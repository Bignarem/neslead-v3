# Archivos de upstream que tocamos

Regla: todo archivo de `every-app/open-seo` que se modifique se lista aquí en el mismo
commit. En cada actualización desde upstream se revisa esta lista y nada más.

| Archivo | Qué cambiamos | Tarea |
|---|---|---|
| src/routes/__root.tsx | título "neslead" | T4 |
| src/client/layout/AppShell.tsx | nombre en cabecera | T4 |
| src/client/layout/AppShellParts.tsx | "OpenSEO" a "neslead" en los avisos de configuración de la clave DataForSEO | T4 |
| src/client/components/Sidebar.tsx | "OpenSEO" a "neslead" en la cabecera del sidebar móvil | T4 |
| public/site.webmanifest | name y short_name "neslead" | T4 |
| src/client/styles/app.css | --color-primary y --color-accent al violeta de neslead (tema claro y oscuro) | T4 |
| src/server/email/loops.ts | appName "neslead" en los tres correos | T4 |
| public/*.png, favicon.ico | pendiente: iconos de neslead | T4 |
