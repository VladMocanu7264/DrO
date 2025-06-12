const searchInput = document.getElementById("search-group");

const mockedGroups = [
    { id: 1, name: 'Băuturi Carbogazoase', image: '../public/poze/cocacola.png', descriere: 'Băuturile carbogazoase sunt băuturi răcoritoare care conțin dioxid de carbon, oferind o senzație efervescentă și un gust revigorant. Acestea pot fi indulcite sau neindulcite și sunt adesea consumate ca alternative la apa obișnuită sau sucurile naturale.', posts: [1, 2, 3, 4, 5] },
    { id: 2, name: 'Băuturi Energetice', image: '../public/poze/cocacola.png', descriere: 'Băuturile energetice sunt băuturi care conțin ingrediente stimulante, cum ar fi cafeina, taurina și vitaminele B, destinate să ofere un impuls de energie și concentrare. Acestea sunt adesea consumate de persoanele active sau care au nevoie de un plus de energie în timpul zilei.', posts: [6, 7] },
    { id: 3, name: 'Băuturi cu Ceai', image: '../public/poze/cocacola.png', descriere: 'Băuturile energetice sunt băuturi care conțin ingrediente stimulante, cum ar fi cafeina, taurina și vitaminele B, destinate să ofere un impuls de energie și concentrare. Acestea sunt adesea consumate de persoanele active sau care au nevoie de un plus de energie în timpul zilei.', descriere: 'Băuturile energetice sunt băuturi care conțin ingrediente stimulante, cum ar fi cafeina, taurina și vitaminele B, destinate să ofere un impuls de energie și concentrare. Acestea sunt adesea consumate de persoanele active sau care au nevoie de un plus de energie în timpul zilei.', posts: [9, 10, 11] },
    { id: 4, name: 'Băuturi Fără Zahăr', image: '../public/poze/cocacola.png', descriere: 'Băuturile energetice sunt băuturi care conțin ingrediente stimulante, cum ar fi cafeina, taurina și vitaminele B, destinate să ofere un impuls de energie și concentrare. Acestea sunt adesea consumate de persoanele active sau care au nevoie de un plus de energie în timpul zilei.', posts: [12] },
    { id: 5, name: 'Băuturi Mixte', image: '../public/poze/cocacola.png', posts: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { id: 6, name: 'Băuturi Răcoritoare', image: '../public/poze/cocacola.png', descriere: 'Băuturile energetice sunt băuturi care conțin ingrediente stimulante, cum ar fi cafeina, taurina și vitaminele B, destinate să ofere un impuls de energie și concentrare. Acestea sunt adesea consumate de persoanele active sau care au nevoie de un plus de energie în timpul zilei.', posts: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    { id: 7, name: 'Băuturi cu Aromă de Citric', image: '../public/poze/cocacola.png', descriere: 'Băuturile energetice sunt băuturi care conțin ingrediente stimulante, cum ar fi cafeina, taurina și vitaminele B, destinate să ofere un impuls de energie și concentrare. Acestea sunt adesea consumate de persoanele active sau care au nevoie de un plus de energie în timpul zilei.', posts: [1, 2, 3, 4, 5] },
    { id: 8, name: 'Băuturi cu Aromă de Fructe', image: '../public/poze/cocacola.png', descriere: 'Băuturile energetice sunt băuturi care conțin ingrediente stimulante, cum ar fi cafeina, taurina și vitaminele B, destinate să ofere un impuls de energie și concentrare. Acestea sunt adesea consumate de persoanele active sau care au nevoie de un plus de energie în timpul zilei.', posts: [9, 10, 11] },
    { id: 9, name: 'Băuturi cu Aromă de Lămâie', image: '../public/poze/cocacola.png', descriere: 'Băuturile energetice sunt băuturi care conțin ingrediente stimulante, cum ar fi cafeina, taurina și vitaminele B, destinate să ofere un impuls de energie și concentrare. Acestea sunt adesea consumate de persoanele active sau care au nevoie de un plus de energie în timpul zilei.', posts: [1, 4] },
    { id: 10, name: 'Băuturi cu Aromă de Portocale', image: '../public/poze/cocacola.png', descriere: 'Băuturile energetice sunt băuturi care conțin ingrediente stimulante, cum ar fi cafeina, taurina și vitaminele B, destinate să ofere un impuls de energie și concentrare. Acestea sunt adesea consumate de persoanele active sau care au nevoie de un plus de energie în timpul zilei.', posts: [2] }
];

function handleSearchGroups() {
    const searchValue = searchInput.value.toLowerCase().trim();

    const filteredGroups = mockedGroups.filter(g => g.name.toLowerCase().includes(searchValue));
    generateGroups(filteredGroups)
}

function generateGroups(groups) {
    const container = document.querySelector('.groups-container');
    container.innerHTML = '';
    if (groups.length === 0) {
        container.innerHTML = '<div class="empty-group">Nu s-au găsit grupuri pentru căutarea ta.</div>';
        return;
    }
    groups.forEach(group => {
        const div = generateGroupContainer(group);
        container.appendChild(div);
    });
}

function handleJoinGroup(event) {
    if (event.target.classList.contains('join-group-button')) {
        const groupId = event.target.getAttribute('data-group-id');
        alert(`Te-ai alăturat grupului cu ID: ${groupId}`);
    }
}

function generateGroupContainer(group) {
    const groupDiv = document.createElement('div');
    groupDiv.classList.add('group');

    groupDiv.innerHTML = `
      <div class="group-content">
        <img src="${group.image}" alt="${group.image}" class="group-image">
        <div class="group-info">
            <p class="group-title">${group.name}</p>
            <p class="group-text">${group.descriere ? group.descriere : 'Grupul nu are o descriere'}</p>
            <button class="join-group-button" data-group-id="${group.id}" onclick="handleJoinGroup(event)">Alătură-te</button>
        </div>
      </div>
    `;
    return groupDiv;

}