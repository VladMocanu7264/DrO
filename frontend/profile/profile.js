// const listContainer = document.querySelector('.lists-container');
// const drinkListSelect = document.getElementById('drink-list-select');
// const selectedList = '';

// const adminUsersBtn = document.getElementById('users-button');
// const adminDrinksBtn = document.getElementById('drinks-button');
// const adminGroupsBtn = document.getElementById('groups-button');

// const mockedListsNames = [
//     { id: 1, name: "Lista 1", drinks: [1, 2, 3, 4, 5, 6] },
//     { id: 2, name: "Lista 2", drinks: [4, 5] },
//     { id: 3, name: "Lista 3", drinks: [6, 7, 8] },
//     { id: 4, name: "Lista 4", drinks: [9, 10] },
//     { id: 5, name: "Lista 5", drinks: [11, 12] }
// ];

// function loadLists(listId) {
//     if (!listContainer) {
//         console.error("List container not found");
//         return;
//     }
//     listContainer.innerHTML = '';

//     const selectedListData = mockedListsNames.find(list => list.id === parseInt(listId));
//     if (!selectedListData) {
//         console.error(`List with ID ${listId} not found`);
//         return;
//     }

//     mockedDrinks.forEach((drink) => {
//         if (selectedListData.drinks.includes(drink.id)) {
//             const card = document.createElement('div');
//             card.classList.add('drink-card');
//             card.innerHTML = `
//                 <h3>${drink.name}</h3>
//                 <p>${drink.category}</p>
//                 <img src="${drink.image}" alt="Drink Image">
//             `;
//             listContainer.appendChild(card);
//         }
//     });

// }

// function loadDrinkList() {
//     if (!drinkListSelect) {
//         console.error("Drink list select not found");
//         return;
//     }
//     drinkListSelect.innerHTML = '';

//     drinkListSelect.addEventListener('change', (event) => {
//         const selectedListId = event.target.value;
//         loadLists(selectedListId);
//     });

//     const placeholder = document.createElement('option');
//     placeholder.value = '';
//     placeholder.textContent = '-- Alege o listă --';
//     placeholder.disabled = true;
//     placeholder.selected = true;
//     drinkListSelect.appendChild(placeholder);

//     mockedListsNames.forEach((list) => {
//         const option = document.createElement('option');
//         option.value = list.id;
//         option.textContent = list.name;
//         drinkListSelect.appendChild(option);
//     });
// }

// function checkAdminAccess() {
//     const userRole = localStorage.getItem('userRole');
//     if (userRole !== 'admin') {
//         adminUsersBtn.style.display = 'none';
//         adminDrinksBtn.style.display = 'none';
//         adminGroupsBtn.style.display = 'none';
//     }
// }

// document.addEventListener('DOMContentLoaded', () => {
//     checkAdminAccess();
//     loadDrinkList();
// });

const token = localStorage.getItem("token");
const headers = token ? { Authorization: `Bearer ${token}` } : {};

const username = new URLSearchParams(window.location.search).get("user");
const profileContainer = document.querySelector(".profile-content");
const logoutBtn = document.getElementById("logout-button");
const deleteBtn = document.getElementById("delete-account-button");

async function fetchProfileData(username) {
  try {
    const res = await fetch(`${window.env.API_BASE_URL}/users/${username}`, { headers });
    if (!res.ok) throw new Error("Eroare profil");
    return await res.json();
  } catch (err) {
    console.warn("Fallback la profil mock:", err.message);
    return mockedProfile; // fallback dacă ai definit un profil mock
  }
}

function generateProfileUI(data) {
  profileContainer.innerHTML = `
    <div class="profile-info">
      <img src="${data.image_path || "../public/poze/avatar.jpg"}" alt="${data.username}">
      <h2>@${data.username}</h2>
      <p>${data.description || "Fără descriere"}</p>
    </div>
    <div class="profile-lists">
      <h3>Liste publice</h3>
      ${data.lists && data.lists.length
        ? data.lists.map(generateListCard).join("")
        : "<p>Nu există liste publice.</p>"}
    </div>
  `;
  bindCopyButtons();
}

function generateListCard(list) {
  return `
    <div class="list-card">
      <h4>${list.name}</h4>
      <div class="drink-preview">
        ${list.drinks.map(drink => `
          <div class="drink-item">
            <img src="${drink.image_url || "../public/poze/smoothie.png"}" alt="${drink.name}" />
            <span>${drink.name}</span>
          </div>`).join("")}
      </div>
      <button class="copy-list-button" data-id="${list.id}">Copiază Lista</button>
    </div>
  `;
}

function bindCopyButtons() {
  const copyButtons = document.querySelectorAll(".copy-list-button");
  copyButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      const listId = btn.dataset.id;
      try {
        const res = await fetch(`${window.env.API_BASE_URL}/lists/${listId}/copy`, {
          method: "POST",
          headers
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Eroare copiere");
        alert("Listă copiată cu succes!");
      } catch (err) {
        alert("Eroare copiere listă: " + err.message);
      }
    });
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      const res = await fetch(`${window.env.API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login/";
    } catch {
      alert("Eroare la logout");
    }
  });
}

if (deleteBtn) {
  deleteBtn.addEventListener("click", async () => {
    if (!confirm("Sigur vrei să-ți ștergi contul? Această acțiune este ireversibilă.")) return;
    try {
      const res = await fetch(`${window.env.API_BASE_URL}/users/me`, {
        method: "DELETE",
        headers
      });
      localStorage.clear();
      alert("Cont șters cu succes.");
      window.location.href = "/login/";
    } catch {
      alert("Eroare la ștergerea contului.");
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!username) {
    alert("Profil invalid");
    return;
  }
  const data = await fetchProfileData(username);
  generateProfileUI(data);
});
