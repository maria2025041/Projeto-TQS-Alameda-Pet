const products = [
  { id: 1, name: "Coleira Terra em algodão", category: "Cão", price: 18.5, rating: "4.9", reviews: 28, badge: "MAIS VENDIDO", image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=700&q=80" },
  { id: 2, name: "Brinquedo de corda natural", category: "Cão", price: 12, rating: "4.8", reviews: 16, badge: "", image: "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&w=700&q=80" },
  { id: 3, name: "Cama Nuvem — verde sálvia", category: "Gato", price: 42, rating: "5.0", reviews: 34, badge: "FEITO EM PORTUGAL", image: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=700&q=80" },
  { id: 4, name: "Snack de salmão (100 g)", category: "Gato", price: 8.9, rating: "4.7", reviews: 21, badge: "NOVO", image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=700&q=80" },
  { id: 5, name: "Taça de cerâmica artesanal", category: "Casa", price: 24, rating: "4.9", reviews: 12, badge: "", image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=700&q=80" },
  { id: 6, name: "Brinquedo ratinho de linho", category: "Gato", price: 9.5, rating: "4.8", reviews: 19, badge: "", image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=700&q=80" },
  { id: 7, name: "Trela de passeio Areia", category: "Cão", price: 22, rating: "4.9", reviews: 17, badge: "MAIS VENDIDO", image: "https://images.unsplash.com/photo-1601758123927-1962a6a7c2f1?auto=format&fit=crop&w=700&q=80" },
  { id: 8, name: "Manta macia de algodão", category: "Casa", price: 29, rating: "4.6", reviews: 9, badge: "", image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=700&q=80" }
];

const productGrid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#search-input");
const filterButtons = document.querySelectorAll(".filter-tab");
const sortSelect = document.querySelector("#sort-select");
const emptyState = document.querySelector("#empty-state");
const resultsNote = document.querySelector("#results-note");
const cartDrawer = document.querySelector("#cart-drawer");
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const cartSummary = document.querySelector("#cart-summary");
const cart = new Map();
let activeFilter = "Todos";
let toastTimer;

function euro(value) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
}

function visibleProducts() {
  const term = searchInput.value.trim().toLocaleLowerCase("pt-PT");
  let visible = products.filter((product) => {
    const matchesFilter = activeFilter === "Todos" || product.category === activeFilter;
    const matchesSearch = product.name.toLocaleLowerCase("pt-PT").includes(term);
    return matchesFilter && matchesSearch;
  });
  if (sortSelect.value === "price-low") visible = [...visible].sort((a, b) => a.price - b.price);
  if (sortSelect.value === "price-high") visible = [...visible].sort((a, b) => b.price - a.price);
  return visible;
}

function renderProducts() {
  const visible = visibleProducts();
  productGrid.innerHTML = visible.map((product) => `
    <article class="product-card">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
        <button class="favorite-button" type="button" aria-label="Adicionar ${product.name} aos favoritos" aria-pressed="false">♡</button>
      </div>
      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <h3 class="product-title">${product.name}</h3>
        <div class="product-meta"><span class="product-price">${euro(product.price)}</span><span class="product-rating">★ ${product.rating} <span>(${product.reviews})</span></span></div>
        <button class="add-button" type="button" data-add="${product.id}">Adicionar ao carrinho <span aria-hidden="true">+</span></button>
      </div>
    </article>
  `).join("");
  emptyState.hidden = visible.length > 0;
  productGrid.hidden = visible.length === 0;
  resultsNote.textContent = visible.length ? `${visible.length} ${visible.length === 1 ? "produto encontrado" : "produtos encontrados"}` : "";
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function updateCart() {
  const items = [...cart.values()];
  const count = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  document.querySelector("#cart-count").textContent = count;
  document.querySelector("#drawer-count").textContent = `(${count})`;
  document.querySelector("#cart-subtotal").textContent = euro(subtotal);
  cartItems.innerHTML = items.map(({ product, quantity }) => `
    <article class="cart-item">
      <img src="${product.image}" alt="">
      <div class="cart-item-info"><h3>${product.name}</h3><span>${euro(product.price)}</span>
        <div class="quantity-controls">
          <button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Diminuir quantidade">−</button>
          <span>${quantity}</span>
          <button type="button" data-quantity="${product.id}" data-change="1" aria-label="Aumentar quantidade">+</button>
        </div>
      </div>
      <span class="cart-item-price">${euro(product.price * quantity)}</span>
    </article>
  `).join("");
  cartEmpty.hidden = count > 0;
  cartSummary.hidden = count === 0;
}

function openCart() {
  document.body.classList.add("cart-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.querySelector("#close-cart").focus();
}

function closeCart() {
  document.body.classList.remove("cart-open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    const product = products.find((item) => item.id === Number(addButton.dataset.add));
    const current = cart.get(product.id);
    cart.set(product.id, { product, quantity: current ? current.quantity + 1 : 1 });
    updateCart();
    showToast(`${product.name} adicionado ao carrinho`);
  }
  const favoriteButton = event.target.closest(".favorite-button");
  if (favoriteButton) {
    const isFavorite = favoriteButton.classList.toggle("is-favorite");
    favoriteButton.setAttribute("aria-pressed", String(isFavorite));
    favoriteButton.textContent = isFavorite ? "♥" : "♡";
    showToast(isFavorite ? "Adicionado aos favoritos" : "Removido dos favoritos");
  }
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-quantity]");
  if (!button) return;
  const id = Number(button.dataset.quantity);
  const item = cart.get(id);
  const quantity = item.quantity + Number(button.dataset.change);
  if (quantity < 1) cart.delete(id);
  else cart.set(id, { ...item, quantity });
  updateCart();
});

filterButtons.forEach((button) => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  filterButtons.forEach((item) => item.classList.toggle("active", item === button));
  renderProducts();
}));
searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);
document.querySelector("#clear-filters").addEventListener("click", () => {
  activeFilter = "Todos";
  searchInput.value = "";
  filterButtons.forEach((button) => button.classList.toggle("active", button.dataset.filter === "Todos"));
  renderProducts();
});
document.querySelector("#cart-button").addEventListener("click", openCart);
document.querySelector("#close-cart").addEventListener("click", closeCart);
document.querySelector("#drawer-backdrop").addEventListener("click", closeCart);
document.querySelector("#continue-shopping").addEventListener("click", closeCart);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeCart();
});
document.querySelector("#checkout-button").addEventListener("click", () => showToast("Checkout indisponível de momento."));
document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector("#newsletter-message").textContent = "Inscrição feita! Prepara-te para boas notícias.";
  event.currentTarget.reset();
});
document.querySelector("#load-more").addEventListener("click", () => showToast("Estás a ver todos os produtos disponíveis."));

document.querySelectorAll(".category-card").forEach((link) => link.addEventListener("click", () => {
  activeFilter = link.dataset.category === "Casa" ? "Todos" : link.dataset.category;
  filterButtons.forEach((button) => button.classList.toggle("active", button.dataset.filter === activeFilter));
  renderProducts();
}));

renderProducts();
updateCart();
