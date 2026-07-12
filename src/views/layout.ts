import type { Nutzer } from '../types';
import { escapeHtml } from '../util';

export function layout(opts: {
  title: string;
  user: Nutzer;
  active: 'cockpit' | 'jourfixe' | 'einkauf' | '';
  body: string;
  extraScript?: string;
}): string {
  const { title, user, active, body } = opts;
  const showEinkauf = user.rolle === 'GF' || user.rolle === 'Einkauf';
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(title)} · BW Bau-Cockpit</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<link href="/static/style.css" rel="stylesheet">
</head>
<body>
<header class="topbar">
  <div class="wordmark">BW&nbsp;GRUPPE <span class="sub">· Bau-Cockpit</span></div>
  <nav class="nav">
    <a href="/cockpit" class="${active==='cockpit'?'active':''}">Cockpit</a>
    <a href="/jour-fixe" class="${active==='jourfixe'?'active':''}">Jour fixe</a>
    ${showEinkauf ? `<a href="/einkauf" class="${active==='einkauf'?'active':''}">Einkauf</a>` : ''}
  </nav>
  <div class="user-chip">
    <span>${escapeHtml(user.name)}</span>
    <span class="rolle">${escapeHtml(user.rolle)}</span>
    <a href="/logout" class="btn-logout" title="Abmelden">⏻</a>
  </div>
</header>
<main class="wrap">
${body}
</main>
<div id="toast-root"></div>
<script src="/static/app.js"></script>
${opts.extraScript ? `<script>${opts.extraScript}</script>` : ''}
</body>
</html>`;
}

// Ein Textfeld/Textarea mit Diktier-Button (Web Speech API greift clientseitig)
export function micField(opts: {
  name: string;
  label: string;
  value?: string;
  textarea?: boolean;
  placeholder?: string;
  required?: boolean;
  id?: string;
}): string {
  const id = opts.id || opts.name;
  const req = opts.required ? 'required' : '';
  const ph = opts.placeholder ? `placeholder="${escapeHtml(opts.placeholder)}"` : '';
  const inner = opts.textarea
    ? `<textarea id="${id}" name="${opts.name}" ${ph} ${req} data-mic>${escapeHtml(opts.value || '')}</textarea>`
    : `<input id="${id}" name="${opts.name}" type="text" value="${escapeHtml(opts.value || '')}" ${ph} ${req} data-mic />`;
  return `<label for="${id}">${escapeHtml(opts.label)}</label>
  <div class="field-mic">
    ${inner}
    <button type="button" class="mic-btn" data-mic-for="${id}" title="Diktieren">🎤</button>
  </div>`;
}
