async function logout() {
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error("Eroare la deconectare");
        }
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        window.location.href = '../login/index.html';
    }
    catch (error) {
        alert("Eroare:", error);
    }
}

async function deleteAccount() {
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
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        window.location.href = '../login/index.html';
    } catch (error) {
        alert("Eroare:", error);
    }
}

async function updateProfile(username, description, image) {
    const token = checkAuth();
    try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('description', description);
        if (image) {
            formData.append('image', image);
        }

        const response = await fetch(`${API_BASE_URL}/users/me`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error("Eroare la actualizarea profilului");
        }
        alert("Profil actualizat cu succes!");
    } catch (error) {
        alert("Eroare:", error);
    }
}


async function changeEmail(newEmail) {
    console.log(API_BASE_URL);
    const token = checkAuth();
    try {
        
        const response = await fetch(`${API_BASE_URL}/users/me/email`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ email: newEmail })
        });

        if (!response.ok) {
            throw new Error("Eroare la schimbarea adresei de email");
        }
        alert("Email actualizat cu succes!");
    } catch (error) {
        alert("Eroare:", error);
    }
}

async function changePassword(oldPassword, newPassword) {
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/users/me/password`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ oldPassword, newPassword })
        });

        if (!response.ok) {
            throw new Error("Eroare la schimbarea parolei");
        }
        alert("Parolă actualizată cu succes!");
    } catch (error) {
        alert(`Eroare: ${error.message}`);
    }
}

const adminUsersBtn = document.getElementById('users-button');
const adminDrinksBtn = document.getElementById('drinks-button');
const adminGroupsBtn = document.getElementById('groups-button');

function checkAdminAccess() {

    const userRole = JSON.parse(localStorage.getItem('user'));

    if (!userRole.is_admin) {
        adminUsersBtn.style.display = 'none';
        adminDrinksBtn.style.display = 'none';
        adminGroupsBtn.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
});

function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "../login/index.html";
    return false;
  }
  return token;
}
