# GOG Regional Prices / Precios Regionales de GOG

[English](#english) · [Español](#español)

---

## English

Extension for **Firefox** and **Chromium-based browsers** (Chrome, Edge, Brave, Opera, Vivaldi…) that shows a game's **regional prices** while you browse the [GOG.com](https://www.gog.com) store, converted to your currency.

### Features
- A collapsible panel appears on every GOG game page.
- **No requests until you open it**: prices are only fetched when you expand the panel.
- Price in each region's local currency, converted to yours, sorted from cheapest to most expensive, with the % difference against your reference country and discounts shown.
- **Automatic region detection** using GOG's `gog_lc` cookie (falls back to the browser's language region).
- Optional **fixed currency** in the settings (overrides automatic detection).
- Choose which countries to compare and your reference country.
- Interface in **English and Spanish** (follows the browser's language).
- Cache: prices 6 h, exchange rates 12 h.

### ⚠ Request limit
GOG allows about **200 price requests per hour per IP**. Each selected country is one request per game, so **the more countries you select, the more requests are made** and the fewer games you can check per hour (16 countries ≈ 12 games/hour). Cached prices don't count. Clearing the cache does **not** reset the limit.

### Installation (Firefox)
**Temporary (for testing):**
1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and select `manifest.json` from this folder.

It is removed when Firefox closes.

**Permanent:** sign it for free as an *unlisted* add-on at [addons.mozilla.org](https://addons.mozilla.org/developers/), or use Firefox Developer Edition / Nightly with `xpinstall.signatures.required = false`.

To build a package: `npx web-ext build` (or zip the folder contents).

### Installation (Chrome, Edge, Brave, Opera, Vivaldi…)
Chromium uses Manifest V3, so it needs its own manifest (`platform/chromium/`). Build the package with Node.js (no dependencies):

```bash
node build.mjs chromium
```

1. Open `chrome://extensions` (`edge://extensions` in Edge, `brave://extensions` in Brave…).
2. Turn on **Developer mode**.
3. Click **Load unpacked** and choose the `dist/chromium` folder.

It stays installed after you restart the browser. `node build.mjs` builds both `dist/firefox` and `dist/chromium` (plus a `.zip` of each if the `zip` command is available, e.g. to upload to the Chrome Web Store).

Ready-made zips for each version are on the [Releases](https://github.com/david1091/gog-regional-price-extension/releases) page. To publish a new one, bump `version` in both manifests and run the **Release** workflow (Actions → Release → Run workflow).

### Data sources
- Prices: `https://api.gog.com/products/{id}/prices?countryCode=XX` (unofficial GOG API).
- Game lookup (fallback): `https://catalog.gog.com/v1/catalog`.
- Exchange rates: [open.er-api.com](https://open.er-api.com) (fallback: [frankfurter.app](https://frankfurter.app), ECB rates).

Conversions are approximate and prices may not include local taxes. GOG's APIs are unofficial and may change without notice.

### Privacy
The extension collects no data. Settings are stored with the browser's `storage` API; requests go only to GOG and the exchange rate services listed above.

---

## Español

Extensión para **Firefox** y **navegadores basados en Chromium** (Chrome, Edge, Brave, Opera, Vivaldi…) que muestra los **precios regionales** de un juego mientras navegas por la tienda de [GOG.com](https://www.gog.com), convertidos a tu moneda.

### Funciones
- Aparece un panel plegable en cada ficha de juego de GOG.
- **No hace peticiones hasta que lo abres**: los precios solo se consultan al desplegar el panel.
- Precio en la moneda local de cada región, convertido a la tuya, ordenado de más barato a más caro, con la diferencia en % frente a tu país de referencia y los descuentos.
- **Detección automática de tu región** mediante la cookie `gog_lc` de GOG (si no está, usa la región del idioma del navegador).
- **Divisa fija** opcional en los ajustes (anula la detección automática).
- Puedes elegir qué países comparar y tu país de referencia.
- Interfaz en **español e inglés** (según el idioma del navegador).
- Caché: precios 6 h, tipos de cambio 12 h.

### ⚠ Límite de peticiones
GOG permite unas **200 consultas de precios por hora y por IP**. Cada país seleccionado es una petición por juego, así que **cuantos más países marques, más peticiones se hacen** y menos juegos podrás consultar por hora (16 países ≈ 12 juegos/hora). Los precios en caché no cuentan. Vaciar la caché **no** reinicia el límite.

### Instalación (Firefox)
**Temporal (para probar):**
1. Abre `about:debugging#/runtime/this-firefox`.
2. Pulsa **Cargar complemento temporal…** y elige el `manifest.json` de esta carpeta.

Se desinstala al cerrar Firefox.

**Permanente:** fírmala gratis como complemento *sin listar* en [addons.mozilla.org](https://addons.mozilla.org/developers/), o usa Firefox Developer Edition / Nightly con `xpinstall.signatures.required = false`.

Para generar el paquete: `npx web-ext build` (o comprime el contenido de la carpeta en un zip).

### Instalación (Chrome, Edge, Brave, Opera, Vivaldi…)
Chromium usa Manifest V3, así que tiene su propio manifiesto (`platform/chromium/`). Genera el paquete con Node.js (sin dependencias):

```bash
node build.mjs chromium
```

1. Abre `chrome://extensions` (`edge://extensions` en Edge, `brave://extensions` en Brave…).
2. Activa el **Modo de desarrollador**.
3. Pulsa **Cargar descomprimida** y elige la carpeta `dist/chromium`.

Se mantiene instalada al reiniciar el navegador. `node build.mjs` genera `dist/firefox` y `dist/chromium` (y un `.zip` de cada uno si tienes el comando `zip`, por ejemplo para subirlo a la Chrome Web Store).

Los zip de cada versión están en la página de [Releases](https://github.com/david1091/gog-regional-price-extension/releases). Para publicar una nueva, sube `version` en los dos manifiestos y lanza el workflow **Release** (Actions → Release → Run workflow).

### Fuentes de datos
- Precios: `https://api.gog.com/products/{id}/prices?countryCode=XX` (API no oficial de GOG).
- Búsqueda del juego (respaldo): `https://catalog.gog.com/v1/catalog`.
- Tipos de cambio: [open.er-api.com](https://open.er-api.com) (respaldo: [frankfurter.app](https://frankfurter.app), tipos del BCE).

Las conversiones son aproximadas y los precios pueden no incluir impuestos locales. Las APIs de GOG no son oficiales y pueden cambiar sin aviso.

### Privacidad
La extensión no recoge ningún dato. Los ajustes se guardan con la API `storage` del navegador; las peticiones solo van a GOG y a los servicios de tipos de cambio indicados.
