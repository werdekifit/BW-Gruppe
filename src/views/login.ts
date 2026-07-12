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
    <button class="btn" id="login-btn" type="submit" style="width:100%;justify-content:center;margin-top:18px;">Anmelden</button>
    <div id="login-msg" style="display:none;margin-top:14px;padding:10px 12px;border-radius:10px;font-size:13px;"></div>

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

var form = document.querySelector('form.login-card');
var msg = document.getElementById('login-msg');
var btn = document.getElementById('login-btn');
function showMsg(text, ok){
  msg.style.display='block';
  msg.style.background = ok ? 'rgba(63,178,127,.2)' : 'rgba(217,83,79,.22)';
  msg.style.color = ok ? '#3FB27F' : '#D9534F';
  msg.textContent = text;
}
form.addEventListener('submit', async function(e){
  e.preventDefault();
  btn.disabled = true; btn.textContent = 'Anmelden…';
  showMsg('Anmeldung läuft…', true);
  try {
    var res = await fetch('/login', {
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded','Accept':'application/json'},
      credentials:'same-origin',
      body: 'login='+encodeURIComponent(document.getElementById('login').value)+'&passwort='+encodeURIComponent(document.getElementById('passwort').value)
    });
    var data = await res.json().catch(function(){return {};});
    if (!res.ok || !data.ok) {
      showMsg(data.error || 'Login oder Passwort falsch.', false);
      btn.disabled=false; btn.textContent='Anmelden'; return;
    }
    // Cookie-Test: können wir jetzt aufs Cockpit?
    var check = await fetch('/cockpit', { credentials:'same-origin', redirect:'manual' });
    if (check.type === 'opaqueredirect' || check.status === 302 || check.redirected) {
      showMsg('Anmeldung ok, aber dein Browser speichert das Login-Cookie nicht. Bitte Cookies für diese Seite erlauben (nicht Inkognito / Cookie-Blocker deaktivieren) und erneut versuchen.', false);
      btn.disabled=false; btn.textContent='Anmelden'; return;
    }
    showMsg('Erfolgreich – weiterleiten…', true);
    window.location.href = data.redirect || '/cockpit';
  } catch(err){
    showMsg('Netzwerkfehler: '+err.message, false);
    btn.disabled=false; btn.textContent='Anmelden';
  }
});
</script>
</body>
</html>`;
}
