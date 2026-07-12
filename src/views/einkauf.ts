import type { Nutzer } from '../types';
import { escapeHtml, fmtDatum } from '../util';

export function einkaufBody(material: any[], user: Nutzer): string {
  const darfBearbeiten = user.rolle === 'GF' || user.rolle === 'Einkauf';

  const rows = material.map(m => {
    const statusSel = darfBearbeiten
      ? `<select class="mat-status" onchange="aendereMaterialStatus(${m.id}, this.value)">
           ${['offen','bestellt','geliefert'].map(s=>`<option value="${s}" ${m.status===s?'selected':''}>${labelStatus(s)}</option>`).join('')}
         </select>`
      : `<span class="status-chip st-${m.status}">${labelStatus(m.status)}</span>`;
    return `<tr data-status="${m.status}">
      <td><strong>${escapeHtml(m.objektnr)}</strong> ${escapeHtml(m.kurzname)}</td>
      <td>${escapeHtml(m.beschreibung)}${m.gewerk_name?`<div class="muted" style="font-size:12px;">Gewerk: ${escapeHtml(m.gewerk_name)}</div>`:''}</td>
      <td class="muted">${escapeHtml((m.angefragt_von_name||'').split(' ').pop()||'')} ${fmtDatum(m.angefragt_am)}</td>
      <td>${statusSel}</td>
      <td>
        ${darfBearbeiten?`<button class="btn btn-ghost btn-sm" onclick="oeffneEinkaufNotiz(${m.id}, ${JSON.stringify(escapeHtml(m.lieferant||'')).replace(/"/g,'&quot;')}, ${JSON.stringify(escapeHtml(m.einkauf_notiz||'')).replace(/"/g,'&quot;')})">Notiz</button>`
        : `<span class="muted" style="font-size:12px;">${m.lieferant?escapeHtml(m.lieferant):''}${m.einkauf_notiz?` · ${escapeHtml(m.einkauf_notiz)}`:''}</span>`}
      </td>
    </tr>`;
  }).join('');

  return `
  <div class="page-head"><h1>Einkauf · Material-Anfragen</h1></div>

  <div class="filters" style="margin-bottom:18px;">
    <button class="chip-filter active" data-mfilter="alle">Alle</button>
    <button class="chip-filter" data-mfilter="offen">Offen</button>
    <button class="chip-filter" data-mfilter="bestellt">Bestellt</button>
    <button class="chip-filter" data-mfilter="geliefert">Geliefert</button>
  </div>

  <div class="panel">
    <div style="overflow-x:auto;">
    <table id="mat-table">
      <thead><tr><th>Objekt</th><th>Bedarf</th><th>Angefragt</th><th>Status</th><th>Einkauf</th></tr></thead>
      <tbody>${rows||'<tr><td colspan="5" class="empty">Keine Material-Anfragen</td></tr>'}</tbody>
    </table>
    </div>
  </div>

  <div class="modal-overlay" id="notiz-modal">
    <form class="modal" onsubmit="return speichereEinkaufNotiz(event)">
      <h3>Einkauf-Notiz</h3>
      <input type="hidden" name="id" id="notiz-id">
      <label>Lieferant</label><input name="lieferant" id="notiz-lieferant">
      <div class="field-mic">
        <label>Notiz</label>
        <textarea name="einkauf_notiz" id="notiz-text" data-mic></textarea>
        <button type="button" class="mic-btn" data-mic-for="notiz-text" style="top:32px;">🎤</button>
      </div>
      <div class="actions">
        <button type="button" class="btn btn-ghost" onclick="schliesseModal('notiz-modal')">Abbrechen</button>
        <button type="submit" class="btn">Speichern</button>
      </div>
    </form>
  </div>
  `;
}

function labelStatus(s: string): string {
  return s==='offen'?'🟠 offen':s==='bestellt'?'📦 bestellt':'✅ geliefert';
}
