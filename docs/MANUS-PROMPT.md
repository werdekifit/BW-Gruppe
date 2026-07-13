# Input-Prompt für Manus AI — „BW Bau-Cockpit" in Manus einspielen

> Diesen gesamten Text als Auftrag in Manus einfügen. Zusätzlich in derselben Nachricht:
> **(1)** den Skill `/bw-gruppe-os` aktivieren, **(2)** den GitHub-Link mitgeben, **(3)** die
> Datenexport-Datei `bw-cockpit-export-JJJJ-MM-TT.sql` anhängen (Beschaffung: siehe Abschnitt „Datenübernahme").

---

## Auftrag in einem Satz

Portiere die **fertige, produktiv erprobte** Bauleitungs-Software **„BW Bau-Cockpit"** aus dem Repository
`https://github.com/werdekifit/BW-Gruppe` (Branch `main`) **funktions- und designidentisch** in die
Manus-Umgebung — mit Manus-eigener Datenbank, Manus-eigenem Dateispeicher für Fotos und einer festen
Manus-URL — und importiere anschließend den mitgelieferten echten Datenbestand (40 reale Projekte der BW GRUPPE).

## Wichtig: Kein PRD-Interview — die Software existiert bereits

Der Skill `/bw-gruppe-os` enthält die Regel, bei Software-Absicht zuerst das Modul `software-prd`
(Anforderungs-Interview → PRD) zu durchlaufen. **Diese Phase ist für dieses Projekt abgeschlossen.**
Die Software wurde bereits vollständig spezifiziert, gebaut (v2-Vollausbau), auf Cloudflare deployt und von der
BW GRUPPE mit echten Daten in Betrieb genommen. Das Repository ist die verbindliche Referenz-Implementierung,
die `README.md` dokumentiert den Funktionsumfang.

**Also: kein Anforderungs-Interview, kein neues PRD, kein Redesign, keine Feature-Diskussion.**
Deine Aufgabe ist eine **1:1-Portierung** (Re-Platforming). Bei echten Unklarheiten oder technischen
Zielkonflikten: **konkret nachfragen statt raten oder abweichen** — das gilt insbesondere für alles, was
Geschäftslogik, Datenmodell oder Design betrifft.

## Rollenverteilung der drei Quellen

| Quelle | Wozu du sie nutzt |
|---|---|
| **GitHub-Repo** `https://github.com/werdekifit/BW-Gruppe` (Branch `main`) | Verbindliche Referenz: kompletter Quellcode, Datenmodell (`migrations/`), Design (`public/static/style.css`), Client-Logik (`public/static/app.js`), Funktionsdoku (`README.md`). Dieser Auftrag liegt dort auch unter `docs/MANUS-PROMPT.md`. |
| **Skill `/bw-gruppe-os`** | Unternehmenskontext: `references/company-context.md` (Gesellschaften, Team), `references/rollen-berechtigungen.md` (Freigaben), `references/brand-ci.md` + `assets/tokens.json` (Corporate Design — deckungsgleich mit dem Design der App). **Die App ist die Software-Umsetzung des Skill-Moduls `projekt-cockpit`** — der Skill beschreibt den fachlichen Workflow, die App ist das Werkzeug dafür. Nichts aus dem Skill „zusätzlich einbauen". |
| **Datenexport `bw-cockpit-export-*.sql`** (angehängt) | Der eingefrorene Live-Datenbestand (Stand des Exports). Reine INSERT-/DELETE-Statements, FK-sichere Reihenfolge, idempotent. **Muss nach dem Aufbau importiert werden.** Falls die Datei fehlt: ersatzweise `seed.sql` aus dem Repo (Excel-Stand 10. Juli) verwenden und das explizit melden. |

---

## Was die Software ist (Funktionsumfang — vollständig, alles ist Pflicht)

**BW Bau-Cockpit** — interne Bauleitungs-Software der BW GRUPPE (Sanierungs-Bauunternehmen, Stuttgart,
~40 laufende Baustellen). Deutsche Oberfläche, mobiltauglich, dunkles Corporate Design. Nutzer: GF Christoph
Brechtel, 3 Bauleiter (Geier, Booch, Gitev), Einkauf (Neuer).

1. **Login/Rollen**: Login per Kürzel + Passwort; Rollen `GF`, `Bauleiter`, `Einkauf`; signierte Session
   (Cookie). Alle Seiten nur nach Login. Rechte-Matrix siehe unten.
2. **Cockpit** (Startseite): Kachel je Baustelle mit Ampel (grün/gelb/rot), Prio-Rang-Badge (P1…),
   Leistung/Stadt/WE, Kurzstatus, Fortschritts-Balken, Bauleiter, Zieltermin. Sortierung nach `prio_rang`
   (1 oben, ohne Rang unten, archivierte hinten). Zähler-Leiste (kritisch/Achtung/im Plan/blockiert) +
   kaufmännische Summen (Angebot Σ, Abgerechnet Σ, Offen Σ, Marge Σ — grün/rot je Vorzeichen).
   Filter: Alle / Prio / Meine / Blockiert / Abgeschlossen / Archiviert (Standard blendet Archivierte aus).
3. **Baustelle anlegen/bearbeiten** (Modal): P-Nr., Kurzname, Adresse, Stadt, Gesellschaft (PG/BF), Leistung,
   Typ, WE, Prio-Rang, Bauleiter, Fertigstellung, Kurzstatus, OneDrive-Link, AZ/SR/Ist-Kosten,
   Ampel-Übersteuerung, Notiz. Neue Baustelle erhält automatisch Standard-Gewerke
   (Fenster/Sonnenschutz, Elektro, HLS, Küche, Innenausbau) + leeren Vorbereitungs-Datensatz.
4. **Objekt-Detail** mit Kopf (Ampel, Badges, Kennzahlen-Block, Fortschritt, Aktionen) und **6 Tabs**:
   - **Gewerke**: Tabelle mit Status (offen/läuft/fertig/blockiert, inline änderbar; Blocker-Grund),
     AN (Auftragnehmer), Install.-/Montage-Status, Angebot/Abgerechnet netto, Notiz; ✎-Modal zum Bearbeiten;
     „+ Gewerk" mit Standardliste (inkl. Zusatzgewerke Fassade, Balkon/Terrasse, Dach, Gerüst …).
   - **Vorbereitung**: 7 Schritte (Genehmigung, Statik, Baubeginn (BB) mit Datum, Sperrung, Bewohner-Modus,
     Demontage, LV) als klickbare Status-Chips, die pro Klick zyklisch weiterschalten
     (offen → aktiv → erledigt → entfällt → offen); Notiz-Feld mit Diktierfunktion.
   - **Aufgaben**: Text, Verantwortlicher, Frist, erledigt-Haken, Kennzeichen „Entscheidung GF".
   - **Fotos**: Upload (bis 15 MB, nur Bilder) → Ablage im Dateispeicher, Galerie, Löschen
     (GF immer, Bauleiter eigene).
   - **Material**: Anfragen an den Einkauf (Beschreibung, optional Gewerk); Status offen → bestellt →
     geliefert (nur Einkauf/GF), Lieferant + Einkaufs-Notiz; Bauleiter kann eigene offene Anfrage zurückziehen.
   - **Verlauf**: automatisches Änderungsprotokoll (wer, wann, Feld, alt → neu) — gespeist von allen
     Schreiboperationen.
5. **Kennzahlen-Block** je Objekt, zweigeteilt: *Eingaben* (Angebot Σ aus Gewerken, Abgerechnet Σ,
   Ist-Kosten, AZ, SR) und *Berechnet* (Offen, Abrechnungsgrad %, Marge €+% — grün/rot).
6. **Jour fixe**: Wochenansicht mit drei Spalten — Fertig (letzte 7 Tage) / Blockiert / Zu entscheiden (GF) —
   plus Schnellerfassung von Entscheidungspunkten; druckoptimierte Agenda (Print-CSS: heller Druck,
   Agenda-Kopf mit KW + Datum) für PDF-Export über den Browser-Druckdialog.
7. **Einkauf**: objektübergreifende Material-Tabelle mit Statusfiltern, Statuswechsel, Lieferant/Notiz-Modal.
8. **Archivierung**: „Baustelle abschließen" / „Reaktivieren" im Objekt-Kopf (GF/Bauleiter).
9. **Diktierfunktion 🎤** auf allen Textfeldern (Web Speech API, `de-DE`); bei fehlendem Browser-Support wird
   der Button ausgeblendet, Tippen geht immer; verständliche deutsche Fehlermeldungen, ein automatischer
   Neuversuch bei Netzwerk-Fehler der Spracherkennung.
10. **Datenexport** `GET /api/export.sql` (nur GF): kompletter Datenbestand als idempotente SQL-Datei —
    bitte mitportieren (dient als Backup).

## Rechte-Matrix (verbindlich beibehalten)

| Aktion | GF | Bauleiter | Einkauf |
|---|---|---|---|
| Alles sehen (Cockpit, Detail, Jour fixe) | ✓ | ✓ | ✓ |
| Einkaufs-Seite | ✓ | – | ✓ |
| Baustelle anlegen/bearbeiten/archivieren | ✓ | ✓ | – |
| Gewerke/Vorbereitung/Aufgaben/Fotos pflegen | ✓ | ✓ | – |
| Material anfragen | ✓ | ✓ | – |
| Material-Status/Lieferant/Notiz | ✓ | – | ✓ |
| Material-Anfrage zurückziehen | ✓ | nur eigene offene | – |
| Foto löschen | ✓ | nur eigene | – |
| Datenexport | ✓ | – | – |

## Datenmodell (8 Tabellen — verbindlich, keine Umbenennungen)

Maßgeblich sind die drei Migrationsdateien im Repo (`migrations/0001…0003`). Kurzfassung:
`nutzer` · `objekt` (inkl. `prio_rang`, `leistung`, `az_netto`, `sr_netto`, `ist_kosten`, `archiviert`,
`ampel_override`) · `vorbereitung` (1:1 zu objekt; 7 Status-Felder mit Enum
`offen/aktiv/erledigt/entfaellt`, `bb_datum`, `notiz`) · `gewerk` (Status-Enum
`offen/laeuft/fertig/blockiert`, `an`, `install_status`, `montage_status`, `angebot_netto`,
`abgerechnet_netto`, `notiz`, `blocker_grund`, `reihenfolge`) · `aufgabe` (`entscheidung`-Flag, `frist`) ·
`foto` (Datei-Verweis + `content_type`, `groesse`; Datei selbst im Dateispeicher) · `materialanfrage` ·
`verlauf` (objekt_id, nutzer_id, aktion, feld, alt_wert, neu_wert, zeitpunkt).
**Deutsche Feld- und Tabellennamen exakt beibehalten** — sonst funktioniert der Datenimport nicht.

## Geschäftslogik, die exakt erhalten bleiben muss (Abnahmegegenstand)

1. **Ampel je Objekt** (Reihenfolge entscheidend; manuelle Übersteuerung `ampel_override` gewinnt immer):
   - ROT: mind. ein Gewerk `blockiert` **oder** Fertigstellungstermin überschritten und nicht alle Gewerke fertig.
   - GELB: mind. eine überfällige offene Aufgabe **oder** < 30 Tage bis Fertigstellung und nicht alles fertig.
   - Sonst GRÜN.
2. **Fortschritt %** = fertige Gewerke ÷ alle Gewerke des Objekts (gerundet).
3. **Kalkulation**: Offen = Angebot Σ − Abgerechnet Σ · Abrechnungsgrad = Abgerechnet ÷ Angebot (%) ·
   Marge = Angebot Σ − Ist-Kosten (€ und % vom Angebot; nur wenn Angebot > 0 und Ist vorhanden).
   Angebot Σ/Abgerechnet Σ = Summe über die Gewerke des Objekts. Cockpit-Summen nur über **aktive** Objekte.
4. **Jour fixe**: „Fertig" = Gewerke mit Status fertig, aktualisiert in den letzten 7 Tagen; „Blockiert" =
   blockierte Gewerke mit Grund; „Zu entscheiden" = offene Aufgaben mit `entscheidung=1`; archivierte Objekte
   ausgenommen; Sortierung nach Prio-Rang.
5. **Prio-Ableitung**: `prio_rang` ≤ 10 ⇒ Objekt gilt als Prio-Baustelle.
6. **Verlauf-Protokollierung** bei: Objekt-Feldänderungen, Gewerk-Status/-Details, Vorbereitungs-Änderungen,
   Aufgaben-Statuswechsel, Material-Statuswechsel, Foto hinzugefügt/gelöscht, Archivieren/Reaktivieren,
   Baustelle angelegt.
7. **Statuswerte-Mapping** (überall konsistent): Excel-Herkunft `Erl.`→erledigt/fertig, `Aktiv`→aktiv/läuft,
   `Offen`→offen, `x`→entfällt, `Vorh.`→erledigt.
8. **Zahlen-/Datumsformat**: deutsch (`1.234,56 €`, `TT.MM.JJJJ`), Kalenderwochen nach ISO.

## Design (verbindlich — BW-Dark, identisch zum Repo)

Farbwerte (= `assets/tokens.json` des Skills): Hintergrund `#050810` · Karten `#1A2332` (Sekundär `#212D40`,
Rahmen `#2A3648`) · Akzent `#5B8FC7` / hell `#7BA7D8` · Text `#FFFFFF` · gedämpft `#B9C2CE` ·
Ampel grün `#3FB27F` / gelb `#E0A63C` / rot `#D9534F`. Schrift **Inter**. Wortmarke „BW GRUPPE"
(Versalien, gesperrt) oben links. Referenz ist `public/static/style.css` im Repo — **übernehmen, nicht neu
gestalten**. Durchgängig Deutsch, responsive (Smartphone-Nutzung auf der Baustelle ist Kernszenario),
Druck-Stylesheet für die Jour-fixe-Agenda (heller Druck) beibehalten.

## Technischer Portierungsauftrag

**Ist-Zustand im Repo:** Hono (TypeScript, serverseitig gerendertes HTML über Template-Strings) + Vanilla-JS-Client
(`public/static/app.js`) + Cloudflare D1 (SQLite) + Cloudflare R2 (Fotos) + Cloudflare Worker (Deployment).

**Ziel in Manus:** dieselbe Anwendung, lauffähig auf Manus-Infrastruktur mit fester URL:

1. **Bevorzugter Weg (A):** Codebasis aus dem Repo übernehmen und **nur die Plattform-Schicht austauschen**:
   - D1-Aufrufe (`c.env.DB.prepare(...).bind(...).all()/first()/run()`) → SQL-Schicht auf die Manus-Datenbank
     (SQLite-kompatibel bevorzugt; bei Postgres o. Ä. SQL-Dialekt anpassen: `datetime('now')`,
     `date('now','+n days')` etc. übersetzen).
   - R2-Aufrufe (`c.env.BUCKET.put/get/delete`) → Manus-Dateispeicher (Fotos unter Schlüssel
     `foto/<objekt_id>/<uuid>.<ext>`, Auslieferung über die bestehende Route `/api/foto/:id` mit korrektem
     Content-Type und Cache-Header, Zugriff nur mit Login).
   - Hono läuft auf Node problemlos (`@hono/node-server`) — der Rest des Codes bleibt unverändert.
   - Cloudflare-spezifische Dateien (`wrangler.jsonc`, `.assetsignore`, `ecosystem.config.cjs`,
     `vite.config.ts`-Worker-Build) ersetzen durch das Manus-übliche Build-/Run-Setup.
2. **Ersatzweg (B), nur falls Manus-Plattformzwänge Weg A verhindern:** Neuimplementierung im
   Manus-Standard-Stack — dann aber **strikt** nach der Referenz: gleiche Seitenstruktur, gleiche Routen,
   gleiches Datenmodell, gleiche Rechte, gleiches Design, gleiche Texte. Abweichungen einzeln begründen.
3. **Session/Auth**: rollenbasierter Login wie im Repo (signierte Session, HttpOnly-Cookie, 14 Tage).
   Secret neu generieren (nicht das Demo-Secret aus dem Repo übernehmen).
4. **Konfiguration**: keine Secrets/Zugangsdaten hart codieren; Manus-typisch als Umgebungsvariablen.

## Datenübernahme (nach dem Aufbau, vor der Abnahme)

1. Schema anlegen = Migrationsdateien `0001` → `0002` → `0003` in dieser Reihenfolge (bzw. äquivalentes
   Gesamtschema, wenn Weg B).
2. Angehängte Exportdatei `bw-cockpit-export-*.sql` einspielen (idempotent: DELETE vor INSERT, FK-sichere
   Reihenfolge nutzer → objekt → vorbereitung → gewerk → aufgabe → foto → materialanfrage → verlauf).
3. **Fotos:** Der Export enthält nur Foto-*Metadaten*. Die Bilddateien aus der alten Umgebung werden nicht
   migriert — Foto-Zeilen mit `r2_key` beim Import auf den Platzhalter zurücksetzen oder löschen (kurz melden,
   wie viele betroffen sind); das Team lädt aktuelle Fotos neu hoch.
4. **Passwörter:** Nach erfolgreicher Abnahme neue, individuelle Passwörter je Nutzer setzen (das im Export
   enthaltene Demo-Passwort ist bekannt und nur für die Übergangsphase gedacht). Logins (`brechtel`, `geier`,
   `booch`, `gitev`, `neuer`) beibehalten.

## Nicht-Ziele (bewusst NICHT bauen)

- Keine neuen Features, kein Redesign, keine zusätzlichen Rollen oder Nutzer.
- Keine Integration von OneDrive/SharePoint, WhatsApp, Lexoffice, Outlook (bewusst Handbetrieb; der
  OneDrive-Link am Objekt bleibt ein einfacher Link).
- Keine Cloudflare-Anbindung mehr (kein wrangler, kein D1/R2).
- Keine KI-Funktionen in der App selbst.
- Skill-Module des `/bw-gruppe-os` (Bautagebuch, Rechnungsprüfung, …) NICHT in die App einbauen — das sind
  separate Manus-Workflows.

## Abnahme-Checkliste (bitte selbst durchtesten und Ergebnis berichten)

1. Login als `brechtel` (GF) funktioniert; falscher Login zeigt deutsche Fehlermeldung.
2. Cockpit: Anzahl Kacheln = Anzahl `INSERT INTO objekt` der Exportdatei (40, falls unverändert);
   Standardfilter blendet archivierte aus; Filter „Archiviert" zeigt sie; Sortierung beginnt mit P1.
3. Summenzeile: Angebot Σ / Abgerechnet Σ / Offen Σ / Marge Σ stimmen mit den Werten aus den importierten
   Daten überein (Offen = Angebot − Abgerechnet; nachrechnen!).
4. Objekt öffnen (z. B. 1109 Uhlbergstr.): Kennzahlen-Block zeigt „Eingaben" + „Berechnet";
   Abrechnungsgrad und Marge rechnen korrekt; negative Marge erscheint rot.
5. Gewerk-Status auf „blockiert" setzen (mit Grund) → Objekt-Ampel wird rot → im Jour fixe unter „Blockiert"
   → Eintrag erscheint im Verlauf-Tab → danach zurücksetzen.
6. Vorbereitungs-Chip klicken → Status schaltet zyklisch weiter → Verlauf protokolliert alt → neu.
7. Aufgabe mit Frist gestern anlegen → Objekt-Ampel wird gelb; Aufgabe „Entscheidung GF" → erscheint im
   Jour fixe unter „Zu entscheiden".
8. Foto hochladen (JPG, ~2–5 MB) → erscheint in Galerie und lädt aus dem Manus-Dateispeicher;
   Nicht-Bild wird mit deutscher Meldung abgelehnt; Foto löschen entfernt Datei + Eintrag.
9. Material-Anfrage als Bauleiter (`geier`) stellen → als Einkauf (`neuer`) auf „bestellt" setzen →
   Bauleiter darf Status NICHT ändern (Serverseite verweigert), Einkauf darf keine Baustellen anlegen.
10. Neue Baustelle anlegen → hat automatisch 5 Standard-Gewerke + Vorbereitungs-Tab; wieder archivieren.
11. Jour fixe: Druckansicht ist hell, mit Agenda-Kopf (KW + Datum), ohne Buttons/Navigation.
12. `GET /api/export.sql` liefert als GF die komplette Datenbank, als Bauleiter 403.
13. Mobile-Check (schmales Viewport): Cockpit-Karten, Tabs und Formulare bedienbar.
14. Diktier-Button erscheint in Chrome und startet die Aufnahme (sofern Manus-Preview HTTPS liefert);
    in Browsern ohne Unterstützung ist der Button ausgeblendet.

## Arbeitsweise

1. Repo lesen (`README.md`, `migrations/`, `src/`, `public/static/`) → kurzen **Portierungsplan** vorlegen
   (Weg A oder B mit Begründung, Ziel-Stack, DB-Mapping, Foto-Speicher-Mapping).
2. Nach Bestätigung: bauen → Schema → Datenimport → Abnahme-Checkliste selbst durchtesten.
3. Ergebnis melden: Manus-URL, Testergebnisse je Checklistenpunkt, offene Punkte.
4. Bei jeder Unklarheit oder erzwungenen Abweichung: **nachfragen bzw. Abweichung explizit benennen** —
   nicht stillschweigend anders bauen.

---

*Kontakt/Betrieb: Die bisherige Cloudflare-Version wird eingefroren (Fallback, keine Datenpflege mehr).
Ab Go-Live in Manus ist die Manus-Instanz das führende System.*
