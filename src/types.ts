export type Bindings = {
  DB: D1Database;
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
  status_text: string | null;
  bauleiter_id: number | null;
  fertigstellung: string | null;
  onedrive_link: string | null;
  ampel_override: 'gruen' | 'gelb' | 'rot' | null;
  notiz: string | null;
  archiviert: number;
  angelegt_am: string;
}

export interface Gewerk {
  id: number;
  objekt_id: number;
  name: string;
  status: 'offen' | 'laeuft' | 'fertig' | 'blockiert';
  verantwortlich_typ: 'eigen' | 'sub' | null;
  verantwortlich_name: string | null;
  abhaengig_von_id: number | null;
  blocker_grund: string | null;
  reihenfolge: number;
  aktualisiert_am: string;
}

export type Ampel = 'gruen' | 'gelb' | 'rot';
