const openUsersBtn = document.getElementById('users-button');
const closeUsersBtn = document.getElementById('close-user-modal');
const usersModal = document.getElementById('users-modal');
const usersOverlay = document.getElementById('overlay');
const userList = document.getElementById('users-list');

const users = [
    { id: 1, name: 'Alice', email: 'alice@yahoo.com', role: 'Admin' },
    { id: 2, name: 'Bob', email: 'bob@yahoo.com', role: 'User' },
    { id: 3, name: 'Charlie', email: 'charlie@yahoo.com', role: 'User' },
    { id: 4, name: 'David', email: 'david@yahoo.com', role: 'User' },
    { id: 1, name: 'Alice', email: 'alice@yahoo.com', role: 'Admin' },
    { id: 2, name: 'Bob', email: 'bob@yahoo.com', role: 'User' },
    { id: 3, name: 'Charlie', email: 'charlie@yahoo.com', role: 'User' },
    { id: 4, name: 'David', email: 'david@yahoo.com', role: 'User' },
]

openUsersBtn.addEventListener('click', () => {
    usersModal.classList.remove('hidden');
    usersOverlay.classList.remove('hidden');
});

closeUsersBtn.addEventListener('click', () => {
    usersModal.classList.add('hidden');
    usersOverlay.classList.add('hidden');
});

overlay.addEventListener('click', () => {
    usersModal.classList.add('hidden');
    usersOverlay.classList.add('hidden');
});


function loadUsers() {
    userList.innerHTML = '';
    users.forEach((user) => {
        userRow = document.createElement('tr');
        userRow.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                <button class="delete-user-button">Șterge</button>
            </td>
        `
        userList.appendChild(userRow);
    })
}

document.addEventListener('DOMContentLoaded', loadUsers);