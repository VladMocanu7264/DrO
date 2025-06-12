const openGroupsBtn = document.getElementById('groups-button');
const closeGroupsBtn = document.getElementById('close-group-modal');
const groupsModal = document.getElementById('groups-modal');
const groupsOverlay = document.getElementById('overlay');
const groupList = document.getElementById('groups-list');

const groups = [
    { id: 1, name: 'Group A', description: 'Description for Group A' },
    { id: 2, name: 'Group B', description: 'Description for Group B' },
    { id: 3, name: 'Group C', description: 'Description for Group C' },
    { id: 4, name: 'Group D', description: 'Description for Group D' },
]

openGroupsBtn.addEventListener('click', () => {
    groupsModal.classList.remove('hidden');
    groupsOverlay.classList.remove('hidden');
});

closeGroupsBtn.addEventListener('click', () => {
    groupsModal.classList.add('hidden');
    groupsOverlay.classList.add('hidden');
});

overlay.addEventListener('click', () => {
    groupsModal.classList.add('hidden');
    groupsOverlay.classList.add('hidden');
});


function loadGroups() {
    groupList.innerHTML = '';
    groups.forEach((group) => {
        groupRow = document.createElement('tr');
        groupRow.innerHTML = `
            <td>${group.name}</td>
            <td>
                <button class="delete-user-button">Șterge</button>
            </td>
        `
        groupList.appendChild(groupRow);
    })
}

document.addEventListener('DOMContentLoaded', loadGroups);
