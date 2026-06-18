const state = {
  products: [],
  tag: "all",
  query: "",
  onlyStock: true,
};

const tagLabels = {
  m10: "M Bar 10k",
  m15: "M Switch 15k หัว",
  mm15: "M Switch 15k พร้อมสูบ",
  Ek20: "ES Switch หัว",
  EE20: "ES Switch พร้อมสูบ",
  in20: "INFY 20k",
  inp: "INFY Plus",
  M9: "Marbo 9k",
  rxp: "RXP",
};

const grid = document.querySelector("#grid");
const spotlight = document.querySelector("#spotlight");
const search = document.querySelector("#search");
const tagFilter = document.querySelector("#tagFilter");
const onlyStock = document.querySelector("#onlyStock");

function baht(value) {
  return new Intl.NumberFormat("th-TH").format(value);
}

function productTag(product) {
  return product.tag[0] || "อื่น ๆ";
}

function stockClass(stock) {
  if (stock <= 0) return "out";
  if (stock <= 3) return "low";
  return "ok";
}

function matches(product) {
  const q = state.query.trim().toLowerCase();
  const haystack = `${product.sku} ${product.name} ${product.tag.join(" ")}`.toLowerCase();
  return (!q || haystack.includes(q))
    && (state.tag === "all" || product.tag.includes(state.tag))
    && (!state.onlyStock || product.stock > 0);
}

function card(product, featured = false) {
  const stockText = product.stock > 0 ? `พร้อมขาย ${product.stock} ชิ้น` : "ของหมด";
  return `
    <article class="${featured ? "feature" : "card"}">
      <div class="media">${product.image ? `<img src="${product.image}" alt="${product.name}" loading="lazy">` : ""}</div>
      <div class="body">
        <div class="sku">${product.sku}</div>
        <div class="name">${product.name}</div>
        <div class="price">${baht(product.price)}.-</div>
        <div class="tag">${tagLabels[productTag(product)] || productTag(product)}</div>
        <div class="stock ${stockClass(product.stock)}">${stockText}</div>
      </div>
    </article>
  `;
}

function render() {
  const visible = state.products.filter(matches);
  document.querySelector("#stockCount").textContent = state.products.filter(p => p.stock > 0).length;
  document.querySelector("#totalCount").textContent = state.products.length;
  spotlight.innerHTML = visible.slice(0, 3).map(p => card(p, true)).join("");
  grid.innerHTML = visible.slice(3, 99).map(p => card(p)).join("") || "<p>ไม่พบสินค้า</p>";
}

function initFilters(products) {
  const tags = [...new Set(products.flatMap(p => p.tag.length ? p.tag : ["อื่น ๆ"]))].sort();
  tagFilter.innerHTML = `<option value="all">ทุกหมวด</option>` + tags.map(tag => (
    `<option value="${tag}">${tagLabels[tag] || tag}</option>`
  )).join("");
}

async function init() {
  const res = await fetch("data/products.json");
  const payload = await res.json();
  state.products = payload.products;
  initFilters(state.products);
  document.querySelector("#freshness").textContent =
    `ข้อมูลจาก Zortout cache: ${new Date(payload.sourceFetchedAt).toLocaleString("th-TH")}`;

  search.addEventListener("input", (event) => {
    state.query = event.target.value;
    render();
  });

  tagFilter.addEventListener("change", (event) => {
    state.tag = event.target.value;
    render();
  });

  onlyStock.addEventListener("change", (event) => {
    state.onlyStock = event.target.checked;
    render();
  });

  render();
}

init();
