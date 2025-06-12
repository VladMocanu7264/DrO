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
const filterList = document.querySelector('.filter-list');


const mockedCategories = [
    { id: 1, name: "soda" },
    { id: 2, name: "energy" },
    { id: 3, name: "juice" },
    { id: 4, name: "water" },
];

const mockedDrinks = [
    { id: 1, name: "Coca-Cola", category: "soda", quantity: 500, listCount: 100, image: "../public/poze/cocacola.png" },
    { id: 2, name: "Pepsi", category: "soda", quantity: 250, listCount: 200, image: "../public/poze/pepsi.png" },
    { id: 3, name: "Fanta", category: "soda", quantity: 300, listCount: 300, image: "../public/poze/fanta.png" },
    { id: 4, name: "Sprite", category: "soda", quantity: 400, listCount: 50, image: "../public/poze/sprite.png" },
    { id: 5, name: "Mountain Dew", category: "soda", quantity: 100, listCount: 70, image: "../public/poze/smoothie.png" },
    { id: 6, name: "Dr Pepper", category: "soda", quantity: 250, listCount: 500, image: "../public/poze/drpepper.png" },
    { id: 7, name: "7UP", category: "soda", quantity: 300, listCount: 130, image: "../public/poze/7up.png" },
    { id: 8, name: "Schweppes", category: "soda", quantity: 400, listCount: 150, image: "../public/poze/smoothie.png" },
    { id: 9, name: "Red Bull", category: "energy", quantity: 100, listCount: 120, image: "../public/poze/redbull.png" },
    { id: 10, name: "Monster", category: "energy", quantity: 100, listCount: 210, image: "../public/poze/smoothie.png" },
    { id: 11, name: "Rockstar", category: "energy", quantity: 200, listCount: 220, image: "../public/poze/rockstar.png" },
    { id: 12, name: "NOS", category: "energy", quantity: 500, listCount: 350, image: "../public/poze/smoothie.png" }
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
        render();
        initEventListeners();
    } catch (err) {
        console.error("Eroare încărcare băuturi:", err);
    }
}


function render() {
    drinksData = [...mockedDrinks];
    drinksData.sort((a, b) => b.listCount - a.listCount);
    cardsContainer.innerHTML = '';
    modalsContainer.innerHTML = '';

    const totalItems = drinksData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = drinksData.slice(start, end);

    pageData.forEach((drink, index) => {
        cardsContainer.appendChild(createDrinkCard(drink, index));
        modalsContainer.appendChild(createDrinkModal(drink));
    });

    renderPagination(totalPages);
}


function createDrinkCard(drink, index) {
    const card = document.createElement('div');
    card.classList.add('rectangle');
    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;

    card.innerHTML = `
    <div class="drink-header">
        <div class="drink-list-count">
            <p><strong>Liste:</strong> ${drink.listCount}</p>
        </div>
        <div class="drink-index">
            <p>${globalIndex}</p>
        </div>
    </div>
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
            render();
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

document.addEventListener('DOMContentLoaded', getGroups);
