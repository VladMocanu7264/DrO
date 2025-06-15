const hamburger = document.querySelector('.hamburger');
const mobile_menu = document.querySelector('.mobile-menu');

hamburger.addEventListener('click', function () {
  this.classList.toggle('is-active');
  mobile_menu.classList.toggle('is-open');
});

window.onload = function () {
  const token = localStorage.getItem("token");
  const loginLink = document.querySelector(".menu #login-link");
  const mobileLoginLink = document.querySelector(".mobile-menu #login-link");

  if (token) {
    if (loginLink) {
      loginLink.innerHTML = `<i class="fa-solid fa-user"></i>`;
      loginLink.href = "../views/profile.html";
    }

    if (mobileLoginLink) {
      mobileLoginLink.innerHTML = `<i class="fa-solid fa-user"></i>`;
      mobileLoginLink.href = "../views/profile.html";
    }
  } //else{
  //   window.location.href = "../views/login.html";
  // }
};