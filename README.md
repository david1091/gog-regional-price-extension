# GOG Regional Prices / Precios Regionales de GOG

[English](#english) · [Español](#español)

---

## English

Firefox extension that shows a game's **regional prices** while you browse the [GOG.com](https://www.gog.com) store, converted to your currency.

### Features
- A collapsible panel appears on every GOG game page.
- **No requests until you open it**: prices are only fetched when you expand the panel.
- Price in each region's local currency, converted to yours, sorted from cheapest to most expensive, with the % difference against your reference country and discounts shown.
- **Automatic region detection** using GOG's `gog_lc` cookie (falls back to the browser's language region).
- Optional **fixed currency** in the settings (overrides automatic detection).
- Choose which countries to compare and your reference country.
- Interface in **English and Spanish** (follows Firefox's language).
- Cache: prices 6 h, exchange rates 12 h.

### ⚠ Request limit
GOG allows about **200 price requests per hour per IP**. Each selected country is one request per game, so **the more countries you select, the more requests are made** and the fewer games you can check per hour (16 countries ≈ 12 games/hour). Cached prices don't count. Clearing the cache does **not** reset the limit.

### Installation
**Temporary (for testing):**
1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and select `manifest.json` from this folder.

It is removed when Firefox closes.

**Permanent:** sign it for free as an *unlisted* add-on at [addons.mozilla.org](https://addons.mozilla.org/developers/), or use Firefox Developer Edition / Nightly with `xpinstall.signatures.required = false`.

To build a package: `npx web-ext build` (or zip the folder contents).

### Data sources
- Prices: `https://api.gog.com/products/{id}/prices?countryCode=XX` (unofficial GOG API).
- Game lookup (fallback): `https://catalog.gog.com/v1/catalog`.
- Exchange rates: [open.er-api.com](https://open.er-api.com) (fallback: [frankfurter.app](https://frankfurter.app), ECB rates).

Conversions are approximate and prices may not include local taxes. GOG's APIs are unofficial and may change without notice.

### Privacy
The extension collects no data. Settings are stored with `browser.storage`; requests go only to GOG and the exchange rate services listed above.

---

## Español

Extensión para Firefox que muestra los **precios regionales** de un juego mientras navegas por la tienda de [GOG.com](https://www.gog.com), convertidos a tu moneda.

### Funciones
- Aparece un panel plegable en cada ficha de juego de GOG.
- **No hace peticiones hasta que lo abres**: los precios solo se consultan al desplegar el panel.
- Precio en la moneda local de cada región, convertido a la tuya, ordenado de más barato a más caro, con la diferencia en % frente a tu país de referencia y los descuentos.
- **Detección automática de tu región** mediante la cookie `gog_lc` de GOG (si no está, usa la región del idioma del navegador).
- **Divisa fija** opcional en los ajustes (anula la detección automática).
- Puedes elegir qué países comparar y tu país de referencia.
- Interfaz en **español e inglés** (según el idioma de Firefox).
- Caché: precios 6 h, tipos de cambio 12 h.

### ⚠ Límite de peticiones
GOG permite unas **200 consultas de precios por hora y por IP**. Cada país seleccionado es una petición por juego, así que **cuantos más países marques, más peticiones se hacen** y menos juegos podrás consultar por hora (16 países ≈ 12 juegos/hora). Los precios en caché no cuentan. Vaciar la caché **no** reinicia el límite.

### Instalación
**Temporal (para probar):**
1. Abre `about:debugging#/runtime/this-firefox`.
2. Pulsa **Cargar complemento temporal…** y elige el `manifest.json` de esta carpeta.

Se desinstala al cerrar Firefox.

**Permanente:** fírmala gratis como complemento *sin listar* en [addons.mozilla.org](https://addons.mozilla.org/developers/), o usa Firefox Developer Edition / Nightly con `xpinstall.signatures.required = false`.

Para generar el paquete: `npx web-ext build` (o comprime el contenido de la carpeta en un zip).

### Fuentes de datos
- Precios: `https://api.gog.com/products/{id}/prices?countryCode=XX` (API no oficial de GOG).
- Búsqueda del juego (respaldo): `https://catalog.gog.com/v1/catalog`.
- Tipos de cambio: [open.er-api.com](https://open.er-api.com) (respaldo: [frankfurter.app](https://frankfurter.app), tipos del BCE).

Las conversiones son aproximadas y los precios pueden no incluir impuestos locales. Las APIs de GOG no son oficiales y pueden cambiar sin aviso.

### Privacidad
La extensión no recoge ningún dato. Los ajustes se guardan con `browser.storage`; las peticiones solo van a GOG y a los servicios de tipos de cambio indicados.
