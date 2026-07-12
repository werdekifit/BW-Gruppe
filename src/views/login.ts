import { escapeHtml } from '../util';

export function loginPage(opts: { error?: string; seedUsers: { login: string; name: string; rolle: string }[] }): string {
  const quick = opts.seedUsers.map(u =>
    `<button type="button" class="quick-user" data-login="${escapeHtml(u.login)}">
      <strong>${escapeHtml(u.name)}</strong> — ${escapeHtml(u.rolle)}
    </button>`
  ).join('');
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Anmelden · BW Bau-Cockpit</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<link href="/static/style.css" rel="stylesheet">
</head>
<body>
<div class="login-wrap">
  <form class="login-card" method="post" action="/login">
    <div class="brand">
      <div class="mark">BW&nbsp;GRUPPE</div>
      <div class="app">Bau-Cockpit</div>
    </div>
    ${opts.error ? `<div class="toast err" style="position:static;margin:14px 0;transform:none;">${escapeHtml(opts.error)}</div>` : ''}
    <label for="login">Login (Kürzel oder E-Mail)</label>
    <input id="login" name="login" type="text" autocomplete="username" required autofocus />
    <label for="passwort">Passwort</label>
    <input id="passwort" name="passwort" type="password" autocomplete="current-password" required />
    <button class="btn" type="submit" style="width:100%;justify-content:center;margin-top:18px;">Anmelden</button>

    <div class="hint">Schnellauswahl (Demo) — Klick füllt das Login, Passwort <b>bw2026!</b></div>
    <div class="quick-users">${quick}</div>
  </form>
</div>
<script>
document.querySelectorAll('.quick-user').forEach(function(b){
  b.addEventListener('click', function(){
    document.getElementById('login').value = b.getAttribute('data-login');
    document.getElementById('passwort').value = 'bw2026!';
    document.getElementById('passwort').focus();
  });
});
</script>
</body>
</html>`;
}
