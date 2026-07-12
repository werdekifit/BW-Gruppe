import { Hono } from 'hono';
import type { Bindings, Nutzer } from './types';
import { darfBearbeiten, darfEinkauf } from './auth';

export const api = new Hono<{ Bindings: Bindings; Variables: { user: Nutzer } }>();

function num(v: any): number | null {
  if (v === '' || v == null) return null;
  const n = parseInt(String(v), 10);
  return isNaN(n) ? null : n;
}
function str(v: any): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

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
  try {
    const r = await c.env.DB.prepare(`
      INSERT INTO objekt (objektnr, kurzname, adresse, stadt, gesellschaft, typ, wohneinheiten, prio, status_text, bauleiter_id, fertigstellung, onedrive_link, ampel_override, notiz, archiviert, angelegt_am)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,datetime('now'))`)
      .bind(str(b.objektnr), str(b.kurzname), str(b.adresse), str(b.stadt), str(b.gesellschaft),
        str(b.typ), num(b.wohneinheiten), num(b.prio) ? 1 : 0, str(b.status_text), num(b.bauleiter_id),
        str(b.fertigstellung), str(b.onedrive_link), str(b.ampel_override), str(b.notiz)).run();
    return c.json({ id: r.meta.last_row_id });
  } catch (e: any) {
    if (String(e).includes('UNIQUE')) return c.json({ error: 'Objekt-Nr. existiert bereits' }, 400);
    return c.json({ error: 'Fehler: ' + e.message }, 500);
  }
});

api.put('/objekt/:id', async (c) => {
  const user = c.get('user');
  if (!darfBearbeiten(user.rolle)) return c.json({ error: 'Keine Berechtigung' }, 403);
  const b = await c.req.json();
  const id = c.req.param('id');
  try {
    await c.env.DB.prepare(`
      UPDATE objekt SET objektnr=?, kurzname=?, adresse=?, stadt=?, gesellschaft=?, typ=?, wohneinheiten=?, prio=?, status_text=?, bauleiter_id=?, fertigstellung=?, onedrive_link=?, ampel_override=?, notiz=? WHERE id=?`)
      .bind(str(b.objektnr), str(b.kurzname), str(b.adresse), str(b.stadt), str(b.gesellschaft),
        str(b.typ), num(b.wohneinheiten), num(b.prio) ? 1 : 0, str(b.status_text), num(b.bauleiter_id),
        str(b.fertigstellung), str(b.onedrive_link), str(b.ampel_override), str(b.notiz), id).run();
    return c.json({ ok: true });
  } catch (e: any) {
    if (String(e).includes('UNIQUE')) return c.json({ error: 'Objekt-Nr. existiert bereits' }, 400);
    return c.json({ error: 'Fehler: ' + e.message }, 500);
  }
});

// ========== GEWERK ==========
api.put('/gewerk/:id', async (c) => {
  const user = c.get('user');
  if (!darfBearbeiten(user.rolle)) return c.json({ error: 'Keine Berechtigung' }, 403);
  const b = await c.req.json();
  const id = c.req.param('id');
  const status = str(b.status);
  const grund = status === 'blockiert' ? str(b.blocker_grund) : null;
  await c.env.DB.prepare(`UPDATE gewerk SET status=?, blocker_grund=?, aktualisiert_am=datetime('now') WHERE id=?`)
    .bind(status, grund, id).run();
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
  const erledigt = status === 'erledigt' ? "datetime('now')" : 'NULL';
  await c.env.DB.prepare(`UPDATE aufgabe SET status=?, erledigt_am=${erledigt} WHERE id=?`).bind(status, id).run();
  return c.json({ ok: true });
});

// ========== FOTO ==========
api.post('/foto', async (c) => {
  const user = c.get('user');
  if (!darfBearbeiten(user.rolle)) return c.json({ error: 'Keine Berechtigung' }, 403);
  const form = await c.req.parseBody();
  const objekt_id = num(form.objekt_id);
  if (!objekt_id) return c.json({ error: 'Objekt fehlt' }, 400);

  let datei_url = '/static/img/placeholder-bau.svg';
  const datei = form.datei;
  if (datei && typeof datei === 'object' && 'arrayBuffer' in datei) {
    const file = datei as File;
    if (file.size > 0) {
      // Als Data-URL in DB (v1: kein R2). Begrenzung ~3 MB.
      if (file.size <= 3_500_000) {
        const buf = await file.arrayBuffer();
        const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
        datei_url = `data:${file.type || 'image/jpeg'};base64,${b64}`;
      } else {
        return c.json({ error: 'Bild zu groß (max. 3 MB)' }, 400);
      }
    }
  }
  const datum = str(form.datum) || new Date().toISOString().substring(0, 10);
  await c.env.DB.prepare(`INSERT INTO foto (objekt_id, bereich, datei_url, kommentar, datum, hochgeladen_von_id) VALUES (?,?,?,?,?,?)`)
    .bind(objekt_id, str(form.bereich), datei_url, str(form.kommentar), datum, user.id).run();
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
