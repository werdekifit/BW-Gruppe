-- BW Bau-Cockpit v2 — Echte Seed-Daten: 40 Projekte aus Projektübersicht.xlsx (Stand 10. Juli)
-- Status-Mapping: Erl.→erledigt/fertig · Aktiv→aktiv/läuft · Offen→offen · x→entfällt · Vorh.→erledigt · Teilweise→aktiv
-- FS-Jahresangaben (2026/2027) → 31.12.JJJJ · KW-Angaben grob in Datum umgerechnet.

DELETE FROM verlauf;
DELETE FROM vorbereitung;
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

-- ============ OBJEKTE (40 echte Projekte, sortiert nach Prio-Rang) ============
-- P-Nr. 9001–9005 = Platzhalter, in der Excel noch keine P-Nr. vergeben.
INSERT INTO objekt (id, objektnr, kurzname, adresse, stadt, gesellschaft, typ, wohneinheiten, prio, prio_rang, leistung, status_text, bauleiter_id, fertigstellung, ampel_override, notiz, az_netto, sr_netto, ist_kosten, archiviert) VALUES
  (1,  '1101', 'Albrecht-Dürer Weg',        'Albrecht-Dürer-Weg',        'Stuttgart',   'PG', 'WH',   NULL, 1, 1,  'WH Sanierung',                  'Nacharbeiten',                    2, '2026-03-31', NULL, NULL, NULL, NULL, NULL, 0),
  (2,  '1118', 'Reutlingerstr. 123',        'Reutlinger Straße 123',     'Stuttgart',   'PG', 'MFH',  4,    1, 2,  'MFH Sanierung',                 'LWP richten',                     3, '2026-04-15', NULL, NULL, NULL, NULL, NULL, 0),
  (3,  '1109', 'Uhlbergstr.',               'Uhlbergstraße',             'Stuttgart',   'PG', 'MFH',  9,    1, 3,  'MFH komplett Sanierung',        'Sanierung läuft',                 2, '2026-12-31', NULL, NULL, NULL, NULL, NULL, 0),
  (4,  '1122', 'Karlstr. Vorderhaus',       'Karlstraße (Vorderhaus)',   'Stuttgart',   'PG', 'MFH',  4,    1, 4,  'MFH Sanierung',                 'Sanierung läuft',                 2, '2026-12-31', NULL, NULL, NULL, NULL, NULL, 0),
  (5,  '1132', 'Karlstr. Hinterhaus',       'Karlstraße (Hinterhaus)',   'Stuttgart',   'PG', 'MFH',  NULL, 1, 5,  'MFH Neubau',                    'Neubau in Vorbereitung',          2, NULL,         NULL, NULL, NULL, NULL, NULL, 0),
  (6,  '1128', 'Stöckachstr.',              'Stöckachstraße',            'Stuttgart',   'PG', 'MFH',  18,   1, 6,  'Musterwohnung / MFH Sanierung', 'Musterwohnung ausbauen',          3, '2027-12-31', NULL, NULL, NULL, NULL, NULL, 0),
  (7,  '2113', 'Reutlingerstr. 78 / Seifert','Reutlinger Straße 78',     'Stuttgart',   'PG', 'MFH',  NULL, 1, 7,  'MFH Sanierung Innenbereich',    'Garageumbau klären',              3, '2026-12-31', NULL, NULL, NULL, NULL, NULL, 0),
  (8,  '1124', 'Antwerpenerstr.',           'Antwerpener Straße',        'Stuttgart',   'PG', 'MFH',  NULL, 1, 8,  'Abgeschlossen',                 'Abrechnen und Auswerten',         4, '2026-01-30', NULL, NULL, NULL, NULL, NULL, 1),
  (9,  '1116', 'Augsburgerstr.',            'Augsburger Straße',         'Stuttgart',   'PG', 'MFH',  NULL, 1, 9,  'Abgeschlossen',                 'Abnahme und Auswerten',           4, '2026-03-31', NULL, NULL, NULL, NULL, NULL, 1),
  (10, '1117', 'Wilhelm-Nagel-Str.',        'Wilhelm-Nagel-Straße',      'Stuttgart',   'PG', 'MFH',  NULL, 1, 10, 'Abgeschlossen',                 'Auswerten',                       4, NULL,         NULL, NULL, 7880, NULL, NULL, 1),
  (11, '1125', 'Schanbacherstr.',           'Schanbacher Straße',        'Stuttgart',   'PG', 'WHG',  2,    0, 11, 'Sanierung 2 Wohnungen',         'Abnahme und Auswerten',           4, '2026-05-29', NULL, NULL, NULL, NULL, NULL, 0),
  (12, '1126', 'Geigeräckerstr.',           'Geigeräckerstraße',         'Stuttgart',   'PG', 'MFH',  NULL, 0, 12, 'Abgeschlossen',                 'Auswerten',                       4, '2026-05-01', NULL, NULL, NULL, NULL, NULL, 1),
  (13, '1119', 'Schmidenerstr.',            'Schmidener Straße',         'Stuttgart',   'PG', 'MFH',  NULL, 0, 13, 'EG Umbau und WE Sanierung',     'BB ab 1. Juli möglich',           3, NULL,         NULL, NULL, NULL, NULL, NULL, 0),
  (14, '1120', 'Tammerweg',                 'Tammerweg',                 'Stuttgart',   'PG', 'WHG',  1,    0, 14, 'UG-Wohnung Umbau',              'UG Umbau',                        3, NULL,         NULL, 'Genehmigung nur UG', NULL, NULL, NULL, 0),
  (15, '9001', 'Kornwestheimerstr.',        'Kornwestheimer Straße',     'Stuttgart',   'PG', 'WHG',  1,    0, 15, 'DG-Wohnung Sanierung',          'Klimamontage und Fassade',        2, '2026-07-01', NULL, 'P-Nr. noch nicht vergeben', NULL, NULL, NULL, 0),
  (16, '2102', 'Neckarstr. / Seifert',      'Neckarstraße',              'Stuttgart',   'PG', 'WHG',  2,    0, 16, 'Sanierung 2 Wohnungen',         NULL,                              4, NULL,         NULL, NULL, NULL, NULL, NULL, 0),
  (17, '2103', 'Vogelsangstr. / Seifert',   'Vogelsangstraße',           'Stuttgart',   'PG', 'Büro', NULL, 0, 17, 'Büro Umbau',                    NULL,                              4, '2026-07-15', NULL, 'SR 30 (Excel) — Wert klären', 10000, NULL, NULL, 0),
  (18, '2118', 'Withauweg',                 'Withauweg',                 'Stuttgart',   'PG', 'Büro', NULL, 0, 18, 'Büro Umbau',                    NULL,                              3, '2026-12-31', NULL, NULL, NULL, NULL, NULL, 0),
  (19, '5110', 'Gänsheidestr. / Tamara',    'Gänsheidestraße',           'Stuttgart',   'PG', 'WH',   NULL, 0, 19, 'WH Sanierung',                  NULL,                              2, '2026-12-31', NULL, NULL, NULL, NULL, NULL, 0),
  (20, '2101', 'Oswald-Hesse-Str. / Louis', 'Oswald-Hesse-Straße',       'Stuttgart',   'PG', 'MFH',  NULL, 0, 20, 'MFH Sanierung',                 'Beauftragt',                      3, '2027-12-31', NULL, NULL, NULL, NULL, NULL, 0),
  (21, '4101', 'Gablenberger Hauptstr.',    'Gablenberger Hauptstraße',  'Stuttgart',   'PG', 'MFH',  NULL, 0, 21, 'MFH Sanierung',                 'Haus ab 1. Juli komplett frei?',  4, '2027-12-31', NULL, NULL, NULL, NULL, NULL, 0),
  (22, '5105', 'Beihingerstr.',             'Beihinger Straße',          'Stuttgart',   'PG', 'WHG',  1,    0, 22, 'DG-Wohnung Umbau',              NULL,                              2, NULL,         NULL, NULL, NULL, NULL, NULL, 0),
  (23, '2116', 'Eugenstr. 37 LB',           'Eugenstraße 37',            'Ludwigsburg', 'PG', 'WHG',  NULL, 0, 23, 'Abgeschlossen',                 'Abrechnen und Auswerten',         3, '2026-05-31', NULL, NULL, NULL, NULL, NULL, 1),
  (24, '5107', 'Mozartstr. / Würthner',     'Mozartstraße',              'Stuttgart',   'PG', 'WH',   NULL, 0, 24, 'WH: Fassade und Ausbau',        NULL,                              2, NULL,         NULL, NULL, NULL, NULL, NULL, 0),
  (25, '5111', 'Johannesstr. 83A',          'Johannesstraße 83A',        'Stuttgart',   'PG', 'WHG',  2,    0, 25, 'Sanierung 2 EG-Wohnungen',      NULL,                              2, NULL,         NULL, NULL, NULL, NULL, NULL, 0),
  (26, '1134', 'Heimgartenstr. 5',          'Heimgartenstraße 5',        'Stuttgart',   'PG', 'WHG',  1,    0, 26, 'UG-Wohnung Umbau',              'Wohnung ab Ende Juli frei',       3, NULL,         NULL, NULL, NULL, NULL, NULL, 0),
  (27, '2127', 'Ludwigsburgerstr.',         'Ludwigsburger Straße',      'Stuttgart',   'PG', 'MFH',  10,   0, 27, 'MFH Sanierung',                 'Sanierung läuft',                 2, '2027-12-31', NULL, NULL, NULL, NULL, NULL, 0),
  (28, '4102', 'Neuestr. 22',               'Neue Straße 22',            'Stuttgart',   'PG', 'MFH',  NULL, 0, 28, 'MFH Sanierung',                 'Angebotzusammenstellung',         4, NULL,         NULL, NULL, NULL, NULL, NULL, 0),
  (29, '4103', 'Neuestr. 24',               'Neue Straße 24',            'Stuttgart',   'PG', 'MFH',  NULL, 0, 29, 'MFH Sanierung',                 'Angebotzusammenstellung',         4, NULL,         NULL, NULL, NULL, NULL, NULL, 0),
  (30, '2132', 'Alexandrstr. 84',           'Alexanderstraße 84',        'Stuttgart',   'PG', 'WHG',  1,    0, 30, 'Wohnung Sanierung',             NULL,                              3, NULL,         NULL, NULL, NULL, NULL, NULL, 0),
  (31, '5109', 'Falchstr. / Würtner',       'Falchstraße',               'Stuttgart',   'PG', 'RH',   NULL, 0, 31, 'Reinhaus Modernisierung',       'Fenstermontage noch offen',       2, '2026-07-01', NULL, NULL, NULL, NULL, NULL, 0),
  (32, '2133', 'Saarstr. 26 Hemmingen',     'Saarstraße 26',             'Hemmingen',   'PG', 'WHG',  NULL, 0, 32, 'Demontage, Boden und Elektro',  NULL,                              3, NULL,         NULL, NULL, NULL, NULL, NULL, 0),
  (33, '2138', 'Böblingerstr. / Denzle',    'Böblinger Straße',          'Stuttgart',   'PG', 'WHG',  1,    0, 33, 'Wohnung Sanierung',             NULL,                              2, NULL,         NULL, NULL, NULL, NULL, NULL, 0),
  (34, '2136', 'Mandarinenweg / Zeljko',    'Mandarinenweg',             'Stuttgart',   'PG', 'WHG',  1,    0, 34, 'Wohnung Sanierung',             'Angebot von Sub einholen',        3, '2026-09-01', NULL, NULL, NULL, NULL, NULL, 0),
  (35, '9002', 'Hermann-Kurz-Str. / Chris', 'Hermann-Kurz-Straße',       'Stuttgart',   'PG', 'WH',   NULL, 0, 35, 'WH Neubau',                     NULL,                              4, NULL,         NULL, 'P-Nr. noch nicht vergeben', NULL, NULL, NULL, 0),
  (36, '9003', 'Bismarkplatz / Karl',       'Bismarckplatz',             'Stuttgart',   'PG', 'Service', NULL, 0, 36, 'Schimmel Beseitigung',       'Abrechnen',                       4, NULL,         NULL, 'P-Nr. noch nicht vergeben', NULL, NULL, NULL, 0),
  (37, '2112', 'Wannenstr. / Kaufmann',     'Wannenstraße',              'Stuttgart',   'PG', 'Service', NULL, 0, 37, 'TR Aufbereitung und Klimaanlage', '1. AZ schreiben',             2, NULL,         NULL, 'BB geplant KW 28', NULL, NULL, NULL, 0),
  (38, '9004', 'Höscheleweg 18',            'Höscheleweg 18',            'Stuttgart',   'PG', 'Außenanlage', NULL, 0, 38, 'Gartenarbeiten',           'Gartenarbeiten und Sanierung',    3, NULL,         NULL, 'P-Nr. noch nicht vergeben', NULL, NULL, NULL, 0),
  (39, '9005', 'Birkenstr. / Boyne',        'Birkenstraße',              'Stuttgart',   'PG', 'Service', NULL, 0, 39, 'Sonnenschutz Reparatur',     'Fassade Reparatur',               2, NULL,         NULL, 'P-Nr. noch nicht vergeben · BB geplant KW 28', NULL, NULL, NULL, 0),
  (40, '2140', 'Pischekstr. 11',            'Pischekstraße 11',          'Stuttgart',   'PG', 'WHG',  1,    0, 42, 'Boden und streichen',           'Wohnung ist frei',                3, NULL,         NULL, 'BB geplant August', NULL, NULL, NULL, 0);

-- ============ VORBEREITUNG (Baustellenstatus aus der Excel) ============
INSERT INTO vorbereitung (objekt_id, genehmigung, statik, bb, sperrung, b_modus, demontage, lv, bb_datum, notiz) VALUES
  (1,  'offen',    'erledigt', 'erledigt', 'erledigt', 'erledigt', 'erledigt', 'entfaellt', NULL,         NULL),
  (2,  'erledigt', 'erledigt', 'erledigt', 'erledigt', 'erledigt', 'erledigt', 'entfaellt', NULL,         NULL),
  (3,  'offen',    'offen',    'erledigt', 'aktiv',    'erledigt', 'aktiv',    'erledigt',  '2025-02-01', NULL),
  (4,  'erledigt', 'erledigt', 'erledigt', 'aktiv',    'erledigt', 'aktiv',    'erledigt',  '2025-09-01', NULL),
  (5,  'entfaellt','entfaellt','entfaellt','entfaellt','entfaellt','entfaellt','entfaellt', NULL,         NULL),
  (6,  'erledigt', 'offen',    'erledigt', 'offen',    'aktiv',    'aktiv',    'erledigt',  NULL,         'Bewohner-Modus teilweise'),
  (7,  'erledigt', 'offen',    'erledigt', 'erledigt', 'erledigt', 'erledigt', 'erledigt',  NULL,         NULL),
  (8,  'entfaellt','entfaellt','erledigt', 'entfaellt','erledigt', 'erledigt', 'entfaellt', NULL,         NULL),
  (9,  'entfaellt','entfaellt','erledigt', 'entfaellt','erledigt', 'erledigt', 'entfaellt', NULL,         NULL),
  (10, 'entfaellt','entfaellt','erledigt', 'entfaellt','erledigt', 'erledigt', 'entfaellt', NULL,         NULL),
  (11, 'entfaellt','entfaellt','erledigt', 'entfaellt','erledigt', 'erledigt', 'offen',     NULL,         NULL),
  (12, 'entfaellt','entfaellt','erledigt', 'entfaellt','erledigt', 'erledigt', 'entfaellt', NULL,         NULL),
  (13, 'erledigt', 'offen',    'offen',    'aktiv',    'offen',    'offen',    'offen',     NULL,         'BB ab 1. Juli möglich'),
  (14, 'erledigt', 'entfaellt','offen',    'entfaellt','erledigt', 'erledigt', 'offen',     NULL,         'Genehmigung nur UG'),
  (15, 'erledigt', 'erledigt', 'erledigt', 'erledigt', 'erledigt', 'erledigt', 'entfaellt', NULL,         NULL),
  (16, 'entfaellt','erledigt', 'erledigt', 'entfaellt','erledigt', 'erledigt', 'offen',     NULL,         NULL),
  (17, 'entfaellt','erledigt', 'erledigt', 'entfaellt','erledigt', 'erledigt', 'offen',     NULL,         NULL),
  (18, 'entfaellt','entfaellt','erledigt', 'entfaellt','erledigt', 'erledigt', 'offen',     NULL,         NULL),
  (19, 'entfaellt','erledigt', 'erledigt', 'entfaellt','erledigt', 'erledigt', 'offen',     NULL,         NULL),
  (20, 'erledigt', 'offen',    'offen',    'offen',    'offen',    'offen',    'offen',     NULL,         NULL),
  (21, 'offen',    'offen',    'offen',    'offen',    'aktiv',    'aktiv',    'offen',     NULL,         'Bewohner-Modus teilweise'),
  (22, 'erledigt', 'entfaellt','entfaellt','entfaellt','entfaellt','entfaellt','offen',     NULL,         NULL),
  (23, 'entfaellt','entfaellt','erledigt', 'entfaellt','erledigt', 'erledigt', 'entfaellt', NULL,         NULL),
  (24, 'erledigt', 'erledigt', 'erledigt', 'entfaellt','erledigt', 'entfaellt','offen',     NULL,         NULL),
  (25, 'erledigt', 'entfaellt','offen',    'entfaellt','offen',    'offen',    'offen',     NULL,         NULL),
  (26, 'offen',    'entfaellt','offen',    'entfaellt','offen',    'offen',    'offen',     NULL,         'Wohnung ab Ende Juli frei'),
  (27, 'erledigt', 'offen',    'erledigt', 'aktiv',    'erledigt', 'aktiv',    'erledigt',  NULL,         NULL),
  (28, 'entfaellt','entfaellt','offen',    'offen',    'offen',    'offen',    'offen',     NULL,         NULL),
  (29, 'entfaellt','entfaellt','offen',    'offen',    'offen',    'offen',    'offen',     NULL,         NULL),
  (30, 'entfaellt','entfaellt','erledigt', 'entfaellt','erledigt', 'erledigt', 'offen',     NULL,         NULL),
  (31, 'entfaellt','entfaellt','erledigt', 'entfaellt','erledigt', 'erledigt', 'erledigt',  NULL,         NULL),
  (32, 'entfaellt','entfaellt','offen',    'entfaellt','entfaellt','offen',    'offen',     '2026-08-25', 'BB geplant 25. Aug'),
  (33, 'entfaellt','entfaellt','erledigt', 'entfaellt','offen',    'offen',    'offen',     '2026-07-01', NULL),
  (34, 'entfaellt','entfaellt','offen',    'entfaellt','offen',    'offen',    'erledigt',  NULL,         NULL),
  (35, 'offen',    'offen',    'offen',    'offen',    'offen',    'offen',    'offen',     NULL,         NULL),
  (36, 'entfaellt','entfaellt','erledigt', 'entfaellt','entfaellt','entfaellt','entfaellt', NULL,         NULL),
  (37, 'entfaellt','entfaellt','offen',    'entfaellt','entfaellt','entfaellt','erledigt',  '2026-07-06', 'BB KW 28'),
  (38, 'entfaellt','entfaellt','offen',    'entfaellt','entfaellt','entfaellt','offen',     NULL,         NULL),
  (39, 'entfaellt','entfaellt','offen',    'entfaellt','entfaellt','entfaellt','entfaellt', '2026-07-06', 'BB KW 28'),
  (40, 'entfaellt','entfaellt','offen',    'entfaellt','entfaellt','offen',    'entfaellt', '2026-08-01', 'BB geplant August');

-- ============ GEWERKE ============
-- Reihenfolge: Fenster/Sonnenschutz 1, Elektro 2, HLS 3, Küche 4, Innenausbau 5, Fassade 6, Balkon/Terrasse 7, Dach 8, Gerüst 9, Sonstiges 10+

-- 1101 Albrecht-Dürer Weg (P1) — Nacharbeiten, FS überschritten → ROT
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (1, 'Fenster/Sonnenschutz',            'fertig', 'eigen', 'BW Real',   'fertig', 'fertig', NULL, NULL, NULL,               1, datetime('now','-60 days')),
  (1, 'Elektro',                         'fertig', 'eigen', 'BW Real',   'fertig', 'fertig', NULL, NULL, NULL,               2, datetime('now','-30 days')),
  (1, 'HLS (Heizung/Lüftung/Sanitär)',   'fertig', 'sub',   'Würthner',  'fertig', 'fertig', NULL, NULL, NULL,               3, datetime('now','-20 days')),
  (1, 'Innenausbau',                     'laeuft', 'eigen', 'BW Real',   'fertig', 'laeuft', NULL, NULL, 'Nacharbeiten',     5, datetime('now','-2 days'));

-- 1118 Reutlingerstr. 123 (P2) — LWP richten, FS überschritten → ROT
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (2, 'Fenster/Sonnenschutz',            'fertig', 'eigen', 'BW Real',   'fertig', 'fertig', NULL,  NULL, NULL,                       1, datetime('now','-40 days')),
  (2, 'Elektro',                         'fertig', 'eigen', 'BW Real',   'fertig', 'fertig', NULL,  NULL, NULL,                       2, datetime('now','-2 days')),
  (2, 'HLS (Heizung/Lüftung/Sanitär)',   'laeuft', 'sub',   'Würthner',  'fertig', 'laeuft', NULL,  NULL, 'LWP richten',              3, datetime('now','-3 days')),
  (2, 'Küche',                           'fertig', 'sub',   NULL,        'fertig', 'fertig', NULL,  NULL, '4 Küchen, 3x KW17 geliefert', 4, datetime('now','-30 days')),
  (2, 'Innenausbau',                     'fertig', 'sub',   'Dragan',    'fertig', 'fertig', 95000, NULL, NULL,                       5, datetime('now','-25 days'));

-- 1109 Uhlbergstr. (P3) — komplett Sanierung bis 2026
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (3, 'Fenster/Sonnenschutz',            'offen',  'eigen', 'BW Real',   'offen',  'offen',  NULL,      NULL, NULL,                 1, datetime('now','-15 days')),
  (3, 'Elektro',                         'laeuft', 'eigen', 'BW Real',   'laeuft', 'offen',  NULL,      NULL, NULL,                 2, datetime('now','-5 days')),
  (3, 'HLS (Heizung/Lüftung/Sanitär)',   'laeuft', 'sub',   'Würthner',  'laeuft', 'offen',  NULL,      NULL, NULL,                 3, datetime('now','-7 days')),
  (3, 'Küche',                           'offen',  'sub',   NULL,        'offen',  'offen',  NULL,      NULL, '9 Küchen geplant',   4, datetime('now','-15 days')),
  (3, 'Innenausbau',                     'laeuft', 'eigen', NULL,        'laeuft', 'offen',  191756.12, NULL, NULL,                 5, datetime('now','-4 days'));

-- 1122 Karlstr. Vorderhaus (P4)
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (4, 'Fenster/Sonnenschutz',            'fertig', 'eigen', 'BW Real',   'fertig', 'fertig', NULL,     NULL, NULL,                1, datetime('now','-1 days')),
  (4, 'Elektro',                         'laeuft', 'eigen', 'BW Real',   'laeuft', 'offen',  NULL,     NULL, NULL,                2, datetime('now','-4 days')),
  (4, 'HLS (Heizung/Lüftung/Sanitär)',   'laeuft', 'sub',   'Würthner',  'laeuft', 'offen',  NULL,     NULL, NULL,                3, datetime('now','-6 days')),
  (4, 'Küche',                           'offen',  'sub',   NULL,        'offen',  'offen',  NULL,     NULL, '4 neue Küchen',     4, datetime('now','-15 days')),
  (4, 'Innenausbau',                     'laeuft', 'eigen', 'BW Real',   'laeuft', 'offen',  45095.60, NULL, NULL,                5, datetime('now','-3 days'));

-- 1132 Karlstr. Hinterhaus (P5) — Neubau in Vorbereitung
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (5, 'Fenster/Sonnenschutz',            'offen', 'eigen', 'BW Real',  'offen', 'offen', NULL,     NULL, NULL, 1, datetime('now','-20 days')),
  (5, 'Elektro',                         'offen', 'eigen', 'BW Real',  'offen', 'offen', NULL,     NULL, NULL, 2, datetime('now','-20 days')),
  (5, 'HLS (Heizung/Lüftung/Sanitär)',   'offen', 'sub',   'Würthner', 'offen', 'offen', NULL,     NULL, NULL, 3, datetime('now','-20 days')),
  (5, 'Innenausbau',                     'offen', 'eigen', 'BW Real',  'offen', 'offen', 39990.31, NULL, NULL, 5, datetime('now','-20 days'));

-- 1128 Stöckachstr. (P6) — Musterwohnung
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (6, 'Fenster/Sonnenschutz',            'offen',  'eigen', NULL, 'offen',  'offen', NULL, NULL, NULL,                       1, datetime('now','-10 days')),
  (6, 'Elektro',                         'offen',  'eigen', NULL, 'offen',  'offen', NULL, NULL, NULL,                       2, datetime('now','-10 days')),
  (6, 'HLS (Heizung/Lüftung/Sanitär)',   'offen',  'sub',   NULL, 'offen',  'offen', NULL, NULL, NULL,                       3, datetime('now','-10 days')),
  (6, 'Küche',                           'offen',  'sub',   NULL, 'offen',  'offen', NULL, NULL, '18 Küchen geplant',        4, datetime('now','-10 days')),
  (6, 'Innenausbau',                     'laeuft', 'eigen', NULL, 'laeuft', 'offen', NULL, NULL, 'Musterwohnung ausbauen',   5, datetime('now','-6 days'));

-- 2113 Reutlingerstr. 78 / Seifert (P7)
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (7, 'Fenster/Sonnenschutz',            'fertig', 'eigen', 'BW Real',    'fertig', 'fertig', NULL,      NULL, NULL, 1, datetime('now','-30 days')),
  (7, 'Elektro',                         'laeuft', 'eigen', 'BW Real',    'laeuft', 'offen',  NULL,      NULL, NULL, 2, datetime('now','-5 days')),
  (7, 'HLS (Heizung/Lüftung/Sanitär)',   'laeuft', 'sub',   'Würthner',   'laeuft', 'offen',  NULL,      NULL, NULL, 3, datetime('now','-8 days')),
  (7, 'Innenausbau',                     'laeuft', 'sub',   'R. Brechko', 'laeuft', 'offen',  196488.39, NULL, NULL, 5, datetime('now','-4 days'));

-- 1124 Antwerpenerstr. (P8, Abgeschlossen/archiviert)
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (8, 'Elektro',                         'fertig', 'eigen', 'BW Real',  'fertig', 'fertig', NULL,     NULL,     NULL, 2, datetime('now','-80 days')),
  (8, 'HLS (Heizung/Lüftung/Sanitär)',   'fertig', 'sub',   'Würthner', 'fertig', 'fertig', NULL,     NULL,     NULL, 3, datetime('now','-80 days')),
  (8, 'Küche',                           'fertig', 'sub',   NULL,       'fertig', 'fertig', 6932.77,  NULL,     NULL, 4, datetime('now','-80 days')),
  (8, 'Innenausbau',                     'fertig', 'sub',   'Nuri',     'fertig', 'fertig', 16597.98, 16796.83, NULL, 5, datetime('now','-80 days'));

-- 1116 Augsburgerstr. (P9, Abgeschlossen/archiviert)
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (9, 'Elektro',                         'fertig', 'eigen', 'BW Real', 'fertig', 'fertig', NULL,  NULL, NULL, 2, datetime('now','-70 days')),
  (9, 'HLS (Heizung/Lüftung/Sanitär)',   'fertig', 'eigen', 'BW Real', 'fertig', 'fertig', NULL,  NULL, NULL, 3, datetime('now','-70 days')),
  (9, 'Küche',                           'fertig', 'sub',   NULL,      'fertig', 'fertig', 11000, NULL, NULL, 4, datetime('now','-70 days')),
  (9, 'Innenausbau',                     'fertig', 'sub',   'Nuri',    'fertig', 'fertig', NULL,  NULL, NULL, 5, datetime('now','-70 days'));

-- 1117 Wilhelm-Nagel-Str. (P10, Abgeschlossen/archiviert)
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (10, 'HLS (Heizung/Lüftung/Sanitär)',  'fertig', 'eigen', 'BW Real',    'fertig', 'fertig', NULL, NULL, NULL,              3, datetime('now','-90 days')),
  (10, 'Küche',                          'fertig', 'sub',   NULL,         'fertig', 'fertig', NULL, NULL, '1 Küche (KW4)',   4, datetime('now','-90 days')),
  (10, 'Innenausbau',                    'fertig', 'sub',   'R. Brechko', 'fertig', 'fertig', NULL, NULL, NULL,              5, datetime('now','-90 days'));

-- 1125 Schanbacherstr. (P11) — alles fertig, Abnahme steht aus
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (11, 'Elektro',                        'fertig', 'eigen', 'BW Real',  'fertig', 'fertig', NULL,  NULL, NULL,                            2, datetime('now','-10 days')),
  (11, 'HLS (Heizung/Lüftung/Sanitär)',  'fertig', 'eigen', 'BW Real',  'fertig', 'fertig', NULL,  NULL, NULL,                            3, datetime('now','-15 days')),
  (11, 'Küche',                          'fertig', 'sub',   NULL,       'fertig', 'fertig', NULL,  NULL, '2 Küchen, Lieferung KW11',      4, datetime('now','-2 days')),
  (11, 'Innenausbau',                    'fertig', 'sub',   'Dikovski', 'fertig', 'fertig', 29000, NULL, NULL,                            5, datetime('now','-12 days'));

-- 1126 Geigeräckerstr. (P12, Abgeschlossen/archiviert)
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (12, 'HLS (Heizung/Lüftung/Sanitär)',  'fertig', 'eigen', 'BW Real',  'fertig', 'fertig', NULL,  NULL, NULL,           3, datetime('now','-50 days')),
  (12, 'Küche',                          'offen',  'sub',   NULL,       'offen',  'offen',  NULL,  NULL, 'Küche kommt',  4, datetime('now','-50 days')),
  (12, 'Innenausbau',                    'fertig', 'sub',   'Dikovski', 'fertig', 'fertig', 24000, NULL, NULL,           5, datetime('now','-50 days'));

-- 1119 Schmidenerstr. (P13)
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (13, 'Elektro',                        'offen', 'eigen', NULL,     'offen', 'offen', NULL, NULL, NULL, 2, datetime('now','-14 days')),
  (13, 'HLS (Heizung/Lüftung/Sanitär)',  'offen', 'sub',   NULL,     'offen', 'offen', NULL, NULL, NULL, 3, datetime('now','-14 days')),
  (13, 'Innenausbau',                    'offen', 'eigen', NULL,     'offen', 'offen', NULL, NULL, NULL, 5, datetime('now','-14 days')),
  (13, 'Fassade',                        'offen', 'sub',   'Dragan', 'offen', 'offen', NULL, NULL, NULL, 6, datetime('now','-14 days'));

-- 1120 Tammerweg (P14) — UG-Umbau
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (14, 'HLS (Heizung/Lüftung/Sanitär)',  'offen',  'eigen', 'BW Real',  'offen',  'offen',  NULL,   NULL, NULL,                     3, datetime('now','-12 days')),
  (14, 'Küche',                          'fertig', 'sub',   NULL,       'fertig', 'fertig', NULL,   NULL, NULL,                     4, datetime('now','-20 days')),
  (14, 'Innenausbau',                    'offen',  'sub',   'D. Matai', 'offen',  'offen',  112500, NULL, 'Angebot ohne Material',  5, datetime('now','-12 days')),
  (14, 'Fassade',                        'offen',  'sub',   'Dragan',   'offen',  'offen',  NULL,   NULL, NULL,                     6, datetime('now','-12 days')),
  (14, 'Balkon/Terrasse',                'offen',  'sub',   'Dragan',   'offen',  'offen',  NULL,   NULL, NULL,                     7, datetime('now','-12 days'));

-- 9001 Kornwestheimerstr. (P15) — Klimamontage + Fassade, FS überschritten → ROT
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (15, 'Fenster/Sonnenschutz',           'fertig', 'eigen', 'BW Real',  'fertig', 'fertig', NULL, NULL, NULL,            1, datetime('now','-35 days')),
  (15, 'Elektro',                        'fertig', 'eigen', 'BW Real',  'fertig', 'fertig', NULL, NULL, NULL,            2, datetime('now','-25 days')),
  (15, 'HLS (Heizung/Lüftung/Sanitär)',  'laeuft', 'sub',   'Würthner', 'fertig', 'laeuft', NULL, NULL, 'Klimamontage',  3, datetime('now','-2 days')),
  (15, 'Innenausbau',                    'fertig', 'eigen', 'BW Real',  'fertig', 'fertig', NULL, NULL, NULL,            5, datetime('now','-3 days')),
  (15, 'Fassade',                        'laeuft', 'eigen', 'BW Real',  'laeuft', 'offen',  NULL, NULL, NULL,            6, datetime('now','-4 days')),
  (15, 'Dach',                           'fertig', 'sub',   'Bülent',   'fertig', 'fertig', NULL, NULL, NULL,            8, datetime('now','-40 days'));

-- 2102 Neckarstr. / Seifert (P16)
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (16, 'Elektro',                        'laeuft', 'eigen', NULL, 'laeuft', 'offen', NULL, NULL, NULL,              2, datetime('now','-6 days')),
  (16, 'HLS (Heizung/Lüftung/Sanitär)',  'offen',  'sub',   NULL, 'offen',  'offen', NULL, NULL, NULL,              3, datetime('now','-10 days')),
  (16, 'Küche',                          'offen',  'sub',   NULL, 'offen',  'offen', NULL, NULL, 'Küche ja/nein?',  4, datetime('now','-10 days')),
  (16, 'Innenausbau',                    'laeuft', 'eigen', NULL, 'laeuft', 'offen', NULL, NULL, NULL,              5, datetime('now','-5 days'));

-- 2103 Vogelsangstr. / Seifert (P17) — FS 15. Jul → GELB
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (17, 'Elektro',                        'fertig', 'eigen', 'BW Real', 'fertig', 'fertig', NULL, NULL, NULL, 2, datetime('now','-2 days')),
  (17, 'HLS (Heizung/Lüftung/Sanitär)',  'laeuft', 'eigen', 'BW Real', 'fertig', 'laeuft', NULL, NULL, NULL, 3, datetime('now','-3 days')),
  (17, 'Innenausbau',                    'laeuft', 'eigen', 'BW Real', 'laeuft', 'offen',  NULL, NULL, NULL, 5, datetime('now','-2 days'));

-- 2118 Withauweg (P18)
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (18, 'Elektro',                        'laeuft', 'eigen', 'BW Real', 'laeuft', 'offen',  NULL,  NULL, NULL,               2, datetime('now','-7 days')),
  (18, 'HLS (Heizung/Lüftung/Sanitär)',  'laeuft', 'eigen', 'BW Real', 'laeuft', 'offen',  NULL,  NULL, NULL,               3, datetime('now','-7 days')),
  (18, 'Küche',                          'fertig', 'sub',   NULL,      'fertig', 'fertig', 18200, NULL, 'Lieferung KW19',   4, datetime('now','-40 days')),
  (18, 'Innenausbau',                    'laeuft', 'eigen', 'BW Real', 'laeuft', 'offen',  NULL,  NULL, NULL,               5, datetime('now','-5 days'));

-- 5110 Gänsheidestr. / Tamara (P19)
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (19, 'Fenster/Sonnenschutz',           'offen',  'eigen', NULL, 'offen',  'offen', NULL, NULL, NULL, 1, datetime('now','-12 days')),
  (19, 'Elektro',                        'offen',  'eigen', NULL, 'offen',  'offen', NULL, NULL, NULL, 2, datetime('now','-12 days')),
  (19, 'HLS (Heizung/Lüftung/Sanitär)',  'offen',  'sub',   NULL, 'offen',  'offen', NULL, NULL, NULL, 3, datetime('now','-12 days')),
  (19, 'Innenausbau',                    'laeuft', 'eigen', NULL, 'laeuft', 'offen', NULL, NULL, NULL, 5, datetime('now','-6 days'));

-- 2101 Oswald-Hesse-Str. / Louis (P20) — beauftragt, Start 2027
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (20, 'Fenster/Sonnenschutz',           'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, NULL, 1, datetime('now','-20 days')),
  (20, 'Elektro',                        'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, NULL, 2, datetime('now','-20 days')),
  (20, 'HLS (Heizung/Lüftung/Sanitär)',  'offen', 'sub',   NULL, 'offen', 'offen', NULL, NULL, NULL, 3, datetime('now','-20 days')),
  (20, 'Innenausbau',                    'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, NULL, 5, datetime('now','-20 days'));

-- 4101 Gablenberger Hauptstr. (P21)
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (21, 'Fenster/Sonnenschutz',           'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, NULL, 1, datetime('now','-18 days')),
  (21, 'Elektro',                        'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, NULL, 2, datetime('now','-18 days')),
  (21, 'HLS (Heizung/Lüftung/Sanitär)',  'offen', 'sub',   NULL, 'offen', 'offen', NULL, NULL, NULL, 3, datetime('now','-18 days')),
  (21, 'Innenausbau',                    'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, NULL, 5, datetime('now','-18 days'));

-- 5105 Beihingerstr. (P22)
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (22, 'Innenausbau',                    'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, NULL, 5, datetime('now','-25 days'));

-- 2116 Eugenstr. 37 LB (P23, Abgeschlossen/archiviert)
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (23, 'Innenausbau',                    'fertig', 'sub', 'Ruslan', 'fertig', 'fertig', 23000, NULL, 'Angebot ohne Material', 5, datetime('now','-45 days'));

-- 5107 Mozartstr. / Würthner (P24) — Fassade und Ausbau
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (24, 'Innenausbau',                    'laeuft', 'eigen', 'BW Real', 'laeuft', 'offen', NULL, NULL, NULL, 5, datetime('now','-8 days')),
  (24, 'Fassade',                        'laeuft', 'eigen', 'BW Real', 'laeuft', 'offen', NULL, NULL, NULL, 6, datetime('now','-6 days'));

-- 5111 Johannesstr. 83A (P25)
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (25, 'Elektro',                        'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, NULL, 2, datetime('now','-16 days')),
  (25, 'HLS (Heizung/Lüftung/Sanitär)',  'offen', 'sub',   NULL, 'offen', 'offen', NULL, NULL, NULL, 3, datetime('now','-16 days')),
  (25, 'Innenausbau',                    'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, NULL, 5, datetime('now','-16 days'));

-- 1134 Heimgartenstr. 5 (P26) — Wohnung erst ab Ende Juli frei → BLOCKIERT/ROT
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, blocker_grund, notiz, reihenfolge, aktualisiert_am) VALUES
  (26, 'Elektro',                        'offen',     'eigen', NULL, 'offen', 'offen', NULL, NULL, NULL,                              NULL,       2, datetime('now','-10 days')),
  (26, 'HLS (Heizung/Lüftung/Sanitär)',  'offen',     'sub',   NULL, 'offen', 'offen', NULL, NULL, NULL,                              NULL,       3, datetime('now','-10 days')),
  (26, 'Küche',                          'offen',     'sub',   NULL, 'offen', 'offen', NULL, NULL, NULL,                              '1 Küche',  4, datetime('now','-10 days')),
  (26, 'Innenausbau',                    'blockiert', 'eigen', NULL, 'offen', 'offen', NULL, NULL, 'Wohnung erst ab Ende Juli frei',  NULL,       5, datetime('now','-5 days'));

-- 2127 Ludwigsburgerstr. (P27)
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (27, 'Fenster/Sonnenschutz',           'laeuft', 'eigen', 'BW Real',   'laeuft', 'offen', NULL,   NULL, NULL,                 1, datetime('now','-9 days')),
  (27, 'Elektro',                        'laeuft', 'eigen', 'BW Real',   'laeuft', 'offen', NULL,   NULL, NULL,                 2, datetime('now','-7 days')),
  (27, 'HLS (Heizung/Lüftung/Sanitär)',  'laeuft', 'eigen', 'BW Real',   'laeuft', 'offen', NULL,   NULL, NULL,                 3, datetime('now','-6 days')),
  (27, 'Küche',                          'offen',  'sub',   NULL,        'offen',  'offen', NULL,   NULL, '10 Küchen geplant',  4, datetime('now','-15 days')),
  (27, 'Innenausbau',                    'laeuft', 'eigen', NULL,        'laeuft', 'offen', 103449, NULL, NULL,                 5, datetime('now','-4 days')),
  (27, 'Dach',                           'offen',  'sub',   'Fleiß Bau', 'offen',  'offen', NULL,   NULL, NULL,                 8, datetime('now','-15 days'));

-- 4102 Neuestr. 22 (P28)
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (28, 'Fenster/Sonnenschutz',           'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, NULL, 1, datetime('now','-14 days')),
  (28, 'Elektro',                        'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, NULL, 2, datetime('now','-14 days')),
  (28, 'HLS (Heizung/Lüftung/Sanitär)',  'offen', 'sub',   NULL, 'offen', 'offen', NULL, NULL, NULL, 3, datetime('now','-14 days')),
  (28, 'Innenausbau',                    'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, NULL, 5, datetime('now','-14 days'));

-- 4103 Neuestr. 24 (P29)
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (29, 'Fenster/Sonnenschutz',           'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, NULL, 1, datetime('now','-14 days')),
  (29, 'Elektro',                        'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, NULL, 2, datetime('now','-14 days')),
  (29, 'HLS (Heizung/Lüftung/Sanitär)',  'offen', 'sub',   NULL, 'offen', 'offen', NULL, NULL, NULL, 3, datetime('now','-14 days')),
  (29, 'Innenausbau',                    'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, NULL, 5, datetime('now','-14 days'));

-- 2132 Alexandrstr. 84 (P30)
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (30, 'Elektro',                        'fertig', 'eigen', 'BW Real',  'fertig', 'fertig', NULL,  NULL, NULL,             2, datetime('now','-20 days')),
  (30, 'HLS (Heizung/Lüftung/Sanitär)',  'laeuft', 'eigen', 'BW Real',  'laeuft', 'offen',  NULL,  NULL, NULL,             3, datetime('now','-5 days')),
  (30, 'Küche',                          'offen',  'sub',   NULL,       'offen',  'offen',  NULL,  NULL, 'Küche zugesagt', 4, datetime('now','-10 days')),
  (30, 'Innenausbau',                    'laeuft', 'sub',   'Dikovski', 'laeuft', 'offen',  21500, NULL, NULL,             5, datetime('now','-4 days'));

-- 5109 Falchstr. / Würtner (P31) — Fenstermontage offen, FS überschritten → ROT
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (31, 'Fenster/Sonnenschutz',           'laeuft', 'sub',   NULL, 'fertig', 'laeuft', NULL, NULL, 'Fenstermontage noch offen', 1, datetime('now','-3 days')),
  (31, 'Küche',                          'fertig', 'sub',   NULL, 'fertig', 'fertig', NULL, NULL, '1 Küche',                   4, datetime('now','-20 days')),
  (31, 'Innenausbau',                    'fertig', 'eigen', NULL, 'fertig', 'fertig', NULL, NULL, NULL,                        5, datetime('now','-3 days'));

-- 2133 Saarstr. 26 Hemmingen (P32)
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (32, 'Elektro',                        'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, NULL,    2, datetime('now','-10 days')),
  (32, 'Innenausbau',                    'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, 'Boden', 5, datetime('now','-10 days'));

-- 2138 Böblingerstr. / Denzle (P33)
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (33, 'Elektro',                        'offen',  'eigen', NULL, 'offen',  'offen', NULL, NULL, NULL, 2, datetime('now','-8 days')),
  (33, 'HLS (Heizung/Lüftung/Sanitär)',  'offen',  'sub',   NULL, 'offen',  'offen', NULL, NULL, NULL, 3, datetime('now','-8 days')),
  (33, 'Innenausbau',                    'laeuft', 'eigen', NULL, 'laeuft', 'offen', NULL, NULL, NULL, 5, datetime('now','-3 days'));

-- 2136 Mandarinenweg / Zeljko (P34)
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (34, 'Elektro',                        'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, NULL, 2, datetime('now','-9 days')),
  (34, 'HLS (Heizung/Lüftung/Sanitär)',  'offen', 'sub',   NULL, 'offen', 'offen', NULL, NULL, NULL, 3, datetime('now','-9 days')),
  (34, 'Innenausbau',                    'offen', 'sub',   NULL, 'offen', 'offen', NULL, NULL, 'Angebot von Sub einholen', 5, datetime('now','-9 days'));

-- 9002 Hermann-Kurz-Str. / Chris (P35) — Neubau, alles offen
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (35, 'Fenster/Sonnenschutz',           'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, NULL, 1, datetime('now','-11 days')),
  (35, 'Elektro',                        'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, NULL, 2, datetime('now','-11 days')),
  (35, 'HLS (Heizung/Lüftung/Sanitär)',  'offen', 'sub',   NULL, 'offen', 'offen', NULL, NULL, NULL, 3, datetime('now','-11 days')),
  (35, 'Innenausbau',                    'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, NULL, 5, datetime('now','-11 days'));

-- 9003 Bismarkplatz / Karl (P36) — Schimmelbeseitigung abgeschlossen, abrechnen
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (36, 'Innenausbau',                    'fertig', 'eigen', 'BW Real', 'fertig', 'fertig', NULL, NULL, 'Schimmelbeseitigung abgeschlossen', 5, datetime('now','-10 days'));

-- 2112 Wannenstr. / Kaufmann (P37) — TR Aufbereitung + Klimaanlage
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (37, 'HLS (Heizung/Lüftung/Sanitär)',  'offen', 'sub',   NULL, 'offen', 'offen', NULL, NULL, 'Klimaanlage',       3, datetime('now','-8 days')),
  (37, 'Innenausbau',                    'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, 'TR Aufbereitung',   5, datetime('now','-8 days'));

-- 9004 Höscheleweg 18 (P38) — Gartenarbeiten
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (38, 'Garten/Außenanlagen',            'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, 'Gartenarbeiten und Sanierung', 10, datetime('now','-7 days'));

-- 9005 Birkenstr. / Boyne (P39) — Sonnenschutz-/Fassaden-Reparatur
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (39, 'Fenster/Sonnenschutz',           'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, 'Sonnenschutz Reparatur', 1, datetime('now','-7 days')),
  (39, 'Fassade',                        'offen', 'eigen', NULL, 'offen', 'offen', NULL, NULL, 'Fassade Reparatur',      6, datetime('now','-7 days'));

-- 2140 Pischekstr. 11 (P42) — Boden und streichen
INSERT INTO gewerk (objekt_id, name, status, verantwortlich_typ, an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz, reihenfolge, aktualisiert_am) VALUES
  (40, 'HLS (Heizung/Lüftung/Sanitär)',  'offen', 'eigen', 'BW Real', 'offen', 'offen', NULL, NULL, NULL,                  3, datetime('now','-6 days')),
  (40, 'Innenausbau',                    'offen', 'eigen', NULL,      'offen', 'offen', NULL, NULL, 'Boden und streichen', 5, datetime('now','-6 days'));

-- ============ AUFGABEN ============
-- Entscheidungen GF (Jour fixe) — aus den Excel-Notizen
INSERT INTO aufgabe (objekt_id, gewerk_id, text, verantwortlich_id, frist, status, erstellt_von_id, erstellt_am, entscheidung) VALUES
  (7,  NULL, 'Garageumbau klären',                 1, NULL, 'offen', 3, datetime('now','-4 days'), 1),
  (21, NULL, 'Haus ab 1. Juli komplett frei?',     1, NULL, 'offen', 4, datetime('now','-6 days'), 1),
  (16, NULL, 'Küche ja/nein?',                     1, NULL, 'offen', 4, datetime('now','-3 days'), 1);

-- Operative Aufgaben (überfällige erzeugen GELB bei 4102 und 2112)
INSERT INTO aufgabe (objekt_id, gewerk_id, text, verantwortlich_id, frist, status, erstellt_von_id, erstellt_am, entscheidung) VALUES
  (1,  NULL, 'Nacharbeiten abschließen',           2, date('now','+5 days'), 'offen', 2, datetime('now','-3 days'), 0),
  (2,  NULL, 'LWP richten',                        3, date('now','+3 days'), 'offen', 3, datetime('now','-2 days'), 0),
  (28, NULL, 'Angebot zusammenstellen',            4, date('now','-3 days'), 'offen', 4, datetime('now','-10 days'), 0),
  (29, NULL, 'Angebot zusammenstellen',            4, date('now','+5 days'), 'offen', 4, datetime('now','-10 days'), 0),
  (34, NULL, 'Angebot von Sub einholen',           3, date('now','+7 days'), 'offen', 3, datetime('now','-5 days'), 0),
  (37, NULL, '1. AZ schreiben',                    2, date('now','-2 days'), 'offen', 2, datetime('now','-8 days'), 0),
  (36, NULL, 'Abrechnen',                          4, NULL,                  'offen', 4, datetime('now','-6 days'), 0),
  (11, NULL, 'Abnahme vereinbaren',                4, date('now','-8 days'), 'erledigt', 4, datetime('now','-14 days'), 0);
UPDATE aufgabe SET erledigt_am = datetime('now','-7 days') WHERE text = 'Abnahme vereinbaren';

-- ============ FOTOS (Platzhalter) ============
INSERT INTO foto (objekt_id, bereich, datei_url, kommentar, datum, hochgeladen_von_id) VALUES
  (1,  'Innenausbau EG',  '/static/img/placeholder-bau.svg', 'Nacharbeiten dokumentiert', date('now','-2 days'), 2),
  (2,  'Technikraum',     '/static/img/placeholder-bau.svg', 'LWP-Anschluss',             date('now','-3 days'), 3),
  (3,  'WE2 Bad',         '/static/img/placeholder-bau.svg', 'Rohinstallation',           date('now','-4 days'), 2),
  (4,  'Fassade Hof',     '/static/img/placeholder-bau.svg', 'Fenster gesetzt',           date('now','-1 days'), 2),
  (15, 'Dachgeschoss',    '/static/img/placeholder-bau.svg', 'Klimageräte geliefert',     date('now','-2 days'), 2),
  (26, 'UG Zugang',       '/static/img/placeholder-bau.svg', 'Bestand vor Umbau',         date('now','-5 days'), 3);

-- ============ MATERIAL-ANFRAGEN ============
INSERT INTO materialanfrage (objekt_id, gewerk_id, beschreibung, angefragt_von_id, angefragt_am, status, einkauf_notiz, lieferant, aktualisiert_am) VALUES
  (3,  NULL, 'Sanitär-Grobmaterial für 9 WE',              2, datetime('now','-2 days'), 'offen',     NULL,                                  NULL,             datetime('now','-2 days')),
  (4,  NULL, '4 Innentüren + Zargen weiß',                 2, datetime('now','-4 days'), 'bestellt',  'Bestellt, Lieferung KW30',            'Türenwelt GmbH', datetime('now','-1 days')),
  (2,  NULL, 'LWP-Ersatzteile (Kleinmaterial)',            3, datetime('now','-6 days'), 'geliefert', 'Geliefert, liegt im Technikraum',     'SHK Großhandel', datetime('now','-2 days')),
  (6,  NULL, 'Material Musterwohnung (Boden, Farbe)',      3, datetime('now','-1 days'), 'offen',     NULL,                                  NULL,             datetime('now','-1 days')),
  (27, NULL, 'Estrich ca. 300 m²',                         2, datetime('now','-3 days'), 'offen',     NULL,                                  NULL,             datetime('now','-3 days'));

-- ============ VERLAUF (Import-Marker je Objekt) ============
INSERT INTO verlauf (objekt_id, nutzer_id, aktion, zeitpunkt)
  SELECT id, 1, 'Import aus Projektübersicht (Excel, Stand 10. Juli)', datetime('now','-1 days') FROM objekt;
