const openGroupsBtn = document.getElementById('groups-button');
const closeGroupsBtn = document.getElementById('close-group-modal');
const groupsModal = document.getElementById('groups-modal');
const groupsOverlay = document.getElementById('overlay');
const groupList = document.getElementById('groups-list');
const searchGroupInput = document.getElementById("search-group-admin");
const searchGroupButton = document.getElementById('search-group-icon');
const clearGroupSearchButton = document.getElementById('clear-group-search-icon');

async function deleteGroup(groupId) {
    if (!groupId) {
        alert("ID-ul grupului lipsește.");
        return;
    }
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/admin/groups/${groupId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error("Eroare la ștergerea grupului");
        }
        alert("Grup șters cu succes!");
        return true;
    } catch (error) {
        alert(`Eroare: ${error.message}`);
        return false;
    }
}

async function getGroupsByQuery(query) {
    console.log("Căutare grupuri:", query);
    if (!query) {
        alert("Căutarea nu poate fi goală.");
        return;
    }
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/admin/groups?search=${query}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error("Eroare la căutarea grupului");
        }
        const groups = await response.json();
        if (groups.length === 0) {
            alert("Nu s-au găsit grupuri care să corespundă căutării.");
            return;
        }
        return groups;
    } catch (error) {
        alert(`Eroare: ${error.message}`);
        return [];
    }
}

openGroupsBtn.addEventListener('click', () => {
    groupsModal.classList.remove('hidden');
    groupsOverlay.classList.remove('hidden');
});

closeGroupsBtn.addEventListener('click', () => {
    groupsModal.classList.add('hidden');
    groupsOverlay.classList.add('hidden');
    clearGroupSearch();
});

overlay.addEventListener('click', () => {
    groupsModal.classList.add('hidden');
    groupsOverlay.classList.add('hidden');
    clearGroupSearch();
});


function loadGroups(groups) {
    console.log(groups);
    groupList.innerHTML = '';
    groups.forEach((group) => {
        const groupRow = document.createElement('tr');
        groupRow.innerHTML = `
            <td>${group.name}</td>
            <td>
                <button class="delete-group-button" 
                data-group-id="${group.id}"
                >Șterge</button>
            </td>
        `
        const deleteGroupBtn = groupRow.querySelector('.delete-group-button');
        deleteGroupBtn.addEventListener('click', async (event) => {
            const groupId = event.target.getAttribute('data-group-id');
            const wasDeleted = await deleteGroup(groupId);
            if (wasDeleted) {
                groupRow.remove();
            }
        }
        );
        groupList.appendChild(groupRow);
    })
}

const searchGroupByQuery = async () => {
    const query = searchGroupInput.value.trim();
    if (query === "") {
        groupList.innerHTML = "";
        groupList.classList.add('hidden');
        return;
    }
    const filteredGroups = await getGroupsByQuery(query);

    if (filteredGroups.length === 0) {
        groupList.innerHTML = "";
        groupList.classList.add('hidden');
    } else {
        loadGroups(filteredGroups);
    }
}

function clearGroupSearch() {
    searchGroupInput.value = "";
    groupList.innerHTML = "";
}

clearGroupSearchButton.addEventListener('click', clearGroupSearch);
searchGroupButton.addEventListener('click', searchGroupByQuery);
