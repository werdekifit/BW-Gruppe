import type { Ampel } from './types';

// ---------- Ampel-Logik (PRD Abschnitt 9) ----------
// Erwartet aggregierte Kennzahlen je Objekt.
export function berechneAmpel(opts: {
  ampel_override: Ampel | null;
  gewerke_blockiert: number;
  gewerke_offen_oder_laeuft: number; // nicht fertig
  aufgaben_ueberfaellig: number;
  fertigstellung: string | null;
}): { ampel: Ampel; override: boolean } {
  if (opts.ampel_override) {
    return { ampel: opts.ampel_override, override: true };
  }
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const ziel = opts.fertigstellung ? new Date(opts.fertigstellung + 'T00:00:00') : null;
  const nichtAllesFertig = opts.gewerke_offen_oder_laeuft > 0;

  // ROT
  if (opts.gewerke_blockiert > 0) return { ampel: 'rot', override: false };
  if (ziel && ziel < heute && nichtAllesFertig) return { ampel: 'rot', override: false };

  // GELB
  if (opts.aufgaben_ueberfaellig > 0) return { ampel: 'gelb', override: false };
  if (ziel) {
    const diffTage = Math.floor((ziel.getTime() - heute.getTime()) / 86400000);
    if (diffTage < 30 && nichtAllesFertig) return { ampel: 'gelb', override: false };
  }

  return { ampel: 'gruen', override: false };
}

export const AMPEL_LABEL: Record<Ampel, string> = {
  gruen: 'im Plan',
  gelb: 'Achtung',
  rot: 'kritisch',
};

export const GEWERK_STATUS_LABEL: Record<string, string> = {
  offen: 'offen',
  laeuft: 'läuft',
  fertig: 'fertig',
  blockiert: 'blockiert',
};

export const GEWERK_STATUS_ICON: Record<string, string> = {
  offen: '⚪',
  laeuft: '🔵',
  fertig: '✅',
  blockiert: '🔴',
};

// Vorbereitungs-Status (Excel: Offen/Aktiv/Erl./x)
export const VORB_STATUS_LABEL: Record<string, string> = {
  offen: 'offen',
  aktiv: 'aktiv',
  erledigt: 'erledigt',
  entfaellt: 'entfällt',
};
export const VORB_STATUS_ICON: Record<string, string> = {
  offen: '⚪',
  aktiv: '🔵',
  erledigt: '✅',
  entfaellt: '➖',
};
export const VORB_FELDER: { key: string; label: string }[] = [
  { key: 'genehmigung', label: 'Genehmigung' },
  { key: 'statik',      label: 'Statik' },
  { key: 'bb',          label: 'Baubeginn (BB)' },
  { key: 'sperrung',    label: 'Sperrung' },
  { key: 'b_modus',     label: 'Bewohner-Modus' },
  { key: 'demontage',   label: 'Demontage' },
  { key: 'lv',          label: 'LV vorhanden' },
];

// Euro-Format de-DE, z. B. 95.000 € / 45.095,60 €
export function fmtEuro(n: number | null | undefined, decimals = 0): string {
  if (n == null) return '—';
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals, maximumFractionDigits: Math.max(decimals, 2),
  }).format(n) + ' €';
}

// Datum dd.mm.yyyy
export function fmtDatum(d: string | null): string {
  if (!d) return '—';
  const iso = d.length > 10 ? d.substring(0, 10) : d;
  const [y, m, day] = iso.split('-');
  if (!y || !m || !day) return d;
  return `${day}.${m}.${y}`;
}

// Monat/Jahr z.B. 09/2026
export function fmtMonatJahr(d: string | null): string {
  if (!d) return '—';
  const iso = d.substring(0, 10);
  const [y, m] = iso.split('-');
  return `${m}/${y}`;
}

export function istUeberfaellig(frist: string | null, status: string): boolean {
  if (!frist || status !== 'offen') return false;
  const heute = new Date(); heute.setHours(0,0,0,0);
  return new Date(frist + 'T00:00:00') < heute;
}

export function escapeHtml(s: string | null | undefined): string {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// KW berechnen
export function kwNummer(d = new Date()): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const diff = date.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / (7 * 86400000));
}
