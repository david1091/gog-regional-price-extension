/* Hace las peticiones a las APIs (desde aquí no hay problemas de CORS)
   y guarda caché en storage.local. Solo se llama cuando el usuario abre el panel. */

const PRICE_TTL = 6 * 3600 * 1000;   // 6 h
const RATES_TTL = 12 * 3600 * 1000;  // 12 h

async function getJSON(url) {
  const r = await fetch(url, { headers: { Accept: "application/json" }, credentials: "omit" });
  if (!r.ok) { const e = new Error("HTTP " + r.status); e.status = r.status; throw e; }
  return r.json();
}

async function cached(key, ttl, loader) {
  const now = Date.now();
  const got = await browser.storage.local.get(key);
  const hit = got[key];
  if (hit && now - hit.t < ttl) return hit.v;
  const v = await loader();
  await browser.storage.local.set({ [key]: { t: now, v } });
  return v;
}

// {moneda: unidades por 1 EUR}
function getRates() {
  return cached("c:rates", RATES_TTL, async () => {
    try {
      const d = await getJSON("https://open.er-api.com/v6/latest/EUR");
      if (d.result === "success") return { rates: d.rates, source: "open.er-api.com" };
    } catch (e) { /* respaldo */ }
    const d = await getJSON("https://api.frankfurter.app/latest?from=EUR");
    return { rates: Object.assign({ EUR: 1 }, d.rates), source: "frankfurter.app (BCE/ECB)" };
  });
}

// "1999 EUR" -> {amount: 19.99, cur: "EUR"}
function parseMoney(s) {
  const m = /^\s*(-?\d+)\s+([A-Z]{3})\s*$/.exec(String(s || ""));
  return m ? { amount: parseInt(m[1], 10) / 100, cur: m[2] } : null;
}

async function priceFor(id, cc) {
  return cached(`c:p:${id}:${cc}`, PRICE_TTL, async () => {
    try {
      const d = await getJSON(`https://api.gog.com/products/${id}/prices?countryCode=${cc}`);
      const list = ((d._embedded || {}).prices || []).map(p => {
        const f = parseMoney(p.finalPrice), b = parseMoney(p.basePrice);
        return f ? { cur: f.cur, final: f.amount, base: b ? b.amount : null } : null;
      }).filter(Boolean);
      return { prices: list };
    } catch (e) {
      if (e.status === 429) throw e;                 // límite: no se guarda en caché
      return { error: e.status === 404 ? "na" : String(e.message || e) };
    }
  });
}

// Plan B para sacar el ID si la página no lo expone: buscar por título y casar el slug.
async function idFromSlug(slug, title) {
  const q = encodeURIComponent("like:" + (title || slug.replace(/_/g, " ")));
  const d = await getJSON(`https://catalog.gog.com/v1/catalog?limit=48&query=${q}&order=desc:score&productType=in:game,pack,dlc&countryCode=US&currencyCode=USD&locale=en-US`);
  const p = (d.products || []).find(x => x.slug === slug);
  return p ? String(p.id) : null;
}

async function compare(id, countries, target) {
  const { rates, source } = await getRates();
  if (!rates[target]) target = "EUR";              // moneda sin tipo de cambio → EUR
  const conv = (amount, cur) => rates[cur] ? amount / rates[cur] * rates[target] : null;

  const results = [];
  for (let i = 0; i < countries.length; i += 6) {   // lotes de 6
    const chunk = countries.slice(i, i + 6);
    const res = await Promise.all(chunk.map(cc =>
      priceFor(id, cc).catch(e => ({ error: e.status === 429 ? "limit" : String(e.message || e) }))));
    chunk.forEach((cc, k) => results.push([cc, res[k]]));
  }

  const rows = results.map(([cc, r]) => {
    if (r.error || !r.prices || !r.prices.length) return { cc, error: r.error || "noprice" };
    let best = null;  // si un país admite varias monedas, la más barata
    for (const p of r.prices) {
      const c = conv(p.final, p.cur);
      if (!best || (c != null && (best.conv == null || c < best.conv))) best = Object.assign({}, p, { conv: c });
    }
    return { cc, cur: best.cur, final: best.final, base: best.base, conv: best.conv };
  });
  rows.sort((a, b) => (a.conv == null) - (b.conv == null) || (a.conv || 0) - (b.conv || 0));
  return { rows, target, source };
}

browser.runtime.onMessage.addListener(async (msg) => {
  try {
    if (msg.type === "settings") return { settings: await browser.storage.sync.get(GOG_DEFAULTS) };
    if (msg.type === "resolveId") return { id: await idFromSlug(msg.slug, msg.title) };
    if (msg.type === "compare") return await compare(msg.id, msg.countries, msg.target);
    if (msg.type === "openOptions") { await browser.runtime.openOptionsPage(); return { ok: true }; }
    if (msg.type === "clearCache") {
      const all = await browser.storage.local.get(null);
      await browser.storage.local.remove(Object.keys(all).filter(k => k.startsWith("c:p:")));
      return { ok: true };
    }
  } catch (e) {
    return { error: String(e.message || e) };
  }
});
