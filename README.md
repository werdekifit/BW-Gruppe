# BW Bau-Cockpit

Interne Projekt-/Baustellen-Software für die **BW GRUPPE**. Responsive, mobiltaugliche Web-App im dunklen BW-Design.

## Projektüberblick
- **Name**: BW Bau-Cockpit
- **Ziel**: Zentrale Bauleitungs-Software — alle Baustellen an einem Ort steuern (Gewerke-Status, Aufgaben, Fotos), Material-Anfragen strukturiert zum Einkauf.
- **Auftraggeber**: werdeKIfit für BW GRUPPE (GF Christoph Brechtel)
- **Stack**: Hono + TypeScript + Cloudflare Pages + D1 (SQLite) · Frontend Vanilla JS + eigenes CSS (BW-Dark)

## MVP — umgesetzte Features
- **M1 Rollenbasierter Login** (GF / Bauleiter / Einkauf) mit Seed-Nutzern, signierte Session-Cookies (HMAC). Alle Seiten nur nach Login (`noindex`).
- **M2 Cockpit** — Kachel-Übersicht aller Baustellen mit Ampel, Prio, Fertigstellungstermin, Bauleiter, Kurzstatus. Filter: Alle / Prio / Meine / Blockiert. Zähler „kritisch / Achtung / im Plan / blockiert".
- **M3 Baustelle anlegen/bearbeiten** — alle Kopf-Felder inkl. OneDrive-Link (Modal-Formular).
- **M4 Objekt-Detail** — Tabs Gewerke / Aufgaben / Fotos / Material.
- **M5 Gewerke-Status** — offen/läuft/fertig/blockiert, Verantwortlich (eigen/Sub), Abhängigkeit (Hinweis „wartet auf …"), Blocker-Grund.
- **M6 Aufgaben** — Text, Verantwortlich, Frist, erledigt-Haken, „Entscheidung GF"-Kennzeichen.
- **M7 Foto-Upload** — Bereich/Raum + Kommentar + Datum; Galerie je Objekt (Bild als Data-URL in DB, v1 ohne R2).
- **M8 Material-Anfrage stellen** (Beschreibung/Menge, optional Gewerk) → erscheint sofort im Einkauf.
- **M9 Einkauf-Ansicht** — alle Anfragen objektübergreifend; Status offen→bestellt→geliefert; Einkauf-Notiz + Lieferant; Filter.
- **M10 Ampel automatisch** (PRD Abschnitt 9), manuell übersteuerbar (`ampel_override`, sichtbar markiert).
- **M11 OneDrive-Button** — „📁 OneDrive-Ordner öffnen" je Objekt.
- **M12 BW-Dark-Design**, deutsche Oberfläche, responsive/mobiltauglich.
- **M13 Jour-fixe-Wochenansicht** — drei Spalten „Fertig (diese Woche) / Blockiert / Zu entscheiden (GF)" über Prio-Baustellen; Drucken-Button; Diktier-Eingabe für neue Entscheidungspunkte.
- **M14 Diktier-Eingabe (🎤)** auf allen Textfeldern via Web Speech API (`de-DE`); Button wird bei fehlendem Browser-Support ausgeblendet; Tippen bleibt möglich.

## Funktions-URIs (Pfade)
| Pfad | Zweck | Rolle |
|---|---|---|
| `GET /login`, `POST /login`, `GET /logout` | Anmeldung/Abmeldung | alle |
| `GET /cockpit` | Startseite, alle Baustellen | alle |
| `GET /objekt/:id` | Objekt-Detail (4 Tabs); `?edit=1` öffnet Bearbeiten | alle (Bearbeiten: GF/BL) |
| `GET /jour-fixe` | Freitags-Wochenansicht | alle |
| `GET /einkauf` | Material-Anfragen objektübergreifend | GF/Einkauf |
| `POST/PUT /api/objekt[/:id]` | Baustelle anlegen/bearbeiten | GF/BL |
| `PUT /api/gewerk/:id` | Gewerk-Status/Blocker | GF/BL |
| `POST /api/aufgabe`, `PUT /api/aufgabe/:id` | Aufgabe anlegen/erledigen | GF/BL |
| `POST /api/foto` | Foto-Upload (multipart) | GF/BL |
| `POST /api/material`, `PUT/DELETE /api/material/:id` | Material stellen/Status/Notiz/zurückziehen | stellen: GF/BL · Status: GF/Einkauf |

## Seed-Daten (echt vorbefüllt)
- **Nutzer**: Christoph Brechtel (GF), Eduard Geier · Dominic Booch · Atanas Gitev (Bauleiter), Robin Neuer (Einkauf). Demo-Passwort für alle: `bw2026!`
- **Objekte**: 1109 Uhlbergstr.6 🟢, 1122 Karlstr.7 🟡, 1131 Stöckachstr.52 🔴 (Prio), + 1104, 1115 🟡, 1127, 1133 🔴.
- 14 Gewerke je Objekt, Abhängigkeit Dämmung→Fenster, blockierte Gewerke bei 1131/1133, überfällige Aufgaben bei 1122/1115, Entscheidungs-Aufgaben, Beispiel-Fotos & Material-Anfragen (offen/bestellt/geliefert).
- **Ampel-Verteilung stimmt**: 2 kritisch · 2 Achtung · 3 im Plan · 2 blockiert.

## Datenmodell (D1 / SQLite)
`nutzer`, `objekt`, `gewerk` (self-FK Abhängigkeit), `aufgabe`, `foto`, `materialanfrage`. Details siehe `migrations/0001_initial_schema.sql`.

## Benutzung
1. `/login` öffnen → Schnellauswahl-Button klickt Nutzer + Passwort ein → Anmelden.
2. Cockpit: Kachel klicken → Objekt-Detail. Gewerke-Status per Dropdown, Aufgaben/Fotos/Material über „+".
3. Material-Anfrage stellen → als Robin (Einkauf) unter `/einkauf` bearbeiten.
4. Freitags: `/jour-fixe` → Überblick + Drucken.
5. 🎤 neben Textfeldern zum Diktieren (Chrome/Edge, Handy-Browser).

## Deployment
- **Plattform**: Cloudflare Pages (noch nicht live deployed — läuft lokal im Sandbox)
- **Lokal**: `npm run build` → `pm2 start ecosystem.config.cjs` (Port 3000, D1 `--local`)
- **DB lokal aufsetzen**: `npm run build && wrangler d1 migrations apply webapp-production --local && wrangler d1 execute webapp-production --local --file=./seed.sql`
- **Status**: ✅ Aktiv (Sandbox)
- **Letztes Update**: 2026-07-12

## Roadmap v2 (nach Feedback)
Fortschritts-%, Aktivitäts-/Änderungsverlauf, Objekt-Archivierung-Ansicht (Feld vorhanden), Jour-fixe-PDF-Export, Abhängigkeits-Automatik, CSV-Import ~40 Objekte, echter OneDrive/M365-Sync, Kamera-Direktupload.
