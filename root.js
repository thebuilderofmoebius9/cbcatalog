const sourceUrl = "/cbcatalog/live/data/products.json";

function normalizeName(name) {
  return name
    .replace(/^M9k\s*/i, "")
    .replace(/^M Bar 10k_/i, "")
    .replace(/^M bar 10k_/i, "")
    .replace(/^M Switch 15k \( พร้อมสูบ \)\s*:\s*/i, "")
    .replace(/^M Switch 15k หัว\s*:\s*/i, "")
    .replace(/^ES SWITCH 20k \(พร้อมสูบ\)\s*:\s*/i, "")
    .replace(/^หัว ES SWITCH 20k\s*:\s*/i, "")
    .replace(/^หัว ES Switch 20k\s*:\s*/i, "")
    .trim();
}

function stockClass(stock) {
  if (stock <= 0) return "out";
  if (stock <= 3) return "low";
  return "";
}

function renderList(target, items, opts = {}) {
  const limit = opts.limit || items.length;
  target.innerHTML = items.slice(0, limit).map((item) => {
    const cls = stockClass(item.stock);
    const suffix = item.stock > 0 ? ` (${item.stock})` : "";
    return `<li class="${cls}">${normalizeName(item.name)}${suffix}</li>`;
  }).join("");
}

function pick(products, tag) {
  return products
    .filter((product) => product.tag.includes(tag))
    .sort((a, b) => (b.stock > 0) - (a.stock > 0) || b.stock - a.stock || a.name.localeCompare(b.name));
}

function spotCard(item) {
  const image = item.image || "https://image.zort.co.th/ImagesStorage/ProductImages/110743/23495097/9555482f36ca43f9801d65c69a47c3fd.png?service=r2";
  return `
    <article class="spot-card">
      <img src="${image}" alt="${item.name}" loading="lazy">
      <div class="spot-body">
        <div class="spot-name">${item.name}</div>
        <div class="spot-meta">
          <span>${item.price}.-</span>
          <span>${item.stock} ชิ้น</span>
        </div>
      </div>
    </article>
  `;
}

async function init() {
  const response = await fetch(sourceUrl);
  const payload = await response.json();
  const products = payload.products;

  const spotlight = products
    .filter((item) => item.stock > 0 && item.image)
    .sort((a, b) => b.stock - a.stock || b.price - a.price)
    .slice(0, 3);

  document.querySelector("#spotlight").innerHTML = spotlight.map(spotCard).join("");

  renderList(document.querySelector("#marbo-list"), pick(products, "M9"), { limit: 24 });
  renderList(document.querySelector("#ms-ready-list"), pick(products, "mm15"), { limit: 15 });
  renderList(document.querySelector("#ms-head-list"), pick(products, "m15"), { limit: 17 });
  renderList(document.querySelector("#m10-list"), pick(products, "m10"), { limit: 12 });

  const es = [...pick(products, "EE20"), ...pick(products, "Ek20")];
  renderList(document.querySelector("#es-list"), es, { limit: 24 });

  document.querySelector("#freshness").textContent =
    `ข้อมูลจาก Zortout cache: ${new Date(payload.sourceFetchedAt).toLocaleString("th-TH")} | พร้อมขาย ${products.filter((item) => item.stock > 0).length} / ${products.length}`;
}

init();
