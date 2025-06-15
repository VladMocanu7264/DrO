const API_BASE_URL = window.env.API_BASE_URL;

const wrapper = document.querySelector(".wrapper");
const loginLink = document.querySelector(".login-link");
const registerLink = document.querySelector(".register-link");
const loginForm = document.querySelector(".form-box.login form");
const registerForm = document.querySelector(".form-box.register form");

// Trecerea între formulare
registerLink.addEventListener("click", () => wrapper.classList.add("active"));
loginLink.addEventListener("click", () => wrapper.classList.remove("active"));

// Validare email dinamică
document.addEventListener("DOMContentLoaded", () => {
  const emailInputs = document.querySelectorAll(".email-input input");
  emailInputs.forEach((input) => {
    input.addEventListener("input", () => {
      input.parentElement.classList.toggle("invalid", !input.validity.valid);
    });
  });
});

// Funcționalitate login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailInput = loginForm.querySelector("input[type='email']");
  const passwordInput = loginForm.querySelector("input[type='password']");

  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Eroare necunoscută");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "/home/";
  } catch (error) {
    alert("Login eșuat: " + error.message);
  }
});
