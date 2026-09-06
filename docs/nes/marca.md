# Red de seguridad de marca

`src/client/marca.test.ts` recorre todo `src/client/**` y `src/routes/**` (menos los
propios archivos de test) y falla si encuentra `OpenSEO`, `openseo.so`/`open-seo`, o
`DataForSEO` en algo que no sea un identificador interno explícitamente aceptado. Corre
con `pnpm test`, igual que el resto de la suite, así que ya está en el gate de cada commit.

## Por qué existe

Es la cuarta vez que la marca del proyecto original (`every-app/open-seo`) aparece en una
pantalla que ve un cliente. Las tres anteriores se arreglaron a mano y las tres volvieron,
porque el método era "que alguien se acuerde de mirar". La última vez, el motivo concreto:
las pantallas de ajustes viven dentro de una condición `isHosted`, y tanto quien las
implementó como quien las revisó la leyeron como "esto está oculto tras una bandera" —
cuando la etapa desplegada corre `AUTH_MODE=hosted`, así que `isHosted` es **verdadera** ahí,
y esas pantallas son justamente las que **siempre** se ven.

Con clientes dentro, una promesa de "me voy a acordar" no alcanza. Este test hace que sea
imposible olvidarlo: si vuelve a colarse marca ajena, no pasa `pnpm test`, y no hay commit.

## Cómo funciona

1. Recorre los archivos de `src/client/**` y `src/routes/**` con extensión `.ts`, `.tsx` o
   `.css`, excluyendo los `*.test.ts`/`*.test.tsx` (un test no es interfaz: nunca se renderiza
   para un cliente).
2. Quita los comentarios de bloque (`/* ... */`, incluidos los JSDoc y los `{/* JSX */}`) y las
   líneas que son comentario completo (`//` al inicio de la línea, una vez recortada). A
   propósito **no** corta una línea de código en el primer `//` que encuentre: eso convertiría
   `https://openseo.so` en `https:` y escondería justo lo que el test tiene que atrapar. Un
   falso negativo (dejar pasar marca real) es mucho peor que un falso positivo (una línea de
   más en la lista blanca).
3. Busca, sin distinguir mayúsculas, las cadenas `openseo`, `open-seo` (la forma con guion de
   `every-app/open-seo`) y `dataforseo` en lo que queda.
4. Cada coincidencia es una violación, salvo que un archivo+fragmento exacto esté en la
   `WHITELIST` del propio test, con su motivo escrito al lado.
5. Si una entrada de la lista blanca ya no coincide con nada (el texto cambió o se tradujo), el
   test también falla — una excepción vieja que ya no aplica es exactamente el mecanismo que
   dejó pasar esto tres veces antes.

## Cómo distingue texto visible de identificador interno

No lo distingue automáticamente — y es a propósito. El test no sabe qué es "prosa" y qué es
"plumbing"; solo sabe qué cadena aparece en qué línea. La distinción la hace una persona, una
vez, al escribir la entrada de la `WHITELIST` con su motivo. Los motivos que se han aceptado
hasta ahora, en dos categorías:

- **Identificador interno**: nombre de variable/función/constante, ruta de módulo, clave de
  `localStorage`, nombre de tema de daisyUI, valor de `id`/`aria-*` que solo conecta dos
  atributos sin ser leído como contenido, o el nombre real de un secreto de entorno
  (`DATAFORSEO_API_KEY`) que hace falta citar tal cual para que alguien pueda configurarlo.
- **Detrás de una bandera verificada**: la ruta o el componente son inalcanzables porque un
  `beforeLoad` lanza `notFound()`/`redirect()`, o el padre deja el componente fuera del árbol
  que renderiza, en función de una bandera cuyo valor en **`.env.preview`** (la etapa
  desplegada) realmente dispara esa rama. Nunca alcanza con que la bandera _exista_ o que nadie
  enlace a la pantalla — hay que leer el valor real y seguir el código hasta el `if`.

Lo que **no** se acepta como motivo: "no está enlazado desde ningún lado", "es poco probable
que pase", "está pendiente de traducir", o razonar sobre el nombre de la bandera en vez de su
valor. Esas tres frases son, literalmente, la causa de las cuatro veces que esto se coló.

## Qué se puede escapar

El test es una búsqueda de texto, no un parser de JSX ni un analizador de flujo. Dos cosas
que no puede ver:

- **Un gate que cambia de forma.** Si alguien reescribe un `beforeLoad` y dos meses después
  dice "esto ya no depende de esa bandera", el test no se entera — sigue confiando en la
  entrada de la lista blanca hasta que alguien la revise a mano. Por eso cada entrada "detrás
  de una bandera" cita el archivo y la condición exactos: quien la lea puede volver a
  comprobarla.
- **Server, correos y datos de prueba.** El alcance declarado es `src/client/**` y
  `src/routes/**` — lo que llega al navegador de un cliente. No cubre `src/server/**` (por
  ejemplo las plantillas de correo en `src/server/email/`), que puede llevar la misma marca por
  un canal distinto. Si se sospecha una fuga ahí, es un test aparte con el mismo criterio, no
  una ampliación silenciosa del alcance de este.

## Cómo añadir una excepción

Edita la `WHITELIST` en `src/client/marca.test.ts` y agrega un objeto:

```ts
{
  file: "src/client/ruta/al/Archivo.tsx",
  match: "el fragmento exacto que aparece en la línea señalada",
  reason: "por qué esto no es marca visible para un cliente",
}
```

`match` se compara sin distinguir mayúsculas contra la línea ya limpia de comentarios — no
hace falta la línea completa, alcanza con el fragmento que identifica el caso. Si el motivo es
"detrás de una bandera", nombra la bandera, su valor en `.env.preview`, y el archivo:línea del
`beforeLoad`/render condicional exactos — no basta con "está gated".

## Qué hacer cuando falle después de traer una versión nueva de upstream

Este es el momento en el que más va a fallar, y el más importante en el que tiene que fallar:
upstream no sabe que existe este test, así que cualquier pantalla nueva o reescrita puede traer
"OpenSEO"/"DataForSEO" de vuelta sin que nadie lo note a simple vista.

1. Corre `pnpm test` (o solo `npx vitest run src/client/marca.test.ts`) después de mergear.
2. Cada violación nueva: es una pantalla que upstream tocó. Ve al archivo:línea, decide si un
   cliente puede llegar ahí y, si puede, tradúcelo/quítale la marca — el mismo criterio de
   siempre.
3. Cada entrada de la lista blanca que el test marque como "ya no coincide con nada": revisa si
   el código que describía cambió de forma. Si el texto se tradujo, borra la entrada. Si el
   archivo se movió o renombró, actualiza `file`/`match`. No la dejes "por si acaso" — una
   excepción que ya no describe el código real es la próxima fuga.
4. No agregues una excepción nueva solo para que el test pase más rápido. Si de verdad no da
   tiempo a arreglar una pantalla alcanzable, eso es un test en rojo y una tarea pendiente, no
   una excepción con motivo "pendiente".
