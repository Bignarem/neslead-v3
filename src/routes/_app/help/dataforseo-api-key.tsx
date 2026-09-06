import { createFileRoute } from "@tanstack/react-router";

const DATAFORSEO_API_ACCESS_URL = "https://app.dataforseo.com/api-access";

export const Route = createFileRoute("/_app/help/dataforseo-api-key")({
  component: DataforseoApiKeyHelpPage,
});

function DataforseoApiKeyHelpPage() {
  return (
    <div className="px-4 py-4 md:px-6 md:py-6 pb-24 md:pb-8 overflow-auto">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-3">
            <h1 className="text-2xl font-semibold">
              Configura tu clave de API de datos SEO
            </h1>
            <p className="text-sm text-base-content/70">
              Hace falta el secreto <code>DATAFORSEO_API_KEY</code> antes de que
              funcionen las búsquedas de palabras clave, dominios y datos SEO.
            </p>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-4">
            <h2 className="card-title text-base">Pasos</h2>
            <ol className="list-decimal pl-5 text-sm space-y-3 text-base-content/80">
              <li>
                Ve a{" "}
                <a
                  className="link link-primary"
                  href={DATAFORSEO_API_ACCESS_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  el panel de acceso del proveedor
                </a>{" "}
                y solicita las credenciales de API por correo.
              </li>
              <li>
                Codifica en base64 tu usuario y contraseña de API del proveedor
                de datos SEO con este formato:
                <pre className="mt-2 p-3 rounded bg-base-200 border border-base-300 overflow-x-auto text-xs">
                  <code>printf '%s' 'YOUR_LOGIN:YOUR_PASSWORD' | base64</code>
                </pre>
              </li>
              <li>
                Guarda el resultado como el secreto{" "}
                <code>DATAFORSEO_API_KEY</code> en tu entorno.
              </li>
            </ol>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-2 text-sm text-base-content/75">
            <h2 className="card-title text-base">
              Cloudflare Workers (panel web)
            </h2>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-base-content/80">
              <li>
                En Cloudflare, ve a <code>Compute</code> -&gt;{" "}
                <code>Workers &amp; Pages</code> y abre tu Worker.
              </li>
              <li>
                Abre <code>Settings</code>.
              </li>
              <li>
                Ve a <code>Variables &amp; Secrets</code> y agrega un secreto
                nuevo llamado
                <code className="mx-1">DATAFORSEO_API_KEY</code>.
              </li>
              <li>
                Pega el valor en base64 del comando de la terminal de arriba y
                guarda.
              </li>
            </ol>

            <div className="divider my-1" />

            <p>O configura el mismo secreto desde tu terminal con:</p>
            <pre className="p-3 rounded bg-base-200 border border-base-300 overflow-x-auto text-xs">
              <code>npx wrangler secret put DATAFORSEO_API_KEY</code>
            </pre>
            <p>
              Usa el valor en base64 de <code>login:password</code> cuando se te
              pida.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
