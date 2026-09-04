import { describe, expect, it } from "vitest";
import { resumirLeads } from "@/server/features/leads/services/resumen";

const ahora = new Date("2026-09-15T12:00:00Z");
const hace = (dias: number) =>
  new Date(ahora.getTime() - dias * 86_400_000).toISOString();

describe("resumirLeads", () => {
  it("cuenta leads de los últimos 30 días y ganados con monto", () => {
    const r = resumirLeads(
      [
        { status: "nuevo", amountUsd: null, createdAt: hace(1) },
        { status: "ganado", amountUsd: 120, createdAt: hace(5) },
        { status: "ganado", amountUsd: 80, createdAt: hace(45) },
        { status: "perdido", amountUsd: null, createdAt: hace(2) },
      ],
      ahora,
    );
    expect(r.leads30).toBe(3);
    expect(r.ganados30).toBe(1);
    expect(r.montoGanado30).toBe(120);
  });
  it("calcula tendencia contra los 30 días anteriores", () => {
    const r = resumirLeads(
      [
        { status: "nuevo", amountUsd: null, createdAt: hace(3) },
        { status: "nuevo", amountUsd: null, createdAt: hace(4) },
        { status: "nuevo", amountUsd: null, createdAt: hace(40) },
      ],
      ahora,
    );
    expect(r.leads30).toBe(2);
    expect(r.leadsPrevios30).toBe(1);
    expect(r.tendencia).toBe(1); // (2-1)/1
  });
  it("tendencia es null sin base previa", () => {
    const r = resumirLeads([{ status: "nuevo", amountUsd: null, createdAt: hace(1) }], ahora);
    expect(r.tendencia).toBeNull();
  });
});
