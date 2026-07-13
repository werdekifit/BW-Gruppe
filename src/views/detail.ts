import type { Nutzer, Gewerk, Vorbereitung, VerlaufEintrag } from '../types';
import type { ObjektMitAmpel } from '../data';
import { escapeHtml, fmtDatum, fmtMonatJahr, fmtEuro, fmtProzent, kaufKennzahlen, GEWERK_STATUS_LABEL, GEWERK_STATUS_ICON, VORB_FELDER, VORB_STATUS_LABEL, VORB_STATUS_ICON, istUeberfaellig } from '../util';
import { micField } from './layout';

export interface DetailData {
  objekt: ObjektMitAmpel;
  gewerke: (Gewerk & { abhaengig_name?: string | null; abhaengig_status?: string | null })[];
  aufgaben: any[];
  fotos: any[];
  material: any[];
  nutzer: Nutzer[];
  vorbereitung: Vorbereitung | null;
  verlauf: VerlaufEintrag[];
}

export function detailBody(d: DetailData, user: Nutzer): string {
  const o = d.objekt;
  const kannBearbeiten = user.rolle === 'GF' || user.rolle === 'Bauleiter';
  const gesLabel = o.gesellschaft === 'PG' ? 'PG (BW Projekt GmbH)' : o.gesellschaft === 'BF' ? 'BF (BW Real Estate GmbH)' : '';

  return `
  <a href="/cockpit" class="muted" style="display:inline-block;margin-bottom:14px;">← Cockpit</a>

  <div class="detail-head">
    <div class="row1">
      <div class="title">
        <span class="dot ${o.ampel}"></span>
        ${escapeHtml(o.objektnr)} · ${escapeHtml(o.kurzname)}
        ${o.ampel_override_flag ? '<span class="prio-tag" title="Ampel manuell gesetzt">MANUELL</span>' : ''}
        ${o.prio_rang ? `<span class="rang-tag">P${o.prio_rang}</span>` : ''}
        ${o.prio && !o.archiviert ? '<span class="prio-tag">PRIO</span>' : ''}
        ${o.archiviert ? '<span class="archiv-tag">ARCHIVIERT</span>' : ''}
      </div>
      <div class="head-actions">
        ${o.onedrive_link ? `<a class="btn btn-ghost" href="${escapeHtml(o.onedrive_link)}" target="_blank" rel="noopener">📁 OneDrive-Ordner öffnen</a>` : ''}
        ${kannBearbeiten ? `<button class="btn btn-ghost" onclick="oeffneEditObjekt(${o.id})">Bearbeiten</button>` : ''}
        ${kannBearbeiten ? (o.archiviert
          ? `<button class="btn btn-ghost" onclick="archiviereObjekt(${o.id}, 0)">↩ Reaktivieren</button>`
          : `<button class="btn btn-ghost" onclick="archiviereObjekt(${o.id}, 1)">✔ Baustelle abschließen</button>`) : ''}
      </div>
    </div>
    <div class="subline">
      ${escapeHtml(o.leistung||'')}${o.leistung?' · ':''}${gesLabel} · ${escapeHtml(o.typ||'')} ${o.wohneinheiten||''} WE · Bauleiter: ${escapeHtml(o.bauleiter_name||'—')}
      · Fertigstellung: ${fmtMonatJahr(o.fertigstellung)}
    </div>
    <div class="progress-line">
      <div class="progress big" title="${o.gewerke_fertig}/${o.gewerke_gesamt} Gewerke fertig"><div class="progress-bar" style="width:${o.fortschritt}%"></div></div>
      <span class="muted" style="font-size:13px;white-space:nowrap;">Fortschritt ${o.fortschritt}% (${o.gewerke_fertig}/${o.gewerke_gesamt} Gewerke)</span>
    </div>
    ${kennzahlenBlock(o)}
    ${o.notiz ? `<div class="subline">📝 ${escapeHtml(o.notiz)}</div>` : ''}
  </div>

  <div class="tabs">
    <div class="tab active" data-tab="gewerke">Gewerke</div>
    <div class="tab" data-tab="vorbereitung">Vorbereitung</div>
    <div class="tab" data-tab="aufgaben">Aufgaben</div>
    <div class="tab" data-tab="fotos">Fotos</div>
    <div class="tab" data-tab="material">Material</div>
    <div class="tab" data-tab="verlauf">Verlauf</div>
  </div>

  <section class="tab-panel active" id="panel-gewerke">${gewerkePanel(d, kannBearbeiten)}</section>
  <section class="tab-panel" id="panel-vorbereitung">${vorbereitungPanel(d, kannBearbeiten)}</section>
  <section class="tab-panel" id="panel-aufgaben">${aufgabenPanel(d, user, kannBearbeiten)}</section>
  <section class="tab-panel" id="panel-fotos">${fotosPanel(d, kannBearbeiten)}</section>
  <section class="tab-panel" id="panel-material">${materialPanel(d, user)}</section>
  <section class="tab-panel" id="panel-verlauf">${verlaufPanel(d)}</section>

  ${kannBearbeiten ? gewerkModal() : ''}

  <script>window.__OBJEKT_ID = ${o.id}; window.__MEINE_ID = ${user.id}; window.__MEINE_ROLLE = ${JSON.stringify(user.rolle)};</script>
  `;
}

// Kaufmännische Kennzahlen: Angebot / Abgerechnet / AZ / SR / Ist
function kennzahlenBlock(o: ObjektMitAmpel): string {
  const kpi = (label: string, wert: string, title = '', cls = '') =>
    `<div class="kpi ${cls}" ${title?`title="${escapeHtml(title)}"`:''}><div class="kpi-label">${label}</div><div class="kpi-wert">${wert}</div></div>`;
  const k = kaufKennzahlen(o);
  // Vorzeichen-Klasse für Marge (grün = positiv, rot = negativ)
  const margeCls = k.marge == null ? '' : (k.marge >= 0 ? 'kpi-pos' : 'kpi-neg');
  const margeWert = k.marge == null ? '—'
    : `${fmtEuro(k.marge)}${k.margeProzent != null ? ` <span class="kpi-sub">(${fmtProzent(k.margeProzent)})</span>` : ''}`;
  return `
  <div class="kpi-group">
    <div class="kpi-group-label">Eingaben</div>
    <div class="kpi-row">
      ${kpi('Angebot netto', fmtEuro(o.angebot_summe), 'Summe Angebote aller Gewerke')}
      ${kpi('Abgerechnet netto', fmtEuro(o.abgerechnet_summe), 'Summe abgerechnet aller Gewerke')}
      ${kpi('Ist-Kosten', fmtEuro(o.ist_kosten))}
      ${kpi('AZ netto', fmtEuro(o.az_netto), 'Abschlagszahlung')}
      ${kpi('SR netto', fmtEuro(o.sr_netto), 'Schlussrechnung')}
    </div>
  </div>
  <div class="kpi-group">
    <div class="kpi-group-label">Berechnet</div>
    <div class="kpi-row">
      ${kpi('Offen (noch abzurechnen)', k.offen == null ? '—' : fmtEuro(k.offen), 'Angebot − Abgerechnet')}
      ${kpi('Abrechnungsgrad', k.abrechnungsgrad == null ? '—' : fmtProzent(k.abrechnungsgrad), 'Abgerechnet ÷ Angebot')}
      ${kpi('Marge (kalkuliert)', margeWert, 'Angebot − Ist-Kosten', margeCls)}
    </div>
  </div>`;
}

function gewerkePanel(d: DetailData, kann: boolean): string {
  const phasenChip = (s: string | null) => s
    ? `<span class="status-chip st-${s==='laeuft'?'laeuft':s==='fertig'?'fertig':s==='entfaellt'?'entfaellt':'offen'}">${VORB_STATUS_ICON[s==='laeuft'?'aktiv':s==='fertig'?'erledigt':s] || '⚪'} ${s==='laeuft'?'läuft':s==='fertig'?'fertig':s==='entfaellt'?'entfällt':'offen'}</span>`
    : '<span class="muted">—</span>';
  const rows = d.gewerke.map(g => {
    const an = g.an || g.verantwortlich_name;
    const anText = an
      ? `${escapeHtml(an)}${g.verantwortlich_typ ? ` <span class="muted" style="font-size:11px;">(${g.verantwortlich_typ==='sub'?'Sub':'eigen'})</span>` : ''}`
      : (g.verantwortlich_typ ? (g.verantwortlich_typ==='sub'?'Sub':'eigen') : '—');
    const statusSel = kann
      ? `<select class="gewerk-status" data-id="${g.id}" onchange="aendereGewerkStatus(${g.id}, this.value)">
           ${['offen','laeuft','fertig','blockiert'].map(s=>`<option value="${s}" ${g.status===s?'selected':''}>${GEWERK_STATUS_ICON[s]} ${GEWERK_STATUS_LABEL[s]}</option>`).join('')}
         </select>`
      : `<span class="status-chip st-${g.status}">${GEWERK_STATUS_ICON[g.status]} ${GEWERK_STATUS_LABEL[g.status]}</span>`;
    const dep = g.abhaengig_von_id && g.abhaengig_status !== 'fertig'
      ? `<div class="dep-hint">wartet auf ${escapeHtml(g.abhaengig_name||'')}</div>` : '';
    const gJson = escapeHtml(JSON.stringify({
      id: g.id, name: g.name, an: g.an || '', verantwortlich_typ: g.verantwortlich_typ || '',
      install_status: g.install_status || '', montage_status: g.montage_status || '',
      angebot_netto: g.angebot_netto ?? '', abgerechnet_netto: g.abgerechnet_netto ?? '', notiz: g.notiz || '',
    }));
    return `<tr>
      <td><strong>${escapeHtml(g.name)}</strong>${g.notiz?`<div class="muted" style="font-size:12px;">${escapeHtml(g.notiz)}</div>`:''}${dep}</td>
      <td>${statusSel}${g.status==='blockiert' && g.blocker_grund?`<div class="blocker-note">⛔ ${escapeHtml(g.blocker_grund)}</div>`:''}</td>
      <td class="muted">${anText}</td>
      <td>${phasenChip(g.install_status)}</td>
      <td>${phasenChip(g.montage_status)}</td>
      <td class="num">${fmtEuro(g.angebot_netto)}</td>
      <td class="num">${fmtEuro(g.abgerechnet_netto)}</td>
      ${kann?`<td><button class="btn btn-ghost btn-sm" data-g="${gJson}" onclick="oeffneGewerkEdit(this)">✎</button></td>`:''}
    </tr>`;
  }).join('');
  const colspan = kann ? 8 : 7;
  return `<div class="panel">
    <div class="panel-head"><h2>Gewerke-Status</h2>${kann?`<button class="btn btn-sm" onclick="toggleForm('form-gewerk')">+ Gewerk</button>`:''}</div>
    ${kann?`<form id="form-gewerk" style="display:none;margin-bottom:16px;" onsubmit="return speichereGewerk(event)">
      <div class="form-row">
        <div><label>Gewerk</label>
          <select name="name">
            ${['Fenster/Sonnenschutz','Elektro','HLS (Heizung/Lüftung/Sanitär)','Küche','Innenausbau','Fassade','Balkon/Terrasse','Dach','Gerüst','Entkernung/Abbruch','Rohbau/Durchbrüche','Trockenbau','Estrich','Fliesen','Maler','Boden','Endmontage'].map(n=>`<option value="${n}">${n}</option>`).join('')}
          </select>
        </div>
        <div>${micField({name:'an',label:'AN (Auftragnehmer)',id:'gw-an',placeholder:'z. B. Würthner'})}</div>
      </div>
      <label>Verantwortlich</label><select name="verantwortlich_typ"><option value="eigen">eigen</option><option value="sub">Sub</option></select>
      <div class="actions"><button type="submit" class="btn btn-sm">Hinzufügen</button></div>
    </form>`:''}
    <div style="overflow-x:auto;">
    <table>
      <thead><tr><th>Gewerk</th><th>Status</th><th>AN</th><th>Install.</th><th>Montage</th><th>Angebot netto</th><th>Abgerechnet</th>${kann?'<th></th>':''}</tr></thead>
      <tbody>${rows||`<tr><td colspan="${colspan}" class="empty">Keine Gewerke</td></tr>`}</tbody>
    </table>
    </div>
  </div>`;
}

// Modal: Gewerk-Details bearbeiten (AN, Install./Montage, Beträge, Notiz)
function gewerkModal(): string {
  const phasenOpts = ['','offen','laeuft','fertig','entfaellt'].map(s =>
    `<option value="${s}">${s===''?'—':s==='laeuft'?'läuft':s==='entfaellt'?'entfällt':s}</option>`).join('');
  return `
  <div class="modal-overlay" id="gewerk-modal">
    <form class="modal" id="gewerk-form" onsubmit="return speichereGewerkDetails(event)">
      <h3 id="gewerk-modal-title">Gewerk bearbeiten</h3>
      <input type="hidden" name="id">
      ${micField({name:'an',label:'AN (Auftragnehmer / Sub-Firma)',id:'gwm-an',placeholder:'z. B. Würthner, Dragan, BW Real'})}
      <label>Verantwortlich</label>
      <select name="verantwortlich_typ"><option value="">—</option><option value="eigen">eigen</option><option value="sub">Sub</option></select>
      <div class="form-row">
        <div><label>Install.-Status</label><select name="install_status">${phasenOpts}</select></div>
        <div><label>Montage-Status</label><select name="montage_status">${phasenOpts}</select></div>
      </div>
      <div class="form-row">
        <div><label>Angebot netto (€)</label><input name="angebot_netto" type="number" step="0.01"></div>
        <div><label>Abgerechnet netto (€)</label><input name="abgerechnet_netto" type="number" step="0.01"></div>
      </div>
      ${micField({name:'notiz',label:'Notiz',id:'gwm-notiz',textarea:true})}
      <div class="actions">
        <button type="button" class="btn btn-ghost" onclick="schliesseModal('gewerk-modal')">Abbrechen</button>
        <button type="submit" class="btn">Speichern</button>
      </div>
    </form>
  </div>`;
}

// Vorbereitungs-Tab: Genehmigung/Statik/BB/Sperrung/B-Modus/Demontage/LV
function vorbereitungPanel(d: DetailData, kann: boolean): string {
  const v: any = d.vorbereitung || {};
  const rows = VORB_FELDER.map(f => {
    const status = v[f.key] || 'offen';
    const chip = kann
      ? `<button type="button" class="vorb-chip st-vorb-${status}" data-feld="${f.key}" data-status="${status}" onclick="zyklusVorbereitung(this)" title="Klicken zum Weiterschalten">${VORB_STATUS_ICON[status]} ${VORB_STATUS_LABEL[status]}</button>`
      : `<span class="vorb-chip st-vorb-${status}" style="cursor:default;">${VORB_STATUS_ICON[status]} ${VORB_STATUS_LABEL[status]}</span>`;
    const extra = f.key === 'bb'
      ? (kann
          ? `<input type="date" value="${v.bb_datum?String(v.bb_datum).substring(0,10):''}" onchange="speichereVorbereitungFeld('bb_datum', this.value)" style="max-width:170px;">`
          : `<span class="muted">${v.bb_datum?fmtDatum(v.bb_datum):''}</span>`)
      : '';
    return `<tr>
      <td><strong>${escapeHtml(f.label)}</strong></td>
      <td>${chip}</td>
      <td>${extra}</td>
    </tr>`;
  }).join('');
  return `<div class="panel">
    <div class="panel-head"><h2>Vorbereitungsphase</h2></div>
    <div style="overflow-x:auto;">
    <table>
      <thead><tr><th>Schritt</th><th>Status</th><th>Datum</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    </div>
    ${kann?`
    <div class="field-mic" style="margin-top:14px;">
      <label for="vorb-notiz">Notiz zur Vorbereitung</label>
      <textarea id="vorb-notiz" data-mic>${escapeHtml(v.notiz||'')}</textarea>
      <button type="button" class="mic-btn" data-mic-for="vorb-notiz" style="top:32px;" title="Diktieren">🎤</button>
    </div>
    <div class="actions" style="margin-top:10px;"><button class="btn btn-sm" onclick="speichereVorbereitungFeld('notiz', document.getElementById('vorb-notiz').value)">Notiz speichern</button></div>`
    : (v.notiz?`<div class="subline" style="margin-top:12px;">📝 ${escapeHtml(v.notiz)}</div>`:'')}
  </div>`;
}

function aufgabenPanel(d: DetailData, user: Nutzer, kann: boolean): string {
  const items = d.aufgaben.map(a => {
    const overdue = istUeberfaellig(a.frist, a.status);
    return `<div class="task-row ${a.status==='erledigt'?'done':''}">
      ${kann ? `<input type="checkbox" style="width:auto;margin-top:3px;" ${a.status==='erledigt'?'checked':''} onchange="toggleAufgabe(${a.id}, this.checked)">` : ''}
      <div style="flex:1;">
        <div class="task-text">${escapeHtml(a.text)} ${a.entscheidung?'<span class="entsch-tag">ENTSCHEIDUNG GF</span>':''}</div>
        <div class="task-meta">
          ${a.verantwortlich_name?escapeHtml(a.verantwortlich_name):'—'}
          ${a.frist?` · Frist <span class="${overdue?'overdue':''}">${fmtDatum(a.frist)}</span>`:''}
        </div>
      </div>
    </div>`;
  }).join('');

  const blOptions = d.nutzer.map(n=>`<option value="${n.id}" ${n.id===user.id?'selected':''}>${escapeHtml(n.name)}</option>`).join('');

  return `<div class="panel">
    <div class="panel-head"><h2>Aufgaben</h2>${kann?`<button class="btn btn-sm" onclick="toggleForm('form-aufgabe')">+ Aufgabe</button>`:''}</div>
    ${kann?`<form id="form-aufgabe" style="display:none;margin-bottom:16px;" onsubmit="return speichereAufgabe(event)">
      ${micField({name:'text',label:'Aufgabe',id:'auf-text',required:true,placeholder:'Was ist zu tun?'})}
      <div class="form-row">
        <div><label>Verantwortlich</label><select name="verantwortlich_id">${blOptions}</select></div>
        <div><label>Frist</label><input type="date" name="frist"></div>
      </div>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" name="entscheidung" value="1" style="width:auto;"> Entscheidung GF (für Jour fixe)</label>
      <div class="actions"><button type="submit" class="btn btn-sm">Speichern</button></div>
    </form>`:''}
    ${items||'<div class="empty">Keine Aufgaben</div>'}
  </div>`;
}

function fotosPanel(d: DetailData, kann: boolean): string {
  const items = d.fotos.map(f=>{
    // R2-Bild über /api/foto/:id ausliefern, sonst Fallback (Seed-Platzhalter/Altbestand)
    const src = f.r2_key ? `/api/foto/${f.id}` : (f.datei_url || '/static/img/placeholder-bau.svg');
    return `<div class="foto-item">
    <img src="${escapeHtml(src)}" alt="${escapeHtml(f.bereich||'Foto')}" loading="lazy">
    <div class="cap">
      <div class="bereich">${escapeHtml(f.bereich||'—')}${kann?`<button class="foto-del" onclick="loescheFoto(${f.id})" title="Foto löschen">✕</button>`:''}</div>
      <div class="kom">${escapeHtml(f.kommentar||'')} · ${fmtDatum(f.datum)}</div>
    </div>
  </div>`;
  }).join('');
  return `<div class="panel">
    <div class="panel-head"><h2>Fotos</h2>${kann?`<button class="btn btn-sm" onclick="toggleForm('form-foto')">+ Foto</button>`:''}</div>
    ${kann?`<form id="form-foto" style="display:none;margin-bottom:16px;" onsubmit="return speichereFoto(event)">
      <label>Bild wählen</label><input type="file" name="datei" accept="image/*" capture="environment">
      <div class="form-row">
        <div>${micField({name:'bereich',label:'Bereich/Raum',id:'foto-bereich',placeholder:'z. B. WE3 Bad'})}</div>
        <div><label>Datum</label><input type="date" name="datum"></div>
      </div>
      ${micField({name:'kommentar',label:'Kommentar',id:'foto-kom',textarea:true})}
      <div class="actions"><button type="submit" class="btn btn-sm">Hochladen</button></div>
    </form>`:''}
    <div class="foto-grid">${items||'<div class="empty">Noch keine Fotos</div>'}</div>
  </div>`;
}

function materialPanel(d: DetailData, user: Nutzer): string {
  const kannStellen = user.rolle === 'GF' || user.rolle === 'Bauleiter';
  const items = d.material.map(m=>{
    const kannEdit = m.status==='offen' && (user.rolle==='GF' || (user.rolle==='Bauleiter' && m.angefragt_von_id===user.id));
    return `<div class="task-row">
      <div style="flex:1;">
        <div class="task-text">${escapeHtml(m.beschreibung)}</div>
        <div class="task-meta">angefragt ${escapeHtml((m.angefragt_von_name||'').split(' ').pop()||'')} ${fmtDatum(m.angefragt_am)}
        ${m.lieferant?` · Lieferant: ${escapeHtml(m.lieferant)}`:''}${m.einkauf_notiz?` · 📝 ${escapeHtml(m.einkauf_notiz)}`:''}</div>
      </div>
      <span class="status-chip st-${m.status}">${m.status==='offen'?'🟠 offen':m.status==='bestellt'?'📦 bestellt':'✅ geliefert'}</span>
      ${kannEdit?`<button class="btn-logout" onclick="zurueckziehenMaterial(${m.id})" title="Zurückziehen">✕</button>`:''}
    </div>`;
  }).join('');
  const gewerkOpts = d.gewerke.map(g=>`<option value="${g.id}">${escapeHtml(g.name)}</option>`).join('');
  return `<div class="panel">
    <div class="panel-head"><h2>Material-Anfragen</h2>${kannStellen?`<button class="btn btn-sm" onclick="toggleForm('form-material')">+ Anfrage</button>`:''}</div>
    ${kannStellen?`<form id="form-material" style="display:none;margin-bottom:16px;" onsubmit="return speichereMaterial(event)">
      ${micField({name:'beschreibung',label:'Bedarf inkl. Menge',id:'mat-besch',textarea:true,required:true,placeholder:'z. B. 20 m² Dämmung WLG035, 6 Sack Kleber'})}
      <label>Gewerk (optional)</label><select name="gewerk_id"><option value="">—</option>${gewerkOpts}</select>
      <div class="actions"><button type="submit" class="btn btn-sm">Anfrage stellen</button></div>
    </form>`:''}
    ${items||'<div class="empty">Keine Material-Anfragen</div>'}
  </div>`;
}

// Verlauf-Tab: Änderungsprotokoll
function verlaufPanel(d: DetailData): string {
  const fmtZeit = (z: string) => {
    const iso = (z || '').replace(' ', 'T').substring(0, 16);
    const [datum, uhrzeit] = iso.split('T');
    return `${fmtDatum(datum)}${uhrzeit ? ` ${uhrzeit}` : ''}`;
  };
  const items = d.verlauf.map(v => {
    const delta = (v.alt_wert != null || v.neu_wert != null)
      ? `<span class="verlauf-delta">${v.feld?`<strong>${escapeHtml(v.feld)}</strong>: `:''}${escapeHtml(v.alt_wert ?? '—')} → ${escapeHtml(v.neu_wert ?? '—')}</span>`
      : '';
    return `<div class="task-row">
      <div style="flex:1;">
        <div class="task-text">${escapeHtml(v.aktion)} ${delta}</div>
        <div class="task-meta">${escapeHtml(v.nutzer_name||'System')} · ${fmtZeit(v.zeitpunkt)} Uhr</div>
      </div>
    </div>`;
  }).join('');
  return `<div class="panel">
    <div class="panel-head"><h2>Verlauf</h2></div>
    ${items||'<div class="empty">Noch keine Änderungen protokolliert.</div>'}
  </div>`;
}
