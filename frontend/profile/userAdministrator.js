const API_BASE_URL = "http://localhost:3000";

async function deleteUser(userId) {
    if (!userId) {
        alert("ID-ul utilizatorului lipsește.");
        return false;
    }

    const token = checkAuth();
    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/users/${userId}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );
        if (!response.ok) {
            alert("Eroare la ștergerea utilizatorului");
            return false;
        }
        alert("Utilizator șters cu succes!");
        return true;
    } catch (error) {
        alert(`Eroare de rețea: ${error}`);
        return false;
    }
}


async function getUserByName(name) {
    if (!name) {
        alert("Numele utilizatorului lipsește.");
        return [];
    }
    const token = checkAuth();
    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/users?search=${name}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );
        if (!response.ok) {
            alert("Eroare la căutarea utilizatorului");
            return [];
        }
        const users = await response.json();
        if (users.length === 0) {
            alert("Nu s-au găsit utilizatori cu acest nume.");
        }
        console.log(users);
        return users;
    } catch (error) {
        alert(`Eroare de rețea: ${error}`);
        return [];
    }
}

const openUsersBtn = document.getElementById('users-button');
const closeUsersBtn = document.getElementById('close-user-modal');
const usersModal = document.getElementById('users-modal');
const usersOverlay = document.getElementById('overlay');
const userList = document.getElementById('users-list');
const searchUserInput = document.getElementById("search-user-admin");
const searchUserButton = document.getElementById('search-user-icon');
const clearUserSearchButton = document.getElementById('clear-user-search-icon');


openUsersBtn.addEventListener('click', () => {
    usersModal.classList.remove('hidden');
    usersOverlay.classList.remove('hidden');
});

closeUsersBtn.addEventListener('click', () => {
    usersModal.classList.add('hidden');
    usersOverlay.classList.add('hidden');
    clearUserSearch();
});

overlay.addEventListener('click', () => {
    usersModal.classList.add('hidden');
    usersOverlay.classList.add('hidden');
    clearUserSearch();
});


function loadUsers(arrayOfUsers) {
    userList.innerHTML = '';

    arrayOfUsers.forEach((user) => {
        const userRow = document.createElement('tr');
        userRow.innerHTML = `
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>
        <button 
          class="delete-user-button"
          data-user-id="${user.id}"
        >
          Șterge
        </button>
      </td>
    `;
        const deleteUserBtn = userRow.querySelector('.delete-user-button');
        deleteUserBtn.addEventListener('click', async () => {
            const id = deleteUserBtn.getAttribute('data-user-id');

            const wasDeleted = await deleteUser(id);
            if (wasDeleted) {
                userRow.remove();
            }
        });

        userList.appendChild(userRow);
    });
}

const searchUserByName = async () => {
    const query = searchUserInput.value.trim();

    if (query === "") {
        userListContainer.innerHTML = "";
        userListContainer.classList.add('hidden');
        return;
    }
    const filteredUsers = await getUserByName(query);

    if (filteredUsers.length === 0) {
        userListContainer.innerHTML = "";
        userListContainer.classList.add('hidden');
    } else {
        loadUsers(filteredUsers);
    }
}

function clearUserSearch() {
    searchUserInput.value = "";
    userList.innerHTML = "";
}

clearUserSearchButton.addEventListener('click', clearUserSearch);
searchUserButton.addEventListener('click', searchUserByName);