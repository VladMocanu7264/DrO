const openDrinksBtn = document.getElementById('drinks-button');
const closeDrinksBtn = document.getElementById('close-drink-modal');
const drinksModal = document.getElementById('drinks-modal');
const drinksOverlay = document.getElementById('overlay');
const searchInput = document.getElementById("search-drink-admin");
const listsContainer = document.getElementById('admin-drink-list');
const searchButton = document.getElementById('search-icon');
const clearSearchButton = document.getElementById('clear-search-icon');

const mockedDrinks = [
    { id: 1, name: "Coca-Cola", category: "soda", image: "../public/poze/cocacola.png" },
    { id: 2, name: "Pepsi", category: "soda", image: "../public/poze/pepsi.png" },
    { id: 3, name: "Fanta", category: "soda", image: "../public/poze/fanta.png" },
    { id: 4, name: "Sprite", category: "soda", image: "../public/poze/sprite.png" },
    { id: 5, name: "Mountain Dew", category: "soda", image: "../public/poze/smoothie.png" },
    { id: 6, name: "Dr Pepper", category: "soda", image: "../public/poze/drpepper.png" },
    { id: 7, name: "7UP", category: "soda", image: "../public/poze/7up.png" },
    { id: 8, name: "Schweppes", category: "soda", image: "../public/poze/smoothie.png" },
    { id: 9, name: "Red Bull", category: "energy", image: "../public/poze/redbull.png" },
    { id: 10, name: "Monster", category: "energy", image: "../public/poze/smoothie.png" },
    { id: 11, name: "Rockstar", category: "energy", image: "../public/poze/rockstar.png" },
    { id: 12, name: "NOS", category: "energy", image: "../public/poze/smoothie.png" }
];

openDrinksBtn.addEventListener('click', () => {
    drinksModal.classList.remove('hidden');
    drinksOverlay.classList.remove('hidden');
});

closeDrinksBtn.addEventListener('click', () => {
    drinksModal.classList.add('hidden');
    drinksOverlay.classList.add('hidden');
});

overlay.addEventListener('click', () => {
    drinksModal.classList.add('hidden');
    drinksOverlay.classList.add('hidden');
});


searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim().toLowerCase();

    if (query === "") {
        listsContainer.innerHTML = "";
        listsContainer.classList.add('hidden');
        return;
    }

    const filtered = mockedDrinks.filter(drink =>
        drink.name.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        listsContainer.innerHTML = "";
        listsContainer.classList.add('hidden');
    } else {
        renderDrinks(filtered);
    }
});

// 5. Afișează card-urile și ascunde chenar mov
function renderDrinks(arrayOfDrinks) {
    listsContainer.innerHTML = "";
    listsContainer.classList.remove('hidden');

    arrayOfDrinks.forEach(drink => {
        const card = document.createElement('div');
        card.classList.add('admin-drink-card');
        card.innerHTML = `
        <div class="admin-drink-card-header">
            <p>${drink.name}</p>
            <i class="fa-solid fa-trash"></i>
        </div>
        <p>${capitalizeFirstLetter(drink.category)}</p>
        <img src="${drink.image}" alt="${drink.name} Image">
    `;
        listsContainer.appendChild(card);
    });
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function clearSearch() {
    searchInput.value = "";
    listsContainer.innerHTML = "";
    listsContainer.classList.add('hidden');
}

clearSearchButton.addEventListener('click', clearSearch);
