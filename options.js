const t = (k, ...s) => browser.i18n.getMessage(k, s.map(String)) || k;

(async () => {
  document.documentElement.lang = gogUiLang();
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });

  const s = await browser.storage.sync.get(GOG_DEFAULTS);
  const byName = (a, b) => a[1].localeCompare(b[1], gogUiLang());

  // Divisa
  const cur = document.getElementById("cur");
  cur.add(new Option(t("optAutoCurrency"), "auto", false, s.currency === "auto"));
  GOG_CURRENCIES.map(c => [c, gogCurrencyName(c)]).sort(byName)
    .forEach(([c, n]) => cur.add(new Option(`${c} — ${n}`, c, false, s.currency === c)));

  // País de referencia
  const ref = document.getElementById("ref");
  ref.add(new Option(t("optAutoRegion"), "auto", false, s.reference === "auto"));
  const named = GOG_COUNTRIES.map(cc => [cc, gogCountryName(cc)]).sort(byName);
  named.forEach(([cc, n]) => ref.add(new Option(`${gogFlag(cc)} ${n}`, cc, false, s.reference === cc)));

  // Países a comparar
  const list = document.getElementById("list");
  for (const [cc, n] of named) {
    const l = document.createElement("label");
    const box = document.createElement("input");
    box.type = "checkbox"; box.value = cc; box.checked = s.countries.includes(cc);
    l.append(box, ` ${gogFlag(cc)} ${n}`);
    l.title = n;
    list.appendChild(l);
  }

  const boxes = () => [...list.querySelectorAll("input")];

  // Estimación en vivo: peticiones por juego y juegos por hora.
  const estimate = () => {
    const n = boxes().filter(b => b.checked).length + (ref.value !== "auto" && !boxes().some(b => b.checked && b.value === ref.value) ? 1 : 0);
    const el = document.getElementById("estimate");
    el.textContent = boxes().some(b => b.checked)
      ? t("limitEstimate", n, Math.max(1, Math.floor(200 / n)))
      : t("limitEstimateNone");
  };
  list.addEventListener("change", estimate);
  ref.addEventListener("change", estimate);
  estimate();

  document.getElementById("all").onclick = () => { boxes().forEach(b => b.checked = true); estimate(); };
  document.getElementById("none").onclick = () => { boxes().forEach(b => b.checked = false); estimate(); };
  document.getElementById("save").onclick = async () => {
    const countries = boxes().filter(b => b.checked).map(b => b.value);
    if (ref.value !== "auto" && !countries.includes(ref.value)) countries.unshift(ref.value);
    await browser.storage.sync.set({ reference: ref.value, currency: cur.value, countries });
    const st = document.getElementById("st");
    st.textContent = t("optSaved");
    setTimeout(() => st.textContent = "", 1500);
  };
})();
