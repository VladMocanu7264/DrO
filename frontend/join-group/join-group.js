const API_BASE_URL = "https://c18c9536-f420-43e6-9492-a9a4331cd516.mock.pstmn.io";
const searchInput = document.getElementById("search-group");

let currentPage = 1;
let totalPages = 1;
const limit = 5;

let searchValue = "";

async function getAvailableGroups(page = 1, limit = 10, search = "") {
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/groups/available?page=${page}&limit=${limit}&search=${search}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error("Eroare la obținerea grupurilor disponibile");
        }
        const data = await response.json();
        currentPage = page;
        totalPages = data.totalPages || 0;
        updatePaginationControls();
        return data.groups || [];
    } catch (error) {
        currentPage = 1;
        totalPages = 1;
        updatePaginationControls();
        alert("Eroare:" + error.message);
        return [];
    }
}

async function joinGroup(groupId) {
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/groups/${groupId}/join`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (response.status === 400) {
            throw new Error("Ești deja în acest grup.");
        }
        if (response.status === 404) {
            throw new Error("Grupul nu a fost găsit.");
        }
        if (!response.ok) {
            throw new Error("Eroare la alăturarea grupului");
        }
        alert("Te-ai alăturat grupului cu succes!");
        await getAvailableGroups(currentPage, limit, searchValue)
            .then(generateGroups);
    } catch (error) {
        alert("Eroare:" + error.message);
    }
}

async function handleSearchGroups() {
    searchValue = searchInput.value.toLowerCase().trim();
    const fetchedGroups = await getAvailableGroups(1, limit, searchValue);
    if (!fetchedGroups || fetchedGroups.length === 0) {
        generateGroups([]);
        return;
    }
    generateGroups(fetchedGroups)
}

function generateGroups(groups) {
    const container = document.querySelector('.groups-container');
    container.innerHTML = '';
    if (groups.length === 0) {
        container.innerHTML = '<div class="empty-group">Nu s-au găsit grupuri pentru căutarea ta.</div>';
        return;
    }
    groups.forEach(group => {
        const div = generateGroupContainer(group);
        container.appendChild(div);
    });
}

function handleJoinGroup(event) {
    if (event.target.classList.contains('join-group-button')) {
        const groupId = event.target.getAttribute('data-group-id');
        joinGroup(groupId);
    }
}

function generateGroupContainer(group) {
    const groupDiv = document.createElement('div');
    groupDiv.classList.add('group');

    groupDiv.innerHTML = `
      <div class="group-content">
        <div class="group-info">
            <p class="group-title">${group.name}</p>
            <p class="group-text">${group.description ? group.description : 'Grupul nu are o descriere'}</p>
            <button class="join-group-button" data-group-id="${group.id}" onclick="handleJoinGroup(event)">Alătură-te</button>
        </div>
      </div>
    `;
    return groupDiv;
}

function updatePaginationControls() {
    const pagination = document.querySelector('.pagination');
    if (totalPages >= 1) {
        pagination.classList.remove('hidden');
    } else {
        pagination.classList.add('hidden');
    }
    document.getElementById('current-page').textContent = currentPage;
    document.getElementById('total-pages').textContent = totalPages;
    document.getElementById('prev-page').disabled = currentPage <= 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages;
}

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        getAvailableGroups(currentPage - 1, limit, searchValue).then(generateGroups);
    }
});
document.getElementById('next-page').addEventListener('click', () => {
    if (currentPage < totalPages) {
        getAvailableGroups(currentPage + 1, limit, searchValue).then(generateGroups);
    }
});

function clearGroups() {
    searchValue = "";
    currentPage = 1;
    totalPages = 1;

    searchInput.value = "";

    const container = document.querySelector('.groups-container');
    container.innerHTML = "";

    const pagination = document.querySelector('.pagination');
    pagination.classList.add('hidden');

    container.innerHTML = `
                <div class="empty-group">
                <h2>
                    Caută grupuri
                </h2>
                <p>Grupurile tale vor apărea aici.</p>
            </div>
  `;
}


