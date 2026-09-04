import { getOptionalEnvValue } from "@/server/lib/runtime-env";

export type BillingProvider = "none" | "autumn";

// Cobro de créditos. "none" ejecuta las consultas sin medir (equivale al
// comportamiento self-host). "autumn" conserva el flujo de upstream. La fase 6
// añade "nes" con el libro de créditos propio.
export async function getBillingProvider(): Promise<BillingProvider> {
  const raw = (await getOptionalEnvValue("BILLING_PROVIDER"))?.trim();
  if (!raw || raw === "none") return "none";
  if (raw === "autumn") return "autumn";
  throw new Error(
    `Unsupported BILLING_PROVIDER "${raw}". Expected "none" or "autumn".`,
  );
}
