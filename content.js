/* Detecta la ficha de juego en gog.com e inserta el panel de precios regionales.
   El panel aparece plegado y solo consulta precios cuando el usuario lo abre. */
(() => {
  const PANEL_ID = "gogrp-panel";
  const t = (k, ...s) => browser.i18n.getMessage(k, s.map(String)) || k;
  // Crea un elemento sin usar innerHTML: h("td", {class: "x"}, "texto", otroNodo).
  // Los textos se insertan como nodos de texto, así que nunca se interpretan como HTML.
  const h = (tag, attrs, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "style") Object.assign(el.style, v);
      else el.setAttribute(k, v);
    }
    for (const k of kids.flat()) if (k != null && k !== "") el.append(k);
    return el;
  };
  const setBody = (...kids) => { const b = bodyEl(); if (b) b.replaceChildren(...kids); };
  const msgEl = (text, extra) => h("div", { class: "gogrp-msg" + (extra ? " " + extra : "") }, text);
  const lang = gogUiLang();
  const fmt = (v, cur) => {
    if (v == null) return "—";
    try { return new Intl.NumberFormat(lang, { style: "currency", currency: cur }).format(v); }
    catch (e) { return v.toFixed(2) + " " + cur; }
  };
  // Igual que fmt, pero permite partir la línea entre la cifra y la moneda
  // (para precios locales largos, p. ej. pesos argentinos).
  const fmtWrap = (v, cur) => fmt(v, cur).replace(/\u00A0/g, " ");

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
    const btn = (act, title, icon) => h("button", { class: "gogrp-btn", "data-act": act, title }, icon);
    p.append(
      h("div", { class: "gogrp-head", title: t("toggle") },
        h("span", { class: "gogrp-title" }, "🌍 " + t("panelTitle") + " ", h("span", { class: "gogrp-hint" }, t("clickToLoad"))),
        h("span", { class: "gogrp-actions" },
          btn("refresh", t("refresh"), "↻"), " ",
          btn("opts", t("options"), "⚙"), " ",
          btn("toggle", t("toggle"), "▾"))),
      h("div", { class: "gogrp-body" }));
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
    const name = cc => `${gogFlag(cc)} ${gogCountryName(cc)}`;
    const out = [];

    out.push(h("div", { class: "gogrp-region" },
      `${t("yourRegion")}: ${name(region.country)} · ${cur}${settings.currency !== "auto" ? " (" + t("fixedCurrency") + ")" : ""}`));
    if (ok.length) {
      const sum = h("div", { class: "gogrp-sum" }, t("cheapest") + ": ", h("b", null, name(ok[0].cc)), " · " + fmt(ok[0].conv, cur));
      if (ref && ok[0].cc !== ref.cc)
        sum.append(" ", h("span", { class: "gogrp-good" }, `(${((ok[0].conv / ref.conv - 1) * 100).toFixed(0)}% ${t("vs", ref.cc)})`));
      out.push(sum);
    }

    const tbody = h("tbody");
    for (const r of rows) {
      if (r.conv == null && r.error) {
        const msg = r.error === "na" ? t("notAvailable") : r.error === "limit" ? t("rateLimited") : r.error === "noprice" ? t("noPrice") : r.error;
        tbody.append(h("tr", { class: "gogrp-na" },
          h("td", { class: "gogrp-country" }, name(r.cc)),
          h("td", { class: "gogrp-local", colspan: "3" }, msg)));
        continue;
      }
      const diff = ref && r.conv != null ? (r.conv / ref.conv - 1) * 100 : null;
      const cls = diff == null ? null : diff < -0.5 ? "gogrp-good" : diff > 0.5 ? "gogrp-bad" : null;
      tbody.append(h("tr", { class: ref && r.cc === ref.cc ? "gogrp-ref" : null },
        h("td", { class: "gogrp-country" }, name(r.cc)),
        h("td", { class: "gogrp-local" }, fmtWrap(r.final, r.cur),
          r.base && r.base > r.final ? [" ", h("s", null, fmtWrap(r.base, r.cur))] : null),
        h("td", null, h("b", null, fmt(r.conv, cur)),
          h("div", { class: "gogrp-bar", style: { width: (r.conv ? (100 * r.conv / max).toFixed(0) : 0) + "%" } })),
        h("td", { class: cls }, diff == null ? "—" : (diff > 0 ? "+" : "") + diff.toFixed(0) + "%")));
    }
    out.push(h("table", { class: "gogrp-table" },
      h("thead", null, h("tr", null, h("th", null, t("colCountry")), h("th", null, t("colLocal")), h("th", null, cur), h("th", null, t("vs", refCC)))),
      tbody));
    out.push(h("div", { class: "gogrp-limit" }, "⚠ " + t("panelLimit", rows.length)));
    out.push(h("div", { class: "gogrp-foot" }, t("footer", cur, data.source)));
    setBody(...out);
  }

  async function load() {
    const my = state;
    const body = bodyEl();
    if (!body) return;
    my.loading = true;
    body.replaceChildren(msgEl(t("loading")));
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
      if (!id) { body.replaceChildren(msgEl(t("cantIdentify"))); return; }

      body.replaceChildren(msgEl(t("querying", countries.length)));
      const data = await browser.runtime.sendMessage({ type: "compare", id, countries, target });
      if (state !== my) return;
      if (!data || data.error) throw new Error(data && data.error);
      render(data, refCC, region, settings);
      my.loaded = true;
      const hint = document.querySelector(`#${PANEL_ID} .gogrp-hint`);
      if (hint) hint.remove();
    } catch (e) {
      if (state === my) body.replaceChildren(msgEl(`${t("errorPrefix")}: ${e.message || e}`, "gogrp-bad"));
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
