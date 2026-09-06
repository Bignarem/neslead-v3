export function DatoCard({
  valor,
  etiqueta,
  detalle,
}: {
  valor: string;
  etiqueta: string;
  detalle?: string | null;
}) {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body gap-1 p-4">
        <p className="text-3xl font-semibold text-primary">{valor}</p>
        <p className="text-sm opacity-70">{etiqueta}</p>
        {detalle && <p className="text-xs opacity-60">{detalle}</p>}
      </div>
    </div>
  );
}
