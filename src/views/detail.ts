import type { Nutzer, Gewerk } from '../types';
import type { ObjektMitAmpel } from '../data';
import { escapeHtml, fmtDatum, fmtMonatJahr, GEWERK_STATUS_LABEL, GEWERK_STATUS_ICON, istUeberfaellig } from '../util';
import { micField } from './layout';

export interface DetailData {
  objekt: ObjektMitAmpel;
  gewerke: (Gewerk & { abhaengig_name?: string | null; abhaengig_status?: string | null })[];
  aufgaben: any[];
  fotos: any[];
  material: any[];
  nutzer: Nutzer[];
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
        ${o.prio ? '<span class="prio-tag">PRIO</span>' : ''}
      </div>
      <div class="head-actions">
        ${o.onedrive_link ? `<a class="btn btn-ghost" href="${escapeHtml(o.onedrive_link)}" target="_blank" rel="noopener">📁 OneDrive-Ordner öffnen</a>` : ''}
        ${kannBearbeiten ? `<button class="btn btn-ghost" onclick="oeffneEditObjekt(${o.id})">Bearbeiten</button>` : ''}
      </div>
    </div>
    <div class="subline">
      ${gesLabel} · ${escapeHtml(o.typ||'')} ${o.wohneinheiten||''} WE · Bauleiter: ${escapeHtml(o.bauleiter_name||'—')}
      · Fertigstellung: ${fmtMonatJahr(o.fertigstellung)} · Fortschritt ${o.fortschritt}%
    </div>
    ${o.notiz ? `<div class="subline">📝 ${escapeHtml(o.notiz)}</div>` : ''}
  </div>

  <div class="tabs">
    <div class="tab active" data-tab="gewerke">Gewerke</div>
    <div class="tab" data-tab="aufgaben">Aufgaben</div>
    <div class="tab" data-tab="fotos">Fotos</div>
    <div class="tab" data-tab="material">Material</div>
  </div>

  <section class="tab-panel active" id="panel-gewerke">${gewerkePanel(d, kannBearbeiten)}</section>
  <section class="tab-panel" id="panel-aufgaben">${aufgabenPanel(d, user, kannBearbeiten)}</section>
  <section class="tab-panel" id="panel-fotos">${fotosPanel(d, kannBearbeiten)}</section>
  <section class="tab-panel" id="panel-material">${materialPanel(d, user)}</section>

  <script>window.__OBJEKT_ID = ${o.id}; window.__MEINE_ID = ${user.id}; window.__MEINE_ROLLE = ${JSON.stringify(user.rolle)};</script>
  `;
}

function gewerkePanel(d: DetailData, kann: boolean): string {
  const rows = d.gewerke.map(g => {
    const dep = g.abhaengig_von_id
      ? (g.abhaengig_status !== 'fertig'
          ? `<span class="dep-hint">wartet auf ${escapeHtml(g.abhaengig_name||'')}</span>`
          : `${escapeHtml(g.abhaengig_name||'')} ✔`)
      : '—';
    const verantw = g.verantwortlich_typ === 'sub'
      ? `Sub${g.verantwortlich_name?` (${escapeHtml(g.verantwortlich_name)})`:''}`
      : `eigen${g.verantwortlich_name?` (${escapeHtml(g.verantwortlich_name)})`:''}`;
    const statusSel = kann
      ? `<select class="gewerk-status" data-id="${g.id}" onchange="aendereGewerkStatus(${g.id}, this.value)">
           ${['offen','laeuft','fertig','blockiert'].map(s=>`<option value="${s}" ${g.status===s?'selected':''}>${GEWERK_STATUS_ICON[s]} ${GEWERK_STATUS_LABEL[s]}</option>`).join('')}
         </select>`
      : `<span class="status-chip st-${g.status}">${GEWERK_STATUS_ICON[g.status]} ${GEWERK_STATUS_LABEL[g.status]}</span>`;
    return `<tr>
      <td><strong>${escapeHtml(g.name)}</strong></td>
      <td>${statusSel}${g.status==='blockiert' && g.blocker_grund?`<div class="blocker-note">⛔ ${escapeHtml(g.blocker_grund)}</div>`:''}</td>
      <td class="muted">${verantw}</td>
      <td>${dep}</td>
    </tr>`;
  }).join('');
  return `<div class="panel">
    <div class="panel-head"><h2>Gewerke-Status</h2></div>
    <div style="overflow-x:auto;">
    <table>
      <thead><tr><th>Gewerk</th><th>Status</th><th>Verantwortlich</th><th>Abhängig von</th></tr></thead>
      <tbody>${rows||'<tr><td colspan="4" class="empty">Keine Gewerke</td></tr>'}</tbody>
    </table>
    </div>
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
  const items = d.fotos.map(f=>`<div class="foto-item">
    <img src="${escapeHtml(f.datei_url||'/static/img/placeholder-bau.svg')}" alt="${escapeHtml(f.bereich||'Foto')}" loading="lazy">
    <div class="cap"><div class="bereich">${escapeHtml(f.bereich||'—')}</div><div class="kom">${escapeHtml(f.kommentar||'')} · ${fmtDatum(f.datum)}</div></div>
  </div>`).join('');
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
