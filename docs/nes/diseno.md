# Sistema de diseño de pantallas

Por qué existe: al revisar el panel (2026-09-04) se notó que la pantalla de Leads no tenía
el mismo ancho que las demás y que hay saltos de maquetación entre pantallas. Este documento
fija el estándar y es copiable sin preguntar.

**Regla de origen: el estándar es la moda estadística de lo que ya existe, no una preferencia.**
Se midió cada pantalla de `src/routes` y `src/client/features`; el valor que más se repite
gana. Se aplica **solo a las pantallas propias** (hoy, `src/client/features/leads/*`). Las
de upstream (`every-app/open-seo`) se dejan como están — ver la sección de desviaciones.

## Medición (evidencia)

### Pantallas del área de proyecto (`_project/p/$projectId/*`)

Es la familia donde vive Leads: mismo layout, mismo sidebar de proyecto. Se cuentan las 12
pantallas de upstream primero (Leads no vota su propio estándar) y se compara Leads al final.

| Pantalla                  | Ancho máximo | Relleno exterior                            | Separación vertical   | Título                   |
| ------------------------- | ------------ | ------------------------------------------- | --------------------- | ------------------------ |
| Dashboard                 | `max-w-5xl`  | `px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-8`   | `flex flex-col gap-5` | `text-2xl font-semibold` |
| Keyword Research          | `max-w-7xl`  | igual (+ `overflow-auto`)                   | `flex flex-col gap-5` | `text-2xl font-semibold` |
| Domain Overview           | `max-w-7xl`  | igual (+ `overflow-auto`)                   | `space-y-4`           | `text-2xl font-semibold` |
| Backlinks                 | `max-w-7xl`  | igual (+ `overflow-auto`)                   | `space-y-4`           | `text-2xl font-semibold` |
| Search Performance        | `max-w-7xl`  | igual (+ `overflow-auto`)                   | `space-y-4`           | `text-2xl font-semibold` |
| Brand Lookup              | `max-w-7xl`  | igual (+ `overflow-auto`)                   | `space-y-4`           | `text-2xl font-semibold` |
| Prompt Explorer           | `max-w-7xl`  | igual (+ `overflow-auto`)                   | `space-y-4`           | `text-2xl font-semibold` |
| Rank Tracking (layout)    | `max-w-7xl`  | igual (+ `overflow-auto`)                   | `space-y-4`           | `text-2xl font-semibold` |
| Site Audit (lanzar)       | `max-w-5xl`  | igual (+ `overflow-auto`)                   | `space-y-4`           | `text-2xl font-semibold` |
| Site Audit (resultados)   | `max-w-5xl`  | igual (+ `overflow-auto`)                   | `space-y-4`           | `text-2xl font-semibold` |
| Saved Keywords            | `max-w-6xl`  | igual (+ `overflow-auto`)                   | `space-y-4`           | `text-2xl font-semibold` |
| Lighthouse Issues         | `max-w-5xl`  | `px-4 py-3 md:px-6 md:py-4 pb-24 md:pb-8` ⚠ | `space-y-4`           | `text-2xl font-semibold` |
| **Leads (propia, antes)** | `max-w-5xl`  | igual al estándar                           | `flex flex-col gap-5` | `text-2xl font-semibold` |

Frecuencias sobre las 12 pantallas de upstream:

- **Ancho:** `max-w-7xl` en 7/12 (58%) · `max-w-5xl` en 4/12 · `max-w-6xl` en 1/12 (Saved
  Keywords, único caso, ver desviaciones).
- **Relleno exterior:** `px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-8` (el orden de las clases y
  el `overflow-auto` varían, los valores no) en 11/12. Lighthouse Issues es la única
  excepción (`py-3`/`md:py-4`).
- **Separación vertical:** `space-y-4` en 10/12 (83%) · `flex flex-col gap-5` en 2/12
  (Dashboard, Keyword Research).
- **Título:** `text-2xl font-semibold` en 12/12 (100%).
- **Tabla:** cuando es una `<table>` nativa, el envoltorio es `<div className="overflow-x-auto">`
  a secas (sin borde ni `rounded`, eso lo pone la tarjeta que la contiene) — así en Leads,
  `AuditHistorySection`, `SerpAnalysisCard`, `DomainKeywordsTable`. Las tablas con
  TanStack Table (Backlinks, Rank Tracking, Search Performance) usan el mismo criterio vía
  `wrapperClassName="overflow-x-auto"`.
- **Estado vacío:** círculo de ícono `mx-auto flex size-10 items-center justify-center
rounded-xl bg-base-200` con un ícono Lucide `size-5 text-base-content/40`, título
  `text-sm font-medium text-base-content/70`, subtítulo `text-xs text-base-content/40`.
  Usado igual en Leads y en `RankTrackingDomainList` (upstream).
- **Estado de error:** `<div className="alert alert-error">{mensaje}</div>`, patrón
  repetido en 11 puntos de la app.

### Otras familias (medidas, no aplican a Leads)

- **Cuenta (`_app/*`: Settings, Projects, Billing, Support, AI & MCP, Help):** anchos entre
  `max-w-xl` y `max-w-4xl`, sin un valor dominante claro (`max-w-2xl` y `max-w-3xl` empatan,
  3 pantallas cada uno). Es la familia a usar cuando haga falta una pantalla propia de tipo
  "ajustes" o "formulario de una sola cosa" — ver el ancho angosto más abajo.
- **Autenticación y standalone** (`_auth.*`, `_authenticated.*`, `forgot-password`,
  `reset-password`, `verify-email`, `accept-invitation`, `auth-error`, `privacidad`,
  `terminos`): tarjeta centrada angosta (`max-w-xs` a `max-w-md`), sin sidebar. Familia
  aparte, no comparable con pantallas de proyecto.
- Las sub-rutas (`rank-tracking/index.tsx`, `rank-tracking/$configId.tsx`,
  `settings/context.tsx`, `settings/integrations.tsx`, `settings/organization.tsx`, etc.) no
  repiten ancho ni relleno: los heredan del layout padre vía `<Outlet />`. No se miden aparte.

## Los dos anchos

1. **`max-w-7xl` — contenido que se explora** (tablas, listados, resultados de búsqueda).
   Es el valor que ya usa la mayoría de las pantallas del área de proyecto. Leads es un
   listado de contactos: entra aquí.
2. **`max-w-2xl` — contenido que se lee o se rellena** (un formulario de una sola cosa,
   ajustes, texto corto). Es el ancho más repetido en la familia de cuenta. No hay hoy
   ninguna pantalla propia de este tipo; se deja anotado para cuando aparezca (p. ej. un
   futuro ajuste de canales o de plan).

No hace falta un tercero: ninguna pantalla propia actual necesita algo entre estos dos, y
agregar uno más repite el problema que esto viene a resolver.

## Esqueleto canónico de una pantalla (ancho, la mayoría de los casos)

```tsx
<div className="px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-8 overflow-auto">
  <div className="mx-auto max-w-7xl space-y-4">
    <div>
      <h1 className="text-2xl font-semibold">Título de la pantalla</h1>
      <p className="text-sm text-base-content/70">
        Descripción breve, una línea.
      </p>
    </div>

    {/* contenido: tarjetas, tabla, formulario... */}
  </div>
</div>
```

Para una pantalla angosta (leer/rellenar), es el mismo esqueleto cambiando solo
`max-w-7xl` por `max-w-2xl`. El `overflow-auto` es opcional: solo hace falta si la pantalla
puede crecer más que el viewport y necesita su propio scroll (la mayoría lo usa; Dashboard es
la excepción porque su contenido ya cabe).

## Patrón de tabla

```tsx
<div className="card bg-base-100 border border-base-300">
  <div className="card-body gap-0 p-0">
    <div className="px-5 pt-4 pb-3">
      <h2 className="text-sm font-semibold">Título de la sección</h2>
    </div>
    <div className="border-t border-base-300">
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Columna</th>
            </tr>
          </thead>
          <tbody>{/* filas */}</tbody>
        </table>
      </div>
    </div>
  </div>
</div>
```

## Patrón de formulario

Formulario corto embebido en una tarjeta (como "Añadir lead"):

```tsx
<div className="card bg-base-100 border border-base-300">
  <div className="card-body gap-3 p-5">
    <h2 className="text-sm font-semibold">Título del formulario</h2>
    <form className="flex flex-wrap items-end gap-3">
      <label className="form-control">
        <span className="label-text text-xs">Campo</span>
        <input className="input input-bordered input-sm" />
      </label>
      <button className="btn btn-primary btn-sm" type="submit">
        Guardar
      </button>
    </form>
  </div>
</div>
```

Un formulario que es la pantalla entera (ancho angosto, `max-w-2xl`) no va en tarjeta: los
campos van directo dentro del contenedor `space-y-4`/`space-y-6`, como en las pantallas de
ajustes de cuenta.

## Estado vacío

```tsx
<div className="space-y-2 px-5 py-10 text-center">
  <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-base-200">
    <IconoLucide className="size-5 text-base-content/40" />
  </div>
  <p className="text-sm font-medium text-base-content/70">Mensaje principal</p>
  <p className="text-xs text-base-content/40">
    Qué hacer para que deje de estar vacío.
  </p>
</div>
```

## Estado de carga

Bloques `skeleton` repetidos con `Array.from`, uno por fila o entrada esperada:

```tsx
<div className="space-y-4 px-5 py-4" aria-busy>
  {Array.from({ length: 3 }).map((_, index) => (
    <div key={index} className="space-y-2">
      <div className="skeleton h-4 w-48" />
      <div className="skeleton h-3 w-72" />
    </div>
  ))}
</div>
```

## Estado de error

```tsx
<div className="alert alert-error">{mensaje}</div>
```

## Desviaciones conocidas de upstream

No se tocan: son archivos de `every-app/open-seo`, y corregirlas serían decenas de parches
que chocan en cada actualización desde upstream. Anotado para contribuirlas al proyecto
original más adelante — es la única forma de que dejen de ser deuda nuestra.

- **Saved Keywords usa `max-w-6xl`**, un valor único que no coincide con ninguno de los dos
  anchos del estándar. Por tipo de contenido (tabla filtrable y paginada) le tocaría
  `max-w-7xl`.
- **Lighthouse Issues usa `px-4 py-3 md:px-6 md:py-4`** en vez del relleno estándar
  (`px-4 py-4 md:px-6 md:py-6`).
- **Dashboard y Keyword Research usan `flex flex-col gap-5`** en vez de `space-y-4`.
- **La familia de cuenta (`_app/*`) no tiene un ancho dominante único** (`max-w-xl` a
  `max-w-4xl` sin mayoría clara). No se homogeniza porque son todas pantallas de upstream.
