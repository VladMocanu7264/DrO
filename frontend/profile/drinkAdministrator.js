// const openDrinksBtn = document.getElementById('drinks-button');
// const closeDrinksBtn = document.getElementById('close-drink-modal');
// const drinksModal = document.getElementById('drinks-modal');
// const drinksOverlay = document.getElementById('overlay');
// const searchInput = document.getElementById("search-drink-admin");
// const listsContainer = document.getElementById('admin-drink-list');
// const searchButton = document.getElementById('search-icon');
// const clearSearchButton = document.getElementById('clear-search-icon');

// const mockedDrinks = [
//     { id: 1, name: "Coca-Cola", category: "soda", image: "../public/poze/cocacola.png" },
//     { id: 2, name: "Pepsi", category: "soda", image: "../public/poze/pepsi.png" },
//     { id: 3, name: "Fanta", category: "soda", image: "../public/poze/fanta.png" },
//     { id: 4, name: "Sprite", category: "soda", image: "../public/poze/sprite.png" },
//     { id: 5, name: "Mountain Dew", category: "soda", image: "../public/poze/smoothie.png" },
//     { id: 6, name: "Dr Pepper", category: "soda", image: "../public/poze/drpepper.png" },
//     { id: 7, name: "7UP", category: "soda", image: "../public/poze/7up.png" },
//     { id: 8, name: "Schweppes", category: "soda", image: "../public/poze/smoothie.png" },
//     { id: 9, name: "Red Bull", category: "energy", image: "../public/poze/redbull.png" },
//     { id: 10, name: "Monster", category: "energy", image: "../public/poze/smoothie.png" },
//     { id: 11, name: "Rockstar", category: "energy", image: "../public/poze/rockstar.png" },
//     { id: 12, name: "NOS", category: "energy", image: "../public/poze/smoothie.png" }
// ];

// openDrinksBtn.addEventListener('click', () => {
//     drinksModal.classList.remove('hidden');
//     drinksOverlay.classList.remove('hidden');
// });

// closeDrinksBtn.addEventListener('click', () => {
//     drinksModal.classList.add('hidden');
//     drinksOverlay.classList.add('hidden');
// });

// overlay.addEventListener('click', () => {
//     drinksModal.classList.add('hidden');
//     drinksOverlay.classList.add('hidden');
// });


// searchButton.addEventListener('click', () => {
//     const query = searchInput.value.trim().toLowerCase();

//     if (query === "") {
//         listsContainer.innerHTML = "";
//         listsContainer.classList.add('hidden');
//         return;
//     }

//     const filtered = mockedDrinks.filter(drink =>
//         drink.name.toLowerCase().includes(query)
//     );

//     if (filtered.length === 0) {
//         listsContainer.innerHTML = "";
//         listsContainer.classList.add('hidden');
//     } else {
//         renderDrinks(filtered);
//     }
// });

// // 5. Afișează card-urile și ascunde chenar mov
// function renderDrinks(arrayOfDrinks) {
//     listsContainer.innerHTML = "";
//     listsContainer.classList.remove('hidden');

//     arrayOfDrinks.forEach(drink => {
//         const card = document.createElement('div');
//         card.classList.add('admin-drink-card');
//         card.innerHTML = `
//         <div class="admin-drink-card-header">
//             <p>${drink.name}</p>
//             <i class="fa-solid fa-trash"></i>
//         </div>
//         <p>${capitalizeFirstLetter(drink.category)}</p>
//         <img src="${drink.image}" alt="${drink.name} Image">
//     `;
//         listsContainer.appendChild(card);
//     });
// }

// function capitalizeFirstLetter(str) {
//     return str.charAt(0).toUpperCase() + str.slice(1);
// }

// function clearSearch() {
//     searchInput.value = "";
//     listsContainer.innerHTML = "";
//     listsContainer.classList.add('hidden');
// }

// clearSearchButton.addEventListener('click', clearSearch);

const API_BASE_URL = window.env.API_BASE_URL;
const token = localStorage.getItem("token");

const openDrinksBtn = document.getElementById('drinks-button');
const closeDrinksBtn = document.getElementById('close-drink-modal');
const drinksModal = document.getElementById('drinks-modal');
const drinksOverlay = document.getElementById('overlay');
const drinksList = document.getElementById('drinks-list');
const searchInput = document.getElementById('search-drink-admin');

const addDrinkForm = document.getElementById("add-drink-form");

// Deschide/închide modal
openDrinksBtn.addEventListener('click', () => {
  drinksModal.classList.remove('hidden');
  drinksOverlay.classList.remove('hidden');
});

closeDrinksBtn.addEventListener('click', () => {
  drinksModal.classList.add('hidden');
  drinksOverlay.classList.add('hidden');
});

drinksOverlay.addEventListener('click', () => {
  drinksModal.classList.add('hidden');
  drinksOverlay.classList.add('hidden');
});

// Caută băuturi
async function fetchDrinks(search = "") {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/drinks?search=${encodeURIComponent(search)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Eroare la fetch drinks");
    return await res.json();
  } catch (err) {
    console.error("Eroare API:", err);
    return [];
  }
}

// Șterge băutură
async function deleteDrink(id) {
  if (!confirm("Sigur doriți să ștergeți această băutură?")) return;

  try {
    const res = await fetch(`${API_BASE_URL}/admin/drinks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Eroare la ștergere");

    alert("Băutură ștearsă!");
    loadDrinks(searchInput.value);
  } catch (err) {
    console.error("Eroare ștergere:", err);
    alert("Eroare la ștergere băutură.");
  }
}

// Încarcă băuturi
async function loadDrinks(search = "") {
  const drinks = await fetchDrinks(search);
  drinksList.innerHTML = "";

  drinks.forEach((drink) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td data-label="Nume">${drink.name}</td>
      <td data-label="Brand">${drink.brand}</td>
      <td data-label="Acțiuni">
        <div class="table-actions">
          <button class="delete-user-button" data-id="${drink.id}">Șterge</button>
        </div>
      </td>
    `;
    drinksList.appendChild(row);
  });

  document.querySelectorAll(".delete-user-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      deleteDrink(id);
    });
  });
}

// Adaugă băutură nouă
addDrinkForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(addDrinkForm);
  const tagsRaw = formData.get("tags") || "";
  const payload = {
    id: formData.get("id"),
    name: formData.get("name"),
    brand: formData.get("brand"),
    image_url: formData.get("image_url"),
    nutrition_grade: formData.get("nutrition_grade"),
    quantity: parseInt(formData.get("quantity")),
    packaging: formData.get("packaging"),
    tags: tagsRaw.split(",").map(t => t.trim()).filter(Boolean)
  };

  try {
    const res = await fetch(`${API_BASE_URL}/admin/drinks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Eroare la adăugare");

    alert("Băutura a fost adăugată!");
    addDrinkForm.reset();
    loadDrinks(); // Reîncarcă lista
  } catch (err) {
    console.error("Eroare adăugare:", err);
    alert("Eroare la adăugare băutură.");
  }
});

// Caută în timp real
searchInput?.addEventListener("input", () => {
  loadDrinks(searchInput.value);
});

// Init
document.addEventListener("DOMContentLoaded", () => {
  loadDrinks();
});