const API_BASE_URL = "http://localhost:3000";
const modalsContainer = document.querySelector("#text-box-container");
const overlay = document.querySelector(".overlay");
const body = document.body;
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

async function getDrinksByRanking() {
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/drinks/ranking`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error("Eroare la obținerea băuturilor");
        }
        return await response.json();
    } catch (error) {
        alert("Eroare:" + error);
    }
}

const cardsContainer = document.querySelector(".cards-container");

async function getRanking() {
    try {
        render();
    } catch (err) {
        console.error("Eroare încărcare băuturi:", err);
    }
}


async function render() {
    const drinksData = await getDrinksByRanking();
    drinksData.sort((a, b) => b.favoritesCount - a.favoritesCount);
    cardsContainer.innerHTML = '';
    modalsContainer.innerHTML = '';
    drinksData.forEach((drink, idx) => {
        const card = createDrinkCard(drink, idx);
        cardsContainer.appendChild(card);
    });
    const modalPromises = drinksData.map(async (d) => {
        const drinkDetails = await getDrinkDetails(d.id);
        return createDrinkModal(drinkDetails);
    });
    const modals = await Promise.all(modalPromises);
    modals.forEach(m => modalsContainer.appendChild(m));
    initEventListeners();
}


function createDrinkCard(drink, index) {
    const selectedDrinks = JSON.parse(localStorage.getItem("selectedDrinks") || "{}");
    const isChecked = selectedDrinks.hasOwnProperty(drink.id);
    const card = document.createElement('div');
    card.classList.add('rectangle');

    card.innerHTML = `
    <div class="drink-header">
        <div class="drink-list-count">
            <p><strong># Favorit:</strong> ${drink.favoritesCount}</p>
        </div>
        <div class="drink-index">
            <p>${index + 1}</p>
        </div>
    </div>
    <div class="content">
        <img class="drink-img" src="${drink.image_url}" alt="${drink.name}">
    </div>
    <h3>${drink.name}</h3>
        <div class="drink-info">
      <p><strong>Brand:</strong> ${drink.brand || "N/A"}</p>
      <p><strong>Cantitate:</strong> ${drink.quantity || "?"} ml</p>
      <p><strong>Nutriție:</strong> ${drink.nutrition_grade || "-"}</p>
          <label>
      <input type="checkbox" class="drink-checkbox" data-drink-id="${drink.id}" ${isChecked ? "checked" : ""}>
      Statistici
    </label>
        <div class="btn">
      <button class="read-more" data-index="${drink.id}">Detalii</button>
    </div>
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

function toggleModal(idx, show) {
    const m = document.getElementById(`text-box-${idx}`);
    if (!m) return;
    m.classList.toggle('hidden', !show);
    overlay.classList.toggle('hidden', !show);
    body.classList.toggle('no-scroll', show);
}

async function createDrinkModal(drink) {
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
          <p><strong>Preț:</strong> ${drink.price || "-"} ${drink.price ? "Lei" : ""}</p>
        </div>
        <div id="icons-container">
          <img id="drink-image-box" src="${drink.image_url}" alt="${drink.name}">
        </div>   
      </div>
    </div>
  `;

    modal.querySelector('.close-modal')
        .addEventListener('click', () => toggleModal(drink.id, false));
    return modal;
}

function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../login/index.html";
        return false;
    }
    return token;
}

function closeAllModals() {
  document.querySelectorAll('.text-box:not(.hidden)')
    .forEach(m => m.classList.add('hidden'));
  overlay.classList.add('hidden');
  body.classList.remove('no-scroll');
}

function initEventListeners() {
    overlay.addEventListener('click', closeAllModals);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeAllModals();
    });
}

document.addEventListener('DOMContentLoaded', getRanking);
