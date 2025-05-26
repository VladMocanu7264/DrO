const searchInput = document.getElementById("search-group");
const sortSelect = document.getElementById("sort-select");

let originalData = [];
let selectedGroupId = null;

const mockedPosts = [
    { id: 1, user: 'George', text: '7up este o băutură răcoritoare cu aromă de lămâie și lime, cunoscută pentru gustul său revigorant.', drink: '7up', likes: 5, date: '2023-10-01', image: '../public/poze/7up.png' },
    { id: 2, user: 'Maria', text: 'Coca-Cola este o băutură carbogazoasă populară, cunoscută pentru gustul său dulce și acidulat.', drink: 'Coca-Cola', likes: 10, date: '2023-10-02', image: '../public/poze/cocacola.png' },
    { id: 3, user: 'Ion', text: 'Fanta este o băutură răcoritoare cu aromă de portocale, apreciată pentru gustul său fructat.', drink: 'Fanta', likes: 8, date: '2023-10-03', image: '../public/poze/fanta.png' },
    { id: 4, user: 'Ana', text: 'Sprite este o băutură răcoritoare cu aromă de lămâie și lime, cunoscută pentru gustul său proaspăt.', drink: 'Sprite', likes: 12, date: '2023-10-04', image: '../public/poze/sprite.png' },
    { id: 5, user: 'Andrei', text: 'Pepsi este o băutură carbogazoasă cunoscută pentru gustul său dulce și acidulat.', drink: 'Pepsi', likes: 7, date: '2023-10-05', image: '../public/poze/pepsi.png' },
    { id: 6, user: 'Elena', text: 'Dr Pepper este o băutură carbogazoasă cu un gust unic și complex.', drink: 'Dr Pepper', likes: 3, date: '2023-10-06', image: '../public/poze/drpepper.png' },
    { id: 7, user: 'Vlad', text: 'Mountain Dew este o băutură energizantă cu un gust citric distinct.', drink: 'Mountain Dew', likes: 6, date: '2023-10-07', image: '../public/poze/cocacola.png' },
    { id: 8, user: 'Ioana', text: 'Schweppes este o băutură carbogazoasă cu aromă de citrice, cunoscută pentru gustul său răcoritor.', drink: 'Schweppes', likes: 4, date: '2023-10-08', image: '../public/poze/7up.png' },
    { id: 9, user: 'Cristian', text: 'Nestea este o băutură răcoritoare cu aromă de ceai, apreciată pentru gustul său ușor și revigorant.', drink: 'Nestea', likes: 9, date: '2023-10-09', image: '../public/poze/sprite.png' },
    { id: 10, user: 'Raluca', text: 'Lipton Ice Tea este o băutură răcoritoare cu aromă de ceai, cunoscută pentru gustul său proaspăt și revigorant.', drink: 'Lipton Ice Tea', likes: 11, date: '2023-10-10', image: '../public/poze/sprite.png' },
    { id: 11, user: 'Mihai', text: 'Cappy este o băutură răcoritoare cu aromă de fructe, cunoscută pentru gustul său natural și revigorant.', drink: 'Cappy', likes: 2, date: '2023-10-11', image: '../public/poze/sprite.png' },
    { id: 12, user: 'Sorin', text: 'Pepsi Max este o variantă fără zahăr a băuturii Pepsi, cunoscută pentru gustul său dulce și acidulat.', drink: 'Pepsi Max', likes: 1, date: '2023-10-12', image: '../public/poze/pepsi.png' },
]

const mockedGroups = [
    { id: 1, name: 'Băuturi Carbogazoase', posts: [1, 2, 3, 4, 5] },
    { id: 2, name: 'Băuturi Energetice', posts: [6, 7] },
    { id: 3, name: 'Băuturi cu Ceai', posts: [9, 10, 11] },
    { id: 4, name: 'Băuturi Fără Zahăr', posts: [12] },
    { id: 5, name: 'Băuturi Mixte', posts: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { id: 6, name: 'Băuturi Răcoritoare', posts: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    { id: 7, name: 'Băuturi cu Aromă de Citric', posts: [1, 2, 3, 4, 5] },
    { id: 8, name: 'Băuturi cu Aromă de Fructe', posts: [9, 10, 11] },
    { id: 9, name: 'Băuturi cu Aromă de Lămâie', posts: [1, 4] },
    { id: 10, name: 'Băuturi cu Aromă de Portocale', posts: [2] }
];


const fetchPosts = async () => {
    // const response = await fetch("http://localhost:3000/api/posts", {
    //   method: "GET",
    //   headers: { "Content-Type": "application/json" }
    // });
    // if (!response.ok) throw new Error("Network error");
    // return await response.json();
    return mockedPosts;
};

const fetchGroups = async () => {
    // const response = await fetch("http://localhost:3000/api/groups", {
    //   method: "GET",
    //   headers: { "Content-Type": "application/json" }
    // });
    // if (!response.ok) throw new Error("Network error");
    // return await response.json();
    return mockedGroups;
};

async function getGroups() {
    try {
        const originalData = await fetchGroups();
    } catch (err) {
        console.error("Eroare încărcare grupuri:", err);
    }
}

function generateRadioFilter(inputName = 'category') {
    const container = document.querySelector('.groups-list');
    if (!container) return;

    container.innerHTML = '';

    mockedGroups.forEach((group) => {
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

        input.addEventListener('change', () => {
            selectedGroupId = parseInt(input.value);

            if (selectedGroupId) {
                handleSelectGroup();
                // selectedListDiv.style.display = 'block';
                // selectedListDiv.innerText = `${list.name}`;
                // publicBtn.style.display = 'block';
            } else {
                // selectedListDiv.style.display = 'none';
            }

            // applyFiltersAndRender();
        });

        item.appendChild(input);
        item.appendChild(label);
        container.appendChild(item);
    });
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
          <img src="${post.image}" alt="${post.drink}" class="user-image">
          <p class="card-user">${post.user}</p>
        </div>
        <p class="post-text">${post.text}</p>
        <div class="drink-info">
          <span class="number-of-likes">
            <i class="fa-solid fa-heart like-icon"
            onclick="handleLikePost(${post.id})" title="Like"
            ></i> 
            ${post.likes}
          </span>
          <span class="drink-title">Băutură: ${post.drink}</span>
          <span class="post-date">Data: ${new Date(post.date).toLocaleDateString()}</span>
        </div>
      </div>
      <img src="${post.image}" alt="${post.drink}" class="drink-image">
    `;

        postsContainer.appendChild(postDiv);
    });
}


function handleSelectGroup() {
    if (selectedGroupId) {
        const selectedGroup = mockedGroups.find(g => g.id == selectedGroupId);
        if (!selectedGroup) return;

        const selectedPostFromGroup = mockedPosts.filter(p => selectedGroup.posts.includes(p.id));
        generatePosts(selectedPostFromGroup);
    }
}

function handleLikePost(postId) {
    const post = mockedPosts.find(p => p.id === postId);
    if (post) {
        post.likes += 1;
        handleSelectGroup();
    }
}

function handleJoinGroup() {
    window.location.href = `../views/join-group.html`;
}



function render() {
    generateRadioFilter();
    // generatePosts(mockedPosts);
}

document.addEventListener('DOMContentLoaded', render);