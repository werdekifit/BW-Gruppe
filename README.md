# BW Bau-Cockpit

## Projektübersicht
- **Name**: BW Bau-Cockpit
- **Auftraggeber**: werdeKIfit für BW GRUPPE (GF Christoph Brechtel)
- **Ziel**: Zentrale, mobiltaugliche Bauleitungs-Software zur Steuerung aller Sanierungs-Baustellen an einem Ort — Gewerke-Status, Aufgaben, Fotos, Material-Anfragen an den Einkauf, Ampel-Übersicht und Jour-fixe-Wochenansicht.
- **Plattform**: Responsive Web-App (Desktop + Handy), DB-gestützt (Cloudflare D1)

## ✅ Fertiggestellte Funktionen (MVP komplett)
- **M1 Rollenbasierter Login** (GF / Bauleiter / Einkauf) mit Seed-Nutzern, signiertes Session-Cookie. Alle Seiten nur nach Login (noindex, Zugriffsschutz).
- **M2 Cockpit** – Kachel-Übersicht aller Baustellen mit Ampel, Prio, Ziel-Termin, Bauleiter, Kurzstatus; Filter „Alle / Prio / Meine / Blockiert“; Zähler-Leiste (X kritisch / Achtung / im Plan / blockiert).
- **M3 Baustelle anlegen/bearbeiten** – alle Kopf-Felder inkl. OneDrive-Link, Prio, manuelle Ampel-Übersteuerung.
- **M4 Objekt-Detail** mit vier Tabs: Gewerke, Aufgaben, Fotos, Material.
- **M5 Gewerke-Status** (offen/läuft/fertig/blockiert), Verantwortlich (eigen/Sub), Abhängigkeit (Anzeige „wartet auf …“), Blocker-Grund.
- **M6 Aufgaben** (Text, Verantwortlich, Frist, erledigt-Haken, Entscheidungs-Kennzeichen).
- **M7 Foto-Upload** mit Bereich/Raum + Kommentar + Datum; Galerie je Objekt (Bild als Data-URL in DB, max. 3 MB).
- **M8 Material-Anfrage stellen** (Beschreibung/Menge, optional Gewerk) → Einkauf-Ansicht.
- **M9 Einkauf-Ansicht** – alle Anfragen objektübergreifend; Status offen→bestellt→geliefert; Einkauf-Notiz + Lieferant; Filter nach Status.
- **M10 Ampel automatisch** berechnet (rot: blockiertes Gewerk / überfälliger Termin; gelb: überfällige Aufgabe / <30 Tage; sonst grün), manuell übersteuerbar (sichtbar markiert).
- **M11 OneDrive-Button** je Objekt („📁 OneDrive-Ordner öffnen“).
- **M12 Durchgängiges BW-Dark-Design**, deutsche Oberfläche, mobiltauglich/touch-freundlich.
- **M13 Jour-fixe-Wochenansicht** – drei Spalten „Fertig (7 Tage) / Blockiert / Zu entscheiden (GF)“ über alle Baustellen, mit Drucken-Button.
- **M14 Diktier-Eingabe (🎤)** auf allen Textfeldern per Web Speech API (`de-DE`); bei fehlendem Browser-Support wird der Button ausgeblendet, Tippen bleibt immer möglich.

## Funktionale Einstiegspunkte (URIs)
| Pfad | Methode | Beschreibung | Rechte |
|---|---|---|---|
| `/login` | GET/POST | Anmeldung (login + passwort) | alle |
| `/logout` | GET | Abmelden | alle |
| `/cockpit` | GET | Baustellen-Übersicht (Startseite) | alle |
| `/objekt/:id` | GET | Objekt-Detail (Tabs); `?edit=1` öffnet Bearbeiten | alle (Bearbeiten: GF/BL) |
| `/jour-fixe` | GET | Wochenansicht Fertig/Blockiert/Zu entscheiden | alle |
| `/einkauf` | GET | Material-Anfragen objektübergreifend | GF/Einkauf |
| `/api/objekt` `/api/objekt/:id` | POST/PUT/GET | Baustelle anlegen/bearbeiten/lesen | GF/BL |
| `/api/gewerk/:id` | PUT | Gewerk-Status + Blocker-Grund | GF/BL |
| `/api/aufgabe` `/api/aufgabe/:id` | POST/PUT | Aufgabe anlegen / erledigt-Status | GF/BL |
| `/api/foto` | POST | Foto hochladen (multipart) | GF/BL |
| `/api/material` `/api/material/:id` | POST/PUT/DELETE | Anfrage stellen/ändern/zurückziehen | POST GF/BL · Status/Notiz GF/Einkauf |

## Datenarchitektur
- **Datenmodell**: `nutzer`, `objekt` (Baustelle), `gewerk` (self-FK Abhängigkeit), `aufgabe`, `foto`, `materialanfrage` — exakt nach PRD Abschnitt 8.
- **Speicher**: Cloudflare **D1** (SQLite). Fotos v1 als Data-URL in der DB (kein OneDrive-Sync).
- **Ampel-Logik**: serverseitig aus aggregierten Gewerke-/Aufgaben-Kennzahlen berechnet (`src/util.ts`).

## Seed-Daten (vorbefüllt)
- **Nutzer**: Brechtel (GF), Geier/Booch/Gitev (Bauleiter), Neuer (Einkauf) — Demo-Passwort für alle: **`bw2026!`**
- **7 Objekte**: 1109 Uhlbergstr. 6, 1122 Karlstr. 7, 1131 Stöckachstr. 52 + Demo 1104/1115/1127/1133 — mit gemischten Gewerke-Status, Abhängigkeit Dämmung→Fenster, blockierten Gewerken bei den roten Objekten (1131, 1133), überfälligen Aufgaben bei den gelben (1122, 1115), Entscheidungs-Aufgaben, Beispiel-Fotos und Material-Anfragen (offen/bestellt/geliefert).
- Ergebnis: Cockpit zeigt **2 kritisch · 2 Achtung · 3 im Plan · 2 blockiert**.

## Benutzer-Kurzanleitung
1. Auf `/login` mit Kürzel (z. B. `geier`) und `bw2026!` anmelden — oder Schnellauswahl klicken.
2. **Cockpit**: Baustellen auf einen Blick, filtern, Kachel öffnet das Objekt.
3. **Objekt-Detail**: Tabs Gewerke/Aufgaben/Fotos/Material pflegen; 🎤 zum Diktieren; „OneDrive-Ordner öffnen“.
4. **Material** anfragen → **Einkauf** (Robin) setzt bestellt/geliefert.
5. **Jour fixe** freitags durchgehen; Drucken für die Agenda.

## Deployment
- **Plattform**: Cloudflare Pages + D1
- **Status**: ✅ lokal lauffähig (Sandbox), noch nicht auf Cloudflare deployt
- **Tech-Stack**: Hono + TypeScript (SSR HTML) + Vanilla JS + D1 (SQLite)
- **Lokal starten**:
  ```bash
  npm run build
  npx wrangler d1 migrations apply webapp-production --local
  npx wrangler d1 execute webapp-production --local --file=./seed.sql
  pm2 start ecosystem.config.cjs
  ```
- **Letzte Aktualisierung**: 2026-07-12

## Roadmap v2 (nach Freigabe)
Fortschritts-%-Balken im Cockpit · Aktivitäts-/Änderungsverlauf · Objekt-Archivierung-Ansicht (Feld `archiviert` ist vorhanden) · Jour-fixe-PDF-Export · Abhängigkeits-Automatik · Kommentar-Threads · CSV-Import der ~40 Objekte · echter OneDrive/M365-Sync · Foto-Kamera-Direktupload.
