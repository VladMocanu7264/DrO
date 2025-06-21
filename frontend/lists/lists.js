// let originalData = [];
// let drinksData = [];
// let currentPage = 1;
// const itemsPerPage = 10;

// const cardsContainer = document.querySelector(".cards-container");
// const modalsContainer = document.querySelector("#text-box-container");
// const overlay = document.querySelector(".overlay");
// const body = document.body;
// const sortSelect = document.getElementById("sort-select");
// const paginationContainer = document.querySelector('.pagination');
// const selectedList = document.getElementById('selected-list');
// const deselectListBtn = document.getElementById('deselect-list');
// const selectedListDiv = document.getElementById('selected-list');
// const publicBtn = document.getElementById('public-btn');

// let selectedGroupId = null;

// const mockedDrinks = [
//     { id: 1, name: "Coca-Cola", category: "soda", quantity: 500, image: "../public/poze/cocacola.png" },
//     { id: 2, name: "Pepsi", category: "soda", quantity: 250, image: "../public/poze/pepsi.png" },
//     { id: 3, name: "Fanta", category: "soda", quantity: 300, image: "../public/poze/fanta.png" },
//     { id: 4, name: "Sprite", category: "soda", quantity: 400, image: "../public/poze/sprite.png" },
//     { id: 5, name: "Mountain Dew", category: "soda", quantity: 100, image: "../public/poze/smoothie.png" },
//     { id: 6, name: "Dr Pepper", category: "soda", quantity: 250, image: "../public/poze/drpepper.png" },
//     { id: 7, name: "7UP", category: "soda", quantity: 300, image: "../public/poze/7up.png" },
//     { id: 8, name: "Schweppes", category: "soda", quantity: 400, image: "../public/poze/smoothie.png" },
//     { id: 9, name: "Red Bull", category: "energy", quantity: 100, image: "../public/poze/redbull.png" },
//     { id: 10, name: "Monster", category: "energy", quantity: 100, image: "../public/poze/smoothie.png" },
//     { id: 11, name: "Rockstar", category: "energy", quantity: 200, image: "../public/poze/rockstar.png" },
//     { id: 12, name: "NOS", category: "energy", quantity: 500, image: "../public/poze/smoothie.png" }
// ];

// const mockedLists = [
//     { id: 1, name: "Lista 1", drinks: [1, 2, 3, 4, 6, 7] },
//     { id: 2, name: "Lista 2", drinks: [4, 5, 6, 7, 8, 9] },
//     { id: 3, name: "Lista 3", drinks: [5, 6, 7, 8, 9, 10, 11, 12] },
//     { id: 4, name: "Lista 4", drinks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },

// ]

// const fetchDrinks = async () => {
//     // const response = await fetch("http://localhost:3000/api/drinks", {
//     //   method: "GET",
//     //   headers: { "Content-Type": "application/json" }
//     // });
//     // if (!response.ok) throw new Error("Network error");
//     // return await response.json();
//     return mockedDrinks;
// };

// async function getGroups() {
//     try {
//         originalData = await fetchDrinks();
//         setupSort();
//         applyFiltersAndRender();
//         initEventListeners();
//     } catch (err) {
//         console.error("Eroare încărcare băuturi:", err);
//     }
// }

// /***----------- Sort -----------***/

// function setupSort() {
//     if (!sortSelect) return;
//     sortSelect.addEventListener("change", () => {
//         currentPage = 1;
//         applyFiltersAndRender();
//     });
// }

// function sortData(criterion) {
//     switch (criterion) {
//         case 'name-asc':
//             drinksData.sort((a, b) => a.name.localeCompare(b.name));
//             break;
//         case 'name-desc':
//             drinksData.sort((a, b) => b.name.localeCompare(a.name));
//             break;
//         case 'category-asc':
//             drinksData.sort((a, b) => a.category.localeCompare(b.category));
//             break;
//         case 'category-desc':
//             drinksData.sort((a, b) => b.category.localeCompare(a.category));
//             break;
//         case 'quantity-asc':
//             drinksData.sort((a, b) => (a.quantity || 0) - (b.quantity || 0));
//             break;
//         case 'quantity-desc':
//             drinksData.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
//             break;
//     }
// }

// /***----------- Render -----------***/
// function applyFiltersAndRender() {
//     drinksData = [...originalData];

//     if (selectedGroupId) {
//         const selectedList = mockedLists
//             .find(l => l.id === selectedGroupId);
//         if (selectedList) {
//             drinksData = drinksData.filter(drink => selectedList.drinks.includes(drink.id));
//         }
//     }

//     sortData(sortSelect.value);

//     render();
//     initEventListeners();
// }



// function render() {
//     cardsContainer.innerHTML = '';
//     modalsContainer.innerHTML = '';

//     const totalItems = drinksData.length;
//     const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
//     const start = (currentPage - 1) * itemsPerPage;
//     const end = start + itemsPerPage;
//     const pageData = drinksData.slice(start, end);

//     pageData.forEach(drink => {
//         cardsContainer.appendChild(createDrinkCard(drink));
//         modalsContainer.appendChild(createDrinkModal(drink));
//     });

//     renderPagination(totalPages);
//     generateRadioFilter();
// }

// function renderPagination(totalPages) {
//     if (!paginationContainer) return;
//     paginationContainer.innerHTML = '';

//     for (let p = 1; p <= totalPages; p++) {
//         const btn = document.createElement('button');
//         btn.textContent = p;
//         btn.classList.add('page-btn');
//         if (p === currentPage) btn.classList.add('active');
//         btn.addEventListener('click', () => {
//             currentPage = p;
//             applyFiltersAndRender();
//         });
//         paginationContainer.appendChild(btn);
//     }
// }


// /***----------- Drinks -----------***/

// function createDrinkCard(drink) {
//     const card = document.createElement('div');
//     card.classList.add('rectangle');
//     card.innerHTML = `
//       <div class="content">
//       <img class="drink-img" src="${drink.image}" alt="${drink.name}">
//     </div>
//     <h3>${drink.name}</h3>
//       <p><strong>Categorie:</strong> ${drink.category}</p>
//       <p><strong>Cantitate:</strong> ${drink.quantity} Litri</p>

//     <div class="btn">
//       <button class="read-more" data-index="${drink.id}">Detalii</button>
//     </div>
//   `;
//     card.querySelector('.read-more').addEventListener('click', () => toggleModal(drink.id, true));
//     return card;
// }

// function createDrinkModal(drink) {
//     const modal = document.createElement('div');
//     modal.classList.add('text-box', 'hidden');
//     modal.id = `text-box-${drink.id}`;
//     Object.assign(modal.style, {
//         position: 'fixed', top: '50%', left: '50%',
//         transform: 'translate(-50%,-50%)', zIndex: '10'
//     });
//     modal.innerHTML = `
//     <button class="close-modal" data-index="${drink.id}">&times;</button>
//     <div class="drink-details">
//       <p id="drink-title">${drink.name}</p>
//       <div class="drink-content">
//         <div class="drink-text">
//           <p id="drink-category"><strong>Categorie:&nbsp;</strong> ${drink.category}</p>
//           <p id="drink-category"><strong>Cantitate:&nbsp;</strong> ${drink.quantity} Litri</p>
//           <p id="drink-description">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
//         </div>
//         <div id="icons-container">
//           <img id="drink-image-box" src="${drink.image}" alt="${drink.name}">
//           <div id="menu-icons-container">
//               <a href="/rss">
//               <i class="fa-regular fa-heart icon-menu"></i>
//               </a>
//               <a>
//               <i class="fa-solid fa-plus icon-menu add-favorite"  data-drink-id="${drink.id}"></i>
//               </a>
//               <a href="/rss">
//               <i class="fa-solid fa-share  icon-menu"></i>
//               </a>
//           </div>
//         </div>   
//         </div>
//            <div class="favorite-section">
//             <label for="favorite-list" class="favorite-label">Liste:</label>
//             <select id="favorite-list-${drink.id}" class="favorite-select">
//               <option value="" disabled selected>Selectează o listă</option>
//               ${mockedLists
//             .map(list => `
//                 <option value="${list.id}">${list.name}</option>
//               `).join('')}
//             </select> 
//           </div>
//     </div>
//   `;
//     modal.querySelector('.close-modal').addEventListener('click', () => toggleModal(drink.id, false));
//     modal.querySelector(".add-favorite").addEventListener("click", (e) => {
//         const select = document.getElementById(`favorite-list-${drink.id}`);
//         const selectedListId = parseInt(select?.value);

//         if (!selectedListId) {
//             alert("Selectează o listă mai întâi!");
//             return;
//         }

//         const drinkData = originalData.find(d => d.id == drink.id);
//         const listName = mockedLists
//             .find(l => l.id == selectedListId)?.name;

//         if (!mockedLists
//             .find(l => l.id == selectedListId).drinks.includes(drink.id)) {
//             mockedLists
//                 .find(l => l.id == selectedListId).drinks.push(drink.id);
//             alert(`Băutura a fost adăugată în lista ${listName}`);
//         } else {
//             alert("Băutura este deja în această listă!");
//         }
//     });
//     return modal;
// }


// function generateRadioFilter(inputName = 'category') {
//     const container = document.querySelector('.filter-list');
//     if (!container) return;

//     container.innerHTML = '';

//     mockedLists
//         .forEach((list) => {
//             const item = document.createElement('div');
//             item.classList.add('filter-item');

//             const input = document.createElement('input');
//             input.type = 'radio';
//             input.id = `filter-${list.id}`;
//             input.name = inputName;
//             input.value = list.id;

//             if (selectedGroupId === list.id) {
//                 input.checked = true;
//             }

//             const label = document.createElement('label');
//             label.setAttribute('for', input.id);
//             label.textContent = list.name;

//             input.addEventListener('change', () => {
//                 selectedGroupId = parseInt(input.value);
//                 currentPage = 1;

//                 if (selectedGroupId) {
//                     selectedListDiv.style.display = 'block';
//                     selectedListDiv.innerText = `${list.name}`;
//                     publicBtn.style.display = 'block';
//                 } else {
//                     selectedListDiv.style.display = 'none';
//                 }

//                 applyFiltersAndRender();
//             });

//             item.appendChild(input);
//             item.appendChild(label);
//             container.appendChild(item);
//         });
// }




// const handleAddDrinkToList = (drinkId, listId) => {
//     drinkId = parseInt(drinkId);
//     listId = parseInt(listId);

//     const list = mockedLists
//         .find(l => l.id === listId);
//     if (!list) {
//         alert("Lista selectată nu există!");
//         return;
//     }

//     if (list.drinks.includes(drinkId)) {
//         alert("Băutura este deja în această listă!");
//         return;
//     }

//     list.drinks.push(drinkId);
//     console.log(`Băutura ${drinkId} a fost adăugată în lista ${list.name}`);
//     alert(`Băutura a fost adăugată în lista ${list.name}`);
// }


// function toggleModal(idx, show) {
//     const m = document.getElementById(`text-box-${idx}`);
//     if (!m) return;
//     m.classList.toggle('hidden', !show);
//     overlay.classList.toggle('hidden', !show);
//     body.classList.toggle('no-scroll', show);
// }

// function closeAllModals() {
//     document.querySelectorAll('.text-box:not(.hidden)')
//         .forEach(m => m.classList.add('hidden'));
//     overlay.classList.add('hidden');
//     body.classList.remove('no-scroll');
// }


// function handleAddList() {
//     const input = document.getElementById('new-list-name');
//     const exists = mockedLists
//         .find(l => l.name === input.value.trim());

//     if (exists) {
//         alert("O listă cu acest nume există deja!");
//         input.value = '';
//         return;
//     }

//     mockedLists
//         .push({
//             id: mockedLists
//                 .length > 0 ? mockedLists
//                 [mockedLists
//                     .length - 1].id + 1 : 1,
//             name: input.value.trim(),
//             drinks: []
//         });

//     input.value = '';
//     render();
//     initEventListeners();
// }

// function handleDeselectList() {
//     selectedGroupId = '';
//     selectedListDiv.style.display = 'none';
//     publicBtn.style.display = 'none';
//     applyFiltersAndRender();
// }

// function handleMakePublic() {
//     if (!selectedGroupId) {
//         alert("Selectează o listă mai întâi!");
//         return;
//     }
//     alert(`Am facut lista cu id ${selectedGroupId} publică`);
// }


// function initEventListeners() {
//     overlay.addEventListener('click', closeAllModals);
//     document.addEventListener('keydown', e => {
//         if (e.key === 'Escape') closeAllModals();
//     });
// }

// document.addEventListener('DOMContentLoaded', getGroups);

// ✅ INTEGRATED WITH API & JWT while preserving mock logic as fallback

const API_BASE_URL = window.env.API_BASE_URL;
let token = localStorage.getItem("token");

let originalData = [];
let drinksData = [];
let currentPage = 1;
const itemsPerPage = 10;

const cardsContainer = document.querySelector(".cards-container");
const modalsContainer = document.querySelector("#text-box-container");
const overlay = document.querySelector(".overlay");
const body = document.body;
const sortSelect = document.getElementById("sort-select");
const paginationContainer = document.querySelector('.pagination');
const selectedListDiv = document.getElementById('selected-list');
const publicBtn = document.getElementById('public-btn');

let selectedGroupId = null;

const fallbackDrinks = [...mockedDrinks];
const fallbackLists = [...mockedLists];

async function fetchDrinksFromAPI() {
  try {
    const res = await fetch(`${API_BASE_URL}/drinks/feed?limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Eșec API");
    return await res.json();
  } catch (err) {
    console.warn("Folosim fallback mock drinks", err);
    return fallbackDrinks;
  }
}

async function fetchListsFromAPI() {
  // Simulat pentru acum, până se integrează endpointul real
  return fallbackLists;
}

async function getGroups() {
  try {
    const [drinks, lists] = await Promise.all([
      fetchDrinksFromAPI(),
      fetchListsFromAPI()
    ]);

    originalData = drinks;
    mockedLists.length = 0;
    mockedLists.push(...lists);

    setupSort();
    applyFiltersAndRender();
    initEventListeners();
  } catch (err) {
    console.error("Eroare încărcare date:", err);
  }
}

function setupSort() {
  if (!sortSelect) return;
  sortSelect.addEventListener("change", () => {
    currentPage = 1;
    applyFiltersAndRender();
  });
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

function applyFiltersAndRender() {
  drinksData = [...originalData];

  if (selectedGroupId) {
    const selectedList = mockedLists.find(l => l.id === selectedGroupId);
    if (selectedList) {
      drinksData = drinksData.filter(drink => selectedList.drinks.includes(drink.id));
    }
  }

  sortData(sortSelect?.value);
  render();
  initEventListeners();
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
  generateRadioFilter();
}

function renderPagination(totalPages) {
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

function createDrinkCard(drink) {
  const card = document.createElement('div');
  card.classList.add('rectangle');
  card.innerHTML = `
    <div class="content">
      <img class="drink-img" src="${drink.image_url || drink.image}" alt="${drink.name}">
    </div>
    <h3>${drink.name}</h3>
    <p><strong>Categorie:</strong> ${drink.category || drink.brand || '-'}</p>
    <p><strong>Cantitate:</strong> ${drink.quantity || 0} ml</p>
    <div class="btn">
      <button class="read-more" data-index="${drink.id}">Detalii</button>
    </div>
  `;
  card.querySelector('.read-more').addEventListener('click', () => toggleModal(drink.id, true));
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
          <p id="drink-category"><strong>Categorie:</strong> ${drink.category || drink.brand || '-'}</p>
          <p id="drink-category"><strong>Cantitate:</strong> ${drink.quantity || 0} ml</p>
          <p id="drink-description">Aceasta este o băutură răcoritoare de test. Nu conține informații adiționale din API.</p>
        </div>
        <div id="icons-container">
          <img id="drink-image-box" src="${drink.image_url || drink.image}" alt="${drink.name}">
          <div id="menu-icons-container">
              <i class="fa-regular fa-heart icon-menu"></i>
              <i class="fa-solid fa-plus icon-menu"></i>
              <i class="fa-solid fa-share icon-menu"></i>
          </div>
        </div>
      </div>
    </div>
  `;
  modal.querySelector(".close-modal").addEventListener("click", () => toggleModal(drink.id, false));
  return modal;
}

function generateRadioFilter() {
  const container = document.querySelector('.filter-list');
  if (!container) return;
  container.innerHTML = '';

  mockedLists.forEach(list => {
    const item = document.createElement('div');
    item.classList.add('filter-item');

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'category';
    input.id = `filter-${list.id}`;
    input.value = list.id;
    if (selectedGroupId === list.id) input.checked = true;

    input.addEventListener('change', () => {
      selectedGroupId = parseInt(input.value);
      currentPage = 1;
      selectedListDiv.textContent = list.name;
      selectedListDiv.style.display = 'block';
      publicBtn.style.display = 'block';
      applyFiltersAndRender();
    });

    const label = document.createElement('label');
    label.setAttribute('for', input.id);
    label.textContent = list.name;

    item.appendChild(input);
    item.appendChild(label);
    container.appendChild(item);
  });
}

function toggleModal(id, show) {
  const m = document.getElementById(`text-box-${id}`);
  if (!m) return;
  m.classList.toggle('hidden', !show);
  overlay.classList.toggle('hidden', !show);
  body.classList.toggle('no-scroll', show);
}

function closeAllModals() {
  document.querySelectorAll('.text-box:not(.hidden)').forEach(m => m.classList.add('hidden'));
  overlay.classList.add('hidden');
  body.classList.remove('no-scroll');
}

document.addEventListener("DOMContentLoaded", getGroups);