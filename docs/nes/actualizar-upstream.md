# Actualizar desde upstream

Solo por etiqueta, nunca `upstream/main`.

1. `git fetch upstream --tags && git tag --sort=-v:refname | head -3`
2. Leer las notas de la versión: `gh release view <etiqueta> --repo every-app/open-seo`
3. Ensayo sin tocar nada:
   `git merge-tree $(git merge-base HEAD <etiqueta>) HEAD <etiqueta> | grep -c '^<<<<<<<'`
   Si el número es mayor que 0, ver qué archivos: añadir `| grep -B1 '^<<<<<<<' | grep '^+++'`.
   Todo archivo en conflicto DEBE estar en `parches-upstream.md`; si no está, es una regresión
   de disciplina: primero mover ese cambio a un archivo nuestro.
4. `git merge <etiqueta>` y resolver solo los archivos listados.
5. `pnpm install --frozen-lockfile && pnpm db:generate && pnpm test && pnpm types:check`
6. Desplegar a staging y pasar la puerta de la última fase completada.
7. Actualizar "Etiqueta base" en `docs/nes/README.md`.
