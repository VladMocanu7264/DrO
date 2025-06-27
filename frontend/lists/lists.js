const API_BASE_URL = "http://localhost:3000";

async function getDrinkDetails(drinkId) {
  if (!drinkId) {
    alert("ID-ul băuturii lipsește.");
    return;
  }
  const token = checkAuth();
  try {
    const response = await fetch(`${API_BASE_URL}/drinks/${drinkId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Eroare la obținerea detaliilor băuturii");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    alert("Eroare:" + error);
  }
}

async function getListWithDrink(drinkId) {
  if (!drinkId) {
    alert("ID-ul băuturii lipsește.");
    return;
  }
  const token = checkAuth();
  try {
    const response = await fetch(`${API_BASE_URL}/lists/with-drink/${drinkId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Eroare la obținerea listei cu băutura");
    }
    const data = await response.json();
    return data.list;
  } catch (error) {
    alert("Eroare:" + error);
  }
}

async function getFavoritesDrinks() {
  const token = checkAuth();
  try {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Eroare la obținerea băuturilor favorite");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    alert("Eroare:" + error);
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
      body: JSON.stringify({ drinkId })
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

async function deleteDrinkFromList(drinkId, listId) {
  if (!drinkId || !listId) {
    alert("ID-ul băuturii sau al listei lipsește.");
    return;
  }
  const token = checkAuth();
  try {
    const response = await fetch(`${API_BASE_URL}/lists/${listId}/remove`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ drinkId })
    });

    if (!response.ok) {
      throw new Error("Eroare la ștergerea băuturii din listă");
    }
    const data = await response.json();
    return true;
    alert(`Băutura a fost ștearsă din listă.`);
  } catch (error) {
    alert("Eroare:" + error);
    return false;
  }
}

async function getListById(listId) {
  if (!listId) {
    alert("ID-ul listei lipsește.");
    return;
  }
  const token = checkAuth();
  try {
    const response = await fetch(`${API_BASE_URL}/lists/${listId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error("Eroare la obținerea detaliilor listei");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    alert("Eroare:" + error);
  }
}

async function createList(name) {
  if (!name) {
    alert("Numele listei lipsește.");
    return;
  }
  const token = checkAuth();
  try {
    const response = await fetch(`${API_BASE_URL}/lists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name, public: false })
    });
    if (response.status === 400) {
      throw new Error("Numele listei nu poate fi gol sau prea lung.");
    }
    if (!response.ok) {
      throw new Error("Eroare la crearea listei");
    }

  }
  catch (error) {
    alert("Eroare:" + error);
  }
}

async function updateList(listId, name, isPublic) {
  if (!listId) {
    alert("ID-ul listei lipsește.");
    return;
  }
  const token = checkAuth();
  try {
    const response = await fetch(`${API_BASE_URL}/lists/${listId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name, public: isPublic })
    });
    if (!response.ok) {
      throw new Error("Eroare la actualizarea listei");
    }
    const data = await response.json();
    return true;
  } catch (error) {
    alert("Eroare:" + error);
    return false;
  }
}

async function deleteList(listId) {
  if (!listId) {
    alert("ID-ul listei lipsește.");
    return;
  }
  const token = checkAuth();
  try {
    const response = await fetch(`${API_BASE_URL}/lists/${listId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error("Eroare la ștergerea listei");
    }
    const data = await response.json();
    alert(`Lista a fost ștearsă cu succes.`);
    return true;
  } catch (error) {
    alert("Eroare:" + error);
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
      body: JSON.stringify({ drinkId })
    });
    if (!response.ok) {
      console.error("Response status:", response);
      throw new Error("Eroare la adăugarea băuturii în listă");
    }
    const data = await response.json();

    alert(`Băutura a fost adăugată în listă.`);
  } catch (error) {
    alert("Eroare:" + error);
  }
}

async function getAllLists() {
  const token = checkAuth();
  try {
    const response = await fetch(`${API_BASE_URL}/lists`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error("Eroare la obținerea listelor");
    }
    const data = await response.json();
    return data || [];
  } catch (error) {
    alert("Eroare:" + error);
    return [];
  }
}

async function addDrinkToFavorites(drinkId) {
  if (!drinkId) {
    alert("ID-ul băuturii lipsește.");
    return;
  }
  const token = checkAuth();
  try {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ drinkId }),
    });
    if (response.status === 400) {
      throw new Error("ID-ul băuturii lipsește sau este invalid.");
    }
    if (response.status === 404) {
      throw new Error("Băutura nu a fost găsită.");
    }
    if (response.status === 409) {
      throw new Error("Băutura este deja la favorite!");
    }
    if (response.status === 200) {
      alert("Băutura a fost adăugată la favorite!");
      return;
    }
    const data = await response.json();
    return true;
  } catch (error) {
    alert("Operațiune eșuată: " + error.message);
    return false;
  }
}

async function isDrinkFavorited(drinkId) {
  if (!drinkId) {
    alert("ID-ul băuturii lipsește.");
    return false;
  }
  const token = checkAuth();
  try {
    const response = await fetch(`${API_BASE_URL}/drinks/${drinkId}/favorite`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const { favorited } = await response.json();
    return Boolean(favorited);

  } catch (err) {
    return false;
  }
}

async function deleteDrinkFromFavorites(drinkId) {
  if (!drinkId) {
    alert("ID-ul băuturii lipsește.");
    return;
  }
  const token = checkAuth();
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/${drinkId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ drinkId }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error("Eroare la eliminarea băuturii din favorite");
    }
    return true;
  } catch (error) {
    alert("Operațiune eșuată: " + error.message);
    return false;
  }
}

let originalData = [];
let displayData = [];
let userLists = [];
let selectedListId = null;
let selectedListName = null;
let favoritesSelected = false;
let price = 0;


const cardsContainer = document.querySelector(".cards-container");
const modalsContainer = document.querySelector("#text-box-container");
const overlay = document.querySelector(".overlay");
const body = document.body;
const sortSelect = document.getElementById("sort-select");
const selectedList = document.getElementById('selected-list');
const selectedListDiv = document.getElementById('selected-list');
const publicBtn = document.getElementById('public-btn');
const privateBtn = document.getElementById('private-btn');
const deleteListBtn = document.getElementById('delete-list-btn');
const emptyListMessage = document.querySelector('.empty-post');
const editListNameContainer = document.getElementById('edit-list-name-container');


function setupSort() {
  if (!sortSelect) return;
  sortSelect.addEventListener("change", () => {
    sortData(sortSelect.value);
    if (!favoritesSelected) {
      renderDrinks();
    }
    else {
      renderFavoriteDrinks();
    }
  });
}

function sortData(criterion) {
  if (!originalData || originalData.length === 0) return;
  switch (criterion) {
    case 'name-asc':
      displayData.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      displayData.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'category-asc':
      displayData.sort((a, b) => a.category.localeCompare(b.category));
      break;
    case 'category-desc':
      displayData.sort((a, b) => b.category.localeCompare(a.category));
      break;
    case 'quantity-asc':
      displayData.sort((a, b) => (a.quantity || 0) - (b.quantity || 0));
      break;
    case 'quantity-desc':
      displayData.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
      break;
  }
}

async function applyFiltersAndRender() {
  originalData = await getListById(selectedListId).then(data => data.drinks || []);
  originalData.sort((a, b) => a.name.localeCompare(b.name));
  displayData = [...originalData];
  await renderDrinks();
  renderPriceTag();
}

function renderPriceTag() {
  const price = displayData.reduce((acc, curr) => {
    const p = parseFloat(curr.price);
    return acc + (isNaN(p) ? 0 : p);
  }, 0);

  console.log("Total price:", price);

  clearPriceTag();

  const actionButtons = document.querySelector('.list-actions-btns');
  const priceButton = document.createElement('p');
  priceButton.classList.add('price-tag');
  priceButton.textContent = `${price.toFixed(2)} Lei`;
  actionButtons.appendChild(priceButton);
}


function clearPriceTag() {
  const actionButtons = document.querySelector('.list-actions-btns');
  actionButtons.querySelectorAll('.price-tag')
    .forEach(el => el.remove());
}


function createDrinkCard(drink) {
  const selectedDrinks = JSON.parse(localStorage.getItem("selectedDrinks") || "{}");
  const isChecked = selectedDrinks.hasOwnProperty(drink.id);
  const card = document.createElement('div');
  card.classList.add('rectangle');
  card.innerHTML = `
      <div class="content">
      <img class="drink-img" src="${drink.image_url}" alt="${drink.name}">
    </div>
    <h3>${drink.name}</h3>
    <div class="drink-info">
      <p><strong>Brand:</strong> ${drink.brand || "N/A"}</p>
      <p><strong>Cantitate:</strong> ${drink.quantity || "?"} ml</p>
      <p><strong>Nutriție:</strong> ${drink.nutrition_grade || "-"}</p>
    </div>
    <label>
      <input type="checkbox" class="drink-checkbox" data-drink-id="${drink.id}" ${isChecked ? "checked" : ""}>
      Statistici
    </label>
    <div class="btn">
      <button class="read-more" data-index="${drink.id}">Detalii</button>
    </div>
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
  card.querySelector('.read-more').addEventListener('click', () => {
    toggleModal(drink.id, true)
  });
  return card;
}

function createFavoriteDrinkCard(drink) {
  const selectedDrinks = JSON.parse(localStorage.getItem("selectedDrinks") || "{}");
  const isChecked = selectedDrinks.hasOwnProperty(drink.id);
  const card = document.createElement('div');
  card.classList.add('rectangle');
  card.innerHTML = `
      <div class="content">
      <img class="drink-img" src="${drink.image_url}" alt="${drink.name}">
    </div>
    <h3>${drink.name}</h3>
    <div class="drink-info">
      <p><strong>Brand:</strong> ${drink.brand || "N/A"}</p>
      <p><strong>Cantitate:</strong> ${drink.quantity || "?"} ml</p>
      <p><strong>Nutriție:</strong> ${drink.nutrition_grade || "-"}</p>
    </div>
    <label>
      <input type="checkbox" class="drink-checkbox" data-drink-id="${drink.id}" ${isChecked ? "checked" : ""}>
      Statistici
    </label>
    <div class="btn">
      <button class="read-more" data-index="${drink.id}">Detalii</button>
    </div>
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
  card.querySelector('.read-more').addEventListener('click', () => {
    toggleModal(drink.id, true)
  });
  return card;
}

async function createDrinkModal(drink) {
  const modal = document.createElement('div');
  modal.classList.add('text-box', 'hidden');
  modal.id = `text-box-${drink.id}`;
  Object.assign(modal.style, {
    position: 'fixed', top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)', zIndex: '10'
  });

  const deleteButtonHtml = favoritesSelected
    ? `<i class="fa-solid fa-trash icon-menu delete-favorite" data-drink-id="${drink.id}" title="Șterge de la favorite"></i>`
    : `<i class="fa-solid fa-trash icon-menu delete-from-list" data-drink-id="${drink.id}" title="Șterge din listă"></i>`;

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
          <p><strong>Preț:</strong> ${drink.price || "-"} ${drink.price ? "Lei" : ""}</p>
        </div>
        <div id="icons-container">
          <img id="drink-image-box" src="${drink.image_url}" alt="${drink.name}">
          <div id="menu-icons-container">
            <i class="fa-regular fa-heart icon-menu add-favorite" data-drink-id="${drink.id}" title="Adaugă la favorite"></i>
            <i class="fa-solid fa-plus icon-menu add-to-list" title="Adaugă în listă"></i>
            <i class="fa-solid fa-share icon-menu share" title="Share"></i>
            ${deleteButtonHtml}
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

  const isFavorite = await isDrinkFavorited(drink.id);
  if (isFavorite) {
    const addFavoriteIcon = modal.querySelector('.add-favorite');
    addFavoriteIcon.classList.remove('fa-regular');
    addFavoriteIcon.classList.add('fa-solid');
    addFavoriteIcon.style.color = 'red';
  }
  modal.querySelector('.close-modal')
    .addEventListener('click', () => toggleModal(drink.id, false));

  modal.querySelector('.add-favorite')
    .addEventListener('click', async e => {
      e.stopPropagation();
      await addDrinkToFavorites(e.target.dataset.drinkId);
      const addFavoriteIcon = modal.querySelector('.add-favorite');
      addFavoriteIcon.classList.remove('fa-regular');
      addFavoriteIcon.classList.add('fa-solid');
      addFavoriteIcon.style.color = 'red';
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

  const delFavBtn = modal.querySelector('.delete-favorite');
  if (delFavBtn) {
    delFavBtn.addEventListener('click', async () => {
      let favoriteDrinkDeleted = await deleteDrinkFromFavorites(drink.id)
      if (favoriteDrinkDeleted) {
        closeAllModals();
        originalData = originalData.filter(d => d.id !== drink.id);
        displayData = displayData.filter(d => d.id !== drink.id);
        renderFavoriteDrinks();
      }
    });
  }
  const delListBtn = modal.querySelector('.delete-from-list');
  if (delListBtn) {
    delListBtn.addEventListener('click', async () => {
      let drinkDeleted = await deleteDrinkFromList(drink.id, selectedListId);
      if (drinkDeleted) {
        closeAllModals();
        originalData = originalData.filter(d => d.id !== drink.id);
        displayData = displayData.filter(d => d.id !== drink.id);
        renderDrinks();
      }
    });
  }
  modal.querySelector('.share')
    .addEventListener('click', () => {
      window.location.href = `../create-post/index.html?drinkId=${drink.id}`;
    });

  return modal;
}


async function handleAddDrinkToFavorites(drinkId) {
  const addedToFavorites = await addDrinkToFavorites(drinkId);
  if (addedToFavorites) {
    alert("Băutura a fost adăugată la favorite!");
  }
};

async function generateRadioFilter(inputName = 'user-list') {
  const lists = await getAllLists();
  lists.sort((a, b) => a.createdAt < b.createdAt ? -1 : +1);
  const container = document.querySelector('.filter-list');
  container.innerHTML = '';
  lists.forEach(list => {
    const item = document.createElement('div');
    item.classList.add('filter-item');
    item.innerHTML = `
      <input
        type="radio"
        name="${inputName}"
        id="filter-${list.id}"
        value="${list.id}"
      >
      <label for="filter-${list.id}">${list.name}</label>
    `;
    const radio = item.querySelector('input');
    if (selectedListId === list.id) {
      radio.checked = true;
    }
    radio.addEventListener('change', () => {
      editListNameContainer.style.display = 'block';
      favoritesSelected = false;
      emptyListMessage.style.display = 'none';
      publicBtn.style.display = 'none';
      privateBtn.style.display = 'none';
      deleteListBtn.style.display = 'block';
      document.querySelector('.sort-section').style.display = 'flex';
      selectedListId = parseInt(radio.value);
      selectedListName = list.name;
      if (!list.public) {
        publicBtn.style.display = 'block';
        publicBtn.dataset.listId = list.id;
      } else {
        privateBtn.style.display = 'block';
        privateBtn.dataset.listId = list.id;
      }
      applyFiltersAndRender();
    });
    container.appendChild(item);
  });
  userLists = lists;
}

async function renderDrinks() {
  cardsContainer.innerHTML = '';
  modalsContainer.innerHTML = '';

  displayData.forEach((drink, idx) => {
    cardsContainer.appendChild(createDrinkCard(drink, idx));
  });

  const modalPromises = originalData.map(async (d) => {
    const drinkDetails = await getDrinkDetails(d.id);
    return createDrinkModal(drinkDetails);
  });

  const modals = await Promise.all(modalPromises);
  modals.forEach(m => modalsContainer.appendChild(m));
  renderPriceTag();
  initEventListeners();
}

async function renderFavoriteDrinks() {
  cardsContainer.innerHTML = '';
  modalsContainer.innerHTML = '';

  displayData.forEach((drink, idx) => {
    cardsContainer.appendChild(createFavoriteDrinkCard(drink, idx));
  });

  const modalPromises = originalData.map(d => createDrinkModal(d));
  const modals = await Promise.all(modalPromises);
  modals.forEach(m => modalsContainer.appendChild(m));
  renderPriceTag();
  initEventListeners();
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


async function handleAddList() {
  const input = document.getElementById('new-list-name');
  const createdList = await createList(input.value);
  input.value = '';
  await generateRadioFilter();
}

async function handleEditListName() {
  const input = document.getElementById('edit-list-name');
  if (!selectedListId) {
    alert("Selectează o listă mai întâi!");
    return;
  }
  if (!input.value) {
    alert("Numele listei nu poate fi gol!");
    return;
  }
  let publicValue = true;
  if (publicBtn.style.display === 'block') {
    publicValue = false;
  }
  const listUpdated = await updateList(selectedListId, input.value, publicValue);
  if (listUpdated) {
    input.value = '';
  }
  await generateRadioFilter();
}


function handleDeselectList() {
  selectedListId = null;
  selectedListDiv.style.display = 'none';
  publicBtn.style.display = 'none';
  privateBtn.style.display = 'none';
  deleteListBtn.style.display = 'none';
  editListNameContainer.style.display = 'none';
  document.querySelector('.sort-section').style.display = 'none';
  document
    .querySelectorAll('input[name="user-list"]')
    .forEach(radio => radio.checked = false);

  clearCards();
}

async function handleMakePublic() {
  if (!selectedListId) {
    alert("Selectează o listă mai întâi!");
    return;
  }
  const listUpdated = await updateList(selectedListId, selectedListName, true);
  if (listUpdated) {
    alert(`Am facut lista cu id ${selectedListId} publică`);
    selectedListDiv.style.display = 'none';
    publicBtn.style.display = 'none';
    privateBtn.style.display = 'block';
  }
}

async function handleMakePrivate() {
  if (!selectedListId) {
    alert("Selectează o listă mai întâi!");
    return;
  }
  const listUpdated = await updateList(selectedListId, selectedListName, false);
  if (listUpdated) {
    alert(`Am facut lista cu id ${selectedListId} privată`);
    selectedListDiv.style.display = 'none';
    privateBtn.style.display = 'none';
    publicBtn.style.display = 'block';
  }
}

async function handleDeleteList() {
  const confirmDelete = confirm("Sigur vrei să ștergi această listă?");
  if (!confirmDelete) return;
  const listDeleted = await deleteList(selectedListId);
  if (listDeleted) {
    handleDeselectList();
    deleteListBtn.style.display = 'none';
    await generateRadioFilter();
  }
}

async function handleFetchFavorites() {
  handleDeselectList();
  clearPriceTag();
  const favorites = await getFavoritesDrinks();
  if (!favorites || favorites.length === 0) {
    alert("Nu ai băuturi favorite.");
    return;
  }

  originalData = favorites;
  displayData = [...originalData];
  selectedListId = null;
  emptyListMessage.style.display = 'none';
  publicBtn.style.display = 'none';
  document.querySelector('.sort-section').style.display = 'flex';
  favoritesSelected = true;
  await renderFavoriteDrinks();
}

function selectAll() {
  const allSelected = {};
  displayData.forEach(drink => {
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


function initEventListeners() {
  overlay.addEventListener('click', closeAllModals);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllModals();
  });
}

function clearCards() {
  cardsContainer.innerHTML = '';
  modalsContainer.innerHTML = '';
  originalData = [];
  displayData = [];
  selectedListId = null;
  emptyListMessage.style.display = 'flex';
}

function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "../login/index.html";
    return false;
  }
  return token;
}

document.addEventListener('DOMContentLoaded', async () => {
  await generateRadioFilter();
  setupSort();
});