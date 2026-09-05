import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const SUPPORT_EMAIL = "info@nesweb.net";
const WHATSAPP_NUMBER = "+1 (849) 278-5097";
const WHATSAPP_URL = "https://wa.me/18492785097";

export const Route = createFileRoute("/_app/support")({
  component: SupportPage,
});

function SupportPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SUPPORT_EMAIL);
    toast.success("Correo copiado");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-8 overflow-auto">
      <div className="mx-auto max-w-2xl space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Soporte</h1>
          <p className="text-sm text-base-content/70">
            Escríbenos si algo no funciona o tienes una duda.
          </p>
        </div>

        {/*
         * Cuando exista el widget de chat propio (fase 3), se incrusta aquí
         * como otra vía de soporte. Más adelante esta pantalla suma también
         * una sección de tutoriales.
         */}
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-3 p-5">
            <div className="flex items-start gap-3">
              <MessageCircle className="mt-0.5 size-4 shrink-0 text-base-content/40" />
              <div>
                <p className="text-sm font-semibold">WhatsApp</p>
                <p className="mt-1 text-sm text-base-content/60">
                  La vía más directa para reportar un problema o resolver una
                  duda.
                </p>
              </div>
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-2 self-start rounded-md border border-base-300 bg-base-200/50 px-3 py-1.5 text-sm font-medium text-base-content transition-colors hover:bg-base-200"
            >
              <span className="font-mono text-xs">{WHATSAPP_NUMBER}</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-3 p-5">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-base-content/40" />
              <div>
                <p className="text-sm font-semibold">Correo</p>
                <p className="mt-1 text-sm text-base-content/60">
                  Alternativa si no usas WhatsApp.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="mt-1 inline-flex items-center gap-2 self-start rounded-md border border-base-300 bg-base-200/50 px-3 py-1.5 text-sm font-medium text-base-content transition-colors hover:bg-base-200"
            >
              <span className="font-mono text-xs">{SUPPORT_EMAIL}</span>
              {copied ? (
                <Check className="size-3.5 text-success" />
              ) : (
                <Copy className="size-3.5 text-base-content/40" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
