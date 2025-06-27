import DrinkUI from '../public/DrinkUI.js';

console.log("[DEBUG] API_BASE_URL:", window.env?.API_BASE_URL);
const API_BASE_URL = (window.env && window.env.API_BASE_URL) || '';
console.log("[DEBUG] Using API_BASE_URL:", API_BASE_URL);

const token = localStorage.getItem("token");
console.log("[DEBUG] Token exists:", !!token);
if (!token) {
    console.warn("[AUTH] No token found — redirecting to login");
    alert("Trebuie să fii autentificat pentru a accesa această pagină.");
    window.location.href = "/login/";
}

const cardsContainer = document.querySelector(".cards-container");
const categoryList = document.querySelector(".filter-list");
const sortSelect = document.getElementById("sort-select");
const searchInput = document.getElementById("search-drink");
const nutritionList = document.getElementById("nutrition-list");
const quantityMinSlider = document.getElementById("quantity-slider-min");
const quantityMaxSlider = document.getElementById("quantity-slider-max");
const quantityRangeText = document.getElementById("quantity-range-text");
const paginationContainer = document.querySelector(".pagination");

let currentPage = 1;
let totalPages = 1;
let selectedTags = [];
let selectedNutritionGrades = [];
let searchTerm = "";
let selectedSort = "";
let minQuantity = 0;
let maxQuantity = 1000;
let maxQuantityAvailable = 1000;
let userLists = [];

async function fetchFilters() {
    try {
        const res = await fetch(`${API_BASE_URL}/drinks/filters`, { headers: { Authorization: `Bearer ${token}` } });
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
        if (+quantityMinSlider.value > +quantityMaxSlider.value) {
            quantityMinSlider.value = quantityMaxSlider.value;
        }
        minQuantity = +quantityMinSlider.value;
        updateQuantityText();
    });

    quantityMaxSlider.addEventListener("input", () => {
        if (+quantityMaxSlider.value < +quantityMinSlider.value) {
            quantityMaxSlider.value = quantityMinSlider.value;
        }
        maxQuantity = +quantityMaxSlider.value;
        updateQuantityText();
    });
}

function updateQuantityText() {
    quantityRangeText.textContent = `Interval: ${minQuantity} - ${maxQuantity} Litri`;
}

async function fetchUserLists() {
    const res = await fetch(`${API_BASE_URL}/lists`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();
    return json || [];
}

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
        const json = await res.json();
        totalPages = json.max_pages || 1;
        return json.drinks || [];
    } catch (err) {
        console.error("Eroare feed:", err.message);
        return [];
    }
}

function renderPagination() {
    paginationContainer.innerHTML = "";
    const label = document.createElement("span");
    label.textContent = `${currentPage} / ${totalPages}`;
    label.classList.add("pagination-label");
    paginationContainer.appendChild(label);

    if (currentPage > 1) {
        const prevBtn = document.createElement("button");
        prevBtn.innerHTML = `<i class="fa-solid fa-chevron-left pagination-button"></i>`;
        prevBtn.classList.add("page-btn");
        prevBtn.addEventListener("click", () => {
            currentPage--;
            resetAndLoad();
        });
        paginationContainer.insertBefore(prevBtn, label);
    }

    if (currentPage < totalPages) {
        const nextBtn = document.createElement("button");
        nextBtn.innerHTML = `<i class="fa-solid fa-chevron-right pagination-button"></i>`;
        nextBtn.classList.add("page-btn");
        nextBtn.addEventListener("click", () => {
            currentPage++;
            resetAndLoad();
        });
        paginationContainer.appendChild(nextBtn);
    }
}

async function resetAndLoad() {
    const drinksData = await fetchDrinks(currentPage);
    userLists = await fetchUserLists();
    cardsContainer.innerHTML = "";
    drinksData.forEach(drink => {
        const card = DrinkUI.createDrinkCard(drink, userLists);
        cardsContainer.appendChild(card);
    });
    renderPagination();
}

function setupListeners() {
    searchInput.addEventListener("input", () => {
        searchTerm = searchInput.value.trim().toLowerCase();
    });

    document.getElementById("apply-filters-btn")?.addEventListener("click", () => {
        currentPage = 1;
        resetAndLoad();
    });

    document.getElementById("clear-filters-btn")?.addEventListener("click", () => {
        selectedTags = [];
        selectedNutritionGrades = [];
        searchTerm = "";
        minQuantity = 0;
        maxQuantity = maxQuantityAvailable;
        document.querySelectorAll(".filter-item input[type='checkbox']").forEach(cb => cb.checked = false);
        searchInput.value = "";
        quantityMinSlider.value = minQuantity;
        quantityMaxSlider.value = maxQuantity;
        resetAndLoad();
    });

    document.getElementById("select-all-drink")?.addEventListener("click", () => {
        const allSelected = {};
        document.querySelectorAll(".rectangle").forEach(card => {
            const checkbox = card.querySelector(".drink-checkbox");
            if (checkbox && !checkbox.checked) checkbox.click();
        });
    });

    document.getElementById("deselect-all-drink")?.addEventListener("click", () => {
        localStorage.removeItem("selectedDrinks");
        document.querySelectorAll(".drink-checkbox").forEach(cb => cb.checked = false);
    });

    window.handleNavigateToRanking = () => {
        window.location.href = "/ranking/";
    };
}

document.addEventListener("DOMContentLoaded", async () => {
    await fetchFilters();
    await resetAndLoad();
    setupListeners();
});
