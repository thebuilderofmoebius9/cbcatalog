const sourceUrl = "/cbcatalog/live/data/products.json";

const creatorDeviceList = [
  "องุ่น",
  "ส้มโซดา",
  "สตอเบอรี่มิ้น",
  "พิ้งเบอรี่",
  "สตอเบอรี่กล้วย",
  "ฝรั่งชมพู",
  "ชาอู่หลงอะโล",
  "เรนโบว์",
  "สตอเบอรี่มิ้น",
  "Spearmint",
  "พาโบ",
  "แตงโมบับเบิ้ลกัม",
  "มิกเบอรี่",
  "บลูเบอรี่",
  "พิ้ง",
  "ดับเบิ้ลมิ้น",
  "โคล่า",
  "แตงโม",
  "Cool mint",
  "คัวซัว",
];

const creatorPuffsList = [
  "ชาเขียวมิ้น",
  "องุ่นโซ",
  "Orange Splash",
  "Spearmint",
  "Mineral Water",
];

function normalizeName(name) {
  return name
    .replace(/^หัว Nexbar Switch_/i, "")
    .replace(/^GO 12k_/i, "")
    .replace(/^RELX NOVO 14K\s*/i, "")
    .replace(/^NEXBAR 20K\s*/i, "")
    .trim();
}

function statusClass(stock) {
  return stock > 0 ? "in" : "out";
}

function byStockThenName(a, b) {
  return (b.stock > 0) - (a.stock > 0) || b.stock - a.stock || a.name.localeCompare(b.name, "th");
}

function renderProductList(target, items) {
  const limit = target.dataset.limit ? Number(target.dataset.limit) : items.length;
  target.innerHTML = items.slice(0, limit).map((item) => {
    const cls = `flavor-item ${statusClass(item.stock)}`;
    return `<li class="${cls}">${normalizeName(item.name)}</li>`;
  }).join("");
}

function renderStaticList(target, items) {
  target.innerHTML = items.map((item) => `<li class="flavor-item out">${item}</li>`).join("");
}

async function init() {
  const response = await fetch(sourceUrl);
  const payload = await response.json();
  const products = payload.products.map((item) => ({
    ...item,
    stock: Number(item.stock || 0),
  }));

  const nexbar20 = products.filter((item) => item.sku.startsWith("NBS_")).sort(byStockThenName);
  const go = products.filter((item) => item.sku.startsWith("G12_")).sort(byStockThenName);
  const novo = products.filter((item) => item.sku.startsWith("REXN14_")).sort(byStockThenName);

  renderProductList(document.querySelector("#nexbar20-list"), nexbar20);
  renderProductList(document.querySelector("#go-list"), go);
  renderProductList(document.querySelector("#novo-list"), novo);
  renderStaticList(document.querySelector("#creator-device-list"), creatorDeviceList);
  renderStaticList(document.querySelector("#creator-puffs-list"), creatorPuffsList);

  document.querySelector("#freshness").textContent =
    `sample sync ${new Date(payload.sourceFetchedAt).toLocaleString("th-TH")} | clone page`;
}

init();
