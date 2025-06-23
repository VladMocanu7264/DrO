// const API_BASE_URL = window.env.API_BASE_URL;

// const wrapper = document.querySelector(".wrapper");
// const loginLink = document.querySelector(".login-link");
// const registerLink = document.querySelector(".register-link");
// const loginForm = document.querySelector(".form-box.login form");
// const registerForm = document.querySelector(".form-box.register form");

// // Trecerea între formulare
// registerLink.addEventListener("click", () => wrapper.classList.add("active"));
// loginLink.addEventListener("click", () => wrapper.classList.remove("active"));

// // Validare email în timp real
// document.addEventListener("DOMContentLoaded", () => {
//   const emailInputs = document.querySelectorAll(".email-input input");
//   emailInputs.forEach((input) => {
//     input.addEventListener("input", () => {
//       input.parentElement.classList.toggle("invalid", !input.validity.valid);
//     });
//   });
// });

// // Submit login
// loginForm.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const email = loginForm.querySelector("input[type='email']").value;
//   const password = loginForm.querySelector("input[type='password']").value;

//   try {
//     const response = await fetch(`${API_BASE_URL}/auth/login`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });

//     const data = await response.json();

//     if (!response.ok) throw new Error(data.message || "Eroare necunoscută");

//     localStorage.setItem("token", data.token);
//     localStorage.setItem("user", JSON.stringify(data.user));
//     window.location.href = "/home/";
//   } catch (error) {
//     alert("Login eșuat: " + error.message);
//   }
// });

// // Submit register
// registerForm.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const username = registerForm.querySelector("input[type='text']").value;
//   const email = registerForm.querySelector("input[type='email']").value;
//   const passwords = registerForm.querySelectorAll("input[type='password']");
//   const password = passwords[0].value;
//   const confirmPassword = passwords[1].value;

//   if (password !== confirmPassword) {
//     alert("Parolele nu coincid!");
//     return;
//   }

//   try {
//     const response = await fetch(`${API_BASE_URL}/auth/signup`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, username, password, confirmPassword }),
//     });

//     const data = await response.json();

//     if (!response.ok) throw new Error(data.message || "Eroare necunoscută");

//     alert("Cont creat cu succes! Puteți face login.");
//     wrapper.classList.remove("active");
//   } catch (error) {
//     alert("Înregistrare eșuată: " + error.message);
//   }
// });

const API_BASE_URL = window.env.API_BASE_URL;

const wrapper = document.querySelector(".wrapper");
const loginLink = document.querySelector(".login-link");
const registerLink = document.querySelector(".register-link");
const loginForm = document.querySelector(".form-box.login form");
const registerForm = document.querySelector(".form-box.register form");

// Trecerea între formulare
registerLink.addEventListener("click", () => wrapper.classList.add("active"));
loginLink.addEventListener("click", () => wrapper.classList.remove("active"));

// Funcții regex locale
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidUsername(username) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

// Debounce helper
let debounceTimeout = null;
function debounce(fn, delay = 500) {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(fn, delay);
}

// Validare email dinamică (stil)
document.addEventListener("DOMContentLoaded", () => {
  const emailInputs = document.querySelectorAll(".email-input input");
  emailInputs.forEach((input) => {
    input.addEventListener("input", () => {
      input.parentElement.classList.toggle("invalid", !input.validity.valid);
    });
  });
});

// Submit login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginForm.querySelector("input[type='email']").value;
  const password = loginForm.querySelector("input[type='password']").value;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Eroare necunoscută");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "../home/";
  } catch (error) {
    alert("Login eșuat: " + error.message);
  }
});

// Submit register
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = registerForm.querySelector("input[type='text']").value;
  const email = registerForm.querySelector("input[type='email']").value;
  const passwords = registerForm.querySelectorAll("input[type='password']");
  const password = passwords[0].value;
  const confirmPassword = passwords[1].value;

  if (!isValidUsername(username)) {
    alert("Nume invalid: minim 3 caractere, doar litere, cifre și _");
    return;
  }

  if (!isValidEmail(email)) {
    alert("Email invalid!");
    return;
  }

  if (password !== confirmPassword) {
    alert("Parolele nu coincid!");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password, confirmPassword }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || data.message || "Eroare necunoscută");

    alert("Cont creat cu succes! Puteți face login.");
    wrapper.classList.remove("active");
  } catch (error) {
    alert("Înregistrare eșuată: " + error.message);
  }
});

// Validare email disponibil
const registerEmailInput = registerForm.querySelector("input[type='email']");
const emailBox = registerEmailInput.closest(".input-box");
const emailError = emailBox.querySelector(".error-message");

registerEmailInput.addEventListener("input", () => {
  debounce(async () => {
    const email = registerEmailInput.value;

    if (!email) {
      emailBox.classList.remove("invalid");
      emailError.textContent = "";
      return;
    }

    if (!isValidEmail(email)) {
      emailBox.classList.add("invalid");
      emailError.textContent = "Email invalid!";
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (data.error) {
        emailBox.classList.add("invalid");
        emailError.textContent = "Email invalid!";
        return;
      }

      if (!data.available) {
        emailBox.classList.add("invalid");
        emailError.textContent = "Emailul este deja folosit!";
      } else {
        emailBox.classList.remove("invalid");
        emailError.textContent = "";
      }
    } catch (err) {
      console.warn("Validare email eșuată:", err.message);
    }
  });
});

// Validare username disponibil
const usernameInput = registerForm.querySelector("input[type='text']");
const usernameBox = usernameInput.closest(".input-box");
const usernameError = usernameBox.querySelector(".error-message");

usernameInput.addEventListener("input", () => {
  debounce(async () => {
    const username = usernameInput.value;

    if (!username) {
      usernameBox.classList.remove("invalid");
      usernameError.textContent = "";
      return;
    }

    if (!isValidUsername(username)) {
      usernameBox.classList.add("invalid");
      usernameError.textContent = "Nume invalid (3-20 caractere, doar litere, cifre și _)";
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/check-username?username=${encodeURIComponent(username)}`);
      const data = await res.json();

      if (data.error) {
        usernameBox.classList.add("invalid");
        usernameError.textContent = "Nume invalid!";
        return;
      }

      if (!data.available) {
        usernameBox.classList.add("invalid");
        usernameError.textContent = "Numele de utilizator este deja luat!";
      } else {
        usernameBox.classList.remove("invalid");
        usernameError.textContent = "";
      }
    } catch (err) {
      console.warn("Validare username eșuată:", err.message);
    }
  });
});

