const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

document.addEventListener("DOMContentLoaded", function () {
  const emailInput = document.querySelector(".email-input input");

  emailInput.addEventListener("input", function () {
    if (emailInput.validity.valid) {
      emailInput.parentElement.classList.remove("invalid");
    } else {
      emailInput.parentElement.classList.add("invalid");
    }
  });
});