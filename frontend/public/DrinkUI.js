// DrinkUI.js

const DrinkUI = (() => {
    const API_BASE_URL = (window.env && window.env.API_BASE_URL) || '';
    const token = localStorage.getItem("token");

    function createDrinkCard(drink, userLists) {
        const selected = JSON.parse(localStorage.getItem("selectedDrinks") || "{}");
        const isChecked = selected.hasOwnProperty(drink.id);

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
        ${drink.favoritesCount != null ? `<p><strong>Favorit de ${drink.favoritesCount} ori</strong></p>` : ""}
      </div>
      <label>
        <input type="checkbox" class="drink-checkbox" data-drink-id="${drink.id}" ${isChecked ? "checked" : ""}>
        Statistici
      </label>
      <button class="read-more" data-index="${drink.id}">Detalii</button>
    `;

        const checkbox = card.querySelector(".drink-checkbox");
        checkbox.addEventListener("change", (e) => {
            const stored = JSON.parse(localStorage.getItem("selectedDrinks") || "{}");
            if (e.target.checked) {
                stored[drink.id] = drink;
            } else {
                delete stored[drink.id];
            }
            localStorage.setItem("selectedDrinks", JSON.stringify(stored));
        });

        const readMore = card.querySelector(".read-more");
        readMore.addEventListener("click", async () => {
            const details = await fetchDrinkDetailsById(drink.id);
            if (details) openDrinkModal(details, userLists);
        });

        return card;
    }

    async function fetchDrinkDetailsById(drinkId) {
        try {
            const res = await fetch(`${API_BASE_URL}/drinks/${drinkId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Drink not found");
            return await res.json();
        } catch (err) {
            alert("Eroare la obținerea detaliilor băuturii.");
            console.error(err);
            return null;
        }
    }

    async function addDrinkToFavorites(drinkId) {
        const res = await fetch(`${API_BASE_URL}/favorites`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ drinkId }),
        });
        return res.ok;
    }

    async function removeDrinkFromFavorites(drinkId) {
        const res = await fetch(`${API_BASE_URL}/favorites/${drinkId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        return res.ok;
    }

    async function addDrinkToList(drinkId, listId) {
        if (!drinkId || !listId) {
            alert("Selectează o listă mai întâi!");
            return;
        }
        const res = await fetch(`${API_BASE_URL}/lists/${listId}/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ drinkId })
        });
        if (res.ok) alert("Băutura a fost adăugată cu succes!");
        else alert("Eroare la adăugarea băuturii");
    }

    function createDrinkModal(drink, userLists) {
        const modal = document.createElement("div");
        modal.classList.add("text-box");
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
            <p><strong>Preț:</strong> ${drink.price} lei</p>
            <p><strong>Etichete:</strong> ${drink.tags?.join(", ") || "-"}</p>
          </div>
          <div id="icons-container">
            <img id="drink-image-box" src="${drink.image_url}" alt="${drink.name}">
            <div id="menu-icons-container">
              <i class="${drink.favorited ? 'fa-solid' : 'fa-regular'} fa-heart icon-menu add-favorite"
                 data-drink-id="${drink.id}" title="${drink.favorited ? 'Favorit' : 'Add to favorites'}"></i>
              <i class="fa-solid fa-plus icon-menu add-to-list" title="Add to list"></i>
              <i class="fa-solid fa-share icon-menu" title="Share"></i>
            </div>
          </div>
        </div>
        <div class="favorite-section">
          <label for="favorite-list" class="favorite-label">Liste:</label>
          <select id="list-${drink.id}" class="favorite-select">
            <option value="" disabled selected>Selectează o listă</option>
            ${userLists.map(list => `<option value="${list.id}">${list.name}</option>`).join("")}
          </select>
        </div>
      </div>
    `;

        modal.querySelector(".add-favorite").addEventListener("click", async e => {
            e.stopPropagation();
            const icon = e.currentTarget;
            const success = drink.favorited
                ? await removeDrinkFromFavorites(drink.id)
                : await addDrinkToFavorites(drink.id);
            if (success) {
                drink.favorited = !drink.favorited;
                icon.classList.toggle("fa-solid", drink.favorited);
                icon.classList.toggle("fa-regular", !drink.favorited);
                icon.title = drink.favorited ? "Favorit" : "Add to favorites";
            }
        });

        modal.querySelector(".add-to-list").addEventListener("click", () => {
            const listId = parseInt(modal.querySelector(`#list-${drink.id}`).value);
            addDrinkToList(drink.id, listId);
        });

        modal.querySelector(".close-modal").addEventListener("click", () => toggleModal(drink.id, false));

        return modal;
    }

    function toggleModal(id, show) {
        const modal = document.getElementById(`text-box-${id}`);
        if (!modal) return;
        modal.classList.toggle("hidden", !show);
        document.querySelector(".overlay").classList.toggle("hidden", !show);
        document.body.classList.toggle("no-scroll", show);
    }

    function openDrinkModal(drink, userLists) {
        const container = document.getElementById("text-box-container");
        const existing = document.getElementById(`text-box-${drink.id}`);
        if (existing) existing.remove();
        const modal = createDrinkModal(drink, userLists);
        container.appendChild(modal);
        toggleModal(drink.id, true);
    }

    return {
        createDrinkCard,
        openDrinkModal
    };
})();

export default DrinkUI;
