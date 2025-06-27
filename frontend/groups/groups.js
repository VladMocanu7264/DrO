const API_BASE_URL = "http://localhost:3000";

const searchInput = document.getElementById("search-group");
const sortSelect = document.getElementById("sort-select");
const createGroupButton = document.getElementsByClassName("add-group-button");

let currentPage = 1;
let totalPages = 1;
const limit = 5;
let isGroupAdmin = false;

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

async function getPostsByGroup(groupId, page = 1, limit = 2) {
    if (!groupId) {
        alert("ID-ul grupului lipsește.");
        return;
    }
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/groups/${groupId}/posts?page=${page}&limit=${limit}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            return [];
        }
        const data = await response.json();
        currentPage = page;
        totalPages = data.max_pages || 10;
        updatePaginationControls();
        return data.posts || [];
    } catch (error) {
        alert("Eroare:" + error);
        return [];
    }
}

async function checkIfUserIsGroupAdmin(groupId) {
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/groups/${groupId}/is-admin`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error("Eroare la verificarea drepturilor de administrator");
        }
        isGroupAdmin = await response.json();
        // if (isGroupAdmin) {
        //     document.querySelector('.add-group-button').classList.remove('hidden');
        // }
        return isGroupAdmin.isAdmin;
    } catch (error) {
        alert("Eroare:" + error);
    }
}

async function likePost(postId) {
    if (!postId) {
        alert("ID-ul postării lipsește.");
        return;
    }
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/groups/${selectedGroupId}/posts/${postId}/like`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (response.status === 400) {
            throw new Error("Ai dat deja like la această postare.");
        }
        if (response.status === 404) {
            throw new Error("Postarea nu a fost găsită.");
        }
        if (!response.ok) {
            throw new Error("Eroare la aprecierea postării");
        }
        return true;
    } catch (error) {
        alert("Eroare:" + error);
        return false;
    }
}

async function deletePostById(postId) {
    if (!postId) {
        alert("ID-ul postării lipsește.");
        return;
    }
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/groups/${selectedGroupId}/posts/${postId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (response.status === 403) {
            throw new Error("Nu ai permisiunile necesare.");
        }
        if (response.status === 404) {
            throw new Error("Postarea nu a fost găsită.");
        }
        if (!response.ok) {
            throw new Error("Eroare la ștergerea postării");
        }
        return true;
    } catch (error) {
        alert("Eroare:" + error);
        return false;
    }
}

async function kickUserFromGroup(selectedGroupId, userId) {
    if (!userId) {
        alert("ID-ul utilizatorului lipsește.");
        return;
    }
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/groups/${selectedGroupId}/kick/${userId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (response.status === 403) {
            throw new Error("Nu ai permisiunile necesare.");
        }
        if (response.status === 404) {
            throw new Error("Utilizatorul nu a fost găsit.");
        }
        if (!response.ok) {
            throw new Error("Eroare la ștergerea utilizatorului din grup.");
        }
        return true;
    } catch (error) {
        alert("Eroare:" + error);
        return false;
    }
}

async function postGroup(name, description) {
    if (!name || !description) {
        alert("Numele și descrierea grupului sunt necesare.");
        return;
    }
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/groups`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name, description })
        });

        if (!response.statusCode === 201) {
            throw new Error("Eroare la crearea grupului");
        }
        return true;
    } catch (error) {
        alert("Eroare:" + error);
        return false;
    }
}

async function leaveGroup() {
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/groups/${selectedGroupId}/leave`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Eroare la părăsirea grupului');
        }
        alert('Ai părăsit grupul cu succes.');
        window.location.href = '../groups/index.html';
    } catch (error) {
        alert('Eroare:' + error);
    }
}

let selectedGroupId = null;

async function generateRadioFilter(inputName = 'category') {
    const fetchedGroups = await getAllGroupsForUser();
    const container = document.querySelector('.groups-list');
    if (!container) return;

    container.innerHTML = '';

    fetchedGroups.forEach((group) => {
        const item = document.createElement('div');
        item.classList.add('filter-item');

        const input = document.createElement('input');
        input.type = 'radio';
        input.id = `filter-${group.id}`;
        input.name = inputName;
        input.value = group.id;

        if (selectedGroupId === group.id) {
            input.checked = true;
        }

        const label = document.createElement('label');
        label.setAttribute('for', input.id);
        label.textContent = group.name;

        if (selectedGroupId === group.id) {
            label.classList.add('active');
        }

        input.addEventListener('change', async () => {
            const fetchedPosts = await getPostsByGroup(group.id);
            isGroupAdmin = await checkIfUserIsGroupAdmin(group.id);
            fetchedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            selectedGroupId = group.id;
            if (!fetchedPosts || fetchedPosts.length === 0) {
                totalPages = 0;
                updatePaginationControls();
                generateEmptyGroup();
                return;
            }
            await generatePosts(fetchedPosts);
        });

        item.appendChild(input);
        item.appendChild(label);
        container.appendChild(item);
    });
}

function generateEmptyGroup() {
    const postsContainer = document.querySelector('.posts-container');
    if (!postsContainer) return;

    postsContainer.innerHTML = `
    <div class="empty-post">
      <h2>Acest grup nu are postări încă.</h2>
      <p>Poți adăuga o postare nouă pentru a începe discuția.</p>
    </div>
  `;

    const leaveGroupButton = document.createElement('button');
    leaveGroupButton.id = 'leave-group-btn';
    leaveGroupButton.textContent = 'Părăsește grupul';
    leaveGroupButton.addEventListener('click', async () => {
        if (confirm('Ești sigur că vrei să părăsești acest grup?')) {
            await leaveGroup();
        }
    });
    postsContainer.appendChild(leaveGroupButton);
}


async function generatePosts(posts) {
    const postsContainer = document.querySelector('.posts-container');
    if (!postsContainer) return;

    postsContainer.innerHTML = '';

    const leaveGroupButton = document.createElement('button');
    leaveGroupButton.id = 'leave-group-btn';
    leaveGroupButton.textContent = 'Părăsește grupul';
    leaveGroupButton.addEventListener('click', async () => {
        if (confirm('Ești sigur că vrei să părăsești acest grup?')) {
            await leaveGroup();
        }
    });
    postsContainer.appendChild(leaveGroupButton);

    posts.forEach((post) => {
        console.log(post);
        const postDiv = document.createElement('div');
        postDiv.classList.add('post');
        postDiv.innerHTML = `
      <div class="post-content">
        <div class="user-info">
          <img src="${post.member.image_path}" alt="${post.member.username}" class="user-image">
          <a style="text-decoration:None; color:white" href="../profile-by-id/index.html?username=${encodeURIComponent(post.member.username)}"><p class="card-user">${post.member.username}</p></a>
        </div>
        <p class="post-text">${post.text}</p>
        <div class="drink-info">
          <span class="number-of-likes">
            <i class="fa-solid fa-heart like-icon"
            ></i> 
            <span class="likes-count">${post.likes}</span>
          </span>
          <span class="drink-title">Băutură: ${post.drink.name}</span>
          <span class="post-date">Data: ${new Date(post.time).toLocaleDateString()}</span>
        </div>
      </div>
      <img src="${post.drink.image_url}" alt="${post.drink.name}" class="drink-image">
    `;
        const likeIcon = postDiv.querySelector('.like-icon');
        likeIcon.title = 'Apreciază postarea';
        const likesCount = postDiv.querySelector('.likes-count');

        likeIcon.addEventListener('click', async () => {
                console.log("Like icon clicked for post ID:", post.id);
                let postLiked = await likePost(post.id);
                if (postLiked) {
                    likesCount.textContent = parseInt(likesCount.textContent) + 1;
                }
            }
        );

        if (isGroupAdmin) {
            createDeletePostButton(post, postDiv, postsContainer);
            createKickUserButton(post.member, postDiv, postsContainer);

        }

        postsContainer.appendChild(postDiv);
    });
}

function createDeletePostButton(post, postDiv, postsContainer) {
    const deleteBtn = document.createElement('i');
    deleteBtn.classList.add('fa-solid');
    deleteBtn.classList.add('fa-trash');
    deleteBtn.classList.add('delete-post-btn');
    deleteBtn.title = 'Șterge postarea';
    deleteBtn.addEventListener('click', async () => {
        if (confirm('Esti sigur că vrei să ștergi acest post?')) {
            const ok = await deletePostById(post.id);
            if (ok) {
                postDiv.remove();
                if (postsContainer.children.length === 0) {
                    const fetchedPosts = await getPostsByGroup(selectedGroupId);
                    isGroupAdmin = await checkIfUserIsGroupAdmin(selectedGroupId);
                    fetchedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    if (!fetchedPosts || fetchedPosts.length === 0) {
                        totalPages = 0;
                        updatePaginationControls();
                        generateEmptyGroup();
                        return;
                    }
                    await generatePosts(fetchedPosts);
                }
            } else {
                alert('A apărut o eroare la ștergere.');
            }
        }
    });
    postDiv.querySelector('.drink-info').appendChild(deleteBtn);
}

function createKickUserButton(member, postDiv, postsContainer) {
    console.log(member);
    console.log(JSON.parse(localStorage.getItem('user')).id);
    if (member.id === JSON.parse(localStorage.getItem('user')).id) {
        return;
    }
    const kickBtn = document.createElement('i');
    kickBtn.classList.add('fa-solid');
    kickBtn.classList.add('fa-user-slash');
    kickBtn.classList.add('delete-post-btn');
    kickBtn.title = 'Dă afară utilizatorul din grup';
    kickBtn.addEventListener('click', async () => {
        if (confirm(`Ești sigur că vrei să dai afară utilizatorul ${member.username} din grup?`)) {
            const ok = await kickUserFromGroup(selectedGroupId, member.id);
            if (ok) {
                postDiv.remove();
                if (postsContainer.children.length === 0) {
                    const fetchedPosts = await getPostsByGroup(selectedGroupId);
                    isGroupAdmin = await checkIfUserIsGroupAdmin(selectedGroupId);
                    fetchedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    if (!fetchedPosts || fetchedPosts.length === 0) {
                        totalPages = 0;
                        updatePaginationControls();
                        generateEmptyGroup();
                        return;
                    }
                    await generatePosts(fetchedPosts);
                }
            }
            else {
                alert('A apărut o eroare la darea afară a utilizatorului.');
            }

        }
    });
    postDiv.querySelector('.user-info').appendChild(kickBtn);
}

async function handleAddGroup() {
    const input = document.getElementById('new-group-name');
    const description = document.getElementById('new-group-description');

    await postGroup(input.value.trim(), description.value.trim());
    input.value = '';
    description.value = '';
    generateRadioFilter();
}

function handleClearGroupAdd() {
    const input = document.getElementById('new-group-name');
    const description = document.getElementById('new-group-description');
    input.value = '';
    description.value = '';
}

function handleJoinGroup() {
    window.location.href = `../join-group/index.html`;
}

function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../login/index.html";
        return false;
    }
    return token;
}

function updatePaginationControls() {
    const pagination = document.querySelector('.pagination');
    if (totalPages >= 1) {
        pagination.classList.remove('hidden');
    } else {
        pagination.classList.add('hidden');
    }
    document.getElementById('current-page').textContent = currentPage;
    document.getElementById('total-pages').textContent = totalPages;
    document.getElementById('prev-page').disabled = currentPage <= 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages;
}

document.getElementById('prev-page').addEventListener('click', async () => {
    if (currentPage > 1) {
        getPostsByGroup(selectedGroupId, currentPage - 1).then(generatePosts);
    }
});
document.getElementById('next-page').addEventListener('click', async () => {
    if (currentPage < totalPages) {
        getPostsByGroup(selectedGroupId, currentPage + 1).then(generatePosts);
    }
});

document.addEventListener('DOMContentLoaded', generateRadioFilter);

