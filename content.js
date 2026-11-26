/* Detecta la ficha de juego en gog.com e inserta el panel de precios regionales.
   El panel aparece plegado y solo consulta precios cuando el usuario lo abre. */
(() => {
  const PANEL_ID = "gogrp-panel";
  const t = (k, ...s) => browser.i18n.getMessage(k, s.map(String)) || k;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const lang = gogUiLang();
  const fmt = (v, cur) => {
    if (v == null) return "—";
    try { return new Intl.NumberFormat(lang, { style: "currency", currency: cur }).format(v); }
    catch (e) { return v.toFixed(2) + " " + cur; }
  };

  // Estado de la ficha actual
  let state = null; // {slug, loaded, loading}

  function gameSlug() {
    const m = location.pathname.match(/^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?game\/([^/?#]+)/i);
    return m ? m[1] : null;
  }

  // Región del usuario: primero la cookie de GOG "gog_lc" (p. ej. "ES_EUR_es-ES"),
  // después el idioma del navegador (es-ES → ES).
  function detectRegion() {
    const ck = document.cookie.split(/;\s*/).find(c => c.startsWith("gog_lc="));
    if (ck) {
      const m = /^([A-Z]{2})_([A-Z]{3})/i.exec(decodeURIComponent(ck.slice(7)));
      if (m) return { country: m[1].toUpperCase(), currency: m[2].toUpperCase(), source: "gog" };
    }
    for (const l of navigator.languages || [navigator.language]) {
      const m = /[-_]([A-Z]{2})$/i.exec(l || "");
      if (m) {
        const cc = m[1].toUpperCase();
        return { country: cc, currency: GOG_COUNTRY_CURRENCY[cc] || "EUR", source: "browser" };
      }
    }
    return { country: "US", currency: "USD", source: "default" };
  }

  function idFromPage() {
    const attrs = ["card-product", "data-product-id", "gog-product", "product-id"];
    for (const a of attrs) {
      const el = document.querySelector(`[${a}]`);
      const v = el && el.getAttribute(a);
      if (v && /^\d{6,}$/.test(v)) return v;
    }
    const html = document.documentElement.innerHTML;
    const pats = [
      /"productId"\s*:\s*"?(\d{6,})/,
      /card-product="(\d{6,})"/,
      /products\/(\d{6,})\/prices/,
      /"id"\s*:\s*"?(\d{9,11})"?\s*,\s*"(?:title|slug)"/
    ];
    for (const p of pats) { const m = p.exec(html); if (m) return m[1]; }
    return null;
  }

  function pageTitle() {
    const h = document.querySelector("h1");
    return h ? h.textContent.trim() : document.title.replace(/\s*[-|–].*GOG.*$/i, "").trim();
  }

  function removePanel() { const p = document.getElementById(PANEL_ID); if (p) p.remove(); }
  const bodyEl = () => document.querySelector(`#${PANEL_ID} .gogrp-body`);

  function makePanel() {
    removePanel();
    const p = document.createElement("div");
    p.id = PANEL_ID;
    p.className = "gogrp-collapsed";
    p.innerHTML = `
      <div class="gogrp-head" title="${esc(t("toggle"))}">
        <span class="gogrp-title">🌍 ${esc(t("panelTitle"))} <span class="gogrp-hint">${esc(t("clickToLoad"))}</span></span>
        <span class="gogrp-actions">
          <button class="gogrp-btn" data-act="refresh" title="${esc(t("refresh"))}">↻</button>
          <button class="gogrp-btn" data-act="opts" title="${esc(t("options"))}">⚙</button>
          <button class="gogrp-btn" data-act="toggle" title="${esc(t("toggle"))}">▾</button>
        </span>
      </div>
      <div class="gogrp-body"></div>`;
    document.body.appendChild(p);

    p.querySelector(".gogrp-head").addEventListener("click", async (e) => {
      const act = e.target.dataset && e.target.dataset.act;
      if (act === "opts") {
        e.stopPropagation();
        browser.runtime.sendMessage({ type: "openOptions" });
        return;
      }
      if (act === "refresh") {
        e.stopPropagation();
        await browser.runtime.sendMessage({ type: "clearCache" });
        p.classList.remove("gogrp-collapsed");
        state.loaded = false;
        load();
        return;
      }
      p.classList.toggle("gogrp-collapsed");
      if (!p.classList.contains("gogrp-collapsed") && !state.loaded && !state.loading) load();
    });
  }

  function render(data, refCC, region, settings) {
    const rows = data.rows;
    const cur = data.target;
    const ok = rows.filter(r => r.conv != null);
    const ref = rows.find(r => r.cc === refCC && r.conv != null);
    const max = Math.max(1e-9, ...ok.map(r => r.conv));
    const name = cc => `${gogFlag(cc)} ${esc(gogCountryName(cc))}`;

    let html = `<div class="gogrp-region">${esc(t("yourRegion"))}: ${name(region.country)} · ${esc(cur)}${settings.currency !== "auto" ? " (" + esc(t("fixedCurrency")) + ")" : ""}</div>`;
    if (ok.length) {
      html += `<div class="gogrp-sum">${esc(t("cheapest"))}: <b>${name(ok[0].cc)}</b> · ${fmt(ok[0].conv, cur)}`;
      if (ref && ok[0].cc !== ref.cc) html += ` <span class="gogrp-good">(${((ok[0].conv / ref.conv - 1) * 100).toFixed(0)}% ${esc(t("vs", ref.cc))})</span>`;
      html += `</div>`;
    }
    html += `<table class="gogrp-table"><thead><tr><th>${esc(t("colCountry"))}</th><th>${esc(t("colLocal"))}</th><th>${esc(cur)}</th><th>${esc(t("vs", refCC))}</th></tr></thead><tbody>`;
    for (const r of rows) {
      if (r.conv == null && r.error) {
        const msg = r.error === "na" ? t("notAvailable") : r.error === "limit" ? t("rateLimited") : r.error === "noprice" ? t("noPrice") : r.error;
        html += `<tr class="gogrp-na"><td>${name(r.cc)}</td><td colspan="3">${esc(msg)}</td></tr>`;
        continue;
      }
      const diff = ref && r.conv != null ? (r.conv / ref.conv - 1) * 100 : null;
      const cls = diff == null ? "" : diff < -0.5 ? "gogrp-good" : diff > 0.5 ? "gogrp-bad" : "";
      const disc = r.base && r.base > r.final ? ` <s>${fmt(r.base, r.cur)}</s>` : "";
      html += `<tr${ref && r.cc === ref.cc ? ' class="gogrp-ref"' : ""}>
        <td>${name(r.cc)}</td>
        <td>${fmt(r.final, r.cur)}${disc}</td>
        <td><b>${fmt(r.conv, cur)}</b><div class="gogrp-bar" style="width:${r.conv ? (100 * r.conv / max).toFixed(0) : 0}%"></div></td>
        <td class="${cls}">${diff == null ? "—" : (diff > 0 ? "+" : "") + diff.toFixed(0) + "%"}</td></tr>`;
    }
    html += `</tbody></table>
      <div class="gogrp-limit">⚠ ${esc(t("panelLimit", rows.length))}</div>
      <div class="gogrp-foot">${esc(t("footer", cur, data.source))}</div>`;
    bodyEl().innerHTML = html;
  }

  async function load() {
    const my = state;
    const body = bodyEl();
    if (!body) return;
    my.loading = true;
    body.innerHTML = `<div class="gogrp-msg">${esc(t("loading"))}</div>`;
    try {
      const { settings } = await browser.runtime.sendMessage({ type: "settings" });
      const region = detectRegion();
      const target = settings.currency === "auto" ? region.currency : settings.currency;
      const refCC = settings.reference === "auto" ? region.country : settings.reference;
      const countries = settings.countries.slice();
      if (!countries.includes(refCC)) countries.unshift(refCC);

      let id = idFromPage();
      if (!id) {
        const r = await browser.runtime.sendMessage({ type: "resolveId", slug: my.slug, title: pageTitle() });
        id = r && r.id;
      }
      if (state !== my) return;
      if (!id) { body.innerHTML = `<div class="gogrp-msg">${esc(t("cantIdentify"))}</div>`; return; }

      body.innerHTML = `<div class="gogrp-msg">${esc(t("querying", countries.length))}</div>`;
      const data = await browser.runtime.sendMessage({ type: "compare", id, countries, target });
      if (state !== my) return;
      if (!data || data.error) throw new Error(data && data.error);
      render(data, refCC, region, settings);
      my.loaded = true;
      const hint = document.querySelector(`#${PANEL_ID} .gogrp-hint`);
      if (hint) hint.remove();
    } catch (e) {
      if (state === my) body.innerHTML = `<div class="gogrp-msg gogrp-bad">${esc(t("errorPrefix"))}: ${esc(e.message || e)}</div>`;
    } finally {
      my.loading = false;
    }
  }

  function check() {
    const slug = gameSlug();
    if (!slug) { state = null; removePanel(); return; }
    if (state && state.slug === slug && document.getElementById(PANEL_ID)) return;
    state = { slug, loaded: false, loading: false };
    makePanel();   // plegado: no se hace ninguna petición hasta que el usuario lo abra
  }

  // GOG cambia de página sin recargar: vigilamos la URL.
  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) { lastUrl = location.href; check(); }
  }, 700);

  // Si cambian los ajustes y el panel ya estaba cargado, se recarga (usa la caché).
  browser.storage.onChanged.addListener((ch, area) => {
    if (area !== "sync" || !state || !state.loaded) return;
    state.loaded = false;
    const p = document.getElementById(PANEL_ID);
    if (p && !p.classList.contains("gogrp-collapsed")) load();
  });

  check();
})();
