import type { Nutzer } from '../types';
import { escapeHtml, kwNummer } from '../util';

export interface JourFixeData {
  fertig: { objekt_id: number; objektnr: string; kurzname: string; gewerk: string }[];
  blockiert: { objekt_id: number; objektnr: string; kurzname: string; grund: string }[];
  entscheiden: { objekt_id: number; objektnr: string; kurzname: string; text: string }[];
  prioObjekte: { id: number; objektnr: string; kurzname: string }[];
}

export function jourFixeBody(d: JourFixeData, user: Nutzer): string {
  const kw = kwNummer();
  const kannEntscheiden = user.rolle === 'GF' || user.rolle === 'Bauleiter';

  const fertigItems = d.fertig.length ? d.fertig.map(x=>`
    <div class="jf-item" onclick="location.href='/objekt/${x.objekt_id}'">
      <div class="obj">${escapeHtml(x.objektnr)} · ${escapeHtml(x.kurzname)}</div>
      <div class="what">${escapeHtml(x.gewerk)} ✔</div>
    </div>`).join('') : '<div class="jf-empty">Diese Woche nichts fertig gemeldet.</div>';

  const blockItems = d.blockiert.length ? d.blockiert.map(x=>`
    <div class="jf-item" onclick="location.href='/objekt/${x.objekt_id}'">
      <div class="obj">${escapeHtml(x.objektnr)} · ${escapeHtml(x.kurzname)}</div>
      <div class="what">${escapeHtml(x.grund)}</div>
    </div>`).join('') : '<div class="jf-empty">Aktuell nichts blockiert. 🎉</div>';

  const entschItems = d.entscheiden.length ? d.entscheiden.map(x=>`
    <div class="jf-item" onclick="location.href='/objekt/${x.objekt_id}'">
      <div class="obj">${escapeHtml(x.objektnr)} · ${escapeHtml(x.kurzname)}</div>
      <div class="what">${escapeHtml(x.text)}</div>
    </div>`).join('') : '<div class="jf-empty">Keine offenen Entscheidungen.</div>';

  const objOptions = d.prioObjekte.map(o=>`<option value="${o.id}">${escapeHtml(o.objektnr)} · ${escapeHtml(o.kurzname)}</option>`).join('');

  return `
  <div class="page-head">
    <h1>Jour fixe · KW ${kw}</h1>
    <div class="head-actions">
      <button class="btn btn-ghost" onclick="window.print()">🖨 Drucken</button>
      ${kannEntscheiden ? `<button class="btn" onclick="toggleForm('form-entscheid')">🎤 Zu entscheiden</button>` : ''}
    </div>
  </div>

  ${kannEntscheiden ? `<form id="form-entscheid" class="panel" style="display:none;" onsubmit="return speichereEntscheidung(event)">
    <h2>Entscheidungspunkt hinzufügen</h2>
    <label>Baustelle</label><select name="objekt_id" required>${objOptions}</select>
    ${micFieldEntsch()}
    <div class="actions"><button type="submit" class="btn btn-sm">Als „Entscheidung GF" anlegen</button></div>
  </form>`:''}

  <div class="jf-cols">
    <div class="jf-col"><h3><span class="dot gruen"></span> Fertig (diese Woche)</h3>${fertigItems}</div>
    <div class="jf-col"><h3><span class="dot rot"></span> Blockiert</h3>${blockItems}</div>
    <div class="jf-col"><h3>🧭 Zu entscheiden (GF)</h3>${entschItems}</div>
  </div>
  `;
}

function micFieldEntsch(): string {
  return `<label for="entsch-text">Frage/Entscheidung</label>
  <div class="field-mic">
    <input id="entsch-text" name="text" type="text" required placeholder="z. B. Bodenwahl WE 5–8?" data-mic />
    <button type="button" class="mic-btn" data-mic-for="entsch-text" title="Diktieren">🎤</button>
  </div>`;
}
