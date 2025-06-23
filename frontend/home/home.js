const API_BASE_URL = window.env.API_BASE_URL;
const token = localStorage.getItem("token");

if (!token) {
  alert("Trebuie să fii autentificat pentru a accesa această pagină.");
  window.location.href = "/login/";
}

let currentPage = 1;
let isLoading = false;
let hasMorePages = true;
let selectedTags = [];
let searchTerm = "";
let selectedSort = "";
let drinksData = [];

const cardsContainer = document.querySelector(".cards-container");
const modalsContainer = document.getElementById("text-box-container");
const overlay = document.querySelector(".overlay");
const body = document.body;
const categoryList = document.querySelector(".filter-list");
const sortSelect = document.getElementById("sort-select");
const searchInput = document.getElementById("search-drink");

async function fetchFilters() {
  try {
    const res = await fetch(`${API_BASE_URL}/drinks/filters`);
    if (!res.ok) throw new Error("Eroare la filtre");
    const data = await res.json();

    populateSortOptions(data.sortOptions);
    populateTags(data.tags);
  } catch (err) {
    console.error("Eroare filtre:", err.message);
  }
}

function populateSortOptions(options) {
  sortSelect.innerHTML = "";
  options.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt.key;
    option.textContent = opt.label;
    sortSelect.appendChild(option);
  });
  sortSelect.addEventListener("change", () => {
    selectedSort = sortSelect.value;
    resetAndLoad();
  });
}

function populateTags(tags) {
  categoryList.innerHTML = "";
  tags.forEach(tag => {
    const container = document.createElement("div");
    container.classList.add("filter-item");
    container.innerHTML = `
      <input type="checkbox" id="tag-${tag.id}" name="category" value="${tag.id}" />
      <label for="tag-${tag.id}">${tag.name}</label>
    `;
    categoryList.appendChild(container);
  });

  categoryList.querySelectorAll("input[type='checkbox']").forEach(cb => {
    cb.addEventListener("change", () => {
      selectedTags = Array.from(categoryList.querySelectorAll("input:checked")).map(cb => cb.value);
      resetAndLoad();
    });
  });
}

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim().toLowerCase();
  render();
});

async function fetchDrinks(page = 1) {
  try {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("limit", 12);
    if (selectedSort) params.set("sort", selectedSort);
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));

    const res = await fetch(`${API_BASE_URL}/drinks/feed?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Eroare la feed");

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Eroare feed:", err.message);
    return [];
  }
}

function render() {
  cardsContainer.innerHTML = "";
  modalsContainer.innerHTML = "";

  const filtered = searchTerm
    ? drinksData.filter(d => d.name.toLowerCase().includes(searchTerm))
    : drinksData;

  filtered.forEach(drink => {
    cardsContainer.appendChild(createDrinkCard(drink));
    modalsContainer.appendChild(createDrinkModal(drink));
  });

  initEventListeners();
}

function createDrinkCard(drink) {
  const card = document.createElement("div");
  card.classList.add("rectangle");
  card.innerHTML = `
    <div class="content">
      <img class="drink-img" src="${drink.image_url}" alt="${drink.name}">
    </div>
    <h3>${drink.name}</h3>
    <p><strong>Brand:</strong> ${drink.brand || "N/A"}</p>
    <p><strong>Cantitate:</strong> ${drink.quantity || "?"} ml</p>
    <p><strong>Nutriție:</strong> ${drink.nutrition_grade || "-"}</p>
    <div class="btn">
      <button class="read-more" data-index="${drink.id}">Detalii</button>
    </div>
  `;
  return card;
}

function createDrinkModal(drink) {
  const modal = document.createElement("div");
  modal.classList.add("text-box", "hidden");
  modal.id = `text-box-${drink.id}`;
  modal.innerHTML = `
    <button class="close-modal" data-index="${drink.id}">&times;</button>
    <div class="drink-details">
      <p id="drink-title">${drink.name}</p>
      <div class="drink-content">
        <div class="drink-text">
          <p><strong>Brand:</strong> ${drink.brand}</p>
          <p><strong>Cantitate:</strong> ${drink.quantity} ml</p>
          <p><strong>Nutriție:</strong> ${drink.nutrition_grade}</p>
          <p><strong>Ambalaj:</strong> ${drink.packaging}</p>
        </div>
        <div id="icons-container">
          <img id="drink-image-box" src="${drink.image_url}" alt="${drink.name}">
        </div>
      </div>
    </div>
  `;
  return modal;
}

function initEventListeners() {
  document.querySelectorAll(".read-more").forEach(btn =>
    btn.addEventListener("click", () => toggleModal(btn.dataset.index, true))
  );
  document.querySelectorAll(".close-modal").forEach(btn =>
    btn.addEventListener("click", () => toggleModal(btn.dataset.index, false))
  );
  overlay.addEventListener("click", closeAllModals);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeAllModals();
  });
}

function toggleModal(idx, show) {
  const modal = document.getElementById(`text-box-${idx}`);
  if (!modal) return;
  modal.classList.toggle("hidden", !show);
  overlay.classList.toggle("hidden", !show);
  body.classList.toggle("no-scroll", show);
}

function closeAllModals() {
  document.querySelectorAll(".text-box:not(.hidden)")
    .forEach(m => m.classList.add("hidden"));
  overlay.classList.add("hidden");
  body.classList.remove("no-scroll");
}

async function resetAndLoad() {
  drinksData = [];
  currentPage = 1;
  hasMorePages = true;
  cardsContainer.innerHTML = "";
  await loadNextPage();
}

async function loadNextPage() {
  if (isLoading || !hasMorePages) return;
  isLoading = true;

  const newDrinks = await fetchDrinks(currentPage);
  if (newDrinks.length === 0) {
    hasMorePages = false;
  } else {
    drinksData.push(...newDrinks);
    render();
    currentPage++;
  }

  isLoading = false;
}

window.addEventListener("scroll", () => {
  const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
  if (nearBottom) loadNextPage();
});

function handleNavigateToRanking() {
  window.location.href = "/ranking/";
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchFilters();
  await loadNextPage();
});
