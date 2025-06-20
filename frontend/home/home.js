let originalData = [];
let drinksData = [];
let currentPage = 1;
const itemsPerPage = 10;

const cardsContainer = document.querySelector(".cards-container");
const modalsContainer = document.querySelector("#text-box-container");
const overlay = document.querySelector(".overlay");
const body = document.body;
const sortSelect = document.getElementById("sort-select");
const searchInput = document.getElementById("search-drink");
const quantityRange = document.getElementById("quantity-range");
const quantityValue = document.getElementById("quantity-value");
const paginationContainer = document.querySelector('.pagination');
const categoryList = document.querySelector('.filter-list');
const nutritionList = document.querySelector('.nutrition-list');


const mockedCategories = [
  { id: 1, name: "soda" },
  { id: 2, name: "energy" },
  { id: 3, name: "juice" },
  { id: 4, name: "water" },
];

const mockedNutritionScores = [
  { id: 1, name: "A" },
  { id: 2, name: "B" },
  { id: 3, name: "C" },
  { id: 4, name: "D" },
  { id: 5, name: "E" },
];

const mockedDrinks = [
  { id: 1, name: "Coca-Cola", category: "soda", nutrition_grade: "A", quantity: 500, image: "../public/poze/cocacola.png" },
  { id: 2, name: "Pepsi", category: "soda", nutrition_grade: "A", quantity: 250, image: "../public/poze/pepsi.png" },
  { id: 3, name: "Fanta", category: "soda", nutrition_grade: "B", quantity: 300, image: "../public/poze/fanta.png" },
  { id: 4, name: "Sprite", category: "soda", nutrition_grade: "C", quantity: 400, image: "../public/poze/sprite.png" },
  { id: 5, name: "Mountain Dew", category: "soda", nutrition_grade: "D", quantity: 100, image: "../public/poze/smoothie.png" },
  { id: 6, name: "Dr Pepper", category: "soda", nutrition_grade: "D", quantity: 250, image: "../public/poze/drpepper.png" },
  { id: 7, name: "7UP", category: "soda", nutrition_grade: "E", quantity: 300, image: "../public/poze/7up.png" },
  { id: 8, name: "Schweppes", category: "soda", nutrition_grade: "E", quantity: 400, image: "../public/poze/smoothie.png" },
  { id: 9, name: "Red Bull", category: "energy", nutrition_grade: "E", quantity: 100, image: "../public/poze/redbull.png" },
  { id: 10, name: "Monster", category: "energy", nutrition_grade: "C", quantity: 100, image: "../public/poze/smoothie.png" },
  { id: 11, name: "Rockstar", category: "energy", nutrition_grade: "C", quantity: 200, image: "../public/poze/rockstar.png" },
  { id: 12, name: "NOS", category: "water", nutrition_grade: "A", quantity: 500, image: "../public/poze/smoothie.png" }
];

const mockedListsNames = [
  { id: 1, name: "Lista 1" },
  { id: 2, name: "Lista 2" },
  { id: 3, name: "Lista 3" },
  { id: 4, name: "Lista 4" },
];

const fetchDrinks = async () => {
  // const response = await fetch("http://localhost:3000/api/drinks", {
  //   method: "GET",
  //   headers: { "Content-Type": "application/json" }
  // });
  // if (!response.ok) throw new Error("Network error");
  // return await response.json();
  return mockedDrinks;
};

async function getGroups() {
  try {
    originalData = await fetchDrinks();
    setupSort();
    loadCategoryFilters();
    loadNutritionFilters();
    setupFilterListeners();
    applyFiltersAndRender();
    setupPriceRange();
    initEventListeners();
  } catch (err) {
    console.error("Eroare încărcare băuturi:", err);
  }
}

function setupSort() {
  if (!sortSelect) return;
  sortSelect.addEventListener("change", () => {
    currentPage = 1;
    applyFiltersAndRender();
  });
}

function loadCategoryFilters() {

  if (!categoryList) return;

  mockedCategories.forEach(cat => {
    const filterItem = document.createElement('div');
    filterItem.classList.add('filter-item');
    filterItem.innerHTML = `
      <input type="checkbox" id="filter-${cat.name}" name="category" value="${cat.name}" />
      <label for="filter-${cat.name}">${cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}</label>
    `;
    categoryList.appendChild(filterItem);
  });
  const categoryInputs = categoryList.querySelectorAll('input[name="category"]');
  categoryInputs.forEach(cb =>
    cb.addEventListener('change', () => {
      currentPage = 1;
      applyFiltersAndRender();
    })
  );

}

function loadNutritionFilters() {

  if (!nutritionList) return;

  mockedNutritionScores.forEach(cat => {
    const filterItem = document.createElement('div');
    filterItem.classList.add('filter-item');
    filterItem.innerHTML = `
      <input type="checkbox" id="filter-${cat.name}" name="nutrition" value="${cat.name}" />
      <label for="filter-${cat.name}">${cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}</label>
    `;
    nutritionList.appendChild(filterItem);
  });
  const nutritionInputs = nutritionList.querySelectorAll('input[name="nutrition"]');
  nutritionInputs.forEach(cb =>
    cb.addEventListener('change', () => {
      currentPage = 1;
      applyFiltersAndRender();
    })
  );

}

function setupPriceRange() {
  const quantitySlider = document.getElementById('quantity-range');
  const quantityValueDisplay = document.getElementById('quantity-value');

  function updateQuantityValue() {
    quantityValueDisplay.textContent = quantitySlider.value;
  }

  updateQuantityValue();
  quantitySlider.addEventListener('input', updateQuantityValue);
};


function setupFilterListeners() {
  if (searchInput) searchInput.addEventListener("input", () => {
    currentPage = 1;
    applyFiltersAndRender();
  });
  if (quantityRange && quantityValue) {
    quantityValue.textContent = quantityRange.value;
    quantityRange.addEventListener("input", () => {
      quantityValue.textContent = quantityValue.value;
      currentPage = 1;
      applyFiltersAndRender();
    });
  }
}

function applyFiltersAndRender() {
  drinksData = [...originalData];

  if (searchInput) {
    const term = searchInput.value.trim().toLowerCase();
    if (term) {
      drinksData = drinksData.filter(d =>
        d.name.toLowerCase().includes(term)
      );
    }
  }

  const categoryInputs = document.querySelectorAll('input[name="category"]');
  const nutritionInputs = document.querySelectorAll('input[name="nutrition"]');

  const selectedCats = Array.from(categoryInputs)
    .filter(cb => cb.checked)
    .map(cb => cb.value.toLowerCase());
  if (selectedCats.length) {
    drinksData = drinksData.filter(d =>
      selectedCats.includes(d.category.toLowerCase())
    );
  }

  const selectedNutrition = Array.from(nutritionInputs)
    .filter(cb => cb.checked)
    .map(cb => cb.value.toLowerCase());
  if (selectedNutrition.length) {
    drinksData = drinksData.filter(d =>
      selectedNutrition.includes(d.nutrition_grade.toLowerCase())
    );
  }

  if (quantityRange) {
    const max = parseFloat(quantityRange.value);
    drinksData = drinksData.filter(d =>
      d.quantity === undefined || d.quantity <= max
    );
  }

  sortData(sortSelect.value);

  render();
  initEventListeners();
}

function sortData(criterion) {
  switch (criterion) {
    case 'name-asc':
      drinksData.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      drinksData.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'category-asc':
      drinksData.sort((a, b) => a.category.localeCompare(b.category));
      break;
    case 'category-desc':
      drinksData.sort((a, b) => b.category.localeCompare(a.category));
      break;
    case 'quantity-asc':
      drinksData.sort((a, b) => (a.quantity || 0) - (b.quantity || 0));
      break;
    case 'quantity-desc':
      drinksData.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
      break;
  }
}

function render() {
  cardsContainer.innerHTML = '';
  modalsContainer.innerHTML = '';

  const totalItems = drinksData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageData = drinksData.slice(start, end);

  pageData.forEach(drink => {
    cardsContainer.appendChild(createDrinkCard(drink));
    modalsContainer.appendChild(createDrinkModal(drink));
  });

  renderPagination(totalPages);
}

function createDrinkCard(drink) {
  const card = document.createElement('div');
  card.classList.add('rectangle');
  card.innerHTML = `
      <div class="content">
        <img class="drink-img" src="${drink.image}" alt="${drink.name}">
      </div>
      <h3>${drink.name}</h3>
      <p><strong>Categorie:</strong> ${drink.category}</p>
      <p><strong>Cantitate:</strong> ${drink.quantity}</p>
      <div class="btn">
        <button class="read-more" data-index="${drink.id}">Detalii</button>
      </div>
  `;
  return card;
}

const handleSelectFavoriteList = (event) => {
  const selectedListId = event.target.value;
  console.log("Selected list ID:", selectedListId);
}

const handleAddToFavorite = (drinkId) => {
  console.log("Drink id", drinkId)
}

function createDrinkModal(drink) {
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
          <p id="drink-category"><strong>Categorie:&nbsp;</strong> ${drink.category}</p>
          <p id="drink-category"><strong>Cantitate:&nbsp;</strong> ${drink.quantity || 0} Litri</p>
          <p id="drink-description">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
        </div>
        <div id="icons-container">
          <img id="drink-image-box" src="${drink.image}" alt="${drink.name}">
          <div id="menu-icons-container">
              <a href="/rss">
              <i class="fa-regular fa-heart icon-menu"></i>
              </a>
              <a>
              <i class="fa-solid fa-plus icon-menu add-favorite"  data-drink-id="${drink.id}"></i>
              </a>
              <a href="/rss">
              <i class="fa-solid fa-share  icon-menu"></i>
              </a>
          </div>
        </div>   
        </div>
           <div class="favorite-section">
            <label for="favorite-list" class="favorite-label">Liste:</label>
            <select id="favorite-list-${drink.id}" class="favorite-select">
              <option value="" disabled selected>Selectează o listă</option>
              ${mockedListsNames.map(list => `
                <option value="${list.id}">${list.name}</option>
              `).join('')}
            </select> 
          </div>
    </div>
  `;
  return modal;
}

function renderPagination(totalPages) {
  if (!paginationContainer) return;
  paginationContainer.innerHTML = '';

  for (let p = 1; p <= totalPages; p++) {
    const btn = document.createElement('button');
    btn.textContent = p;
    btn.classList.add('page-btn');
    if (p === currentPage) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentPage = p;
      applyFiltersAndRender();
    });
    paginationContainer.appendChild(btn);
  }
}

function initEventListeners() {
  document.querySelectorAll('.read-more').forEach(btn =>
    btn.addEventListener('click', () => toggleModal(btn.dataset.index, true))
  );
  document.querySelectorAll('.close-modal').forEach(btn =>
    btn.addEventListener('click', () => toggleModal(btn.dataset.index, false))
  );
  overlay.addEventListener('click', closeAllModals);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllModals();
  });

  document.querySelectorAll(".add-favorite").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const drinkId = e.target.dataset.drinkId;
      const select = document.getElementById(`favorite-list-${drinkId}`);
      const selectedListId = select?.value;

      if (!selectedListId) {
        alert("Selectează o listă mai întâi!");
        return;
      }

      const drink = originalData.find(d => d.id == drinkId);
      const listName = mockedListsNames.find(l => l.id == selectedListId)?.name;

      console.log(`Adăugat "${drink.name}" în lista: ${listName}`);
    });
  });

}

function toggleModal(idx, show) {
  const m = document.getElementById(`text-box-${idx}`);
  if (!m) return;
  m.classList.toggle('hidden', !show);
  overlay.classList.toggle('hidden', !show);
  body.classList.toggle('no-scroll', show);
}

function closeAllModals() {
  document.querySelectorAll('.text-box:not(.hidden)')
    .forEach(m => m.classList.add('hidden'));
  overlay.classList.add('hidden');
  body.classList.remove('no-scroll');
}


function handleNavigateToRanking() {
  window.location.href = `../views/ranking.html`;
}


document.addEventListener('DOMContentLoaded', getGroups);
