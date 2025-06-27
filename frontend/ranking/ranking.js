// ranking.js
import DrinkUI from '../public/DrinkUI.js';

const API_BASE_URL = (window.env && window.env.API_BASE_URL) || '';
const token = localStorage.getItem("token");
if (!token) {
    alert("Trebuie să fii autentificat pentru a accesa această pagină.");
    window.location.href = "/login/";
}

const container = document.querySelector(".cards-container");
const overlay = document.querySelector(".overlay");
const modalsContainer = document.getElementById("text-box-container");
let userLists = [];
let drinksData = [];

async function fetchUserLists() {
    try {
        const res = await fetch(`${API_BASE_URL}/lists`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Eroare la încărcarea listelor");
        const data = await res.json();
        return data || [];
    } catch (err) {
        console.error("Eroare la list API:", err);
        return [];
    }
}

async function fetchDrinkRanking(limit = 50) {
    try {
        const res = await fetch(`${API_BASE_URL}/drinks/ranking?limit=${limit}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Eroare la încărcarea clasamentului");
        const data = await res.json();
        return data || [];
    } catch (err) {
        console.error("Eroare la ranking API:", err);
        return [];
    }
}

function renderRanking(drinks) {
    container.innerHTML = "";
    drinks.forEach(drink => {
        const card = DrinkUI.createDrinkCard(drink, userLists);
        container.appendChild(card);
    });
}

function closeAllModals() {
    document.querySelectorAll(".text-box").forEach(m => m.classList.add("hidden"));
    overlay.classList.add("hidden");
    document.body.classList.remove("no-scroll");
}

document.addEventListener("DOMContentLoaded", async () => {
    userLists = await fetchUserLists();
    drinksData = await fetchDrinkRanking(50);
    renderRanking(drinksData);

    overlay.addEventListener("click", closeAllModals);
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") closeAllModals();
    });
});

document.getElementById("select-all-btn").addEventListener("click", () => {
    const selected = {};
    document.querySelectorAll(".drink-checkbox").forEach(cb => {
        cb.checked = true;
        const drinkId = cb.dataset.drinkId;
        const drink = drinksData.find(d => d.id == drinkId);
        if (drink) selected[drinkId] = drink;
    });
    localStorage.setItem("selectedDrinks", JSON.stringify(selected));
});

document.getElementById("deselect-all-btn").addEventListener("click", () => {
    document.querySelectorAll(".drink-checkbox").forEach(cb => {
        cb.checked = false;
    });
    localStorage.removeItem("selectedDrinks");
});
