export type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
};

export type Rolle = 'GF' | 'Bauleiter' | 'Einkauf';

export interface Nutzer {
  id: number;
  name: string;
  rolle: Rolle;
  login: string;
  aktiv: number;
}

export interface Objekt {
  id: number;
  objektnr: string;
  kurzname: string;
  adresse: string | null;
  stadt: string | null;
  gesellschaft: 'PG' | 'BF' | null;
  typ: string | null;
  wohneinheiten: number | null;
  prio: number;
  prio_rang: number | null;
  leistung: string | null;
  status_text: string | null;
  bauleiter_id: number | null;
  fertigstellung: string | null;
  onedrive_link: string | null;
  ampel_override: 'gruen' | 'gelb' | 'rot' | null;
  notiz: string | null;
  az_netto: number | null;
  sr_netto: number | null;
  ist_kosten: number | null;
  archiviert: number;
  angelegt_am: string;
}

export type VorbStatus = 'offen' | 'aktiv' | 'erledigt' | 'entfaellt';

export interface Vorbereitung {
  objekt_id: number;
  genehmigung: VorbStatus;
  statik: VorbStatus;
  bb: VorbStatus;
  sperrung: VorbStatus;
  b_modus: VorbStatus;
  demontage: VorbStatus;
  lv: VorbStatus;
  bb_datum: string | null;
  notiz: string | null;
  aktualisiert_am: string;
}

export interface VerlaufEintrag {
  id: number;
  objekt_id: number;
  nutzer_id: number | null;
  nutzer_name?: string | null;
  aktion: string;
  feld: string | null;
  alt_wert: string | null;
  neu_wert: string | null;
  zeitpunkt: string;
}

export interface Gewerk {
  id: number;
  objekt_id: number;
  name: string;
  status: 'offen' | 'laeuft' | 'fertig' | 'blockiert';
  verantwortlich_typ: 'eigen' | 'sub' | null;
  verantwortlich_name: string | null;
  an: string | null;
  install_status: VorbStatus | null;
  montage_status: VorbStatus | null;
  angebot_netto: number | null;
  abgerechnet_netto: number | null;
  notiz: string | null;
  abhaengig_von_id: number | null;
  blocker_grund: string | null;
  reihenfolge: number;
  aktualisiert_am: string;
}

export type Ampel = 'gruen' | 'gelb' | 'rot';
