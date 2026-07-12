// ===== BW Bau-Cockpit — Client =====

function toast(msg, isErr) {
  var t = document.createElement('div');
  t.className = 'toast' + (isErr ? ' err' : '');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function(){ t.style.opacity = '0'; t.style.transition='opacity .3s'; }, 2200);
  setTimeout(function(){ t.remove(); }, 2600);
}

async function api(method, url, body) {
  var opts = { method: method, headers: {} };
  if (body instanceof FormData) {
    opts.body = body;
  } else if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  var res = await fetch(url, opts);
  var data = null;
  try { data = await res.json(); } catch(e) {}
  if (!res.ok) { throw new Error((data && data.error) || 'Fehler beim Speichern'); }
  return data;
}

// ---------- Tabs ----------
document.addEventListener('click', function(e){
  var tab = e.target.closest('.tab');
  if (tab) {
    var name = tab.getAttribute('data-tab');
    document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
    document.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.remove('active'); });
    tab.classList.add('active');
    var panel = document.getElementById('panel-' + name);
    if (panel) panel.classList.add('active');
  }
});

function toggleForm(id){
  var f = document.getElementById(id);
  if (f) f.style.display = (f.style.display === 'none' || !f.style.display) ? 'block' : 'none';
}
function schliesseModal(id){ var m = document.getElementById(id); if(m) m.classList.remove('open'); }

// ---------- Cockpit filter ----------
document.querySelectorAll('.chip-filter[data-filter]').forEach(function(chip){
  chip.addEventListener('click', function(){
    document.querySelectorAll('.chip-filter[data-filter]').forEach(function(c){ c.classList.remove('active'); });
    chip.classList.add('active');
    var f = chip.getAttribute('data-filter');
    var cards = document.querySelectorAll('#objekt-grid .obj-card');
    var sichtbar = 0;
    cards.forEach(function(card){
      var show = true;
      if (f === 'prio') show = card.getAttribute('data-prio') === '1';
      else if (f === 'blockiert') show = card.getAttribute('data-blockiert') === '1';
      else if (f === 'meine') show = card.getAttribute('data-bl') == window.__MEINE_ID;
      card.style.display = show ? '' : 'none';
      if (show) sichtbar++;
    });
    var keine = document.getElementById('keine-treffer');
    if (keine) keine.style.display = sichtbar === 0 ? 'block' : 'none';
  });
});

// ---------- Einkauf filter ----------
document.querySelectorAll('.chip-filter[data-mfilter]').forEach(function(chip){
  chip.addEventListener('click', function(){
    document.querySelectorAll('.chip-filter[data-mfilter]').forEach(function(c){ c.classList.remove('active'); });
    chip.classList.add('active');
    var f = chip.getAttribute('data-mfilter');
    document.querySelectorAll('#mat-table tbody tr').forEach(function(tr){
      if (!tr.getAttribute('data-status')) return;
      tr.style.display = (f === 'alle' || tr.getAttribute('data-status') === f) ? '' : 'none';
    });
  });
});

// ========== Objekt anlegen / bearbeiten ==========
function oeffneNeueObjekt(){
  var form = document.getElementById('objekt-form');
  if (form) { form.reset(); form.querySelector('[name=id]').value=''; document.getElementById('objekt-modal-title').textContent='Neue Baustelle'; }
  document.getElementById('objekt-modal').classList.add('open');
}
async function oeffneEditObjekt(id){
  try {
    var d = await api('GET', '/api/objekt/' + id);
    location.href = '/objekt/' + id + '?edit=1';
  } catch(e){ toast(e.message, true); }
}
async function speichereObjekt(e){
  e.preventDefault();
  var form = e.target;
  var fd = new FormData(form);
  var obj = {}; fd.forEach(function(v,k){ obj[k]=v; });
  try {
    var id = obj.id;
    if (id) { await api('PUT', '/api/objekt/'+id, obj); }
    else { var r = await api('POST', '/api/objekt', obj); id = r.id; }
    toast('Baustelle gespeichert');
    setTimeout(function(){ location.href = '/objekt/' + id; }, 500);
  } catch(err){ toast(err.message, true); }
  return false;
}

// ========== Gewerke ==========
async function aendereGewerkStatus(id, status){
  var grund = null;
  if (status === 'blockiert') {
    grund = prompt('Blocker-Grund:');
    if (grund === null) { location.reload(); return; }
  }
  try {
    await api('PUT', '/api/gewerk/'+id, { status: status, blocker_grund: grund });
    toast('Status gespeichert');
    setTimeout(function(){ location.reload(); }, 400);
  } catch(e){ toast(e.message, true); }
}

// ========== Aufgaben ==========
async function speichereAufgabe(e){
  e.preventDefault();
  var fd = new FormData(e.target);
  var obj = { objekt_id: window.__OBJEKT_ID };
  fd.forEach(function(v,k){ obj[k]=v; });
  obj.entscheidung = fd.get('entscheidung') ? 1 : 0;
  try { await api('POST','/api/aufgabe', obj); toast('Aufgabe angelegt'); setTimeout(function(){location.reload();},400); }
  catch(err){ toast(err.message, true); }
  return false;
}
async function toggleAufgabe(id, done){
  try { await api('PUT','/api/aufgabe/'+id, { status: done?'erledigt':'offen' }); toast('Aufgabe aktualisiert'); setTimeout(function(){location.reload();},400); }
  catch(e){ toast(e.message, true); }
}

// ========== Fotos ==========
async function speichereFoto(e){
  e.preventDefault();
  var form = e.target;
  var fd = new FormData(form);
  fd.append('objekt_id', window.__OBJEKT_ID);
  try { await api('POST','/api/foto', fd); toast('Foto gespeichert'); setTimeout(function(){location.reload();},400); }
  catch(err){ toast(err.message, true); }
  return false;
}

// ========== Material ==========
async function speichereMaterial(e){
  e.preventDefault();
  var fd = new FormData(e.target);
  var obj = { objekt_id: window.__OBJEKT_ID };
  fd.forEach(function(v,k){ if(v) obj[k]=v; });
  try { await api('POST','/api/material', obj); toast('Material-Anfrage gestellt'); setTimeout(function(){location.reload();},400); }
  catch(err){ toast(err.message, true); }
  return false;
}
async function zurueckziehenMaterial(id){
  if(!confirm('Anfrage wirklich zurückziehen?')) return;
  try { await api('DELETE','/api/material/'+id); toast('Anfrage zurückgezogen'); setTimeout(function(){location.reload();},400); }
  catch(e){ toast(e.message, true); }
}
async function aendereMaterialStatus(id, status){
  try { await api('PUT','/api/material/'+id, { status: status }); toast('Status: '+status); }
  catch(e){ toast(e.message, true); }
}
function oeffneEinkaufNotiz(id, lieferant, notiz){
  document.getElementById('notiz-id').value = id;
  document.getElementById('notiz-lieferant').value = lieferant || '';
  document.getElementById('notiz-text').value = notiz || '';
  document.getElementById('notiz-modal').classList.add('open');
}
async function speichereEinkaufNotiz(e){
  e.preventDefault();
  var fd = new FormData(e.target);
  var id = fd.get('id');
  try { await api('PUT','/api/material/'+id, { lieferant: fd.get('lieferant'), einkauf_notiz: fd.get('einkauf_notiz') }); toast('Notiz gespeichert'); setTimeout(function(){location.reload();},400); }
  catch(err){ toast(err.message, true); }
  return false;
}

// ========== Jour fixe ==========
async function speichereEntscheidung(e){
  e.preventDefault();
  var fd = new FormData(e.target);
  try { await api('POST','/api/aufgabe', { objekt_id: fd.get('objekt_id'), text: fd.get('text'), entscheidung: 1 }); toast('Entscheidungspunkt angelegt'); setTimeout(function(){location.reload();},400); }
  catch(err){ toast(err.message, true); }
  return false;
}

// ========== Diktier-Eingabe (Web Speech API, de-DE) ==========
(function(){
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    // Kein Support -> Mic-Buttons ausblenden
    document.querySelectorAll('.mic-btn').forEach(function(b){ b.style.display='none'; });
    return;
  }
  var aktiv = null;
  document.addEventListener('click', function(e){
    var btn = e.target.closest('.mic-btn');
    if (!btn) return;
    var targetId = btn.getAttribute('data-mic-for');
    var field = document.getElementById(targetId);
    if (!field) return;

    if (aktiv && aktiv.btn === btn) { aktiv.rec.stop(); return; }
    if (aktiv) { aktiv.rec.stop(); }

    var rec = new SR();
    rec.lang = 'de-DE';
    rec.interimResults = true;
    rec.continuous = false;
    var startWert = field.value ? field.value + ' ' : '';
    btn.classList.add('rec');
    aktiv = { rec: rec, btn: btn };

    rec.onresult = function(ev){
      var txt = '';
      for (var i=0; i<ev.results.length; i++){ txt += ev.results[i][0].transcript; }
      field.value = startWert + txt;
    };
    rec.onerror = function(ev){ toast('Spracherkennung: ' + ev.error, true); };
    rec.onend = function(){ btn.classList.remove('rec'); aktiv = null; };
    try { rec.start(); } catch(err){ btn.classList.remove('rec'); aktiv=null; }
  });
})();

// Auto-open edit modal wenn ?edit=1
(function(){
  if (location.search.indexOf('edit=1') >= 0) {
    var m = document.getElementById('objekt-modal');
    if (m) m.classList.add('open');
  }
})();
