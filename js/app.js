const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  if (username === "admin" && password === "1234") {
    window.location.href = "dashboard.html";
  } else {
    message.textContent = "Wrong username or password!";
    message.style.color = "red";
  }
});
