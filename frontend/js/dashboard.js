const logoutBtn = document.getElementById("logoutBtn");

const inputInvoiceBtn = document.getElementById("inputInvoiceBtn");

const searchInvoiceBtn = document.getElementById("searchInvoiceBtn");

const addUserBtn = document.getElementById("addUserBtn");

logoutBtn.addEventListener("click", function () {
  window.location.href = "index.html";
});

inputInvoiceBtn.addEventListener("click", function () {
  window.location.href = "input-invoice.html";
});

searchInvoiceBtn.addEventListener("click", function () {
  window.location.href = "search-invoice.html";
});
