const API_BASE_URL = "https://c18c9536-f420-43e6-9492-a9a4331cd516.mock.pstmn.io";

async function getDrinksByRanking(limit = 10) {
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/drinks/ranking?limit=${limit}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error("Eroare la obținerea băuturilor");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        alert("Eroare:", error);
    }
}

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
    drinksData.forEach((drink, idx) => {
        const card = createDrinkCard(drink, idx);
        cardsContainer.appendChild(card);
    });
}


function createDrinkCard(drink, index) {
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
    <p><strong>Grad nutrițional: </strong> ${drink.nutrition_grade}</p>
    <p><strong>Brand: </strong> ${drink.brand}</p>
  `;
    return card;
}


document.addEventListener('DOMContentLoaded', getRanking);
