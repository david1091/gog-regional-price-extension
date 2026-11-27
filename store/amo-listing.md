# Firefox Add-ons (AMO) listing

Texts to copy into the add-on's listing on addons.mozilla.org.
Fill in **English** first (the default locale), then add **Español** as a translation.

- **Add-on ID:** `gog-regional-prices@addon` (permanent once submitted)
- **Package:** `gog-regional-prices-X.Y.Z-firefox.zip` from [Releases](https://github.com/david1091/gog-regional-price-extension/releases)
- **Categories:** Shopping
- **License:** to be chosen in the form
- **Homepage / Support site:** https://github.com/david1091/gog-regional-price-extension
- **Support:** https://github.com/david1091/gog-regional-price-extension/issues
- **Screenshots:** `store/screenshots/*.png` (1280×800, `-en` / `-es`; sample prices on a mock game page)
- **Source code submission:** not needed (the code isn't minified, bundled or transpiled)

---

## English

### Name
GOG Regional Prices

### Summary
Shows a game's regional prices while you browse the GOG.com store, converted to your currency, so you can compare prices between countries at a glance.

### Description
See what a game costs in other countries without leaving the GOG.com store.

On every game page, a small collapsible panel shows the game's price in each region you choose, in its local currency and converted to yours, sorted from cheapest to most expensive.

Features:
• No requests until you open the panel: prices are only fetched when you expand it.
• Local price and converted price for each country, with discounts and the % difference against your reference country.
• Automatic detection of your region and currency (or pick a fixed currency in the settings).
• Choose which countries to compare.
• Interface in English and Spanish.
• Prices are cached for 6 hours and exchange rates for 12 hours.

Request limit: GOG allows about 200 price requests per hour per IP. Each selected country is one request per game, so the more countries you select, the fewer games you can check per hour (16 countries ≈ 12 games/hour). The settings page shows an estimate.

Using Chrome, Edge, Brave, Opera or Vivaldi? This add-on is also available for Chromium-based browsers. Download the Chromium package from GitHub: https://github.com/david1091/gog-regional-price-extension/releases

Notes:
• This is an unofficial add-on and is not affiliated with or endorsed by GOG.
• It uses GOG's public but unofficial price API, which may change without notice.
• Conversions are approximate (exchange rates from open.er-api.com, with frankfurter.app as fallback) and prices may not include local taxes.
• No data is collected. Settings are stored in your browser.

Source code: https://github.com/david1091/gog-regional-price-extension

### Privacy policy
Leave it empty: the add-on collects no data.

### Notes to reviewer
No build step: the uploaded package contains the same files as the repository (Firefox manifest at the root), unminified.

Permissions:
- storage: user settings (sync) and a cache of prices and exchange rates (local).
- https://www.gog.com/*: content script that adds the price panel to game pages.
- https://api.gog.com/*: price lookup per country (`/products/{id}/prices?countryCode=XX`).
- https://catalog.gog.com/*: fallback to find the product ID from the page slug.
- https://open.er-api.com/* and https://api.frankfurter.app/*: exchange rates.

Requests are only made after the user expands the panel. No user data is sent anywhere; requests are made with `credentials: "omit"`.

To test: open any game page, e.g. https://www.gog.com/en/game/the_witcher_3_wild_hunt, and click the "Regional prices" panel at the bottom right.

---

## Español

### Nombre
GOG Precios Regionales

### Resumen
Muestra los precios regionales de un juego mientras navegas por la tienda de GOG.com, convertidos a tu moneda, para comparar de un vistazo lo que cuesta en cada país.

### Descripción
Mira cuánto cuesta un juego en otros países sin salir de la tienda de GOG.com.

En cada ficha de juego aparece un pequeño panel plegable con el precio del juego en cada región que elijas, en su moneda local y convertido a la tuya, ordenado de más barato a más caro.

Funciones:
• No hace peticiones hasta que abres el panel: los precios solo se consultan al desplegarlo.
• Precio local y precio convertido de cada país, con descuentos y la diferencia en % frente a tu país de referencia.
• Detección automática de tu región y moneda (o elige una divisa fija en los ajustes).
• Elige qué países comparar.
• Interfaz en español e inglés.
• Los precios se guardan en caché 6 horas y los tipos de cambio 12 horas.

Límite de peticiones: GOG permite unas 200 consultas de precios por hora y por IP. Cada país seleccionado es una petición por juego, así que cuantos más países marques, menos juegos podrás consultar por hora (16 países ≈ 12 juegos/hora). La página de ajustes muestra una estimación.

¿Usas Chrome, Edge, Brave, Opera o Vivaldi? Esta extensión también está disponible para navegadores basados en Chromium. Descarga el paquete para Chromium desde GitHub: https://github.com/david1091/gog-regional-price-extension/releases

Notas:
• Es una extensión no oficial, sin relación con GOG ni respaldada por GOG.
• Usa la API de precios de GOG, pública pero no oficial, que puede cambiar sin aviso.
• Las conversiones son aproximadas (tipos de cambio de open.er-api.com, con frankfurter.app como respaldo) y los precios pueden no incluir impuestos locales.
• No recoge ningún dato. Los ajustes se guardan en tu navegador.

Código fuente: https://github.com/david1091/gog-regional-price-extension
