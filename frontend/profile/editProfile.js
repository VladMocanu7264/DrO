// const openBtn = document.getElementById('edit-profile-button');
// const closeBtn = document.getElementById('close-modal');
// const modal = document.getElementById('edit-modal');
// const overlay = document.getElementById('overlay');

// openBtn.addEventListener('click', () => {
//     modal.classList.remove('hidden');
//     overlay.classList.remove('hidden');
// });

// closeBtn.addEventListener('click', () => {
//     modal.classList.add('hidden');
//     overlay.classList.add('hidden');
// });

// overlay.addEventListener('click', () => {
//     modal.classList.add('hidden');
//     overlay.classList.add('hidden');
// });

const API_BASE_URL = window.env.API_BASE_URL;
const token = localStorage.getItem("token");

const openBtn = document.getElementById('edit-profile-button');
const closeBtn = document.getElementById('close-modal');
const modal = document.getElementById('edit-modal');
const overlay = document.getElementById('overlay');

openBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
});

closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
});

overlay.addEventListener('click', () => {
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
});

// Actualizare profil (username, descriere, imagine)
document.getElementById("update-profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("new-username").value.trim();
    const description = document.getElementById("description").value.trim();
    const imagePath = document.getElementById("image-url").value.trim();

    if (!username && !description && !imagePath) {
        alert("Introduceți cel puțin un câmp pentru actualizare!");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ username, description, image_path: imagePath }),
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Eroare necunoscută");

        alert("Profil actualizat cu succes!");
        location.reload();
    } catch (error) {
        alert("Eroare actualizare profil: " + error.message);
    }
});

// Actualizare email
document.getElementById("update-email-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const newEmail = document.getElementById("new-email").value.trim();

    if (!newEmail) {
        alert("Introduceți o adresă de email nouă!");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/me/email`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email: newEmail }),
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Eroare necunoscută");

        alert("Email actualizat cu succes!");
        location.reload();
    } catch (error) {
        alert("Eroare actualizare email: " + error.message);
    }
});

// Schimbare parolă
document.getElementById("update-password-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const oldPassword = document.getElementById("old-password").value.trim();
    const newPassword = document.getElementById("new-password").value.trim();

    if (!oldPassword || !newPassword) {
        alert("Completați ambele câmpuri pentru parolă!");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/me/password`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ oldPassword, newPassword }),
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Eroare necunoscută");

        alert("Parolă schimbată cu succes!");
        document.getElementById("old-password").value = "";
        document.getElementById("new-password").value = "";
    } catch (error) {
        alert("Eroare schimbare parolă: " + error.message);
    }
});