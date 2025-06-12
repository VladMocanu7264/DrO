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