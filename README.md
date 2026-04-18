# Boxtronome

Boxtronome es una aplicación Angular para entrenamiento de boxeo en saco:

- genera combos aleatorios por nivel
- asigna figuras musicales a cada acción
- reproduce el combo al BPM elegido
- incluye metrónomo
- guarda favoritos en `localStorage`
- funciona como **PWA instalable** con **soporte offline completo** tras la primera carga

## Requisitos

- Node.js 20+
- npm 10+

## Desarrollo local

Inicia el servidor de desarrollo:

```powershell
cd C:\Users\Usuario\WebstormProjects\Boxtronome
npm install
npx ng serve
```

Abre después:

- `http://localhost:4200/`

## Tests

Ejecuta la suite unitaria con Vitest:

```powershell
cd C:\Users\Usuario\WebstormProjects\Boxtronome
npx ng test --watch=false
```

## Build de producción

Genera la versión optimizada:

```powershell
cd C:\Users\Usuario\WebstormProjects\Boxtronome
npx ng build
```

## PWA y modo offline

La app está configurada como PWA con:

- `manifest.webmanifest`
- service worker de Angular
- caché de shell y assets estáticos
- fuentes e iconos cargados localmente, sin dependencia de Google Fonts/CDN

### Cómo probar el modo offline

1. Haz un build de producción.
2. Sirve la carpeta generada con un servidor estático.
3. Abre la app una vez online.
4. Recarga y después desactiva la red desde DevTools.
5. La app debería seguir funcionando offline.

Ejemplo de prueba local con servidor estático:

```powershell
cd C:\Users\Usuario\WebstormProjects\Boxtronome
npx ng build
npx http-server .\dist\Boxtronome\browser -p 8080 -c-1
```

Después abre:

- `http://localhost:8080/`

> Nota: el service worker solo se registra en builds de producción.

## Despliegue automático en GitHub Pages

El repositorio incluye el workflow `/.github/workflows/deploy-pages.yml`.

Ese workflow:

- se ejecuta automáticamente al hacer `push` a la rama `master`
- instala dependencias con `npm ci`
- ejecuta los tests
- genera el build Angular con el `base-href` correcto para GitHub Pages.
- publica `dist/Boxtronome/browser` en la rama `gh-pages`

### 1. Activar GitHub Pages desde la rama `gh-pages`

En GitHub:

1. Ve a **Settings**.
2. Entra en **Pages**.
3. En **Build and deployment**, selecciona **Source: Deploy from a branch**.
4. Elige la rama **`gh-pages`**.
5. Elige la carpeta **`/ (root)`**.
6. Guarda los cambios.

> Este paso suele hacerse una sola vez.

### 2. Hacer push a `master`

Una vez subido el workflow, cada push a `master` desplegará automáticamente la aplicación.

```powershell
cd C:\Users\Usuario\WebstormProjects\Boxtronome
git add .
git commit -m "Configura despliegue automático en GitHub Pages"
git push origin master
```

### 3. URL final esperada

Si tu usuario es `TU_USUARIO` y el repo es `Boxtronome`, la URL será:

```text
https://TU_USUARIO.github.io/Boxtronome/
```

## Flujo recomendado para publicar actualizaciones

```powershell
cd C:\Users\Usuario\WebstormProjects\Boxtronome
npx ng test --watch=false
git add .
git commit -m "Actualiza Boxtronome"
git push origin master
```

GitHub Actions publicará automáticamente la nueva versión en `gh-pages`.

## Estructura relevante para la PWA

- `src/app/app.config.ts` → registro del service worker
- `ngsw-config.json` → estrategia de caché offline
- `public/manifest.webmanifest` → manifest de instalación
- `public/icons/` → iconos instalables
- `angular.json` → activación de service worker en producción

## Notas

- El workflow calcula automáticamente el `base-href` a partir del nombre del repositorio.
- Si GitHub Pages no estaba activado, primero configura la fuente a `gh-pages` una vez en Settings → Pages.
- Como ahora las fuentes e iconos son locales, la aplicación no depende de CDNs externos para renderizarse correctamente sin conexión.
