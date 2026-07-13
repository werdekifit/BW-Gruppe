-- BW Bau-Cockpit v2 — Vollausbau (additiv, zerstört keine Daten)

-- 1) objekt: Prio-Rang, Leistung, kaufmännische Felder
ALTER TABLE objekt ADD COLUMN prio_rang INTEGER;
ALTER TABLE objekt ADD COLUMN leistung TEXT;
ALTER TABLE objekt ADD COLUMN az_netto REAL;
ALTER TABLE objekt ADD COLUMN sr_netto REAL;
ALTER TABLE objekt ADD COLUMN ist_kosten REAL;

-- 2) gewerk: AN (Auftragnehmer), Install-/Montage-Status, Beträge, Notiz
ALTER TABLE gewerk ADD COLUMN an TEXT;
ALTER TABLE gewerk ADD COLUMN install_status TEXT CHECK (install_status IN ('offen','laeuft','fertig','entfaellt'));
ALTER TABLE gewerk ADD COLUMN montage_status TEXT CHECK (montage_status IN ('offen','laeuft','fertig','entfaellt'));
ALTER TABLE gewerk ADD COLUMN angebot_netto REAL;
ALTER TABLE gewerk ADD COLUMN abgerechnet_netto REAL;
ALTER TABLE gewerk ADD COLUMN notiz TEXT;

-- 3) vorbereitung (1:1 zu objekt) — Vorbereitungsphase aus der Excel
CREATE TABLE IF NOT EXISTS vorbereitung (
  objekt_id INTEGER PRIMARY KEY REFERENCES objekt(id),
  genehmigung TEXT NOT NULL DEFAULT 'offen' CHECK (genehmigung IN ('offen','aktiv','erledigt','entfaellt')),
  statik      TEXT NOT NULL DEFAULT 'offen' CHECK (statik      IN ('offen','aktiv','erledigt','entfaellt')),
  bb          TEXT NOT NULL DEFAULT 'offen' CHECK (bb          IN ('offen','aktiv','erledigt','entfaellt')),
  sperrung    TEXT NOT NULL DEFAULT 'offen' CHECK (sperrung    IN ('offen','aktiv','erledigt','entfaellt')),
  b_modus     TEXT NOT NULL DEFAULT 'offen' CHECK (b_modus     IN ('offen','aktiv','erledigt','entfaellt')),
  demontage   TEXT NOT NULL DEFAULT 'offen' CHECK (demontage   IN ('offen','aktiv','erledigt','entfaellt')),
  lv          TEXT NOT NULL DEFAULT 'offen' CHECK (lv          IN ('offen','aktiv','erledigt','entfaellt')),
  bb_datum TEXT,
  notiz TEXT,
  aktualisiert_am TEXT DEFAULT (datetime('now'))
);

-- 4) verlauf — Aktivitäts-/Änderungsprotokoll je Objekt
CREATE TABLE IF NOT EXISTS verlauf (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  objekt_id INTEGER NOT NULL REFERENCES objekt(id),
  nutzer_id INTEGER REFERENCES nutzer(id),
  aktion TEXT NOT NULL,
  feld TEXT,
  alt_wert TEXT,
  neu_wert TEXT,
  zeitpunkt TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_verlauf_objekt ON verlauf(objekt_id, zeitpunkt);

-- Vorbereitung für bestehende Objekte anlegen
INSERT INTO vorbereitung (objekt_id)
  SELECT id FROM objekt WHERE id NOT IN (SELECT objekt_id FROM vorbereitung);
