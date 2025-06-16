// const wrapper = document.querySelector(".wrapper");
// const loginNavigator = document.querySelector(".login-link");
// const registerNavigator = document.querySelector(".login-register");
// const loginForm = document.querySelector(".form-box.login form");
// const registerForm = document.querySelector(".form-box.register form");

// registerNavigator.addEventListener("click", () => {
//   wrapper.classList.add("active");
// });
// loginNavigator.addEventListener("click", () => {
//   wrapper.classList.remove("active");
// });


// document.addEventListener("DOMContentLoaded", function () {
//   const emailInput = document.querySelector(".email-input input");

//   emailInput.addEventListener("input", function () {
//     if (emailInput.validity.valid) {
//       emailInput.parentElement.classList.remove("invalid");
//     } else {
//       emailInput.parentElement.classList.add("invalid");
//     }
//   });
// });


// function login(event) {
//   event.preventDefault();

//   const emailInput = loginForm.querySelector(".email-input input");
//   const passwordInput = loginForm.querySelector('input[type="password"]');

//   console.log(emailInput.value)
//   console.log(passwordInput.value)
//   fetch("http://localhost:3000/api/auth/login", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       email: emailInput.value,
//       password: passwordInput.value,
//     }),
//   })
//     .then((response) =>
//       response
//         .json()
//         .then((data) => ({ status: response.status, body: data }))
//     )
//     .then((data) => {
//       if (data.status !== 200) {
//         throw new Error(data.body.message || "Unknown error");
//       }

//       console.log("Success:", data.body.message);
//       localStorage.setItem("token", data.body.data.token);
//       window.location.href = "../../views/home.html";
//     })
//     .catch((error) => {
//       alert("Error: " + error.message);
//     });
// }

// loginForm.addEventListener("submit", login);

const wrapper = document.querySelector(".wrapper");
const loginNavigator = document.querySelector(".login-btn");
const registerNavigator = document.querySelector(".register-btn");
const loginForm = document.querySelector(".form-box.login form");
const registerForm = document.querySelector(".form-box.register form");

// Trecerea între formulare
registerNavigator.addEventListener("click", () => {
  wrapper.classList.add("active");
});
loginNavigator.addEventListener("click", () => {
  wrapper.classList.remove("active");
});

// Validare simplă pentru câmpul de email la înregistrare
document.addEventListener("DOMContentLoaded", function () {
  const emailInput = document.querySelector(".email-input input");

  if (emailInput) {
    emailInput.addEventListener("input", function () {
      if (emailInput.validity.valid) {
        emailInput.parentElement.classList.remove("invalid");
      } else {
        emailInput.parentElement.classList.add("invalid");
      }
    });
  }
});

// Login handler
function login(event) {
  event.preventDefault();

  const emailInput = loginForm.querySelector('input[placeholder="Email"]');
  const passwordInput = loginForm.querySelector('input[type="password"]');

  console.log(emailInput.value);
  console.log(passwordInput.value);

  fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: emailInput.value,
      password: passwordInput.value,
    }),
  })
    .then((response) =>
      response
        .json()
        .then((data) => ({ status: response.status, body: data }))
    )
    .then((data) => {
      if (data.status !== 200) {
        throw new Error(data.body.message || "Unknown error");
      }

      console.log("Success:", data.body.message);
      localStorage.setItem("token", data.body.data.token);
      window.location.href = "../../views/home.html";
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
}

loginForm.addEventListener("submit", login);






