const API_BASE_URL = "http://localhost:3000";

let username = '';
const drinkListSelect = document.getElementById('drink-list-select');
const listContainer = document.querySelector('.lists-container');

async function copyList(listId) {
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/lists/${listId}/copy`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Eroare la copierea listei");
        }

        const copiedList = await response.json();
        alert(`Lista a fost copiată cu succes și are id-ul ${copiedList.newListId}!`);
    } catch (error) {
        alert("Eroare: " + error.message);
    }
}


async function fetchUserData(username) {
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/users/${username}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Eroare la încărcarea datelor utilizatorului");
        }

        const userData = await response.json();
        return userData;
    } catch (error) {
        alert("Eroare: " + error.message);
    }
}

async function loadUserData() {
    const params = new URLSearchParams(window.location.search);
    username = params.get('username');
    const userData = await fetchUserData(username);
    if (!userData) {
        console.error("No user data found");
        return;
    }
    const usernameElement = document.getElementById('username-text');
    const email = document.getElementById('email-text');
    const description = document.getElementById('user-description');
    const profileImage = document.getElementById('user-image');
    const profileImageUrl = userData.image;
    usernameElement.textContent = userData.username;
    email.textContent = userData.email;
    description.textContent = userData.description || "No description provided";
    profileImage.src = profileImageUrl;

    const lists = userData.lists || [];
    loadDrinkList(lists);
}

function loadLists(lists, listId) {
    const listHeader = document.querySelector('.drink-list-header');
    const listContainer = document.querySelector('.lists-container');

    if (!listContainer || !listHeader) {
        console.error("List container or header not found");
        return;
    }

    listContainer.innerHTML = '';
    const selectedListData = lists.find(l => l.id === parseInt(listId, 10));
    if (!selectedListData) {
        listContainer.innerHTML = `<div class="drink-card">
      <p>Lista nu a fost găsită.</p>
    </div>`;
        return;
    }

    selectedListData.drinks.forEach(drink => {
        const card = document.createElement('div');
        card.classList.add('drink-card');
        card.innerHTML = `
      <h3 id='drink-name'>${drink.name}</h3>
      <img src="${drink.image_url}" alt="${drink.name}">
    `;
        listContainer.appendChild(card);
    });

    const oldBtn = listHeader.querySelector('.copy-list-button');
    if (oldBtn) oldBtn.remove();
    const currentUsername = JSON.parse(localStorage.getItem("user")).username;
    if (currentUsername !== username) {
        const copyButton = document.createElement('button');
        copyButton.classList.add('action-button', 'copy-list-button');
        copyButton.textContent = 'Copiază';
        copyButton.dataset.listId = listId;
        copyButton.addEventListener('click', () => {
            const listId = copyButton.dataset.listId;
            copyList(listId);
        });
        listHeader.appendChild(copyButton);
    }
}

function loadDrinkList(lists) {
    if (!drinkListSelect) {
        console.error("Drink list select not found");
        return;
    }
    drinkListSelect.innerHTML = '';

    drinkListSelect.addEventListener('change', (event) => {
        const selectedListId = event.target.value;
        loadLists(lists, selectedListId);
    });

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '-- Alege o listă --';
    placeholder.disabled = true;
    placeholder.selected = true;
    drinkListSelect.appendChild(placeholder);

    lists.forEach((list) => {
        const option = document.createElement('option');
        option.value = list.id;
        option.textContent = list.name;
        drinkListSelect.appendChild(option);
    });
}

function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../login/index.html";
        return false;
    }
    return token;
}

document.addEventListener('DOMContentLoaded', () => loadUserData());

