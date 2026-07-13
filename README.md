# BW Bau-Cockpit

## Projektübersicht
- **Name**: BW Bau-Cockpit (v2 — Vollausbau)
- **Auftraggeber**: werdeKIfit für BW GRUPPE (GF Christoph Brechtel)
- **Ziel**: Zentrale, mobiltaugliche Bauleitungs-Software zur Steuerung aller Sanierungs-Baustellen an einem Ort — Vorbereitungsphase, Gewerke-Status inkl. AN/Beträgen, Aufgaben, Fotos, Material-Anfragen, Ampel-Übersicht, Kaufmännische Kennzahlen, Änderungsverlauf und Jour-fixe-Wochenansicht mit PDF-Export.
- **Plattform**: Responsive Web-App (Desktop + Handy), DB-gestützt (Cloudflare D1)

## ✅ Fertiggestellte Funktionen

### MVP (v1)
- **M1 Rollenbasierter Login** (GF / Bauleiter / Einkauf) mit Seed-Nutzern, signiertes Session-Cookie (HMAC). Alle Seiten nur nach Login.
- **M2 Cockpit** – Kachel-Übersicht aller Baustellen mit Ampel, Prio, Ziel-Termin, Bauleiter, Kurzstatus.
- **M3 Baustelle anlegen/bearbeiten** – alle Kopf-Felder inkl. OneDrive-Link, manuelle Ampel-Übersteuerung.
- **M4 Objekt-Detail** mit Tabs, **M5 Gewerke-Status** (offen/läuft/fertig/blockiert) mit Blocker-Grund, **M6 Aufgaben** (Frist, Entscheidungs-Kennzeichen), **M7 Foto-Upload**, **M8/M9 Material-Anfragen + Einkauf-Ansicht**, **M10 Ampel-Automatik**, **M11 OneDrive-Button**, **M12 BW-Dark-Design**, **M13 Jour-fixe-Wochenansicht**, **M14 Diktier-Eingabe (🎤, de-DE)**.

### v2 — Vollausbau (neu)
- **V1 Echte Projektstruktur**: `prio_rang` (echter Rang 1–46 aus Excel), `leistung` (z. B. „MFH Sanierung", „Abgeschlossen"), kaufmännische Felder `az_netto`/`sr_netto`/`ist_kosten` am Objekt.
- **V2 Vorbereitungsphase** (neue Tabelle `vorbereitung`, 1:1 zu Objekt): Genehmigung / Statik / BB (+ BB-Datum) / Sperrung / Bewohner-Modus / Demontage / LV — Status je `offen/aktiv/erledigt/entfällt` (Excel: Offen/Aktiv/Erl./x). Eigener Tab im Objekt-Detail mit klickbaren Status-Chips (Klick schaltet weiter) + Diktier-Notiz.
- **V3 Erweiterte Gewerke**: AN (Auftragnehmer/Sub-Firma), Install.-/Montage-Status, Angebot-/Abgerechnet-Netto, Notiz je Gewerk; Bearbeiten-Modal (✎); „+ Gewerk" mit erweiterter Standardliste (Fenster/Sonnenschutz, Elektro, HLS, Küche, Innenausbau + Zusatz: Fassade, Balkon/Terrasse, Dach, Gerüst …). **Küche** als eigenes Gewerk mit Angebot/Pläne(Install.)/Montage/Netto.
- **V4 Kaufmännische Übersicht**: Kennzahlen-Block je Objekt (Angebot Σ / Abgerechnet Σ aus Gewerken, AZ / SR / Ist vom Objekt) + Summenzeile im Cockpit (Angebot gesamt, abgerechnet gesamt über alle aktiven Baustellen).
- **V5 Cockpit-Sortierung nach `prio_rang`** (1 oben, ohne Rang unten), Rang-Badge (P1…), neue Filter **„Abgeschlossen"** (leistung='Abgeschlossen') und **„Archiviert"**.
- **V6 Fortschritts-%** je Objekt (fertige ÷ alle Gewerke) als Balken im Cockpit und Detail.
- **V7 Änderungsverlauf** (neue Tabelle `verlauf`): Status-/Feldänderungen an Objekt, Gewerken, Vorbereitung, Aufgaben und Material werden protokolliert (wer, wann, alt → neu) — Tab „Verlauf" im Detail.
- **V8 Archivierung**: Button „✔ Baustelle abschließen" / „↩ Reaktivieren" (GF/Bauleiter), archivierte Objekte im Cockpit ausgeblendet (Filter „Archiviert" zeigt sie).
- **V9 Jour-fixe-PDF-Export**: druckoptimierte Freitags-Agenda (Print-CSS: weißer Hintergrund, Agenda-Kopf mit KW/Datum, Spalten untereinander) — über „🖨 Drucken / PDF-Export" → im Browser-Druckdialog „Als PDF speichern".
- **V10 Echte Seed-Daten**: alle **40 realen BW-Projekte** aus Projektübersicht.xlsx (Stand 10. Juli) inkl. Vorbereitungs-Status, Gewerken mit AN + Beträgen, Prio-Rang; „Abgeschlossen"-Projekte automatisch `archiviert=1`.

## Funktionale Einstiegspunkte (URIs)
| Pfad | Methode | Beschreibung | Rechte |
|---|---|---|---|
| `/login` | GET/POST | Anmeldung (login + passwort) | alle |
| `/logout` | GET | Abmelden | alle |
| `/cockpit` | GET | Baustellen-Übersicht (Startseite), sortiert nach Prio-Rang | alle |
| `/objekt/:id` | GET | Objekt-Detail (Tabs Gewerke/Vorbereitung/Aufgaben/Fotos/Material/Verlauf); `?edit=1` öffnet Bearbeiten | alle (Bearbeiten: GF/BL) |
| `/jour-fixe` | GET | Wochenansicht Fertig/Blockiert/Zu entscheiden + Druck/PDF | alle |
| `/einkauf` | GET | Material-Anfragen objektübergreifend | GF/Einkauf |
| `/api/objekt` `/api/objekt/:id` | POST/PUT/GET | Baustelle anlegen (inkl. Standard-Gewerke + Vorbereitung)/bearbeiten/lesen | GF/BL |
| `/api/objekt/:id/archiv` | POST | Baustelle archivieren/reaktivieren (`{archiviert:0\|1}`) | GF/BL |
| `/api/gewerk` | POST | Gewerk hinzufügen | GF/BL |
| `/api/gewerk/:id` | PUT | Gewerk-Status + Blocker-Grund | GF/BL |
| `/api/gewerk/:id/details` | PUT | AN, Install./Montage, Angebot/Abgerechnet, Notiz | GF/BL |
| `/api/vorbereitung/:objektId` | PUT | Vorbereitungs-Feld setzen (`{feld, wert}`; Felder: genehmigung, statik, bb, sperrung, b_modus, demontage, lv, bb_datum, notiz) | GF/BL |
| `/api/aufgabe` `/api/aufgabe/:id` | POST/PUT | Aufgabe anlegen / erledigt-Status | GF/BL |
| `/api/foto` | POST | Foto hochladen (multipart) → Bild nach R2, Verweis in D1 | GF/BL |
| `/api/foto/:id` | GET | Bild aus R2 streamen (Cache 1 Tag, nur angemeldet) | alle (angemeldet) |
| `/api/foto/:id` | DELETE | Foto löschen (R2-Objekt + D1-Zeile) | GF · BL (eigene) |
| `/api/material` `/api/material/:id` | POST/PUT/DELETE | Anfrage stellen/ändern/zurückziehen | POST GF/BL · Status/Notiz GF/Einkauf |
| `/api/export.sql` | GET | Voll-Backup des Datenbestands als idempotente SQL-Datei (Migration/Backup) | GF |

## Datenarchitektur
- **Datenmodell**: `nutzer`, `objekt` (+ prio_rang, leistung, az_netto, sr_netto, ist_kosten), `vorbereitung` (1:1, Vorbereitungsphase), `gewerk` (+ an, install_status, montage_status, angebot_netto, abgerechnet_netto, notiz), `aufgabe`, `foto`, `materialanfrage`, `verlauf` (Änderungsprotokoll).
- **Migrationen**: `0001_initial_schema.sql` (MVP) + `0002_v2_vollausbau.sql` (Vollausbau, additiv) + `0003_foto_r2.sql` (Foto-Spalten `r2_key`/`content_type`/`groesse`).
- **Speicher**: Cloudflare **D1** (SQLite) für alle Sachdaten (Projekte/Gewerke/…). **Fotos in Cloudflare R2** (Objektspeicher, Binding `BUCKET`, Bucket `bw-bau-fotos`): das Bild liegt in R2 (praktisch unbegrenzt, skaliert auf tausende/Millionen Fotos), in D1 steht nur der Schlüssel (`r2_key`). Upload bis 15 MB, nur Bilddateien; Auslieferung über `/api/foto/:id` (nur angemeldet, 1 Tag Cache). `datei_url`-Fallback für Seed-Platzhalter/Altbestand bleibt erhalten.
  > Hintergrund: D1 ist auf 10 GB pro Datenbank und 2 MB pro Zeile begrenzt — für Foto-Massen ungeeignet. R2 ist unbegrenzt und ohne Egress-Kosten und damit der richtige Ort für Bilder.
- **Ampel-Logik** (`src/util.ts`): rot = blockiertes Gewerk oder Fertigstellung überschritten (und nicht alles fertig); gelb = überfällige Aufgabe oder < 30 Tage bis Ziel; sonst grün; manuell übersteuerbar.
- **Status-Mapping Excel → App**: `Erl.` → erledigt/fertig · `Aktiv` → aktiv/läuft · `Offen` → offen · `x` → entfällt · `Vorh.` → erledigt (vorhanden) · `Teilweise` → aktiv. FS-Jahresangaben (2026/2027) → 31.12.JJJJ, KW-Angaben grob in Datum umgerechnet bzw. als Notiz.

## Seed-Daten (echte Projekte)
- **Nutzer**: Brechtel (GF), Geier/Booch/Gitev (Bauleiter), Neuer (Einkauf) — Demo-Passwort für alle: **`bw2026!`**
- **40 echte Projekte** aus der Projektübersicht (Stand 10. Juli), sortiert nach Prio-Rang 1–42: u. a. 1101 Albrecht-Dürer Weg, 1118 Reutlingerstr. 123, 1109 Uhlbergstr., 1122/1132 Karlstr., 1128 Stöckachstr., 2113 Reutlingerstr. 78 … bis 2140 Pischekstr. 11.
- 5 „Abgeschlossen"-Projekte (1124, 1116, 1117, 1126, 2116) sind archiviert (Filter „Archiviert"/„Abgeschlossen").
- Projekte ohne P-Nr. in der Excel haben Platzhalter-Nummern **9001–9005** (Notiz „P-Nr. noch nicht vergeben").
- Häufige AN: Würthner (HLS), Bülent/Fleiß Bau (Dach), Dragan/Dikovski/Nuri/R. Brechko/D. Matai/Ruslan (Innenausbau/Fassade), BW Real (Eigenleistung).
- Ampel-Ergebnis mit Seed: **5 kritisch** (überschrittene Fertigstellung bzw. Blocker) · **3 Achtung** (Frist < 30 Tage / überfällige Aufgaben) · Rest im Plan · 1 blockiert (1134 Heimgartenstr.: Wohnung erst ab Ende Juli frei).

## Benutzer-Kurzanleitung
1. Auf `/login` mit Kürzel (z. B. `geier`) und `bw2026!` anmelden — oder Schnellauswahl klicken.
2. **Cockpit**: Baustellen nach echtem Prio-Rang, Fortschritts-Balken, Summenzeile Angebot/Abgerechnet; Filter Alle/Prio/Meine/Blockiert/Abgeschlossen/Archiviert.
3. **Objekt-Detail**: Kennzahlen-Block (Angebot/Abgerechnet/AZ/SR/Ist); Tabs **Gewerke** (Status, AN, Install./Montage, Beträge — ✎ öffnet Bearbeiten), **Vorbereitung** (Chips anklicken zum Weiterschalten), Aufgaben, Fotos, Material, **Verlauf**.
4. **Baustelle abschließen**: Button im Detail-Kopf archiviert das Objekt (reaktivierbar).
5. **Material** anfragen → **Einkauf** (Robin) setzt bestellt/geliefert.
6. **Jour fixe** freitags durchgehen; „🖨 Drucken / PDF-Export" erzeugt die druckoptimierte Agenda (im Druckdialog „Als PDF speichern").
7. 🎤 auf allen Textfeldern diktieren (Web Speech API, de-DE).

## Deployment
- **Plattform**: Cloudflare **Workers** (Git-Build via `npx wrangler deploy`) + **D1** (Sachdaten) + **R2** (Fotos)
- **Tech-Stack**: Hono + TypeScript (SSR HTML) + Vanilla JS + D1 (SQLite) + R2 (Objektspeicher)
- **Bindings** (in `wrangler.jsonc`): `DB` → D1 `webapp-production`; `BUCKET` → R2 `bw-bau-fotos`. Beide müssen im Cloudflare-Konto existieren, bevor deployt wird.
- **Einmalige Cloud-Einrichtung**:
  ```bash
  npx wrangler d1 create webapp-production      # database_id in wrangler.jsonc eintragen
  npx wrangler r2 bucket create bw-bau-fotos    # R2 muss im Konto aktiviert sein
  npx wrangler d1 migrations apply webapp-production --remote
  npx wrangler d1 execute webapp-production --remote --file=./seed.sql
  ```
- **Lokal starten** (R2 & D1 werden lokal simuliert):
  ```bash
  npm run build
  npx wrangler d1 migrations apply webapp-production --local
  npx wrangler d1 execute webapp-production --local --file=./seed.sql
  pm2 start ecosystem.config.cjs   # bzw. npx wrangler dev
  ```
- **Letzte Aktualisierung**: 2026-07-13

## Roadmap v3 (Ideen)
Abhängigkeits-Automatik zwischen Gewerken · Kommentar-Threads · CSV-/Excel-Re-Import als Abgleich · echter OneDrive/M365-Sync · Bild-Verkleinerung/Thumbnails beim Upload (spart R2-Speicher & Ladezeit) · Kosten-Auswertung (Soll/Ist je Gewerk) · Push-Benachrichtigungen bei Blockern.
