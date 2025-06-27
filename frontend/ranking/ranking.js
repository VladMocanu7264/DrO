const API_BASE_URL = "http://localhost:3000";

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
    drinksData.forEach((drink, idx) => {
        const card = createDrinkCard(drink, idx);
        cardsContainer.appendChild(card);
    });
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
    return card;
}

function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../login/index.html";
        return false;
    }
    return token;
}

document.addEventListener('DOMContentLoaded', getRanking);
