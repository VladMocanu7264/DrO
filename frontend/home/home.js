// Diagnostic logging
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

// Warn on malformed fetch URLs
const originalFetch = window.fetch;
window.fetch = async function (...args) {
    if (args[0] && typeof args[0] === 'string' && args[0].includes("null")) {
        console.warn("[WARNING] Suspicious fetch URL:", args[0]);
    }
    return originalFetch.apply(this, args);
};

let currentPage = 1;
let totalPages = 1;
let selectedTags = [];
let selectedNutritionGrades = [];
let searchTerm = "";
let selectedSort = "";
let drinksData = [];
let userLists = [];
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
        const feedURL = `${API_BASE_URL}/drinks/filters`;
        console.log("[FETCH] Fetching drinks from:", feedURL);
        const res = await fetch(feedURL)
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
    // resetAndLoad();
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

        const feedURL = `${API_BASE_URL}/drinks/feed?${params.toString()}`;
        console.log("[FETCH] Fetching drinks from:", feedURL);
        const res = await fetch(feedURL, {
            headers: {Authorization: `Bearer ${token}`}
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

async function fetchUserLists() {
    try {

        const feedURL = `${API_BASE_URL}/lists`;
        console.log("[FETCH] Fetching drinks from:", feedURL);
        const res = await fetch(feedURL, {
            headers: {Authorization: `Bearer ${token}`}
        });
        if (!res.ok) throw new Error("Eroare la încărcarea listelor");

        const json = await res.json();
        return json || [];
    } catch (err) {
        console.error("Eroare feed:", err.message);
        return [];
    }
}

async function addDrinkToFavorites(drinkId) {
    if (!drinkId) {
        alert("ID-ul băuturii lipsește.");
        return false;
    }
    console.log("Adding drink to favorites:", drinkId);
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/favorites`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({drinkId}),
        });
        if (response.status === 400) {
            throw new Error("ID-ul băuturii lipsește sau este invalid.");
        }
        if (response.status === 404) {
            throw new Error("Băutura nu a fost găsită.");
        }
        if (response.status === 200) {
            return true;
        }
        const data = await response.json();
        return false;
    } catch (error) {
        alert("Operațiune eșuată: " + error.message);
        return false;
    }
}

async function removeDrinkFromFavorites(drinkId) {
    if (!drinkId) {
        alert("ID-ul băuturii lipsește.");
        return false;
    }

    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/favorites/${drinkId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Eroare la ștergerea favoritului");

        return true;
    } catch (err) {
        alert("Eroare la eliminarea din favorite: " + err.message);
        return false;
    }
}

async function addDrinkToList(drinkId, listId) {
    if (!drinkId || !listId) {
        alert("ID-ul băuturii sau al listei lipsește.");
        return;
    }
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/lists/${listId}/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({drinkId})
        });

        if (!response.ok) {
            throw new Error("Eroare la adăugarea băuturii în listă");
        }
        const data = await response.json();
        alert(`Băutura a fost adăugată în listă.`);
    } catch (error) {
        alert("Eroare:" + error);
    }
}

function render() {
    cardsContainer.innerHTML = "";
    modalsContainer.innerHTML = "";


    drinksData.forEach(drink => {
        cardsContainer.appendChild(createDrinkCard(drink));
    });

    initEventListeners();
    renderPagination();
}

function createDrinkCard(drink) {
    const selectedDrinks = JSON.parse(localStorage.getItem("selectedDrinks") || "{}");
    const isChecked = selectedDrinks.hasOwnProperty(drink.id);

    const card = document.createElement("div");
    card.classList.add("rectangle");
    card.innerHTML = `
    <div class="content">
      <img class="drink-img" src="${drink.image_url}" alt="${drink.name}">
    </div>
    <h3>${drink.name}</h3>
    <div class="drink-info">
      <p><strong>Brand:</strong> ${drink.brand || "-"}</p>
      <p><strong>Cantitate:</strong> ${drink.quantity || "?"} ml</p>
      <p><strong>Nutriție:</strong> ${drink.nutrition_grade || "-"}</p>
      <p><strong>Preț:</strong> ${drink.price || "-"} lei</p>
    </div>
    <label>
      <input type="checkbox" class="drink-checkbox" data-drink-id="${drink.id}" ${isChecked ? "checked" : ""}>
      Statistici
    </label>
    <button class="read-more" data-index="${drink.id}">Detalii</button>
  `;

    const checkbox = card.querySelector(".drink-checkbox");
    checkbox.addEventListener("change", (e) => {
        const selected = JSON.parse(localStorage.getItem("selectedDrinks") || "{}");

        if (e.target.checked) {
            selected[drink.id] = drink;
        } else {
            delete selected[drink.id];
        }

        localStorage.setItem("selectedDrinks", JSON.stringify(selected));
    });

    return card;
}

function createDrinkModal(drink) {
    console.log(drink);
    const modal = document.createElement('div');
    modal.classList.add('text-box', 'hidden');
    modal.id = `text-box-${drink.id}`;
    Object.assign(modal.style, {
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)', zIndex: '10'
    });
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
            <p><strong>Preț:</strong> ${drink.price} lei</p>
            <p><strong>Etichete:</strong> ${drink.tags?.join(", ") || "-"}</p>
          </div>
          <div id="icons-container">
            <img id="drink-image-box" src="${drink.image_url}" alt="${drink.name}">
            <div id="menu-icons-container">
              <i class="${drink.favorited ? 'fa-solid' : 'fa-regular'} fa-heart icon-menu add-favorite"
                 data-drink-id="${drink.id}"
                 title="${drink.favorited ? 'Favorit' : 'Add to favorites'}"></i>
              <i class="fa-solid fa-plus icon-menu add-to-list" title="Add to list"></i>
              <i class="fa-solid fa-share icon-menu" title="Share"></i>
            </div>
          </div>
        </div>
        <div class="favorite-section">
          <label for="favorite-list" class="favorite-label">Liste:</label>
          <select id="list-${drink.id}" class="favorite-select">
            <option value="" disabled selected>Selectează o listă</option>
            ${userLists.map(list => `
              <option value="${list.id}">${list.name}</option>
            `).join('')}
          </select> 
        </div>
      </div>
    `;

    modal.querySelector('.add-favorite')
        .addEventListener('click', async e => {
            e.stopPropagation();
            const icon = e.currentTarget;
            const drinkId = icon.dataset.drinkId;

            let success = false;
            if (drink.favorited) {
                success = await removeDrinkFromFavorites(drinkId);
                if (success) {
                    icon.classList.remove('fa-solid');
                    icon.classList.add('fa-regular');
                    icon.title = 'Add to favorites';
                    drink.favorited = false;
                }
            } else {
                success = await addDrinkToFavorites(drinkId);
                if (success) {
                    icon.classList.remove('fa-regular');
                    icon.classList.add('fa-solid');
                    icon.title = 'Favorit';
                    drink.favorited = true;
                }
            }
        });

    modal.querySelector('.add-to-list')
        .addEventListener('click', async () => {
            const select = modal.querySelector(`#list-${drink.id}`);
            const listToAddTo = parseInt(select.value);
            if (!listToAddTo) {
                alert("Selectează o listă mai întâi!");
                return;
            }
            await addDrinkToList(drink.id, listToAddTo);
        });
    modal.querySelector('.close-modal').addEventListener("click", () => {
        toggleModal(drink.id, false);
    });
    return modal;
}

async function fetchDrinkDetailsById(drinkId) {
    try {
        const res = await fetch(`${API_BASE_URL}/drinks/${drinkId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!res.ok) {
            throw new Error("Drink not found");
        }
        return await res.json();
    } catch (err) {
        alert("Eroare la obținerea detaliilor băuturii.");
        console.error(err);
        return null;
    }
}

function openDynamicDrinkModal(drink) {
    const modal = createDrinkModal(drink);
    closeAllModals();
    modalsContainer.appendChild(modal);

    modal.querySelector('.close-modal')
        .addEventListener("click", () => toggleModal(drink.id, false));

    toggleModal(drink.id, true);
}

function initEventListeners() {
    document.querySelectorAll(".read-more").forEach(btn =>
        btn.addEventListener("click", async () => {
            const drinkId = btn.dataset.index;

            const drink = await fetchDrinkDetailsById(drinkId);
            if (!drink) return;

            const existingModal = document.getElementById(`text-box-${drink.id}`);
            if (existingModal) existingModal.remove(); // clean up old

            const modal = createDrinkModal(drink);
            modalsContainer.appendChild(modal);

            modal.querySelector('.close-modal').addEventListener("click", () => {
                toggleModal(drink.id, false);
            });

            toggleModal(drink.id, true);
        })
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
    userLists = await fetchUserLists();
    userLists.sort((a, b) => a.name.localeCompare(b.name));
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

function selectAll() {
    const allSelected = {};
    drinksData.forEach(drink => {
        allSelected[drink.id] = drink;
    })

    localStorage.setItem("selectedDrinks", JSON.stringify(allSelected));

    document.querySelectorAll(".drink-checkbox").forEach(cb => {
        cb.checked = true;
    });
}

function deselectAll() {
    localStorage.removeItem("selectedDrinks");
    document.querySelectorAll(".drink-checkbox").forEach(cb => {
        cb.checked = false;
    });
}


function clearFilters() {
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
}

document.getElementById("clear-filters-btn").addEventListener("click", clearFilters);

function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../login/index.html";
        return false;
    }
    return token;
}

function handleNavigateToRanking() {
    window.location.href = "/ranking/";
}
