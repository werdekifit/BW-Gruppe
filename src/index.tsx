import { Hono } from 'hono';
import type { Bindings, Nutzer } from './types';
import { getCurrentUser, createSession, clearSession, darfBearbeiten } from './auth';
import { ladeObjekte, ladeObjekt } from './data';
import { layout } from './views/layout';
import { loginPage } from './views/login';
import { cockpitBody, objektModal } from './views/cockpit';
import { detailBody } from './views/detail';
import { jourFixeBody } from './views/jourfixe';
import { einkaufBody } from './views/einkauf';
import { kwNummer } from './util';
import { api } from './api';

const app = new Hono<{ Bindings: Bindings; Variables: { user: Nutzer } }>();

// ---------- Login-Seiten (ohne Auth) ----------
app.get('/login', async (c) => {
  const user = await getCurrentUser(c);
  if (user) return c.redirect('/cockpit');
  const seed = await c.env.DB.prepare("SELECT login, name, rolle FROM nutzer WHERE aktiv=1 ORDER BY CASE rolle WHEN 'GF' THEN 0 WHEN 'Bauleiter' THEN 1 ELSE 2 END, name").all();
  return c.html(loginPage({ seedUsers: seed.results as any[] }));
});

app.post('/login', async (c) => {
  const body = await c.req.parseBody();
  const login = String(body.login || '').trim().toLowerCase();
  const passwort = String(body.passwort || '').trim();
  const wantsJson = (c.req.header('accept') || '').includes('application/json');
  // Login case-insensitiv (Kürzel), Passwort whitespace-tolerant
  const u = await c.env.DB.prepare('SELECT * FROM nutzer WHERE lower(login) = ? AND aktiv = 1').bind(login).first<any>();
  if (!u || String(u.passwort).trim() !== passwort) {
    if (wantsJson) return c.json({ ok: false, error: 'Login oder Passwort falsch.' }, 401);
    const seed = await c.env.DB.prepare("SELECT login, name, rolle FROM nutzer WHERE aktiv=1 ORDER BY rolle, name").all();
    return c.html(loginPage({ error: 'Login oder Passwort falsch.', seedUsers: seed.results as any[] }));
  }
  await createSession(c, u.id);
  if (wantsJson) return c.json({ ok: true, redirect: '/cockpit' });
  return c.redirect('/cockpit');
});

app.get('/logout', (c) => { clearSession(c); return c.redirect('/login'); });

// ---------- Auth-Middleware für alles andere ----------
app.use('*', async (c, next) => {
  const path = c.req.path;
  if (path === '/login' || path.startsWith('/static')) return next();
  const user = await getCurrentUser(c);
  if (!user) {
    if (path.startsWith('/api')) return c.json({ error: 'Nicht angemeldet' }, 401);
    return c.redirect('/login');
  }
  c.set('user', user);
  return next();
});

// ---------- API (JSON) ----------
app.route('/api', api);

// ---------- Cockpit ----------
app.get('/', (c) => c.redirect('/cockpit'));

app.get('/cockpit', async (c) => {
  const user = c.get('user');
  // inkl. archivierter Objekte — Filterung übernimmt der Client (Filter „Abgeschlossen/Archiv")
  const objekte = await ladeObjekte(c.env.DB, { inklArchiviert: true });
  const bauleiter = await c.env.DB.prepare("SELECT id, name FROM nutzer WHERE rolle IN ('Bauleiter','GF') AND aktiv=1 ORDER BY name").all();
  const body = cockpitBody(objekte, user, bauleiter.results as any[]);
  return c.html(layout({ title: 'Cockpit', user, active: 'cockpit', body }));
});

// ---------- Objekt-Detail ----------
app.get('/objekt/:id', async (c) => {
  const user = c.get('user');
  const id = parseInt(c.req.param('id'), 10);
  const objekt = await ladeObjekt(c.env.DB, id);
  if (!objekt) return c.html(layout({ title:'Nicht gefunden', user, active:'', body:'<div class="empty">Baustelle nicht gefunden. <a href="/cockpit">← Cockpit</a></div>' }), 404);

  const gewerke = (await c.env.DB.prepare(`
    SELECT g.*, dep.name AS abhaengig_name, dep.status AS abhaengig_status
    FROM gewerk g LEFT JOIN gewerk dep ON dep.id = g.abhaengig_von_id
    WHERE g.objekt_id = ? ORDER BY g.reihenfolge, g.id`).bind(id).all()).results as any[];

  const aufgaben = (await c.env.DB.prepare(`
    SELECT a.*, n.name AS verantwortlich_name FROM aufgabe a
    LEFT JOIN nutzer n ON n.id = a.verantwortlich_id
    WHERE a.objekt_id = ? ORDER BY a.status ASC, a.frist ASC, a.id DESC`).bind(id).all()).results as any[];

  const fotos = (await c.env.DB.prepare('SELECT * FROM foto WHERE objekt_id = ? ORDER BY datum DESC, id DESC').bind(id).all()).results as any[];

  const material = (await c.env.DB.prepare(`
    SELECT m.*, n.name AS angefragt_von_name, g.name AS gewerk_name FROM materialanfrage m
    LEFT JOIN nutzer n ON n.id = m.angefragt_von_id
    LEFT JOIN gewerk g ON g.id = m.gewerk_id
    WHERE m.objekt_id = ? ORDER BY m.angefragt_am DESC`).bind(id).all()).results as any[];

  const nutzer = (await c.env.DB.prepare("SELECT id, name, rolle FROM nutzer WHERE aktiv=1 ORDER BY name").all()).results as any[];

  // Vorbereitung (1:1) — bei Bedarf anlegen
  await c.env.DB.prepare('INSERT OR IGNORE INTO vorbereitung (objekt_id) VALUES (?)').bind(id).run();
  const vorbereitung = (await c.env.DB.prepare('SELECT * FROM vorbereitung WHERE objekt_id = ?').bind(id).first()) as any;

  const verlauf = (await c.env.DB.prepare(`
    SELECT v.*, n.name AS nutzer_name FROM verlauf v
    LEFT JOIN nutzer n ON n.id = v.nutzer_id
    WHERE v.objekt_id = ? ORDER BY v.zeitpunkt DESC, v.id DESC LIMIT 100`).bind(id).all()).results as any[];

  let body = detailBody({ objekt, gewerke, aufgaben, fotos, material, nutzer, vorbereitung, verlauf }, user);

  // Objekt-Modal (bearbeiten) anhängen wenn Rechte
  if (darfBearbeiten(user.rolle)) {
    const bauleiter = (await c.env.DB.prepare("SELECT id, name FROM nutzer WHERE rolle IN ('Bauleiter','GF') AND aktiv=1 ORDER BY name").all()).results as any[];
    body += objektModal(objekt, user, bauleiter);
  }

  return c.html(layout({ title: `${objekt.objektnr} ${objekt.kurzname}`, user, active:'', body }));
});

// ---------- Jour fixe ----------
app.get('/jour-fixe', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  const fertig = (await db.prepare(`
    SELECT g.objekt_id, o.objektnr, o.kurzname, g.name AS gewerk
    FROM gewerk g JOIN objekt o ON o.id = g.objekt_id
    WHERE g.status='fertig' AND g.aktualisiert_am >= datetime('now','-7 days') AND o.archiviert=0
    ORDER BY g.aktualisiert_am DESC`).all()).results as any[];

  const blockiert = (await db.prepare(`
    SELECT g.objekt_id, o.objektnr, o.kurzname, COALESCE(g.blocker_grund, g.name || ' blockiert') AS grund
    FROM gewerk g JOIN objekt o ON o.id = g.objekt_id
    WHERE g.status='blockiert' AND o.archiviert=0
    ORDER BY CASE WHEN o.prio_rang IS NULL THEN 1 ELSE 0 END, o.prio_rang, o.prio DESC`).all()).results as any[];

  const entscheiden = (await db.prepare(`
    SELECT a.objekt_id, o.objektnr, o.kurzname, a.text
    FROM aufgabe a JOIN objekt o ON o.id = a.objekt_id
    WHERE a.entscheidung=1 AND a.status='offen' AND o.archiviert=0
    ORDER BY CASE WHEN o.prio_rang IS NULL THEN 1 ELSE 0 END, o.prio_rang, a.erstellt_am DESC`).all()).results as any[];

  const prioObjekte = (await db.prepare("SELECT id, objektnr, kurzname FROM objekt WHERE archiviert=0 ORDER BY CASE WHEN prio_rang IS NULL THEN 1 ELSE 0 END, prio_rang, objektnr").all()).results as any[];

  const body = jourFixeBody({ fertig, blockiert, entscheiden, prioObjekte }, user);
  return c.html(layout({ title:'Jour fixe', user, active:'jourfixe', body }));
});

// ---------- Einkauf ----------
app.get('/einkauf', async (c) => {
  const user = c.get('user');
  if (!(user.rolle === 'GF' || user.rolle === 'Einkauf')) return c.redirect('/cockpit');
  const material = (await c.env.DB.prepare(`
    SELECT m.*, o.objektnr, o.kurzname, n.name AS angefragt_von_name, g.name AS gewerk_name
    FROM materialanfrage m
    JOIN objekt o ON o.id = m.objekt_id
    LEFT JOIN nutzer n ON n.id = m.angefragt_von_id
    LEFT JOIN gewerk g ON g.id = m.gewerk_id
    ORDER BY CASE m.status WHEN 'offen' THEN 0 WHEN 'bestellt' THEN 1 ELSE 2 END, m.angefragt_am DESC`).all()).results as any[];
  const body = einkaufBody(material, user);
  return c.html(layout({ title:'Einkauf', user, active:'einkauf', body }));
});

export default app;
