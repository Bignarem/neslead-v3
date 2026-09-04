import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createLead } from "@/serverFunctions/leads";
import { getStandardErrorMessage } from "@/client/lib/error-messages";

export function NuevoLeadForm({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const crear = useMutation({
    mutationFn: () =>
      createLead({
        data: {
          projectId,
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          source: "manual",
        },
      }),
    onSuccess: () => {
      setName("");
      setPhone("");
      setEmail("");
      void queryClient.invalidateQueries({ queryKey: ["leads", projectId] });
    },
    onError: (error) =>
      toast.error(getStandardErrorMessage(error, "No se pudo añadir el lead.")),
  });

  const canSubmit = Boolean(name.trim() || phone.trim() || email.trim());

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        crear.mutate();
      }}
    >
      <label className="form-control">
        <span className="label-text text-xs">Nombre</span>
        <input
          className="input input-bordered input-sm"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label className="form-control">
        <span className="label-text text-xs">Teléfono</span>
        <input
          className="input input-bordered input-sm"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
      </label>
      <label className="form-control">
        <span className="label-text text-xs">Correo</span>
        <input
          className="input input-bordered input-sm"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <button
        className="btn btn-primary btn-sm gap-1"
        type="submit"
        disabled={crear.isPending || !canSubmit}
      >
        {crear.isPending && <Loader2 className="size-3.5 animate-spin" />}
        Añadir lead
      </button>
    </form>
  );
}
