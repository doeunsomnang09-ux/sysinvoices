const saveInvoiceBtn = document.getElementById("saveInvoiceBtn");
const invoiceId = document.getElementById("invoiceId");
const invoicePicture = document.getElementById("invoicePicture");
const message = document.getElementById("message");
const preview = document.getElementById("preview");

// =========================
// Image Preview
// =========================

invoicePicture.addEventListener("change", function () {
  const file = invoicePicture.files[0];

  preview.innerHTML = "";

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    message.textContent = "Please select an image file.";
    message.style.color = "red";
    invoicePicture.value = "";
    return;
  }

  const image = document.createElement("img");

  image.src = URL.createObjectURL(file);

  image.style.maxWidth = "100%";
  image.style.maxHeight = "300px";
  image.style.objectFit = "contain";

  preview.appendChild(image);

  message.textContent = "";
});

// =========================
// Save Invoice
// =========================

saveInvoiceBtn.addEventListener("click", async function () {
  const id = invoiceId.value.trim();
  const file = invoicePicture.files[0];

  // Check Invoice ID
  if (id === "") {
    message.textContent = "Please enter Invoice ID.";
    message.style.color = "red";
    return;
  }

  // Check Image
  if (!file) {
    message.textContent = "Please select invoice image.";
    message.style.color = "red";
    return;
  }

  // Check Image Type
  if (!file.type.startsWith("image/")) {
    message.textContent = "Please select an image file.";
    message.style.color = "red";
    return;
  }

  try {
    message.textContent = "Uploading...";
    message.style.color = "blue";

    // =========================
    // Create FormData
    // =========================

    const formData = new FormData();

    formData.append("invoice_id", id);
    formData.append("invoice_picture", file);

    // =========================
    // Send to Backend
    // =========================

    const response = await fetch("http://localhost:3000/api/invoices", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    // =========================
    // Handle Error
    // =========================

    if (!response.ok) {
      message.textContent = data.message;
      message.style.color = "red";
      return;
    }

    // =========================
    // Success
    // =========================

    message.textContent = "Invoice saved successfully!";

    message.style.color = "green";

    console.log("Invoice result:", data);

    // Clear form
    invoiceId.value = "";
    invoicePicture.value = "";
    preview.innerHTML = "";
  } catch (error) {
    console.error(error);

    message.textContent = "Cannot connect to server.";

    message.style.color = "red";
  }
});
