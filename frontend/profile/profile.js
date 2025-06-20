const listContainer = document.querySelector('.lists-container');
const drinkListSelect = document.getElementById('drink-list-select');
const selectedList = '';

const adminUsersBtn = document.getElementById('users-button');
const adminDrinksBtn = document.getElementById('drinks-button');
const adminGroupsBtn = document.getElementById('groups-button');

const mockedListsNames = [
    { id: 1, name: "Lista 1", drinks: [1, 2, 3, 4, 5, 6] },
    { id: 2, name: "Lista 2", drinks: [4, 5] },
    { id: 3, name: "Lista 3", drinks: [6, 7, 8] },
    { id: 4, name: "Lista 4", drinks: [9, 10] },
    { id: 5, name: "Lista 5", drinks: [11, 12] }
];

function loadLists(listId) {
    if (!listContainer) {
        console.error("List container not found");
        return;
    }
    listContainer.innerHTML = '';

    const selectedListData = mockedListsNames.find(list => list.id === parseInt(listId));
    if (!selectedListData) {
        console.error(`List with ID ${listId} not found`);
        return;
    }

    mockedDrinks.forEach((drink) => {
        if (selectedListData.drinks.includes(drink.id)) {
            const card = document.createElement('div');
            card.classList.add('drink-card');
            card.innerHTML = `
                <h3>${drink.name}</h3>
                <p>${drink.category}</p>
                <img src="${drink.image}" alt="Drink Image">
            `;
            listContainer.appendChild(card);
        }
    });

}

function loadDrinkList() {
    if (!drinkListSelect) {
        console.error("Drink list select not found");
        return;
    }
    drinkListSelect.innerHTML = '';

    drinkListSelect.addEventListener('change', (event) => {
        const selectedListId = event.target.value;
        loadLists(selectedListId);
    });

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '-- Alege o listă --';
    placeholder.disabled = true;
    placeholder.selected = true;
    drinkListSelect.appendChild(placeholder);

    mockedListsNames.forEach((list) => {
        const option = document.createElement('option');
        option.value = list.id;
        option.textContent = list.name;
        drinkListSelect.appendChild(option);
    });
}

function checkAdminAccess() {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
        adminUsersBtn.style.display = 'none';
        adminDrinksBtn.style.display = 'none';
        adminGroupsBtn.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    loadDrinkList();
});
