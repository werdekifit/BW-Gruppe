import type { Nutzer } from '../types';
import type { ObjektMitAmpel } from '../data';
import { escapeHtml, fmtMonatJahr, fmtEuro } from '../util';

export function cockpitBody(objekte: ObjektMitAmpel[], user: Nutzer, bauleiter: {id:number;name:string}[] = []): string {
  const aktive = objekte.filter(o => !o.archiviert);
  const rot = aktive.filter(o => o.ampel === 'rot').length;
  const gelb = aktive.filter(o => o.ampel === 'gelb').length;
  const gruen = aktive.filter(o => o.ampel === 'gruen').length;
  const blockiert = aktive.filter(o => o.gewerke_blockiert > 0).length;
  const kannAnlegen = user.rolle === 'GF' || user.rolle === 'Bauleiter';

  // Kaufmännische Summenzeile über alle aktiven Objekte (echte Kalkulation)
  const angebotSumme = aktive.reduce((s, o) => s + (o.angebot_summe || 0), 0);
  const abgerechnetSumme = aktive.reduce((s, o) => s + (o.abgerechnet_summe || 0), 0);
  const offenSumme = angebotSumme - abgerechnetSumme;               // noch abzurechnen
  const istSumme = aktive.reduce((s, o) => s + (o.ist_kosten || 0), 0);
  const margeSumme = angebotSumme - istSumme;                        // kalkuliertes Ergebnis

  const cards = objekte.map(o => {
    const gesLabel = o.gesellschaft === 'PG' ? 'PG' : o.gesellschaft === 'BF' ? 'BF' : '';
    const abgeschlossen = (o.leistung || '') === 'Abgeschlossen' || o.archiviert === 1;
    return `<article class="obj-card ${o.archiviert?'archived':''}" data-ampel="${o.ampel}" data-blockiert="${o.gewerke_blockiert>0?1:0}" data-bl="${o.bauleiter_id||''}" data-prio="${o.prio}" data-archiviert="${o.archiviert}" data-abgeschlossen="${abgeschlossen?1:0}" onclick="location.href='/objekt/${o.id}'">
      <span class="ampel-strip ${o.ampel}"></span>
      <div class="card-top">
        <span class="dot ${o.ampel}"></span>
        <span style="display:flex;gap:6px;align-items:center;">
          ${o.prio_rang ? `<span class="rang-tag" title="Prio-Rang">P${o.prio_rang}</span>` : ''}
          ${o.prio && !o.archiviert ? '<span class="prio-tag">PRIO</span>' : ''}
          ${o.archiviert ? '<span class="archiv-tag">ARCHIV</span>' : ''}
        </span>
      </div>
      <div class="objtitle">${escapeHtml(o.objektnr)} · ${escapeHtml(o.kurzname)}</div>
      <div class="meta">${escapeHtml(o.leistung || o.typ || '')}${o.stadt?` · ${escapeHtml(o.stadt)}`:''}${gesLabel?` · ${gesLabel}`:''}${o.wohneinheiten?` · ${o.wohneinheiten} WE`:''}</div>
      <div class="status-text">${escapeHtml(o.status_text||'—')}</div>
      ${o.gewerke_blockiert>0 ? '<div class="blocker-note">⛔ blockiert</div>' : ''}
      <div class="progress" title="Fortschritt: ${o.gewerke_fertig}/${o.gewerke_gesamt} Gewerke fertig">
        <div class="progress-bar" style="width:${o.fortschritt}%"></div>
      </div>
      <div class="footline">
        <span>BL ${escapeHtml((o.bauleiter_name||'—').split(' ').pop()||'')}</span>
        <span>${o.fortschritt}%</span>
        <span>Ziel ${fmtMonatJahr(o.fertigstellung)}</span>
      </div>
    </article>`;
  }).join('');

  return `
  <div class="page-head">
    <h1>Cockpit</h1>
    ${kannAnlegen ? `<button class="btn" onclick="oeffneNeueObjekt()">+ Neue Baustelle</button>` : ''}
  </div>

  <div class="summary-bar">
    <div class="summary-pill"><span class="dot rot"></span> ${rot} kritisch</div>
    <div class="summary-pill"><span class="dot gelb"></span> ${gelb} Achtung</div>
    <div class="summary-pill"><span class="dot gruen"></span> ${gruen} im Plan</div>
    <div class="summary-pill">⛔ ${blockiert} blockiert</div>
    <div class="summary-pill sum-money" title="Summe Angebote (netto) aller aktiven Baustellen">Angebot Σ ${fmtEuro(angebotSumme)}</div>
    <div class="summary-pill sum-money" title="Summe abgerechnet (netto) aller aktiven Baustellen">Abgerechnet Σ ${fmtEuro(abgerechnetSumme)}</div>
    <div class="summary-pill sum-money" title="Noch abzurechnen: Angebot Σ − Abgerechnet Σ">Offen Σ ${fmtEuro(offenSumme)}</div>
    <div class="summary-pill sum-money ${margeSumme>=0?'sum-pos':'sum-neg'}" title="Kalkuliertes Ergebnis: Angebot Σ − Ist-Kosten Σ">Marge Σ ${fmtEuro(margeSumme)}</div>
  </div>

  <div class="filters" style="margin-bottom:18px;">
    <button class="chip-filter active" data-filter="alle">Alle</button>
    <button class="chip-filter" data-filter="prio">Prio</button>
    <button class="chip-filter" data-filter="meine">Meine</button>
    <button class="chip-filter" data-filter="blockiert">Blockiert</button>
    <button class="chip-filter" data-filter="abgeschlossen">Abgeschlossen</button>
    <button class="chip-filter" data-filter="archiviert">Archiviert</button>
  </div>

  <div class="grid" id="objekt-grid">${cards}</div>
  <div class="empty" id="keine-treffer" style="display:none;">Keine Baustellen für diesen Filter.</div>

  ${objektModal(null, user, bauleiter)}
  <script>window.__MEINE_ID = ${user.id};</script>
  `;
}

// Modal zum Anlegen/Bearbeiten
import { micField } from './layout';
import type { Objekt } from '../types';

export function objektModal(o: (Objekt & any) | null, user: Nutzer, bauleiter?: {id:number;name:string}[]): string {
  const isEdit = !!o;
  const blOptions = (bauleiter || []).map(b =>
    `<option value="${b.id}" ${o && o.bauleiter_id===b.id?'selected':''}>${escapeHtml(b.name)}</option>`
  ).join('');
  return `
  <div class="modal-overlay" id="objekt-modal">
    <form class="modal" id="objekt-form" onsubmit="return speichereObjekt(event)">
      <h3 id="objekt-modal-title">${isEdit?'Baustelle bearbeiten':'Neue Baustelle'}</h3>
      <input type="hidden" name="id" value="${o?o.id:''}" />
      <div class="form-row">
        <div><label>Objekt-Nr. (P-Nr.)</label><input name="objektnr" value="${escapeHtml(o?.objektnr||'')}" required></div>
        <div><label>Kurzname</label><input name="kurzname" value="${escapeHtml(o?.kurzname||'')}" required></div>
      </div>
      <label>Adresse</label><input name="adresse" value="${escapeHtml(o?.adresse||'')}">
      <div class="form-row">
        <div><label>Stadt</label><input name="stadt" value="${escapeHtml(o?.stadt||'')}"></div>
        <div><label>Gesellschaft</label>
          <select name="gesellschaft">
            <option value="PG" ${o?.gesellschaft==='PG'?'selected':''}>PG (BW Projekt GmbH)</option>
            <option value="BF" ${o?.gesellschaft==='BF'?'selected':''}>BF (BW Real Estate GmbH)</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div>${micField({ name:'leistung', label:'Leistung', value:o?.leistung||'', id:'obj-leistung', placeholder:'z. B. MFH Sanierung' })}</div>
        <div><label>Typ</label><input name="typ" value="${escapeHtml(o?.typ||'MFH')}"></div>
      </div>
      <div class="form-row">
        <div><label>Wohneinheiten</label><input name="wohneinheiten" type="number" value="${o?.wohneinheiten??''}"></div>
        <div><label>Prio-Rang (1 = oben)</label><input name="prio_rang" type="number" min="1" value="${o?.prio_rang??''}" placeholder="z. B. 5"></div>
      </div>
      <div class="form-row">
        <div><label>Bauleiter</label><select name="bauleiter_id"><option value="">—</option>${blOptions}</select></div>
        <div><label>Fertigstellung</label><input name="fertigstellung" type="date" value="${o?.fertigstellung?o.fertigstellung.substring(0,10):''}"></div>
      </div>
      <label>Kurzstatus</label><input name="status_text" value="${escapeHtml(o?.status_text||'')}" placeholder="z. B. Innenausbau">
      <label>OneDrive-Projektordner (Link)</label><input name="onedrive_link" value="${escapeHtml(o?.onedrive_link||'')}" placeholder="https://...sharepoint.com/...">
      <div class="form-row">
        <div><label>AZ netto (€)</label><input name="az_netto" type="number" step="0.01" value="${o?.az_netto??''}"></div>
        <div><label>SR netto (€)</label><input name="sr_netto" type="number" step="0.01" value="${o?.sr_netto??''}"></div>
      </div>
      <div class="form-row">
        <div><label>Ist-Kosten (€)</label><input name="ist_kosten" type="number" step="0.01" value="${o?.ist_kosten??''}"></div>
        <div><label>Ampel manuell</label><select name="ampel_override"><option value="">Automatisch</option><option value="gruen" ${o?.ampel_override==='gruen'?'selected':''}>Grün</option><option value="gelb" ${o?.ampel_override==='gelb'?'selected':''}>Gelb</option><option value="rot" ${o?.ampel_override==='rot'?'selected':''}>Rot</option></select></div>
      </div>
      <div class="form-row">
        <div><label>Priorität</label><select name="prio"><option value="1" ${o?.prio?'selected':''}>Prio-Baustelle</option><option value="0" ${o && !o.prio?'selected':''}>Standard</option></select></div>
        <div></div>
      </div>
      ${micField({ name:'notiz', label:'Notiz', value:o?.notiz||'', textarea:true, id:'obj-notiz' })}
      <div class="actions">
        <button type="button" class="btn btn-ghost" onclick="schliesseModal('objekt-modal')">Abbrechen</button>
        <button type="submit" class="btn">Speichern</button>
      </div>
    </form>
  </div>`;
}
