-- BW Bau-Cockpit — Datenmodell (PRD Abschnitt 8)

-- nutzer
CREATE TABLE IF NOT EXISTS nutzer (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  rolle TEXT NOT NULL CHECK (rolle IN ('GF','Bauleiter','Einkauf')),
  login TEXT UNIQUE NOT NULL,
  passwort TEXT NOT NULL,
  aktiv INTEGER NOT NULL DEFAULT 1
);

-- objekt (Baustelle)
CREATE TABLE IF NOT EXISTS objekt (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  objektnr TEXT UNIQUE NOT NULL,
  kurzname TEXT NOT NULL,
  adresse TEXT,
  stadt TEXT,
  gesellschaft TEXT CHECK (gesellschaft IN ('PG','BF')),
  typ TEXT,
  wohneinheiten INTEGER,
  prio INTEGER NOT NULL DEFAULT 0,
  status_text TEXT,
  bauleiter_id INTEGER REFERENCES nutzer(id),
  fertigstellung TEXT,
  onedrive_link TEXT,
  ampel_override TEXT CHECK (ampel_override IN ('gruen','gelb','rot')),
  notiz TEXT,
  archiviert INTEGER NOT NULL DEFAULT 0,
  angelegt_am TEXT DEFAULT (datetime('now'))
);

-- gewerk
CREATE TABLE IF NOT EXISTS gewerk (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  objekt_id INTEGER NOT NULL REFERENCES objekt(id),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'offen' CHECK (status IN ('offen','laeuft','fertig','blockiert')),
  verantwortlich_typ TEXT CHECK (verantwortlich_typ IN ('eigen','sub')),
  verantwortlich_name TEXT,
  abhaengig_von_id INTEGER REFERENCES gewerk(id),
  blocker_grund TEXT,
  reihenfolge INTEGER DEFAULT 0,
  aktualisiert_am TEXT DEFAULT (datetime('now'))
);

-- aufgabe
CREATE TABLE IF NOT EXISTS aufgabe (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  objekt_id INTEGER NOT NULL REFERENCES objekt(id),
  gewerk_id INTEGER REFERENCES gewerk(id),
  text TEXT NOT NULL,
  verantwortlich_id INTEGER REFERENCES nutzer(id),
  frist TEXT,
  status TEXT NOT NULL DEFAULT 'offen' CHECK (status IN ('offen','erledigt')),
  erstellt_von_id INTEGER REFERENCES nutzer(id),
  erstellt_am TEXT DEFAULT (datetime('now')),
  erledigt_am TEXT,
  entscheidung INTEGER NOT NULL DEFAULT 0
);

-- foto
CREATE TABLE IF NOT EXISTS foto (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  objekt_id INTEGER NOT NULL REFERENCES objekt(id),
  bereich TEXT,
  datei_url TEXT,
  kommentar TEXT,
  datum TEXT,
  hochgeladen_von_id INTEGER REFERENCES nutzer(id)
);

-- materialanfrage
CREATE TABLE IF NOT EXISTS materialanfrage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  objekt_id INTEGER NOT NULL REFERENCES objekt(id),
  gewerk_id INTEGER REFERENCES gewerk(id),
  beschreibung TEXT NOT NULL,
  angefragt_von_id INTEGER REFERENCES nutzer(id),
  angefragt_am TEXT DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'offen' CHECK (status IN ('offen','bestellt','geliefert')),
  einkauf_notiz TEXT,
  lieferant TEXT,
  aktualisiert_am TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_gewerk_objekt ON gewerk(objekt_id);
CREATE INDEX IF NOT EXISTS idx_aufgabe_objekt ON aufgabe(objekt_id);
CREATE INDEX IF NOT EXISTS idx_foto_objekt ON foto(objekt_id);
CREATE INDEX IF NOT EXISTS idx_material_objekt ON materialanfrage(objekt_id);
CREATE INDEX IF NOT EXISTS idx_material_status ON materialanfrage(status);
