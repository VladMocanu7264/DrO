const API_BASE_URL = window.env.API_BASE_URL;
const token = localStorage.getItem("token");

if (!token) {
  alert("Trebuie să fii autentificat pentru a accesa această pagină.");
  window.location.href = "/login/";
}

let currentPage = 1;
let totalPages = 1;
let selectedTags = [];
let selectedNutritionGrades = [];
let searchTerm = "";
let selectedSort = "";
let drinksData = [];
let minQuantity = 0;
let maxQuantity = 1000;
let maxQuantityAvailable = 1000;

const cardsContainer = document.querySelector(".cards-container");
const modalsContainer = document.getElementById("text-box-container");
const overlay = document.querySelector(".overlay");
const body = document.body;
const categoryList = document.querySelector(".filter-list");
const sortSelect = document.getElementById("sort-select");
const searchInput = document.getElementById("search-drink");
const nutritionList = document.getElementById("nutrition-list");
const quantityMinSlider = document.getElementById("quantity-slider-min");
const quantityMaxSlider = document.getElementById("quantity-slider-max");
const quantityRangeText = document.getElementById("quantity-range-text");

async function fetchFilters() {
  try {
    const res = await fetch(`${API_BASE_URL}/drinks/filters`);
    if (!res.ok) throw new Error("Eroare la filtre");
    const data = await res.json();

    populateSortOptions(data.sortOptions);
    populateTags(data.tags);
    populateNutritionGrades(data.nutrition_grades);
    setupQuantitySliders(data.quantity);
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
    });
  });
}

function populateNutritionGrades(grades) {
  nutritionList.innerHTML = "";
  grades.forEach(g => {
    const container = document.createElement("div");
    container.classList.add("filter-item");
    container.innerHTML = `
      <input type="checkbox" id="grade-${g}" value="${g}" />
      <label for="grade-${g}">${g.toUpperCase()}</label>
    `;
    nutritionList.appendChild(container);
  });
  nutritionList.querySelectorAll("input[type='checkbox']").forEach(cb => {
    cb.addEventListener("change", () => {
      selectedNutritionGrades = Array.from(nutritionList.querySelectorAll("input:checked")).map(cb => cb.value);
    });
  });
}

function setupQuantitySliders(range) {
  minQuantity = range.min_quantity;
  maxQuantityAvailable = range.max_quantity;
  maxQuantity = range.max_quantity;

  quantityMinSlider.min = minQuantity;
  quantityMinSlider.max = maxQuantityAvailable;
  quantityMinSlider.value = minQuantity;

  quantityMaxSlider.min = minQuantity;
  quantityMaxSlider.max = maxQuantityAvailable;
  quantityMaxSlider.value = maxQuantity;

  updateQuantityText();

  quantityMinSlider.addEventListener("input", () => {
    if (parseInt(quantityMinSlider.value) > parseInt(quantityMaxSlider.value)) {
      quantityMinSlider.value = quantityMaxSlider.value;
    }
    minQuantity = parseInt(quantityMinSlider.value);
    updateQuantityText();
  });

  quantityMaxSlider.addEventListener("input", () => {
    if (parseInt(quantityMaxSlider.value) < parseInt(quantityMinSlider.value)) {
      quantityMaxSlider.value = quantityMinSlider.value;
    }
    maxQuantity = parseInt(quantityMaxSlider.value);
    updateQuantityText();
  });
}

function updateQuantityText() {
  quantityRangeText.textContent = `Interval: ${minQuantity} - ${maxQuantity} Litri`;
}

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim().toLowerCase();
  resetAndLoad();
});

async function fetchDrinks(page = 1) {
  try {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("limit", 12);
    if (selectedSort) params.set("sort", selectedSort);
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
    if (selectedNutritionGrades.length > 0) params.set("nutrition_grades", selectedNutritionGrades.join(","));
    if (searchTerm) params.set("search", searchTerm);
    if (maxQuantity) {
      params.set("min_quantity", minQuantity);
      params.set("max_quantity", maxQuantity);
    }

    const res = await fetch(`${API_BASE_URL}/drinks/feed?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Eroare la feed");

    const json = await res.json();
    totalPages = json.max_pages || 1;
    return json.drinks || [];
  } catch (err) {
    console.error("Eroare feed:", err.message);
    return [];
  }
}

function render() {
  cardsContainer.innerHTML = "";
  modalsContainer.innerHTML = "";

  drinksData.forEach(drink => {
    cardsContainer.appendChild(createDrinkCard(drink));
    modalsContainer.appendChild(createDrinkModal(drink));
  });

  initEventListeners();
  renderPagination();
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
  drinksData = await fetchDrinks(currentPage);
  render();
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchFilters();
  await resetAndLoad();

  const applyFiltersBtn = document.getElementById("apply-filters-btn");
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", () => {
      currentPage = 1;
      resetAndLoad();
    });
  }
});

function renderPagination() {
  const paginationContainer = document.querySelector(".pagination");
  if (!paginationContainer) return;

  paginationContainer.innerHTML = "";

  const label = document.createElement("span");
  label.textContent = `${currentPage} / ${totalPages}`;
  label.classList.add("pagination-label");
  paginationContainer.appendChild(label);

  if (currentPage > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "‹";
    prevBtn.classList.add("page-btn");
    prevBtn.addEventListener("click", () => {
      currentPage--;
      resetAndLoad();
    });
    paginationContainer.insertBefore(prevBtn, label);
  }

  if (currentPage < totalPages) {
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "›";
    nextBtn.classList.add("page-btn");
    nextBtn.addEventListener("click", () => {
      currentPage++;
      resetAndLoad();
    });
    paginationContainer.appendChild(nextBtn);
  }
}

function handleNavigateToRanking() {
  window.location.href = "/ranking/";
}
