// const openUsersBtn = document.getElementById('users-button');
// const closeUsersBtn = document.getElementById('close-user-modal');
// const usersModal = document.getElementById('users-modal');
// const usersOverlay = document.getElementById('overlay');
// const userList = document.getElementById('users-list');

// const users = [
//     { id: 1, name: 'Alice', email: 'alice@yahoo.com', role: 'Admin' },
//     { id: 2, name: 'Bob', email: 'bob@yahoo.com', role: 'User' },
//     { id: 3, name: 'Charlie', email: 'charlie@yahoo.com', role: 'User' },
//     { id: 4, name: 'David', email: 'david@yahoo.com', role: 'User' },
//     { id: 1, name: 'Alice', email: 'alice@yahoo.com', role: 'Admin' },
//     { id: 2, name: 'Bob', email: 'bob@yahoo.com', role: 'User' },
//     { id: 3, name: 'Charlie', email: 'charlie@yahoo.com', role: 'User' },
//     { id: 4, name: 'David', email: 'david@yahoo.com', role: 'User' },
// ]

// openUsersBtn.addEventListener('click', () => {
//     usersModal.classList.remove('hidden');
//     usersOverlay.classList.remove('hidden');
// });

// closeUsersBtn.addEventListener('click', () => {
//     usersModal.classList.add('hidden');
//     usersOverlay.classList.add('hidden');
// });

// overlay.addEventListener('click', () => {
//     usersModal.classList.add('hidden');
//     usersOverlay.classList.add('hidden');
// });


// function loadUsers() {
//     userList.innerHTML = '';
//     users.forEach((user) => {
//         userRow = document.createElement('tr');
//         userRow.innerHTML = `
//             <td>${user.name}</td>
//             <td>${user.email}</td>
//             <td>
//                 <button class="delete-user-button">Șterge</button>
//             </td>
//         `
//         userList.appendChild(userRow);
//     })
// }

// document.addEventListener('DOMContentLoaded', loadUsers);

const API_BASE_URL = window.env.API_BASE_URL;
const token = localStorage.getItem("token");

const openUsersBtn = document.getElementById('users-button');
const closeUsersBtn = document.getElementById('close-user-modal');
const usersModal = document.getElementById('users-modal');
const usersOverlay = document.getElementById('overlay');
const userList = document.getElementById('users-list');
const searchInput = document.getElementById('admin-user-search');

let fetchedUsers = [];

openUsersBtn.addEventListener('click', () => {
    usersModal.classList.remove('hidden');
    usersOverlay.classList.remove('hidden');
});

closeUsersBtn.addEventListener('click', () => {
    usersModal.classList.add('hidden');
    usersOverlay.classList.add('hidden');
});

usersOverlay.addEventListener('click', () => {
    usersModal.classList.add('hidden');
    usersOverlay.classList.add('hidden');
});

function renderUsers(users) {
    userList.innerHTML = '';
    users.forEach((user) => {
        const userRow = document.createElement('tr');
        userRow.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td class="table-actions">
                <button class="delete-user-button" data-user-id="${user.id}">Șterge</button>
            </td>
        `;
        userList.appendChild(userRow);
    });

    document.querySelectorAll(".delete-user-button").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const userId = e.target.dataset.userId;
            if (!confirm("Sigur vrei să ștergi acest utilizator?")) return;

            try {
                const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Eroare ștergere");

                fetchedUsers = fetchedUsers.filter(u => u.id !== userId);
                renderUsers(fetchedUsers);
            } catch (err) {
                alert("Eroare la ștergere: " + err.message);
            }
        });
    });
}

async function loadUsers(query = "") {
    try {
        const res = await fetch(`${API_BASE_URL}/admin/users?search=${encodeURIComponent(query)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Eșec la încărcarea utilizatorilor");

        fetchedUsers = await res.json();
        renderUsers(fetchedUsers);
    } catch (err) {
        alert("Eroare la încărcarea utilizatorilor: " + err.message);
    }
}

searchInput?.addEventListener("input", (e) => {
    const searchTerm = e.target.value;
    loadUsers(searchTerm);
});

document.addEventListener("DOMContentLoaded", () => {
    loadUsers();
});