// const openGroupsBtn = document.getElementById('groups-button');
// const closeGroupsBtn = document.getElementById('close-group-modal');
// const groupsModal = document.getElementById('groups-modal');
// const groupsOverlay = document.getElementById('overlay');
// const groupList = document.getElementById('groups-list');

// const groups = [
//     { id: 1, name: 'Group A', description: 'Description for Group A' },
//     { id: 2, name: 'Group B', description: 'Description for Group B' },
//     { id: 3, name: 'Group C', description: 'Description for Group C' },
//     { id: 4, name: 'Group D', description: 'Description for Group D' },
// ]

// openGroupsBtn.addEventListener('click', () => {
//     groupsModal.classList.remove('hidden');
//     groupsOverlay.classList.remove('hidden');
// });

// closeGroupsBtn.addEventListener('click', () => {
//     groupsModal.classList.add('hidden');
//     groupsOverlay.classList.add('hidden');
// });

// overlay.addEventListener('click', () => {
//     groupsModal.classList.add('hidden');
//     groupsOverlay.classList.add('hidden');
// });


// function loadGroups() {
//     groupList.innerHTML = '';
//     groups.forEach((group) => {
//         groupRow = document.createElement('tr');
//         groupRow.innerHTML = `
//             <td>${group.name}</td>
//             <td>
//                 <button class="delete-user-button">Șterge</button>
//             </td>
//         `
//         groupList.appendChild(groupRow);
//     })
// }

// document.addEventListener('DOMContentLoaded', loadGroups);

const openGroupsBtn = document.getElementById('groups-button');
const closeGroupsBtn = document.getElementById('close-group-modal');
const groupsModal = document.getElementById('groups-modal');
const groupsOverlay = document.getElementById('overlay');
const groupList = document.getElementById('groups-list');
const searchInput = document.getElementById('search-group-admin');

const API_BASE_URL = window.env.API_BASE_URL;
const token = localStorage.getItem("token");

// Deschide/închide modal
openGroupsBtn.addEventListener('click', () => {
  groupsModal.classList.remove('hidden');
  groupsOverlay.classList.remove('hidden');
});

closeGroupsBtn.addEventListener('click', () => {
  groupsModal.classList.add('hidden');
  groupsOverlay.classList.add('hidden');
});

groupsOverlay.addEventListener('click', () => {
  groupsModal.classList.add('hidden');
  groupsOverlay.classList.add('hidden');
});

// Fetch grupuri din API
async function fetchGroups(search = "") {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/groups?search=${encodeURIComponent(search)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Eroare la încărcarea grupurilor");
    return await res.json();
  } catch (err) {
    console.error("Eroare API grupuri:", err);
    return [];
  }
}

// Șterge grup
async function deleteGroup(id) {
  if (!confirm("Sigur doriți să ștergeți acest grup?")) return;

  try {
    const res = await fetch(`${API_BASE_URL}/admin/groups/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Eroare la ștergere");
    alert("Grup șters cu succes!");
    loadGroups(searchInput.value);
  } catch (err) {
    console.error("Eroare ștergere grup:", err);
    alert("Eroare la ștergere grup.");
  }
}

// Încarcă grupurile în tabel
async function loadGroups(search = "") {
  const groups = await fetchGroups(search);
  groupList.innerHTML = "";

  groups.forEach((group) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td data-label="Nume">${group.name}</td>
      <td data-label="Acțiuni:">
        <div class="table-actions">
          <button class="delete-user-button" data-id="${group.id}">Șterge</button>
        </div>
      </td>
    `;
    groupList.appendChild(row);
  });

  // Atasează eveniment de ștergere
  document.querySelectorAll(".delete-user-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      deleteGroup(id);
    });
  });
}

// Caută grupuri
searchInput?.addEventListener("input", () => {
  loadGroups(searchInput.value);
});

document.addEventListener("DOMContentLoaded", () => {
  loadGroups();
});

