const API_BASE_URL = "http://localhost:3000";

const customSelect = document.getElementById("group-selector");
const triggerBtn = customSelect.querySelector(".cs-trigger");
const optionsList = customSelect.querySelector(".cs-options");
const drinkIdContainer = document.getElementById("drink-id");
let drinkId = null;
let selectedGroupId = null;

async function getAllGroupsForUser() {
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/groups/user`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error("Eroare la obținerea grupurilor");
        }
        const groups = await response.json();
        return groups;
    } catch (error) {
        alert("Eroare:" + error);
    }
}

async function populateGroupForm() {
    const params = new URLSearchParams(window.location.search);
    drinkId = params.get("drinkId");
    drinkIdContainer.textContent = `ID băutură: ${drinkId}`;

    const groups = await getAllGroupsForUser();
    if (!groups || groups.length === 0) {
        alert("Nu aveți grupuri disponibile.");
        return;
    }
    optionsList.innerHTML = groups
        .map(g => `<li data-value="${g.id}">${g.name}</li>`)
        .join("");

    triggerBtn.addEventListener("click", () => {
        customSelect.classList.toggle("open");
    });

    optionsList.addEventListener("click", e => {
        if (e.target.tagName !== "LI") return;
        selectedGroupId = e.target.dataset.value;
        triggerBtn.textContent = e.target.textContent;
        customSelect.classList.remove("open");
    });

    document.addEventListener("click", e => {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove("open");
        }
    });
}


async function createPost(groupId, drinkId, text) {
    if (!groupId || !drinkId || !text) {
        alert("ID-ul grupului, ID-ul băuturii și textul postării sunt necesare.");
        return;
    }
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/groups/${groupId}/posts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ drinkId, text })
        });
        if (response.status === 400) {
            throw new Error("Postarea nu a putut fi creată. Verifică datele introduse.");
        }
        if (response.status === 403) {
            throw new Error("Nu ai permisiunea de a crea postări în acest grup.");
        }
        if (response.status === 404) {
            throw new Error("Grupul sau băutura nu a fost găsită.");
        }

        if (response.status !== 201) {
            throw new Error("Eroare la crearea postării");
        }
        alert("Postarea a fost creată cu succes!");
        clearForm();
        window.location.href = "../groups/index.html";
    } catch (error) {
        alert("Eroare:" + error);
    }
}

async function handleCreatePost() {
    const text = document.getElementById("text").value.trim();
    await createPost(selectedGroupId, drinkId, text);
}

function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../login/index.html";
        return false;
    }
    return token;
}

function clearForm() {
    document.getElementById("text").value = "";

    selectedGroupId = null;
    triggerBtn.textContent = "Alege grup";

    optionsList.querySelectorAll("li.selected").forEach(li => {
        li.classList.remove("selected");
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await populateGroupForm();
});