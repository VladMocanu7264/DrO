(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.replace("../login/index.html");
  }
})();


const hamburger = document.querySelector('.hamburger');
const mobile_menu = document.querySelector('.mobile-menu');

hamburger.addEventListener('click', function () {
  this.classList.toggle('is-active');
  mobile_menu.classList.toggle('is-open');
});

document.addEventListener('DOMContentLoaded', () => {
  const loginLink = document.querySelector(".menu #login-link");
  const mobileLoginLink = document.querySelector(".mobile-menu #login-link-mobile");

  if (loginLink) {
    loginLink.innerHTML = `<i class="fa-solid fa-user"></i>`;
    loginLink.href = "../profile/index.html";
  }
  if (mobileLoginLink) {
    mobileLoginLink.innerHTML = `<i class="fa-solid fa-user"></i>`;
    mobileLoginLink.href = "../profile/index.html";
  }
});
