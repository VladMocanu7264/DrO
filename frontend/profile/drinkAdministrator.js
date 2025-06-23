const openDrinksBtn = document.getElementById('drinks-button');
const closeDrinksBtn = document.getElementById('close-drink-modal');
const drinksModal = document.getElementById('drinks-modal');
const drinksOverlay = document.getElementById('overlay');
const searchInput = document.getElementById("search-drink-admin");
const listsContainer = document.getElementById('admin-drink-list');
const searchButton = document.getElementById('search-icon');
const clearSearchButton = document.getElementById('clear-search-icon');

async function getDrinkByQuery(query) {
    if (!query) {
        alert("Căutarea nu poate fi goală.");
        return;
    }
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/admin/drinks?search=${query}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error("Eroare la căutarea băuturii");
        }
        const drinks = await response.json();
        console.log(drinks);
        if (drinks.length === 0) {
            alert("Nu s-au găsit băuturi care să corespundă căutării.");
            return;
        }
        return drinks;
    } catch (error) {
        alert(`Eroare: ${error.message}`);
        return [];
    }
}

async function postDrink(drinkData) {
    if (!drinkData || !drinkData.name || !drinkData.category) {
        alert("Datele băuturii sunt incomplete.");
        return;
    }
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/admin/drinks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(drinkData)
        });
        if (!response.status === 201) {
            throw new Error("Eroare la adăugarea băuturii");
        }
        alert("Băutură adăugată cu succes!");
        return true;
    } catch (error) {
        alert(`Eroare: ${error.message}`);
        return false;
    }
}

async function deleteDrink(drinkId) {
    if (!drinkId) {
        alert("ID-ul băuturii lipsește.");
        return;
    }
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/admin/drinks/${drinkId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error("Eroare la ștergerea băuturii");
        }
        alert("Băutură ștearsă cu succes!");
        return true;
    } catch (error) {
        alert(`Eroare: ${error.message}`);
        return false;
    }
}


openDrinksBtn.addEventListener('click', () => {
    drinksModal.classList.remove('hidden');
    drinksOverlay.classList.remove('hidden');
});

closeDrinksBtn.addEventListener('click', () => {
    drinksModal.classList.add('hidden');
    drinksOverlay.classList.add('hidden');
    clearDrinkSearch();
    clearDrinkForm();
});

overlay.addEventListener('click', () => {
    drinksModal.classList.add('hidden');
    drinksOverlay.classList.add('hidden');
    clearDrinkSearch();
    clearDrinkForm();
});

async function searchDrinkByName() {
    const query = searchInput.value.trim().toLowerCase();

    if (query === "") {
        listsContainer.innerHTML = "";
        listsContainer.classList.add('hidden');
        return;
    }

    const filtered = await getDrinkByQuery(query);

    if (filtered.length === 0) {
        listsContainer.innerHTML = "";
        listsContainer.classList.add('hidden');
    } else {
        renderDrinks(filtered);
    }
}


function renderDrinks(arrayOfDrinks) {
    listsContainer.innerHTML = "";
    listsContainer.classList.remove('hidden');

    arrayOfDrinks.forEach(drink => {
        const card = document.createElement('div');
        card.classList.add('admin-drink-card');

        card.innerHTML = `
      <div class="admin-drink-card-header">
        <p>${drink.name}</p>
        <!-- one class attribute, and correct data- attribute -->
        <i 
          class="fa-solid fa-trash trash-icon delete-drink-button" 
          data-drink-id="${drink.id}"
          title="Șterge băutura"
        ></i>
      </div>
      <p>${capitalizeFirstLetter(drink.brand)}</p>
      <!-- fix the quotes and alt text -->
      <img src="../public/poze/cocacola.png" alt="${drink.name} Image">
    `;

        const deleteDrinkBtn = card.querySelector('.delete-drink-button');
        deleteDrinkBtn.addEventListener('click', async () => {
            const id = deleteDrinkBtn.getAttribute('data-drink-id');
            const wasDeleted = await deleteDrink(id);
            if (wasDeleted) {
                card.remove();
            }
        });

        listsContainer.appendChild(card);
    });
}


function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function clearDrinkSearch() {
    searchInput.value = "";
    listsContainer.innerHTML = "";
    listsContainer.classList.add('hidden');
}


const addDrink = async () => {
    const name = document.getElementById("drink-name").value.trim();
    const category = document.getElementById("drink-type").value.trim();
    const brand = document.getElementById("drink-brand").value.trim();
    const nutrition_grade = document.getElementById("drink-nutrition-grade")
        .value.trim();
    const quantity = document.getElementById("drink-quantity").value.trim();
    const packaging = document.getElementById("drink-packaging").value.trim();

    const rawTags = document.getElementById("drink-tags").value;
    const tags = rawTags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag);

    const fileInput = document.getElementById("drink-image");
    const file = fileInput.files[0];
    if (!file) {
        alert("Trebuie să selectezi o imagine.");
        return;
    }
    const image_url = URL.createObjectURL(file);

    const drinkData = {
        name,
        category,
        brand,
        nutrition_grade,
        quantity,
        packaging,
        image_url,
        tags
    };
    const wasAdded = await postDrink(drinkData);
    if (!wasAdded) {
        return;
    }
    clearDrinkForm();
};

const clearDrinkForm = () => {
    document.getElementById("drink-name").value = "";
    document.getElementById("drink-type").value = "";
    document.getElementById("drink-brand").value = "";
    document.getElementById("drink-nutrition-grade").value = "";
    document.getElementById("drink-quantity").value = "";
    document.getElementById("drink-packaging").value = "";
    document.getElementById("drink-tags").value = "";
    document.getElementById("drink-image").value = "";
}

document.getElementById("add-drink-button").addEventListener("click", addDrink);
document.getElementById("clear-drink-button").addEventListener("click", clearDrinkForm);
clearSearchButton.addEventListener('click', clearDrinkSearch);
searchButton.addEventListener('click', searchDrinkByName);
