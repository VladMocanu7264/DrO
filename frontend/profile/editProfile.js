const openBtn = document.getElementById('edit-profile-button');
const closeBtn = document.getElementById('close-modal');
const modal = document.getElementById('edit-modal');
const overlay = document.getElementById('overlay');
const deleteAccountBtn = document.getElementById('delete-account-button');
const logoutBtn = document.getElementById('logout-button');
const mainInfoBtn = document.getElementById('edit-main-info-btn');
const clearMainInfoBtn = document.getElementById('clear-main-info-btn');
const emailBtn = document.getElementById('edit-email-btn');
const clearEmailBtn = document.getElementById('clear-email-btn');
const passwordBtn = document.getElementById('edit-password-btn');
const clearPasswordBtn = document.getElementById('clear-password-btn');

const passwordInput = document.getElementById('password');
const oldPasswordInput = document.getElementById('old-password');

async function fetchPublicProfile(username) {
    try {
        const res = await fetch(`${API_BASE_URL}/users/${username}`);
        if (!res.ok) {
            throw new Error("Nu s-a putut încărca profilul utilizatorului");
        }
        const data = await res.json();

        // Afișare date profil
        document.getElementById("public-username").textContent = data.username;
        document.getElementById("public-description").textContent = data.description || "Fără descriere";
        if (data.image) {
            document.getElementById("public-profile-image").src = data.image;
        }

        const listsContainer = document.getElementById("public-lists-container");
        listsContainer.innerHTML = "";
        data.lists.forEach(list => {
            const listEl = document.createElement("div");
            listEl.classList.add("profile-list");
            listEl.innerHTML = `
              <h4>${list.name}</h4>
              <div class="list-drinks">
                ${list.drinks.map(drink => `
                  <img src="${drink.image}" alt="${drink.name}" class="list-drink-img" title="${drink.name}">
                `).join("")}
              </div>
            `;
            listsContainer.appendChild(listEl);
        });

    } catch (err) {
        alert(err.message);
    }
}

async function fetchOwnProfile() {
    const token = checkAuth();
    try {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) throw new Error("Nu s-a putut încărca profilul propriu");
        const data = await res.json();

        document.getElementById("public-username").textContent = data.username;
        document.getElementById("public-email").textContent = data.email;
        document.getElementById("public-description").textContent = data.description || "Fără descriere";
        if (data.image) {
            document.getElementById("public-profile-image").src = data.image;
        }



    } catch (err) {
        alert(err.message);
    }
}

async function deleteAccount() {
    if (confirm('Sigur doriți să ștergeți contul? Această acțiune nu poate fi anulată.')) {
        const token = checkAuth();
        try {
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error("Eroare la ștergerea contului");
            }
            alert("Cont șters cu success!");
            localStorage.removeItem('token');
            window.location.href = '../login/index.html';
        } catch (error) {
            alert("Eroare:", error);
        }
    }
}

async function logout() {
    const token = checkAuth();
    try {
        localStorage.removeItem('token');
        window.location.href = '../login/index.html';
    } catch (error) {
        alert("Eroare:", error);
    }
}

async function editMainInfo() {
    const usernameValue = document.getElementById('username').value.trim();
    const descriptionValue = document.getElementById('description').value.trim();

    const imageInput = document.getElementById('profile-image');
    const imageFile = imageInput.files[0];

    const formData = new FormData();
    formData.append('username', usernameValue);
    formData.append('description', descriptionValue);

    if (imageFile) {
        formData.append('profile_image', imageFile);
    }

    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Eroare la actualizarea profilului: ${response}`);
        }
        alert('Profil actualizat cu succes!');
        clearMainInfoForm();
    } catch (err) {
        alert(`Eroare: ${err.message}`);
    }

    fetchOwnProfile();
}

async function editEmail() {
    const emailValue = document.getElementById('email').value.trim();
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        alert('Vă rugăm să introduceți o adresă de email validă.');
        return;
    }
    const token = checkAuth();
    try {
        const response = await fetch(`http://localhost:3000/users/me/email`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ email: emailValue })
        });
        if (!response.ok) {
            throw new Error(`Actualizarea email-ului a eșuat`);
        }
        alert('Email actualizat cu succes!');
        clearEmailForm();
    } catch (err) {
        alert(`Eroare la trimiterea datelor: ${err.message}`);
    }

    fetchOwnProfile();
}
async function editPassword() {
    const passwordValue = passwordInput.value.trim();
    const oldPasswordValue = oldPasswordInput.value.trim();
    if (!passwordValue || !oldPasswordValue) {
        alert('Vă rugăm să introduceți o parolă validă.');
        return;
    }

    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/users/me/password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ oldPassword: oldPasswordValue, newPassord: passwordValue })
        });
        if (!response.ok) {
            throw new Error(`Actualizarea parolei a eșuat`);
        }
        alert('Parolă actualizată cu succes!');
        clearPasswordForm();
    } catch (err) {
        alert(`Eroare la trimiterea datelor: ${err.message}`);
    }
}

openBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
});

closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
    clearAllForms();
});

overlay.addEventListener('click', () => {
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
    clearAllForms();
});

document.addEventListener("DOMContentLoaded", () => {
    fetchOwnProfile();
});

const clearMainInfoForm = () => {
    document.getElementById('username').value = '';
    document.getElementById('description').value = '';
    document.getElementById('profile-image').value = '';
}

const clearEmailForm = () => {
    document.getElementById('email').value = '';
}

const clearPasswordForm = () => {
    passwordInput.value = '';
    oldPasswordInput.value = '';
}

const clearAllForms = () => {
    clearMainInfoForm();
    clearEmailForm();
    clearPasswordForm();
}


deleteAccountBtn.addEventListener('click', deleteAccount);
logoutBtn.addEventListener('click', logout);
mainInfoBtn.addEventListener('click', editMainInfo);
clearMainInfoBtn.addEventListener('click', clearMainInfoForm);
emailBtn.addEventListener('click', editEmail);
clearEmailBtn.addEventListener('click', clearEmailForm);
passwordBtn.addEventListener('click', editPassword);
clearPasswordBtn.addEventListener('click', clearPasswordForm);