export type LeadParaResumen = {
  status: string;
  amountUsd: number | null;
  createdAt: string;
};

export type ResumenPortada = {
  leads30: number;
  leadsPrevios30: number;
  ganados30: number;
  montoGanado30: number;
  tendencia: number | null;
};

const DIA = 86_400_000;

// La portada del cliente: cuántos escribieron, cuántos compraron, cuánto, y si
// va mejor o peor que el mes anterior. Nada más.
export function resumirLeads(rows: LeadParaResumen[], ahora: Date): ResumenPortada {
  const t = ahora.getTime();
  const desde30 = t - 30 * DIA;
  const desde60 = t - 60 * DIA;
  let leads30 = 0;
  let leadsPrevios30 = 0;
  let ganados30 = 0;
  let montoGanado30 = 0;
  for (const r of rows) {
    const c = Date.parse(r.createdAt);
    if (c >= desde30) {
      leads30++;
      if (r.status === "ganado") {
        ganados30++;
        montoGanado30 += r.amountUsd ?? 0;
      }
    } else if (c >= desde60) {
      leadsPrevios30++;
    }
  }
  const tendencia =
    leadsPrevios30 === 0 ? null : (leads30 - leadsPrevios30) / leadsPrevios30;
  return { leads30, leadsPrevios30, ganados30, montoGanado30, tendencia };
}
