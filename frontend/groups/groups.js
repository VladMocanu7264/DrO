const API_BASE_URL = "http://localhost:3000";

const searchInput = document.getElementById("search-group");
const sortSelect = document.getElementById("sort-select");
const createGroupButton = document.getElementsByClassName("add-group-button");

let currentPage = 1;
let totalPages = 1;
const limit = 5;

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

async function getPostsByGroup(groupId, page = 1, limit = 10) {
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
            fetchedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            selectedGroupId = group.id;
            if (!fetchedPosts || fetchedPosts.length === 0) {
                totalPages = 0;
                updatePaginationControls();
                generateEmptyGroup();
                return;
            }
            generatePosts(fetchedPosts);
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
}

function generatePosts(posts) {
    const postsContainer = document.querySelector('.posts-container');
    if (!postsContainer) return;

    postsContainer.innerHTML = '';

    posts.forEach((post) => {
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
        const likesCount = postDiv.querySelector('.likes-count');

        likeIcon.addEventListener('click', async () => {
            console.log("Like icon clicked for post ID:", post.id);
            let postLiked = await likePost(post.id);
            if (postLiked) {
                likesCount.textContent = parseInt(likesCount.textContent) + 1;
            }
        }
        );

        postsContainer.appendChild(postDiv);
    });
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
    console.log("Updating pagination controls:", currentPage, totalPages);
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

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        getPostsByGroup(selectedGroupId, currentPage - 1).then(generatePosts);
    }
});
document.getElementById('next-page').addEventListener('click', () => {
    if (currentPage < totalPages) {
        getPostsByGroup(selectedGroupId, currentPage + 1).then(generatePosts);
    }
});

document.addEventListener('DOMContentLoaded', generateRadioFilter);

