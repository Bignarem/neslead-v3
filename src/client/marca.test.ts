import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Brand-safety net. See docs/nes/marca.md for what this test protects, how
 * to add an exception, and what to do when it goes red after pulling a new
 * upstream version.
 *
 * Task 4d exists because this leaked into a client-visible screen four
 * times, hand-fixed each time, and came back each time. The last case:
 * settings screens live behind an `isHosted` check, and both the
 * implementer and the reviewer read that as "hidden" — but the deployed
 * stage runs AUTH_MODE=hosted, so `isHosted` is TRUE there and those
 * screens are exactly the ones every client sees. Nobody reasoned about
 * flag *values*, only flag *names*. This test does neither: it does not
 * know what `isHosted`, `AI_AGENT_ENABLED`, or any other flag evaluates to.
 * It reads the source files as plain text. The only way a match doesn't
 * fail the build is an explicit line below, with a reason a human wrote
 * after checking the real gate against the real deployed .env.preview.
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Directories this test is responsible for. The brief scopes it to these two
// — everything a client's browser ever loads is reachable from here (routes
// + the client feature/component tree). Server code, emails, and docs are
// out of scope for this specific test.
const SCAN_ROOTS = ["src/client", "src/routes"];

// Only files that can end up in a client's browser. Test files never render
// for a client — they're fixtures and assertions, not interface — so they're
// excluded structurally, the same way a comment is excluded structurally:
// neither is something a client can ever read.
const SCAN_EXTENSIONS = [".ts", ".tsx", ".css"];
const isTestFile = (path: string) => /\.test\.tsx?$/.test(path);

// Case-insensitive substrings that must never appear in anything a client
// can read. "openseo" alone also catches "OpenSEO", "openseo.so", and
// "openseo-dark"; "open-seo" separately catches the hyphenated GitHub/npm
// package spelling ("every-app/open-seo"), which "openseo" does not match.
const BANNED_NEEDLES = ["openseo", "open-seo", "dataforseo"];

interface WhitelistEntry {
  file: string;
  /** Substring expected on the flagged line (matched case-insensitively).
   * Keeps the entry valid across line-number drift from upstream merges —
   * if the substring is gone, the entry is stale and this test fails until
   * someone removes it. */
  match: string;
  /** Why this specific string is not client-visible marca. Required: an
   * exception with no reason is exactly how this leaked in three times. */
  reason: string;
}

// prettier-ignore
const WHITELIST: WhitelistEntry[] = [
  // --- Internal identifiers: variable/constant/function names, module
  // paths, CSS theme names, localStorage keys, HTML id/aria plumbing. A
  // client never reads these as prose; they only ever appear as source code,
  // a devtools attribute, or an error-code key. ---
  {
    file: "src/client/components/SerpLocationCombobox.tsx",
    match: "@/server/lib/dataforseo/serp-locations",
    reason: "Ruta de módulo interna del servidor (import type), no es texto de interfaz.",
  },
  {
    file: "src/client/features/backlinks/BacklinksPageSections.tsx",
    match: "MAX_DATAFORSEO_FILTER_CONDITIONS",
    reason: "Nombre de constante interna (límite de condiciones de filtro), nunca se muestra en pantalla.",
  },
  {
    file: "src/client/features/backlinks/useBacklinksFilters.ts",
    match: "MAX_DATAFORSEO_FILTER_CONDITIONS",
    reason: "Nombre de constante interna (límite de condiciones de filtro), nunca se muestra en pantalla.",
  },
  {
    file: "src/client/features/domain/components/DomainFilterPanel.tsx",
    match: "MAX_DATAFORSEO_FILTER_CONDITIONS",
    reason: "Nombre de constante interna (límite de condiciones de filtro), nunca se muestra en pantalla.",
  },
  {
    file: "src/client/features/domain/components/KeywordsTab.tsx",
    match: "MAX_DATAFORSEO_FILTER_CONDITIONS",
    reason: "Nombre de constante interna (límite de condiciones de filtro), nunca se muestra en pantalla.",
  },
  {
    file: "src/client/features/domain/components/PagesTab.tsx",
    match: "MAX_DATAFORSEO_FILTER_CONDITIONS",
    reason: "Nombre de constante interna (límite de condiciones de filtro), nunca se muestra en pantalla.",
  },
  {
    file: "src/client/features/billing/BillingFeatureBreakdown.tsx",
    match: "mapDataforseoPathToCreditFeature",
    reason: "Nombre de función interna; sus valores de retorno (CREDIT_FEATURE_LABELS en src/shared/billing-credit-features.ts) no incluyen el nombre del proveedor.",
  },
  {
    file: "src/client/lib/active-project.ts",
    match: "openseo:lastProjectId",
    reason: "Clave de localStorage, identificador interno que el cliente nunca lee.",
  },
  {
    file: "src/client/lib/theme.ts",
    match: "openseo",
    reason: "Nombres de tema de daisyUI; deben coincidir con app.css. Son plumbing (atributo data-theme en el DOM), no prosa que un cliente lee — cambiarlos es un rediseño de identidad visual aparte, no un caso de marca ajena visible.",
  },
  {
    file: "src/client/styles/app.css",
    match: "openseo",
    reason: "Selectores CSS para los temas 'openseo'/'openseo-dark' (ver src/client/lib/theme.ts); identificadores de plumbing, no texto visible.",
  },
  {
    file: "src/client/layout/AppShellParts.tsx",
    match: "dataforseo-setup-title",
    reason: "Valor de atributo id/aria-labelledby, no es contenido leído. El texto visible del modal ya está de-brandeado ('Falta completar la configuración de la cuenta').",
  },
  {
    file: "src/client/layout/AppShellParts.tsx",
    match: "dataforseo-setup-description",
    reason: "Valor de atributo id/aria-describedby, no es contenido leído. El texto visible del modal ya está de-brandeado.",
  },
  {
    file: "src/client/layout/AppShell.tsx",
    match: "DATAFORSEO_HELP_PATH",
    reason: "Nombre de constante interna usada solo para comparar location.pathname, no es texto visible.",
  },
  {
    file: "src/client/lib/error-messages.ts",
    match: "DATAFORSEO_AUTH_FAILED",
    reason: "Clave de un código de error definido en src/shared/error-codes.ts; renombrarlo es un refactor más amplio (server + client + tests) fuera de esta tarea. El mensaje visible ya no nombra la marca.",
  },
  {
    file: "src/client/lib/error-messages.ts",
    match: "DATAFORSEO_API_KEY",
    reason: "Nombre real del secreto de entorno (ver .env.preview), citado para quien administra el despliegue. No es prosa de marca; el resto del mensaje ya dice 'the data provider'.",
  },
  {
    file: "src/routes/_app/help/dataforseo-api-key.tsx",
    match: "DATAFORSEO_API_KEY",
    reason: "Nombre real del secreto de entorno en Cloudflare (ver .env.preview); el comando/nombre exacto que hay que teclear para configurarlo. La prosa alrededor ya no nombra la marca.",
  },
  {
    file: "src/routes/_app/help/dataforseo-api-key.tsx",
    match: "DATAFORSEO_API_ACCESS_URL",
    reason: "URL real de alta del proveedor (app.dataforseo.com/api-access), necesaria para completar el trámite operativo; no hay equivalente propio a la que enlazar.",
  },
  {
    file: "src/routes/_app/help/dataforseo-api-key.tsx",
    match: "/_app/help/dataforseo-api-key",
    reason: "Ruta/nombre de archivo de esta misma página de ayuda; renombrarla implica regenerar el árbol de rutas de TanStack Router, fuera del alcance quirúrgico de esta tarea. Queda como página huérfana (nada enlaza a ella hoy) — ver informe de la tarea 4d.",
  },
  {
    file: "src/routes/_app/help/dataforseo-api-key.tsx",
    match: "DataforseoApiKeyHelpPage",
    reason: "Nombre de función/componente que refleja el nombre del archivo de ruta, no texto visible.",
  },

  // --- Gated behind AI_AGENT_ENABLED=false (verified in .env.preview): the
  // route throws notFound() in beforeLoad, or the parent drops the
  // component from render. Each entry names the exact gate and confirms
  // (via `grep -rln` at review time) that the file has no other importer. ---
  {
    file: "src/client/features/ai-mcp/AvailableTools.tsx",
    match: "OpenSEO",
    reason: "Solo lo importa src/routes/_app/ai.tsx, cuyo beforeLoad lanza notFound() si AI_AGENT_ENABLED === \"false\" (.env.preview: AI_AGENT_ENABLED=false). Único importador confirmado.",
  },
  {
    file: "src/client/features/dashboard/McpConnectCard.tsx",
    match: "OpenSEO",
    reason: "Solo lo importa DashboardPage.tsx, que lo excluye del arreglo `cards` cuando `!aiAgentEnabled` (AI_AGENT_ENABLED === \"false\" en .env.preview). Único importador confirmado.",
  },
  {
    file: "src/client/features/dashboard/DashboardPage.tsx",
    match: "OpenSEO",
    reason: "El texto vive en HERO_COPY.mcp. dashboardSteps.ts excluye \"mcp\" de STEP_ORDER cuando AI_AGENT_ENABLED === \"false\", y computeNextStep solo devuelve pasos de STEP_ORDER: ese texto nunca se renderiza con la bandera actual.",
  },
  {
    file: "src/client/features/sam/SamSetupGate.tsx",
    match: "OpenSEO",
    reason: "Solo lo importa SamChat.tsx, que solo se usa en src/routes/_project/p/$projectId/sam.tsx, cuyo beforeLoad lanza notFound() si AI_AGENT_ENABLED === \"false\".",
  },
  {
    file: "src/client/features/sam/SamSidebarPanel.tsx",
    match: "OpenSEO",
    reason: "Se importa en Sidebar.tsx pero solo se renderiza cuando view === \"chat\"; ese estado solo se alcanza vía openChat(), que solo lo dispara el botón de pestaña \"Chat\", oculto por Sidebar.tsx cuando aiAgentEnabled es falso. Con AI_AGENT_ENABLED=false no hay forma de llegar a view === \"chat\".",
  },
  {
    file: "src/client/features/sam/SamChat.tsx",
    match: "OpenSEO",
    reason: "Solo se usa en src/routes/_project/p/$projectId/sam.tsx, gated por AI_AGENT_ENABLED === \"false\".",
  },
  {
    file: "src/routes/_app/ai.tsx",
    match: "openseo",
    reason: "El beforeLoad de esta misma ruta lanza notFound() si AI_AGENT_ENABLED === \"false\" (.env.preview: AI_AGENT_ENABLED=false), antes de que el componente con este texto se monte.",
  },
  {
    file: "src/routes/_app/ai.tsx",
    match: "open-seo",
    reason: "Mismo gate que la entrada anterior de este archivo (beforeLoad -> notFound() con AI_AGENT_ENABLED=false); cubre la forma con guion (every-app/open-seo) de los comandos de instalación de skills.",
  },

  // --- Gated behind ONBOARDING_ENABLED=false (verified in .env.preview),
  // added by this task: both onboarding routes now throw notFound() in
  // beforeLoad when the flag is off, matching the pattern already proven
  // for AI_AGENT_ENABLED. Before this task neither route checked the flag
  // at all — only the auto-redirect into onboarding did — so the route was
  // reachable by direct URL despite the flag. See docs/nes/marca.md. ---
  {
    file: "src/routes/_authenticated.onboarding.index.tsx",
    match: "ben@openseo.so",
    reason: "El beforeLoad de esta misma ruta (arriba en este archivo) lanza notFound() si ONBOARDING_ENABLED === \"false\" (.env.preview: ONBOARDING_ENABLED=false).",
  },
  {
    file: "src/client/features/onboarding/PostSignupOnboarding.tsx",
    match: "OpenSEO",
    reason: "Solo lo importa src/routes/_authenticated.onboarding.index.tsx, gated por ONBOARDING_ENABLED === \"false\".",
  },
  {
    file: "src/client/features/onboarding/SearchConsoleOnboardingStep.tsx",
    match: "OpenSEO",
    reason: "Solo lo importa PostSignupOnboarding.tsx, que a su vez está gated (ver entrada anterior).",
  },
  {
    file: "src/client/features/onboarding/OnboardingChat.tsx",
    match: "OpenSEO",
    reason: "Solo se usa en src/routes/_authenticated.onboarding.chat.tsx, cuyo beforeLoad lanza notFound() si ONBOARDING_ENABLED === \"false\".",
  },
  {
    file: "src/client/features/onboarding/OnboardingChatConversation.tsx",
    match: "OpenSEO",
    reason: "Solo lo importa OnboardingChat.tsx, gated por ONBOARDING_ENABLED === \"false\" (ver entrada anterior).",
  },
  {
    file: "src/client/features/onboarding/OnboardingChatParts.tsx",
    match: "OpenSEO",
    reason: "Los dos componentes que usan estas piezas están gated: OnboardingChatConversation.tsx (ruta onboarding/chat, ONBOARDING_ENABLED === \"false\") y SamConversation.tsx (ruta sam, AI_AGENT_ENABLED === \"false\"; ese segundo camino además sobreescribe el placeholder sin nombrar la marca).",
  },
];

function listFiles(root: string): string[] {
  const absoluteRoot = join(REPO_ROOT, root);
  const entries = readdirSync(absoluteRoot, {
    recursive: true,
    withFileTypes: true,
  });
  const files: string[] = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!SCAN_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) continue;
    if (isTestFile(entry.name)) continue;
    files.push(relative(REPO_ROOT, join(entry.parentPath, entry.name)));
  }
  return files;
}

/**
 * Strips comments conservatively so the check never produces a false
 * negative. Block comments (including JSDoc and `{/* JSX *\/}`) are removed
 * entirely, replaced by the same number of newlines so line numbers in the
 * failure report stay accurate. Only *whole-line* `//` comments are
 * stripped — a trailing `//` on a code line is left alone on purpose,
 * because naively cutting a line at the first `//` would also truncate
 * `https://openseo.so` into `https:`, silently hiding the one thing this
 * test exists to catch.
 */
function stripComments(source: string): string {
  const withoutBlocks = source.replace(/\/\*[\s\S]*?\*\//g, (block) =>
    "\n".repeat((block.match(/\n/g) ?? []).length),
  );
  return withoutBlocks
    .split("\n")
    .map((line) => (line.trim().startsWith("//") ? "" : line))
    .join("\n");
}

interface Hit {
  file: string;
  line: number;
  content: string;
  needle: string;
}

function scan(): Hit[] {
  const hits: Hit[] = [];
  for (const root of SCAN_ROOTS) {
    for (const file of listFiles(root)) {
      const raw = readFileSync(join(REPO_ROOT, file), "utf8");
      const cleaned = stripComments(raw).split("\n");
      cleaned.forEach((line, index) => {
        const lower = line.toLowerCase();
        const needle = BANNED_NEEDLES.find((n) => lower.includes(n));
        if (needle) {
          hits.push({ file, line: index + 1, content: line.trim(), needle });
        }
      });
    }
  }
  return hits;
}

describe("marca: sin OpenSEO, openseo.so, ni el proveedor de datos SEO en la interfaz", () => {
  it("no deja marca ajena visible en src/client/** ni src/routes/**", () => {
    const hits = scan();
    const usedWhitelistEntries = new Set<WhitelistEntry>();

    const violations = hits.filter((hit) => {
      const entry = WHITELIST.find(
        (candidate) =>
          candidate.file === hit.file &&
          hit.content.toLowerCase().includes(candidate.match.toLowerCase()),
      );
      if (entry) {
        usedWhitelistEntries.add(entry);
        return false;
      }
      return true;
    });

    // A whitelist entry that matches nothing is stale — the exact silent
    // drift that let this leak back in three times before. Fail loudly so
    // someone removes it instead of it quietly outliving the code it once
    // excused.
    const staleEntries = WHITELIST.filter(
      (entry) => !usedWhitelistEntries.has(entry),
    );

    if (staleEntries.length > 0) {
      const details = staleEntries
        .map((entry) => `  ${entry.file}\n    esperaba: "${entry.match}"`)
        .join("\n\n");
      expect.fail(
        `${staleEntries.length} excepción(es) de la lista blanca en marca.test.ts ya no coinciden con nada:\n\n${details}\n\n` +
          `Qué hacer: si el texto se tradujo o se quitó, borra la excepción. Si el archivo ` +
          `cambió de forma, actualiza el "match" para que apunte al texto real. Ver docs/nes/marca.md.`,
      );
    }

    if (violations.length > 0) {
      const details = violations
        .map(
          (hit) =>
            `  ${hit.file}:${hit.line}\n    "${hit.content}"\n    -> contiene "${hit.needle}"`,
        )
        .join("\n\n");
      expect.fail(
        `Marca del proyecto original visible para un cliente en ${violations.length} lugar(es):\n\n${details}\n\n` +
          `Qué hacer:\n` +
          `  1. Si un cliente puede llegar a esa pantalla, tradúcelo o quítale la marca.\n` +
          `  2. Si es un identificador interno, o está genuinamente detrás de una bandera ` +
          `verificada en .env.preview (beforeLoad -> notFound(), o el padre deja de renderizarlo), ` +
          `añade una excepción en el WHITELIST de este archivo con el motivo escrito.\n` +
          `Nunca asumas que "no tiene bandera" o "no está enlazado" significa inalcanzable — ` +
          `comprueba el valor real en .env.preview. Ver docs/nes/marca.md.`,
      );
    }
  });
});
