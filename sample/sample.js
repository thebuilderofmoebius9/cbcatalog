const sourceUrl = "/cbcatalog/live/data/products.json";

function normalizeName(name) {
  return name
    .replace(/^M9k\s*/i, "")
    .replace(/^M Bar 10k_/i, "")
    .replace(/^M bar 10k_/i, "")
    .replace(/^M Switch 15k \( พร้อมสูบ \)\s*:\s*/i, "")
    .replace(/^M Switch 15k หัว\s*:\s*/i, "")
    .replace(/^Holdem 22k_/i, "")
    .replace(/^GO 12k_/i, "")
    .replace(/^RELX NOVO 14K\s*/i, "")
    .replace(/^หัว Nexbar Switch_/i, "")
    .trim();
}

function statusClass(stock) {
  return stock > 0 ? "in" : "out";
}

function byStockThenName(a, b) {
  return (b.stock > 0) - (a.stock > 0) || b.stock - a.stock || a.name.localeCompare(b.name, "th");
}

function renderList(target, items) {
  target.innerHTML = items.map((item) => {
    const cls = `flavor-item ${statusClass(item.stock)}`;
    return `<li class="${cls}">${normalizeName(item.name)}</li>`;
  }).join("");
}

function pickByPrefix(products, prefix) {
  return products.filter((product) => product.sku.startsWith(prefix)).sort(byStockThenName);
}

function pickByTag(products, tag) {
  return products.filter((product) => product.tag.includes(tag)).sort(byStockThenName);
}

async function init() {
  const response = await fetch(sourceUrl);
  const payload = await response.json();
  const products = payload.products.map((item) => ({
    ...item,
    stock: Number(item.stock || 0),
    tag: Array.isArray(item.tag) ? item.tag : [],
  }));

  const marbo = pickByPrefix(products, "M9K");
  const mSwitchReady = products.filter((item) => item.sku.startsWith("MS15k_") && item.name.includes("( พร้อมสูบ )")).sort(byStockThenName);
  const mSwitchHead = products.filter((item) => item.sku.startsWith("MS15k_") && item.name.includes("หัว :")).sort(byStockThenName);
  const holdem = pickByPrefix(products, "HDD");
  const nexbarHeads = pickByPrefix(products, "NBS_");
  const m10 = pickByPrefix(products, "M10K_");
  const go = pickByPrefix(products, "G12_");
  const novo = pickByPrefix(products, "REXN14_");

  renderList(document.querySelector("#marbo-list"), marbo);
  renderList(document.querySelector("#ms-ready-list"), mSwitchReady);
  renderList(document.querySelector("#ms-head-list"), mSwitchHead);
  renderList(document.querySelector("#holdem-list"), holdem);
  renderList(document.querySelector("#nexbar-head-list"), nexbarHeads);
  renderList(document.querySelector("#m10-list"), m10);
  renderList(document.querySelector("#go-list"), go);
  renderList(document.querySelector("#novo-list"), novo);

  const heroPrimary = m10.find((item) => item.image) || marbo.find((item) => item.image);
  const heroSecondary = marbo.find((item) => item.image) || m10.find((item) => item.image);

  document.querySelector("#hero-primary-image").src = heroPrimary?.image || "";
  document.querySelector("#hero-secondary-image").src = heroSecondary?.image || "";

  document.querySelector("#freshness").textContent =
    `sample sync ${new Date(payload.sourceFetchedAt).toLocaleString("th-TH")} | พร้อมขาย ${products.filter((item) => item.stock > 0).length} / ${products.length}`;
}

init();
