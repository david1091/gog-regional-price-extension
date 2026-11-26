// Datos compartidos por background, content script y opciones.

// Compatibilidad Firefox / Chromium: en Chromium (MV3) no existe `browser`,
// pero `chrome.*` devuelve promesas igual que la API de Firefox.
var browser = globalThis.browser || globalThis.chrome;

// Moneda local de cada país (para convertir según la región del usuario).
var GOG_COUNTRY_CURRENCY = {
  ES: "EUR", DE: "EUR", FR: "EUR", IT: "EUR", PT: "EUR", NL: "EUR", BE: "EUR", AT: "EUR", IE: "EUR",
  FI: "EUR", GR: "EUR", SK: "EUR", SI: "EUR", EE: "EUR", LV: "EUR", LT: "EUR", LU: "EUR", MT: "EUR",
  CY: "EUR", HR: "EUR", BG: "EUR", AD: "EUR", MC: "EUR", SM: "EUR", VA: "EUR", ME: "EUR", XK: "EUR",
  GB: "GBP", PL: "PLN", CZ: "CZK", HU: "HUF", RO: "RON", SE: "SEK", NO: "NOK", DK: "DKK", IS: "ISK",
  CH: "CHF", LI: "CHF", RS: "RSD", TR: "TRY", UA: "UAH", RU: "RUB", BY: "BYN", KZ: "KZT", GE: "GEL",
  US: "USD", CA: "CAD", MX: "MXN", BR: "BRL", AR: "ARS", CL: "CLP", CO: "COP", PE: "PEN", UY: "UYU",
  AU: "AUD", NZ: "NZD", JP: "JPY", KR: "KRW", CN: "CNY", HK: "HKD", TW: "TWD", SG: "SGD", MY: "MYR",
  TH: "THB", PH: "PHP", VN: "VND", ID: "IDR", IN: "INR", PK: "PKR", ZA: "ZAR", EG: "EGP", NG: "NGN",
  SA: "SAR", AE: "AED", QA: "QAR", KW: "KWD", IL: "ILS"
};

// Países que se pueden comparar (las tiendas regionales de GOG).
var GOG_COUNTRIES = [
  "ES", "DE", "FR", "IT", "PT", "GB", "PL", "CZ", "HU", "RO", "SE", "NO", "DK", "CH",
  "TR", "UA", "RU", "KZ", "US", "CA", "MX", "BR", "AR", "CL", "CO", "PE",
  "AU", "NZ", "JP", "KR", "CN", "IN", "ID", "ZA", "SA", "AE", "IL"
];

// Monedas que se pueden elegir como divisa fija en los ajustes.
var GOG_CURRENCIES = Array.from(new Set(Object.values(GOG_COUNTRY_CURRENCY))).sort();

var GOG_DEFAULTS = {
  reference: "auto",   // "auto" = país detectado del usuario
  currency: "auto",    // "auto" = moneda de la región del usuario
  countries: ["ES", "DE", "GB", "PL", "TR", "UA", "US", "CA", "MX", "BR", "AR", "AU", "JP", "CN", "IN", "ZA"]
};

function gogFlag(cc) {
  return cc.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

function gogUiLang() {
  try { return browser.i18n.getUILanguage(); } catch (e) { return navigator.language || "en"; }
}

function gogCountryName(cc) {
  try { return new Intl.DisplayNames([gogUiLang()], { type: "region" }).of(cc) || cc; }
  catch (e) { return cc; }
}

function gogCurrencyName(cur) {
  try { return new Intl.DisplayNames([gogUiLang()], { type: "currency" }).of(cur) || cur; }
  catch (e) { return cur; }
}
