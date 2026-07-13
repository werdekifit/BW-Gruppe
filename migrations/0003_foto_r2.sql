-- BW Bau-Cockpit — Fotos in R2 statt Base64 in D1 (additiv)
-- r2_key: Objekt-Schlüssel im R2-Bucket; content_type: MIME-Typ zum korrekten Ausliefern.
-- datei_url bleibt erhalten (Fallback für Seed-Platzhalter und Altbestand).

ALTER TABLE foto ADD COLUMN r2_key TEXT;
ALTER TABLE foto ADD COLUMN content_type TEXT;
ALTER TABLE foto ADD COLUMN groesse INTEGER;
