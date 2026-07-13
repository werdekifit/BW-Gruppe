import { berechneAmpel } from './util';
import type { Ampel, Objekt } from './types';

export interface ObjektMitAmpel extends Objekt {
  bauleiter_name: string | null;
  gewerke_gesamt: number;
  gewerke_fertig: number;
  gewerke_blockiert: number;
  aufgaben_ueberfaellig: number;
  material_offen: number;
  angebot_summe: number | null;
  abgerechnet_summe: number | null;
  ampel: Ampel;
  ampel_override_flag: boolean;
  fortschritt: number;
}

const OBJEKT_AGG_SQL = `
SELECT o.*,
  n.name AS bauleiter_name,
  (SELECT COUNT(*) FROM gewerk g WHERE g.objekt_id = o.id) AS gewerke_gesamt,
  (SELECT COUNT(*) FROM gewerk g WHERE g.objekt_id = o.id AND g.status = 'fertig') AS gewerke_fertig,
  (SELECT COUNT(*) FROM gewerk g WHERE g.objekt_id = o.id AND g.status = 'blockiert') AS gewerke_blockiert,
  (SELECT COUNT(*) FROM gewerk g WHERE g.objekt_id = o.id AND g.status != 'fertig') AS gewerke_nicht_fertig,
  (SELECT COUNT(*) FROM aufgabe a WHERE a.objekt_id = o.id AND a.status = 'offen' AND a.frist IS NOT NULL AND a.frist < date('now')) AS aufgaben_ueberfaellig,
  (SELECT COUNT(*) FROM materialanfrage m WHERE m.objekt_id = o.id AND m.status = 'offen') AS material_offen,
  (SELECT SUM(g.angebot_netto) FROM gewerk g WHERE g.objekt_id = o.id) AS angebot_summe,
  (SELECT SUM(g.abgerechnet_netto) FROM gewerk g WHERE g.objekt_id = o.id) AS abgerechnet_summe
FROM objekt o
LEFT JOIN nutzer n ON n.id = o.bauleiter_id
`;

function mapObjekt(row: any): ObjektMitAmpel {
  const { ampel, override } = berechneAmpel({
    ampel_override: row.ampel_override,
    gewerke_blockiert: row.gewerke_blockiert,
    gewerke_offen_oder_laeuft: row.gewerke_nicht_fertig,
    aufgaben_ueberfaellig: row.aufgaben_ueberfaellig,
    fertigstellung: row.fertigstellung,
  });
  const fortschritt = row.gewerke_gesamt > 0
    ? Math.round((row.gewerke_fertig / row.gewerke_gesamt) * 100) : 0;
  return { ...row, ampel, ampel_override_flag: override, fortschritt };
}

export async function ladeObjekte(db: D1Database, opts: { inklArchiviert?: boolean } = {}): Promise<ObjektMitAmpel[]> {
  const where = opts.inklArchiviert ? '' : 'WHERE o.archiviert = 0';
  // Sortierung: aktive vor archivierten, dann echter Prio-Rang (1 oben, ohne Rang unten)
  const sql = `${OBJEKT_AGG_SQL} ${where}
    ORDER BY o.archiviert ASC,
      CASE WHEN o.prio_rang IS NULL THEN 1 ELSE 0 END,
      o.prio_rang ASC, o.prio DESC, o.objektnr ASC`;
  const res = await db.prepare(sql).all();
  return (res.results as any[]).map(mapObjekt);
}

export async function ladeObjekt(db: D1Database, id: number): Promise<ObjektMitAmpel | null> {
  const sql = `${OBJEKT_AGG_SQL} WHERE o.id = ?`;
  const row = await db.prepare(sql).bind(id).first();
  return row ? mapObjekt(row) : null;
}
