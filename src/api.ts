import { Hono } from 'hono';
import type { Bindings, Nutzer } from './types';
import { darfBearbeiten, darfEinkauf } from './auth';

export const api = new Hono<{ Bindings: Bindings; Variables: { user: Nutzer } }>();

function num(v: any): number | null {
  if (v === '' || v == null) return null;
  const n = parseInt(String(v), 10);
  return isNaN(n) ? null : n;
}
function numF(v: any): number | null {
  if (v === '' || v == null) return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? null : n;
}
function str(v: any): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

// ---------- Verlauf-Protokoll ----------
async function logVerlauf(db: D1Database, objektId: number, nutzerId: number,
  aktion: string, feld?: string | null, alt?: any, neu?: any): Promise<void> {
  const s = (v: any) => (v === undefined || v === null || v === '') ? null : String(v);
  await db.prepare(`INSERT INTO verlauf (objekt_id, nutzer_id, aktion, feld, alt_wert, neu_wert, zeitpunkt)
    VALUES (?,?,?,?,?,?,datetime('now'))`)
    .bind(objektId, nutzerId, aktion, feld ?? null, s(alt), s(neu)).run();
}

// Standard-Gewerkeliste für neue Baustellen (Excel-Struktur)
const STANDARD_GEWERKE = ['Fenster/Sonnenschutz', 'Elektro', 'HLS (Heizung/Lüftung/Sanitär)', 'Küche', 'Innenausbau'];

// ========== OBJEKT ==========
api.get('/objekt/:id', async (c) => {
  const o = await c.env.DB.prepare('SELECT * FROM objekt WHERE id = ?').bind(c.req.param('id')).first();
  if (!o) return c.json({ error: 'Nicht gefunden' }, 404);
  return c.json(o);
});

api.post('/objekt', async (c) => {
  const user = c.get('user');
  if (!darfBearbeiten(user.rolle)) return c.json({ error: 'Keine Berechtigung' }, 403);
  const b = await c.req.json();
  if (!str(b.objektnr) || !str(b.kurzname)) return c.json({ error: 'Objekt-Nr. und Kurzname sind Pflicht' }, 400);
  const prioRang = num(b.prio_rang);
  const prio = (prioRang != null && prioRang <= 10) ? 1 : (num(b.prio) ? 1 : 0);
  try {
    const r = await c.env.DB.prepare(`
      INSERT INTO objekt (objektnr, kurzname, adresse, stadt, gesellschaft, typ, wohneinheiten, prio, prio_rang, leistung, status_text, bauleiter_id, fertigstellung, onedrive_link, ampel_override, notiz, az_netto, sr_netto, ist_kosten, archiviert, angelegt_am)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,datetime('now'))`)
      .bind(str(b.objektnr), str(b.kurzname), str(b.adresse), str(b.stadt), str(b.gesellschaft),
        str(b.typ), num(b.wohneinheiten), prio, prioRang, str(b.leistung), str(b.status_text), num(b.bauleiter_id),
        str(b.fertigstellung), str(b.onedrive_link), str(b.ampel_override), str(b.notiz),
        numF(b.az_netto), numF(b.sr_netto), numF(b.ist_kosten)).run();
    const id = r.meta.last_row_id as number;
    // Vorbereitungs-Datensatz + Standard-Gewerke anlegen
    await c.env.DB.prepare('INSERT OR IGNORE INTO vorbereitung (objekt_id) VALUES (?)').bind(id).run();
    for (let i = 0; i < STANDARD_GEWERKE.length; i++) {
      await c.env.DB.prepare(`INSERT INTO gewerk (objekt_id, name, status, reihenfolge, aktualisiert_am) VALUES (?,?, 'offen', ?, datetime('now'))`)
        .bind(id, STANDARD_GEWERKE[i], i + 1).run();
    }
    await logVerlauf(c.env.DB, id, user.id, 'Baustelle angelegt');
    return c.json({ id });
  } catch (e: any) {
    if (String(e).includes('UNIQUE')) return c.json({ error: 'Objekt-Nr. existiert bereits' }, 400);
    return c.json({ error: 'Fehler: ' + e.message }, 500);
  }
});

// Felder, deren Änderung im Verlauf protokolliert wird
const OBJEKT_LOG_FELDER = ['objektnr','kurzname','gesellschaft','prio_rang','leistung','status_text','bauleiter_id','fertigstellung','ampel_override','az_netto','sr_netto','ist_kosten'];

api.put('/objekt/:id', async (c) => {
  const user = c.get('user');
  if (!darfBearbeiten(user.rolle)) return c.json({ error: 'Keine Berechtigung' }, 403);
  const b = await c.req.json();
  const id = parseInt(c.req.param('id'), 10);
  const alt = await c.env.DB.prepare('SELECT * FROM objekt WHERE id = ?').bind(id).first<any>();
  if (!alt) return c.json({ error: 'Nicht gefunden' }, 404);
  const prioRang = num(b.prio_rang);
  const prio = (prioRang != null && prioRang <= 10) ? 1 : (num(b.prio) ? 1 : 0);
  try {
    await c.env.DB.prepare(`
      UPDATE objekt SET objektnr=?, kurzname=?, adresse=?, stadt=?, gesellschaft=?, typ=?, wohneinheiten=?, prio=?, prio_rang=?, leistung=?, status_text=?, bauleiter_id=?, fertigstellung=?, onedrive_link=?, ampel_override=?, notiz=?, az_netto=?, sr_netto=?, ist_kosten=? WHERE id=?`)
      .bind(str(b.objektnr), str(b.kurzname), str(b.adresse), str(b.stadt), str(b.gesellschaft),
        str(b.typ), num(b.wohneinheiten), prio, prioRang, str(b.leistung), str(b.status_text), num(b.bauleiter_id),
        str(b.fertigstellung), str(b.onedrive_link), str(b.ampel_override), str(b.notiz),
        numF(b.az_netto), numF(b.sr_netto), numF(b.ist_kosten), id).run();
    const neu = await c.env.DB.prepare('SELECT * FROM objekt WHERE id = ?').bind(id).first<any>();
    for (const f of OBJEKT_LOG_FELDER) {
      if (String(alt[f] ?? '') !== String(neu[f] ?? '')) {
        await logVerlauf(c.env.DB, id, user.id, 'Baustelle geändert', f, alt[f], neu[f]);
      }
    }
    return c.json({ ok: true });
  } catch (e: any) {
    if (String(e).includes('UNIQUE')) return c.json({ error: 'Objekt-Nr. existiert bereits' }, 400);
    return c.json({ error: 'Fehler: ' + e.message }, 500);
  }
});

// Archivieren / Reaktivieren („Baustelle abschließen")
api.post('/objekt/:id/archiv', async (c) => {
  const user = c.get('user');
  if (!darfBearbeiten(user.rolle)) return c.json({ error: 'Keine Berechtigung' }, 403);
  const id = parseInt(c.req.param('id'), 10);
  const b = await c.req.json();
  const ziel = num(b.archiviert) ? 1 : 0;
  const alt = await c.env.DB.prepare('SELECT archiviert FROM objekt WHERE id = ?').bind(id).first<any>();
  if (!alt) return c.json({ error: 'Nicht gefunden' }, 404);
  await c.env.DB.prepare('UPDATE objekt SET archiviert=? WHERE id=?').bind(ziel, id).run();
  await logVerlauf(c.env.DB, id, user.id, ziel ? 'Baustelle archiviert' : 'Baustelle reaktiviert', 'archiviert', alt.archiviert, ziel);
  return c.json({ ok: true });
});

// ========== GEWERK ==========
api.put('/gewerk/:id', async (c) => {
  const user = c.get('user');
  if (!darfBearbeiten(user.rolle)) return c.json({ error: 'Keine Berechtigung' }, 403);
  const b = await c.req.json();
  const id = c.req.param('id');
  const g = await c.env.DB.prepare('SELECT * FROM gewerk WHERE id = ?').bind(id).first<any>();
  if (!g) return c.json({ error: 'Nicht gefunden' }, 404);
  const status = str(b.status);
  const grund = status === 'blockiert' ? str(b.blocker_grund) : null;
  await c.env.DB.prepare(`UPDATE gewerk SET status=?, blocker_grund=?, aktualisiert_am=datetime('now') WHERE id=?`)
    .bind(status, grund, id).run();
  if (g.status !== status) {
    await logVerlauf(c.env.DB, g.objekt_id, user.id, `Gewerk „${g.name}" Status`, 'status', g.status, status);
  }
  return c.json({ ok: true });
});

// Gewerk-Details (AN, Install./Montage, Beträge, Notiz)
const VORB_WERTE = ['offen', 'aktiv', 'erledigt', 'entfaellt'];
const GEWERK_PHASE_WERTE = ['offen', 'laeuft', 'fertig', 'entfaellt'];

api.put('/gewerk/:id/details', async (c) => {
  const user = c.get('user');
  if (!darfBearbeiten(user.rolle)) return c.json({ error: 'Keine Berechtigung' }, 403);
  const b = await c.req.json();
  const id = c.req.param('id');
  const g = await c.env.DB.prepare('SELECT * FROM gewerk WHERE id = ?').bind(id).first<any>();
  if (!g) return c.json({ error: 'Nicht gefunden' }, 404);
  const inst = str(b.install_status);
  const mont = str(b.montage_status);
  if ((inst && !GEWERK_PHASE_WERTE.includes(inst)) || (mont && !GEWERK_PHASE_WERTE.includes(mont))) {
    return c.json({ error: 'Ungültiger Install./Montage-Status' }, 400);
  }
  const neu = {
    an: str(b.an), verantwortlich_typ: str(b.verantwortlich_typ),
    install_status: inst, montage_status: mont,
    angebot_netto: numF(b.angebot_netto), abgerechnet_netto: numF(b.abgerechnet_netto),
    notiz: str(b.notiz),
  };
  await c.env.DB.prepare(`UPDATE gewerk SET an=?, verantwortlich_typ=?, install_status=?, montage_status=?, angebot_netto=?, abgerechnet_netto=?, notiz=?, aktualisiert_am=datetime('now') WHERE id=?`)
    .bind(neu.an, neu.verantwortlich_typ, neu.install_status, neu.montage_status,
      neu.angebot_netto, neu.abgerechnet_netto, neu.notiz, id).run();
  for (const f of ['an','install_status','montage_status','angebot_netto','abgerechnet_netto'] as const) {
    if (String(g[f] ?? '') !== String(neu[f] ?? '')) {
      await logVerlauf(c.env.DB, g.objekt_id, user.id, `Gewerk „${g.name}" geändert`, f, g[f], neu[f]);
    }
  }
  return c.json({ ok: true });
});

// Gewerk hinzufügen
api.post('/gewerk', async (c) => {
  const user = c.get('user');
  if (!darfBearbeiten(user.rolle)) return c.json({ error: 'Keine Berechtigung' }, 403);
  const b = await c.req.json();
  const objektId = num(b.objekt_id);
  const name = str(b.name);
  if (!objektId || !name) return c.json({ error: 'Objekt und Gewerk-Name erforderlich' }, 400);
  const max = await c.env.DB.prepare('SELECT COALESCE(MAX(reihenfolge),0) AS m FROM gewerk WHERE objekt_id = ?').bind(objektId).first<any>();
  const r = await c.env.DB.prepare(`INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, reihenfolge, aktualisiert_am) VALUES (?,?, 'offen', ?, ?, ?, datetime('now'))`)
    .bind(objektId, name, str(b.verantwortlich_typ), str(b.an), (max?.m || 0) + 1).run();
  await logVerlauf(c.env.DB, objektId, user.id, `Gewerk „${name}" hinzugefügt`);
  return c.json({ id: r.meta.last_row_id });
});

// ========== EXPORT (Voll-Backup als SQL, nur GF) ==========
// Erzeugt eine idempotente Import-Datei (DELETE + INSERT) des kompletten Datenstands —
// für Backup und Migration (z. B. Import in eine andere Umgebung wie Manus).
const EXPORT_TABELLEN = ['nutzer','objekt','vorbereitung','gewerk','aufgabe','foto','materialanfrage','verlauf'];

function sqlWert(v: any): string {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}

api.get('/export.sql', async (c) => {
  const user = c.get('user');
  if (user.rolle !== 'GF') return c.json({ error: 'Nur GF darf exportieren' }, 403);
  const zeilen: string[] = [
    `-- BW Bau-Cockpit — Datenexport (Voll-Backup)`,
    `-- Erzeugt: ${new Date().toISOString()} · Reihenfolge FK-sicher · idempotent (DELETE vor INSERT)`,
    ``,
  ];
  for (const t of [...EXPORT_TABELLEN].reverse()) zeilen.push(`DELETE FROM ${t};`);
  zeilen.push('');
  for (const t of EXPORT_TABELLEN) {
    const res = await c.env.DB.prepare(`SELECT * FROM ${t}`).all();
    const rows = res.results as any[];
    zeilen.push(`-- ${t} (${rows.length} Zeilen)`);
    for (const r of rows) {
      const cols = Object.keys(r);
      zeilen.push(`INSERT INTO ${t} (${cols.join(', ')}) VALUES (${cols.map(k => sqlWert(r[k])).join(', ')});`);
    }
    zeilen.push('');
  }
  return new Response(zeilen.join('\n'), {
    headers: {
      'Content-Type': 'application/sql; charset=utf-8',
      'Content-Disposition': `attachment; filename="bw-cockpit-export-${new Date().toISOString().substring(0,10)}.sql"`,
      'Cache-Control': 'no-store',
    },
  });
});

// ========== VORBEREITUNG ==========
const VORB_STATUS_FELDER = ['genehmigung','statik','bb','sperrung','b_modus','demontage','lv'];
const VORB_LABELS: Record<string, string> = {
  genehmigung: 'Genehmigung', statik: 'Statik', bb: 'Baubeginn (BB)', sperrung: 'Sperrung',
  b_modus: 'Bewohner-Modus', demontage: 'Demontage', lv: 'LV vorhanden',
  bb_datum: 'BB-Datum', notiz: 'Vorbereitungs-Notiz',
};

api.put('/vorbereitung/:objektId', async (c) => {
  const user = c.get('user');
  if (!darfBearbeiten(user.rolle)) return c.json({ error: 'Keine Berechtigung' }, 403);
  const objektId = parseInt(c.req.param('objektId'), 10);
  const b = await c.req.json();
  const feld = str(b.feld);
  if (!feld || !(VORB_STATUS_FELDER.includes(feld) || feld === 'bb_datum' || feld === 'notiz')) {
    return c.json({ error: 'Ungültiges Feld' }, 400);
  }
  let wert: string | null = str(b.wert);
  if (VORB_STATUS_FELDER.includes(feld)) {
    if (!wert || !VORB_WERTE.includes(wert)) return c.json({ error: 'Ungültiger Status' }, 400);
  }
  await c.env.DB.prepare('INSERT OR IGNORE INTO vorbereitung (objekt_id) VALUES (?)').bind(objektId).run();
  const alt = await c.env.DB.prepare('SELECT * FROM vorbereitung WHERE objekt_id = ?').bind(objektId).first<any>();
  await c.env.DB.prepare(`UPDATE vorbereitung SET ${feld}=?, aktualisiert_am=datetime('now') WHERE objekt_id=?`)
    .bind(wert, objektId).run();
  if (String(alt?.[feld] ?? '') !== String(wert ?? '')) {
    await logVerlauf(c.env.DB, objektId, user.id, 'Vorbereitung geändert', VORB_LABELS[feld] || feld, alt?.[feld], wert);
  }
  return c.json({ ok: true });
});

// ========== AUFGABE ==========
api.post('/aufgabe', async (c) => {
  const user = c.get('user');
  if (!darfBearbeiten(user.rolle)) return c.json({ error: 'Keine Berechtigung' }, 403);
  const b = await c.req.json();
  if (!num(b.objekt_id) || !str(b.text)) return c.json({ error: 'Objekt und Text erforderlich' }, 400);
  const entscheidung = num(b.entscheidung) ? 1 : 0;
  // Entscheidungs-Aufgaben standardmäßig dem GF zuordnen
  let verantwortlich = num(b.verantwortlich_id);
  if (entscheidung && !verantwortlich) {
    const gf = await c.env.DB.prepare("SELECT id FROM nutzer WHERE rolle='GF' AND aktiv=1 LIMIT 1").first<any>();
    verantwortlich = gf ? gf.id : user.id;
  }
  const r = await c.env.DB.prepare(`
    INSERT INTO aufgabe (objekt_id, gewerk_id, text, verantwortlich_id, frist, status, erstellt_von_id, erstellt_am, entscheidung)
    VALUES (?,?,?,?,?, 'offen', ?, datetime('now'), ?)`)
    .bind(num(b.objekt_id), num(b.gewerk_id), str(b.text), verantwortlich, str(b.frist), user.id, entscheidung).run();
  return c.json({ id: r.meta.last_row_id });
});

api.put('/aufgabe/:id', async (c) => {
  const user = c.get('user');
  if (!darfBearbeiten(user.rolle)) return c.json({ error: 'Keine Berechtigung' }, 403);
  const b = await c.req.json();
  const id = c.req.param('id');
  const status = str(b.status);
  const a = await c.env.DB.prepare('SELECT * FROM aufgabe WHERE id = ?').bind(id).first<any>();
  if (!a) return c.json({ error: 'Nicht gefunden' }, 404);
  const erledigt = status === 'erledigt' ? "datetime('now')" : 'NULL';
  await c.env.DB.prepare(`UPDATE aufgabe SET status=?, erledigt_am=${erledigt} WHERE id=?`).bind(status, id).run();
  if (a.status !== status) {
    await logVerlauf(c.env.DB, a.objekt_id, user.id, `Aufgabe „${a.text}"`, 'status', a.status, status);
  }
  return c.json({ ok: true });
});

// ========== FOTO ==========
// Bild wird in R2 (Objektspeicher) abgelegt; in D1 steht nur der Schlüssel (skalierbar
// für tausende Bilder). datei_url bleibt Fallback für Seed-Platzhalter/Altbestand.
const FOTO_MAX_BYTES = 15_000_000; // 15 MB

api.post('/foto', async (c) => {
  const user = c.get('user');
  if (!darfBearbeiten(user.rolle)) return c.json({ error: 'Keine Berechtigung' }, 403);
  const form = await c.req.parseBody();
  const objekt_id = num(form.objekt_id);
  if (!objekt_id) return c.json({ error: 'Objekt fehlt' }, 400);

  let datei_url: string | null = null;
  let r2_key: string | null = null;
  let content_type: string | null = null;
  let groesse: number | null = null;

  const datei = form.datei;
  if (datei && typeof datei === 'object' && 'arrayBuffer' in datei) {
    const file = datei as File;
    if (file.size > 0) {
      if (file.size > FOTO_MAX_BYTES) {
        return c.json({ error: 'Bild zu groß (max. 15 MB)' }, 400);
      }
      const ct = file.type || 'image/jpeg';
      if (!ct.startsWith('image/')) {
        return c.json({ error: 'Nur Bilddateien erlaubt' }, 400);
      }
      const ext = (ct.split('/')[1] || 'jpg').split('+')[0].replace(/[^a-z0-9]/gi, '') || 'jpg';
      const key = `foto/${objekt_id}/${crypto.randomUUID()}.${ext}`;
      try {
        await c.env.BUCKET.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: ct } });
      } catch (e: any) {
        return c.json({ error: 'Fehler beim Speichern des Bildes: ' + (e?.message || e) }, 500);
      }
      r2_key = key;
      content_type = ct;
      groesse = file.size;
    }
  }
  // Ohne Datei: Platzhalter (falls nur Bereich/Kommentar erfasst wird)
  if (!r2_key) datei_url = '/static/img/placeholder-bau.svg';

  const datum = str(form.datum) || new Date().toISOString().substring(0, 10);
  await c.env.DB.prepare(`INSERT INTO foto (objekt_id, bereich, datei_url, r2_key, content_type, groesse, kommentar, datum, hochgeladen_von_id) VALUES (?,?,?,?,?,?,?,?,?)`)
    .bind(objekt_id, str(form.bereich), datei_url, r2_key, content_type, groesse, str(form.kommentar), datum, user.id).run();
  await logVerlauf(c.env.DB, objekt_id, user.id, 'Foto hinzugefügt', 'bereich', null, str(form.bereich));
  return c.json({ ok: true });
});

// Bild aus R2 streamen (nur für angemeldete Nutzer, Cookie wird vom <img> mitgesendet)
api.get('/foto/:id', async (c) => {
  const f = await c.env.DB.prepare('SELECT r2_key, content_type FROM foto WHERE id = ?').bind(c.req.param('id')).first<any>();
  if (!f || !f.r2_key) return c.notFound();
  const obj = await c.env.BUCKET.get(f.r2_key);
  if (!obj) return c.notFound();
  return new Response(obj.body, {
    headers: {
      'Content-Type': f.content_type || obj.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'private, max-age=86400',
      'ETag': obj.httpEtag,
    },
  });
});

// Foto löschen (GF, oder Bauleiter der es hochgeladen hat) — entfernt auch das R2-Objekt
api.delete('/foto/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const f = await c.env.DB.prepare('SELECT * FROM foto WHERE id = ?').bind(id).first<any>();
  if (!f) return c.json({ error: 'Nicht gefunden' }, 404);
  if (!(user.rolle === 'GF' || (user.rolle === 'Bauleiter' && f.hochgeladen_von_id === user.id))) {
    return c.json({ error: 'Keine Berechtigung' }, 403);
  }
  if (f.r2_key) { try { await c.env.BUCKET.delete(f.r2_key); } catch (_) { /* R2-Rest ignorieren */ } }
  await c.env.DB.prepare('DELETE FROM foto WHERE id = ?').bind(id).run();
  await logVerlauf(c.env.DB, f.objekt_id, user.id, 'Foto gelöscht', 'bereich', f.bereich, null);
  return c.json({ ok: true });
});

// ========== MATERIAL ==========
api.post('/material', async (c) => {
  const user = c.get('user');
  if (!darfBearbeiten(user.rolle)) return c.json({ error: 'Keine Berechtigung' }, 403);
  const b = await c.req.json();
  if (!num(b.objekt_id) || !str(b.beschreibung)) return c.json({ error: 'Objekt und Beschreibung erforderlich' }, 400);
  const r = await c.env.DB.prepare(`
    INSERT INTO materialanfrage (objekt_id, gewerk_id, beschreibung, angefragt_von_id, angefragt_am, status, aktualisiert_am)
    VALUES (?,?,?,?, datetime('now'), 'offen', datetime('now'))`)
    .bind(num(b.objekt_id), num(b.gewerk_id), str(b.beschreibung), user.id).run();
  return c.json({ id: r.meta.last_row_id });
});

api.put('/material/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const b = await c.req.json();
  const m = await c.env.DB.prepare('SELECT * FROM materialanfrage WHERE id = ?').bind(id).first<any>();
  if (!m) return c.json({ error: 'Nicht gefunden' }, 404);

  // Statusänderung + Einkauf-Notiz/Lieferant: nur Einkauf/GF
  const willStatus = b.status !== undefined;
  const willEinkauf = b.einkauf_notiz !== undefined || b.lieferant !== undefined;
  if ((willStatus || willEinkauf) && !darfEinkauf(user.rolle)) {
    return c.json({ error: 'Nur Einkauf/GF darf Status/Notiz ändern' }, 403);
  }
  const status = willStatus ? str(b.status) : m.status;
  const notiz = b.einkauf_notiz !== undefined ? str(b.einkauf_notiz) : m.einkauf_notiz;
  const lieferant = b.lieferant !== undefined ? str(b.lieferant) : m.lieferant;
  await c.env.DB.prepare(`UPDATE materialanfrage SET status=?, einkauf_notiz=?, lieferant=?, aktualisiert_am=datetime('now') WHERE id=?`)
    .bind(status, notiz, lieferant, id).run();
  if (m.status !== status) {
    await logVerlauf(c.env.DB, m.objekt_id, user.id, `Material „${m.beschreibung}"`, 'status', m.status, status);
  }
  return c.json({ ok: true });
});

api.delete('/material/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const m = await c.env.DB.prepare('SELECT * FROM materialanfrage WHERE id = ?').bind(id).first<any>();
  if (!m) return c.json({ error: 'Nicht gefunden' }, 404);
  // Bauleiter darf nur eigene offene Anfrage zurückziehen; GF immer
  const eigen = m.angefragt_von_id === user.id;
  if (!(user.rolle === 'GF' || (user.rolle === 'Bauleiter' && eigen && m.status === 'offen'))) {
    return c.json({ error: 'Zurückziehen nur bei eigener offener Anfrage möglich' }, 403);
  }
  await c.env.DB.prepare('DELETE FROM materialanfrage WHERE id = ?').bind(id).run();
  return c.json({ ok: true });
});
