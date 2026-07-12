-- BW Bau-Cockpit — Seed-Daten (PRD Abschnitt 14)
-- Datumslogik relativ zu "heute" (datetime('now')) damit Ampel & Jour-fixe live stimmen.

DELETE FROM materialanfrage;
DELETE FROM foto;
DELETE FROM aufgabe;
DELETE FROM gewerk;
DELETE FROM objekt;
DELETE FROM nutzer;
DELETE FROM sqlite_sequence;

-- ============ NUTZER ============
-- Einheitliches Demo-Passwort: bw2026!
INSERT INTO nutzer (id, name, rolle, login, passwort, aktiv) VALUES
  (1, 'Christoph Brechtel', 'GF',        'brechtel', 'bw2026!', 1),
  (2, 'Eduard Geier',      'Bauleiter',  'geier',    'bw2026!', 1),
  (3, 'Dominic Booch',     'Bauleiter',  'booch',    'bw2026!', 1),
  (4, 'Atanas Gitev',      'Bauleiter',  'gitev',    'bw2026!', 1),
  (5, 'Robin Neuer',       'Einkauf',    'neuer',    'bw2026!', 1);

-- ============ OBJEKTE ============
INSERT INTO objekt (id, objektnr, kurzname, adresse, stadt, gesellschaft, typ, wohneinheiten, prio, status_text, bauleiter_id, fertigstellung, onedrive_link, ampel_override, notiz, archiviert) VALUES
  (1, '1109', 'Uhlbergstr. 6',   'Uhlbergstraße 6',  'Stuttgart',      'PG', 'MFH', 10, 1, 'Innenausbau',           2, '2026-09-30', 'https://bwgruppe.sharepoint.com/sites/projekte/1109', NULL, NULL, 0),
  (2, '1122', 'Karlstr. 7',      'Karlstraße 7',     'Ludwigsburg',    'PG', 'MFH', 4,  1, 'Estrich trocknet',      2, '2026-09-30', 'https://bwgruppe.sharepoint.com/sites/projekte/1122', NULL, NULL, 0),
  (3, '1131', 'Stöckachstr. 52', 'Stöckachstraße 52','Stuttgart',      'PG', 'MFH', 8,  1, 'Genehmigung offen',     2, '2026-12-31', 'https://bwgruppe.sharepoint.com/sites/projekte/1131', NULL, NULL, 0),
  (4, '1104', 'Bahnhofstr. 12',  'Bahnhofstraße 12', 'Kornwestheim',   'PG', 'MFH', 6,  0, 'Rohinstallation',       3, '2026-10-31', 'https://bwgruppe.sharepoint.com/sites/projekte/1104', NULL, NULL, 0),
  (5, '1115', 'Lindenweg 4',     'Lindenweg 4',      'Fellbach',       'PG', 'MFH', 5,  1, 'Fassade',               4, '2026-11-30', 'https://bwgruppe.sharepoint.com/sites/projekte/1115', NULL, NULL, 0),
  (6, '1127', 'Hauptstr. 30',    'Hauptstraße 30',   'Tamm',           'BF', 'RH-San.', 1, 0, 'Endmontage',          3, '2026-08-31', 'https://bwgruppe.sharepoint.com/sites/projekte/1127', NULL, NULL, 0),
  (7, '1133', 'Neckarstr. 9',    'Neckarstraße 9',   'Freiberg a.N.',  'PG', 'MFH', 7,  1, 'Wasserschaden Keller',  4, '2026-12-31', 'https://bwgruppe.sharepoint.com/sites/projekte/1133', NULL, NULL, 0);

-- ============ GEWERKE ============
-- Standard-Sanierungsliste. Dach & Heizung = Sub, Rest = Eigenleistung.
-- reihenfolge fest, aktualisiert_am für "diese Woche fertig" teils auf -2 Tage.

-- Objekt 1 (1109) GRÜN — Innenausbau, gemischt, Abhängigkeit Dämmung->Fenster; 2 Gewerke diese Woche fertig
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, verantwortlich_name, abhaengig_von_id, blocker_grund, reihenfolge, aktualisiert_am) VALUES
  (1, 'Entkernung/Abbruch', 'fertig',   'eigen', 'Kolonne A', NULL, NULL, 1, datetime('now','-40 days')),
  (1, 'Rohbau/Durchbrüche', 'fertig',   'eigen', 'Kolonne A', NULL, NULL, 2, datetime('now','-30 days')),
  (1, 'Fenster',            'fertig',   'eigen', NULL,        NULL, NULL, 3, datetime('now','-2 days')),
  (1, 'Dämmung/Fassade',    'laeuft',   'eigen', NULL,        NULL, NULL, 4, datetime('now','-5 days')),
  (1, 'Elektro',            'fertig',   'eigen', 'Kolonne B', NULL, NULL, 5, datetime('now','-1 days')),
  (1, 'Sanitär',            'laeuft',   'eigen', NULL,        NULL, NULL, 6, datetime('now','-6 days')),
  (1, 'Heizung',            'laeuft',   'sub',   'Heizungsbau XY', NULL, NULL, 7, datetime('now','-8 days')),
  (1, 'Trockenbau',         'laeuft',   'eigen', NULL,        NULL, NULL, 8, datetime('now','-3 days')),
  (1, 'Estrich',            'offen',    'eigen', NULL,        NULL, NULL, 9, datetime('now','-20 days')),
  (1, 'Fliesen',            'offen',    'eigen', NULL,        NULL, NULL, 10, datetime('now','-20 days')),
  (1, 'Maler',              'offen',    'eigen', NULL,        NULL, NULL, 11, datetime('now','-20 days')),
  (1, 'Boden',             'offen',    'eigen', NULL,        NULL, NULL, 12, datetime('now','-20 days')),
  (1, 'Dach',               'fertig',   'sub',   'Bedachung Müller', NULL, NULL, 13, datetime('now','-50 days')),
  (1, 'Endmontage',         'offen',    'eigen', NULL,        NULL, NULL, 14, datetime('now','-20 days'));
-- Dämmung (id? reihenfolge4) abhängig von Fenster (reihenfolge3): setzen wir per UPDATE unten.

-- Objekt 2 (1122) GELB — Estrich trocknet, überfällige Aufgabe erzeugt Gelb
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, verantwortlich_name, abhaengig_von_id, blocker_grund, reihenfolge, aktualisiert_am) VALUES
  (2, 'Entkernung/Abbruch', 'fertig',   'eigen', 'Kolonne A', NULL, NULL, 1, datetime('now','-60 days')),
  (2, 'Rohbau/Durchbrüche', 'fertig',   'eigen', 'Kolonne A', NULL, NULL, 2, datetime('now','-45 days')),
  (2, 'Fenster',            'fertig',   'eigen', NULL,        NULL, NULL, 3, datetime('now','-35 days')),
  (2, 'Dämmung/Fassade',    'fertig',   'eigen', NULL,        NULL, NULL, 4, datetime('now','-20 days')),
  (2, 'Elektro',            'laeuft',   'eigen', NULL,        NULL, NULL, 5, datetime('now','-4 days')),
  (2, 'Sanitär',            'laeuft',   'eigen', NULL,        NULL, NULL, 6, datetime('now','-4 days')),
  (2, 'Heizung',            'laeuft',   'sub',   'Heizungsbau XY', NULL, NULL, 7, datetime('now','-10 days')),
  (2, 'Trockenbau',         'fertig',   'eigen', NULL,        NULL, NULL, 8, datetime('now','-12 days')),
  (2, 'Estrich',            'laeuft',   'eigen', NULL,        NULL, NULL, 9, datetime('now','-2 days')),
  (2, 'Fliesen',            'offen',    'eigen', NULL,        NULL, NULL, 10, datetime('now','-20 days')),
  (2, 'Maler',              'offen',    'eigen', NULL,        NULL, NULL, 11, datetime('now','-20 days')),
  (2, 'Boden',             'offen',    'eigen', NULL,        NULL, NULL, 12, datetime('now','-20 days')),
  (2, 'Dach',               'fertig',   'sub',   'Bedachung Müller', NULL, NULL, 13, datetime('now','-70 days')),
  (2, 'Endmontage',         'offen',    'eigen', NULL,        NULL, NULL, 14, datetime('now','-20 days'));

-- Objekt 3 (1131) ROT — Genehmigung offen, Rohbau blockiert
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, verantwortlich_name, abhaengig_von_id, blocker_grund, reihenfolge, aktualisiert_am) VALUES
  (3, 'Entkernung/Abbruch', 'fertig',    'eigen', 'Kolonne A', NULL, NULL, 1, datetime('now','-25 days')),
  (3, 'Rohbau/Durchbrüche', 'blockiert', 'eigen', 'Kolonne A', NULL, 'Baugenehmigung offen', 2, datetime('now','-6 days')),
  (3, 'Fenster',            'offen',     'eigen', NULL,        NULL, NULL, 3, datetime('now','-15 days')),
  (3, 'Dämmung/Fassade',    'offen',     'eigen', NULL,        NULL, NULL, 4, datetime('now','-15 days')),
  (3, 'Elektro',            'offen',     'eigen', NULL,        NULL, NULL, 5, datetime('now','-15 days')),
  (3, 'Sanitär',            'offen',     'eigen', NULL,        NULL, NULL, 6, datetime('now','-15 days')),
  (3, 'Heizung',            'offen',     'sub',   'Heizungsbau XY', NULL, NULL, 7, datetime('now','-15 days')),
  (3, 'Trockenbau',         'offen',     'eigen', NULL,        NULL, NULL, 8, datetime('now','-15 days')),
  (3, 'Estrich',            'offen',     'eigen', NULL,        NULL, NULL, 9, datetime('now','-15 days')),
  (3, 'Fliesen',            'offen',     'eigen', NULL,        NULL, NULL, 10, datetime('now','-15 days')),
  (3, 'Maler',              'offen',     'eigen', NULL,        NULL, NULL, 11, datetime('now','-15 days')),
  (3, 'Boden',             'offen',     'eigen', NULL,        NULL, NULL, 12, datetime('now','-15 days')),
  (3, 'Dach',               'offen',     'sub',   'Bedachung Müller', NULL, NULL, 13, datetime('now','-15 days')),
  (3, 'Endmontage',         'offen',     'eigen', NULL,        NULL, NULL, 14, datetime('now','-15 days'));

-- Objekt 4 (1104) GRÜN — Rohinstallation
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, verantwortlich_name, abhaengig_von_id, blocker_grund, reihenfolge, aktualisiert_am) VALUES
  (4, 'Entkernung/Abbruch', 'fertig',   'eigen', 'Kolonne C', NULL, NULL, 1, datetime('now','-30 days')),
  (4, 'Rohbau/Durchbrüche', 'fertig',   'eigen', 'Kolonne C', NULL, NULL, 2, datetime('now','-18 days')),
  (4, 'Fenster',            'fertig',   'eigen', NULL,        NULL, NULL, 3, datetime('now','-3 days')),
  (4, 'Dämmung/Fassade',    'laeuft',   'eigen', NULL,        NULL, NULL, 4, datetime('now','-5 days')),
  (4, 'Elektro',            'laeuft',   'eigen', NULL,        NULL, NULL, 5, datetime('now','-2 days')),
  (4, 'Sanitär',            'laeuft',   'eigen', NULL,        NULL, NULL, 6, datetime('now','-2 days')),
  (4, 'Heizung',            'offen',    'sub',   'Heizungsbau XY', NULL, NULL, 7, datetime('now','-10 days')),
  (4, 'Trockenbau',         'offen',    'eigen', NULL,        NULL, NULL, 8, datetime('now','-10 days')),
  (4, 'Estrich',            'offen',    'eigen', NULL,        NULL, NULL, 9, datetime('now','-10 days')),
  (4, 'Fliesen',            'offen',    'eigen', NULL,        NULL, NULL, 10, datetime('now','-10 days')),
  (4, 'Maler',              'offen',    'eigen', NULL,        NULL, NULL, 11, datetime('now','-10 days')),
  (4, 'Boden',             'offen',    'eigen', NULL,        NULL, NULL, 12, datetime('now','-10 days')),
  (4, 'Dach',               'fertig',   'sub',   'Bedachung Müller', NULL, NULL, 13, datetime('now','-40 days')),
  (4, 'Endmontage',         'offen',    'eigen', NULL,        NULL, NULL, 14, datetime('now','-10 days'));

-- Objekt 5 (1115) GELB — Fassade, überfällige Aufgabe erzeugt Gelb
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, verantwortlich_name, abhaengig_von_id, blocker_grund, reihenfolge, aktualisiert_am) VALUES
  (5, 'Entkernung/Abbruch', 'fertig',   'eigen', 'Kolonne C', NULL, NULL, 1, datetime('now','-35 days')),
  (5, 'Rohbau/Durchbrüche', 'fertig',   'eigen', 'Kolonne C', NULL, NULL, 2, datetime('now','-25 days')),
  (5, 'Fenster',            'fertig',   'eigen', NULL,        NULL, NULL, 3, datetime('now','-14 days')),
  (5, 'Dämmung/Fassade',    'laeuft',   'eigen', NULL,        NULL, NULL, 4, datetime('now','-3 days')),
  (5, 'Elektro',            'laeuft',   'eigen', NULL,        NULL, NULL, 5, datetime('now','-6 days')),
  (5, 'Sanitär',            'offen',    'eigen', NULL,        NULL, NULL, 6, datetime('now','-12 days')),
  (5, 'Heizung',            'offen',    'sub',   'Heizungsbau XY', NULL, NULL, 7, datetime('now','-12 days')),
  (5, 'Trockenbau',         'offen',    'eigen', NULL,        NULL, NULL, 8, datetime('now','-12 days')),
  (5, 'Estrich',            'offen',    'eigen', NULL,        NULL, NULL, 9, datetime('now','-12 days')),
  (5, 'Fliesen',            'offen',    'eigen', NULL,        NULL, NULL, 10, datetime('now','-12 days')),
  (5, 'Maler',              'offen',    'eigen', NULL,        NULL, NULL, 11, datetime('now','-12 days')),
  (5, 'Boden',             'offen',    'eigen', NULL,        NULL, NULL, 12, datetime('now','-12 days')),
  (5, 'Dach',               'fertig',   'sub',   'Bedachung Müller', NULL, NULL, 13, datetime('now','-45 days')),
  (5, 'Endmontage',         'offen',    'eigen', NULL,        NULL, NULL, 14, datetime('now','-12 days'));

-- Objekt 6 (1127) GRÜN — Endmontage (fast fertig)
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, verantwortlich_name, abhaengig_von_id, blocker_grund, reihenfolge, aktualisiert_am) VALUES
  (6, 'Entkernung/Abbruch', 'fertig',   'eigen', 'Kolonne C', NULL, NULL, 1, datetime('now','-60 days')),
  (6, 'Rohbau/Durchbrüche', 'fertig',   'eigen', 'Kolonne C', NULL, NULL, 2, datetime('now','-50 days')),
  (6, 'Fenster',            'fertig',   'eigen', NULL,        NULL, NULL, 3, datetime('now','-40 days')),
  (6, 'Dämmung/Fassade',    'fertig',   'eigen', NULL,        NULL, NULL, 4, datetime('now','-30 days')),
  (6, 'Elektro',            'fertig',   'eigen', NULL,        NULL, NULL, 5, datetime('now','-20 days')),
  (6, 'Sanitär',            'fertig',   'eigen', NULL,        NULL, NULL, 6, datetime('now','-18 days')),
  (6, 'Heizung',            'fertig',   'sub',   'Heizungsbau XY', NULL, NULL, 7, datetime('now','-15 days')),
  (6, 'Trockenbau',         'fertig',   'eigen', NULL,        NULL, NULL, 8, datetime('now','-14 days')),
  (6, 'Estrich',            'fertig',   'eigen', NULL,        NULL, NULL, 9, datetime('now','-12 days')),
  (6, 'Fliesen',            'fertig',   'eigen', NULL,        NULL, NULL, 10, datetime('now','-8 days')),
  (6, 'Maler',              'fertig',   'eigen', NULL,        NULL, NULL, 11, datetime('now','-4 days')),
  (6, 'Boden',             'fertig',   'eigen', NULL,        NULL, NULL, 12, datetime('now','-3 days')),
  (6, 'Dach',               'fertig',   'sub',   'Bedachung Müller', NULL, NULL, 13, datetime('now','-70 days')),
  (6, 'Endmontage',         'laeuft',   'eigen', NULL,        NULL, NULL, 14, datetime('now','-1 days'));

-- Objekt 7 (1133) ROT — Wasserschaden, Sanitär blockiert
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, verantwortlich_name, abhaengig_von_id, blocker_grund, reihenfolge, aktualisiert_am) VALUES
  (7, 'Entkernung/Abbruch', 'fertig',    'eigen', 'Kolonne C', NULL, NULL, 1, datetime('now','-40 days')),
  (7, 'Rohbau/Durchbrüche', 'fertig',    'eigen', 'Kolonne C', NULL, NULL, 2, datetime('now','-28 days')),
  (7, 'Fenster',            'fertig',    'eigen', NULL,        NULL, NULL, 3, datetime('now','-18 days')),
  (7, 'Dämmung/Fassade',    'laeuft',    'eigen', NULL,        NULL, NULL, 4, datetime('now','-6 days')),
  (7, 'Elektro',            'laeuft',    'eigen', NULL,        NULL, NULL, 5, datetime('now','-5 days')),
  (7, 'Sanitär',            'blockiert', 'eigen', NULL,        NULL, 'Wasserschaden Keller — Ursache offen', 6, datetime('now','-4 days')),
  (7, 'Heizung',            'offen',     'sub',   'Heizungsbau XY', NULL, NULL, 7, datetime('now','-14 days')),
  (7, 'Trockenbau',         'offen',     'eigen', NULL,        NULL, NULL, 8, datetime('now','-14 days')),
  (7, 'Estrich',            'offen',     'eigen', NULL,        NULL, NULL, 9, datetime('now','-14 days')),
  (7, 'Fliesen',            'offen',     'eigen', NULL,        NULL, NULL, 10, datetime('now','-14 days')),
  (7, 'Maler',              'offen',     'eigen', NULL,        NULL, NULL, 11, datetime('now','-14 days')),
  (7, 'Boden',             'offen',     'eigen', NULL,        NULL, NULL, 12, datetime('now','-14 days')),
  (7, 'Dach',               'fertig',    'sub',   'Bedachung Müller', NULL, NULL, 13, datetime('now','-50 days')),
  (7, 'Endmontage',         'offen',     'eigen', NULL,        NULL, NULL, 14, datetime('now','-14 days'));

-- Abhängigkeit: Dämmung/Fassade hängt von Fenster ab (je Objekt)
UPDATE gewerk SET abhaengig_von_id = (
  SELECT g2.id FROM gewerk g2 WHERE g2.objekt_id = gewerk.objekt_id AND g2.name = 'Fenster'
) WHERE name = 'Dämmung/Fassade';

-- ============ AUFGABEN ============
-- Standard-Beispielaufgaben (1109)
INSERT INTO aufgabe (objekt_id, gewerk_id, text, verantwortlich_id, frist, status, erstellt_von_id, erstellt_am, entscheidung) VALUES
  (1, NULL, 'Fenstermaße Bad WE3 prüfen', 2, date('now','+3 days'), 'offen', 2, datetime('now','-1 days'), 0),
  (1, NULL, 'Baustrom anmelden', 2, date('now','-5 days'), 'erledigt', 2, datetime('now','-10 days'), 0);
UPDATE aufgabe SET erledigt_am = datetime('now','-6 days') WHERE text = 'Baustrom anmelden';

-- Überfällige offene Aufgaben bei GELB-Objekten (1122, 1115) -> erzeugt Gelb
INSERT INTO aufgabe (objekt_id, gewerk_id, text, verantwortlich_id, frist, status, erstellt_von_id, erstellt_am, entscheidung) VALUES
  (2, NULL, 'Estrich-Feuchtemessung dokumentieren', 2, date('now','-4 days'), 'offen', 2, datetime('now','-12 days'), 0),
  (5, NULL, 'Gerüstabnahme Fassade beauftragen', 4, date('now','-2 days'), 'offen', 4, datetime('now','-9 days'), 0);

-- Entscheidungs-Aufgaben (entscheidung=1, Verantwortlich Brechtel/GF, offen)
INSERT INTO aufgabe (objekt_id, gewerk_id, text, verantwortlich_id, frist, status, erstellt_von_id, erstellt_am, entscheidung) VALUES
  (1, NULL, 'Bodenwahl WE 5–8?',        1, NULL, 'offen', 2, datetime('now','-2 days'), 1),
  (2, NULL, 'Küche ja/nein?',           1, NULL, 'offen', 2, datetime('now','-3 days'), 1),
  (3, NULL, 'Aufteilung 8 vs. 10 WE?',  1, NULL, 'offen', 2, datetime('now','-4 days'), 1);

-- ============ FOTOS (Platzhalter) ============
INSERT INTO foto (objekt_id, bereich, datei_url, kommentar, datum, hochgeladen_von_id) VALUES
  (1, 'WE3 Bad',      '/static/img/placeholder-bau.svg', 'Fliesenraster geprüft', date('now','-2 days'), 2),
  (1, 'Fassade Nord', '/static/img/placeholder-bau.svg', 'Dämmung angebracht',    date('now','-4 days'), 2),
  (1, 'Elektro UG',   '/static/img/placeholder-bau.svg', 'Verteilung gesetzt',    date('now','-1 days'), 2),
  (2, 'EG Wohnraum',  '/static/img/placeholder-bau.svg', 'Estrich eingebracht',   date('now','-2 days'), 2),
  (2, 'Fassade',      '/static/img/placeholder-bau.svg', 'Putz grundiert',        date('now','-6 days'), 2),
  (3, 'Außenansicht', '/static/img/placeholder-bau.svg', 'Vor Sanierungsbeginn',  date('now','-10 days'), 2),
  (5, 'Fassade West', '/static/img/placeholder-bau.svg', 'Gerüst steht',          date('now','-3 days'), 4),
  (7, 'Keller',       '/static/img/placeholder-bau.svg', 'Wasserschaden Keller',  date('now','-4 days'), 4);

-- ============ MATERIAL-ANFRAGEN ============
INSERT INTO materialanfrage (objekt_id, gewerk_id, beschreibung, angefragt_von_id, angefragt_am, status, einkauf_notiz, lieferant, aktualisiert_am) VALUES
  (1, NULL, '20 m² Dämmung WLG035 + 6 Sack Kleber', 2, datetime('now','-1 days'), 'offen', NULL, NULL, datetime('now','-1 days')),
  (2, NULL, '12 Innentüren weiß', 3, datetime('now','-2 days'), 'bestellt', 'Bei Türenwelt bestellt, KW30', 'Türenwelt GmbH', datetime('now','-1 days')),
  (3, NULL, 'Sanitär-Grobmaterial WE2', 4, datetime('now','-3 days'), 'geliefert', 'Geliefert, auf Baustelle eingelagert', 'Sanitär Groß AG', datetime('now','-1 days')),
  (5, NULL, 'Fassadenfarbe silikat 200 L', 4, datetime('now','-1 days'), 'offen', NULL, NULL, datetime('now','-1 days')),
  (7, NULL, 'Bautrockner 4 Stk (Miete)', 4, datetime('now','-2 days'), 'bestellt', 'Mietgerät bestellt', 'Mietprofi', datetime('now','-1 days'));
