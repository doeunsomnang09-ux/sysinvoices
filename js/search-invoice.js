const searchId = document.getElementById("searchId");
const searchBtn = document.getElementById("searchBtn");
const invoiceResult = document.getElementById("invoiceResult");
const message = document.getElementById("message");
const backBtn = document.getElementById("backBtn");

searchBtn.addEventListener("click", async function () {
  const id = searchId.value.trim();

  // Check Invoice ID
  if (id === "") {
    message.textContent = "Please enter Invoice ID.";
    message.style.color = "red";
    invoiceResult.innerHTML = "";
    return;
  }

  message.textContent = "Searching...";
  message.style.color = "blue";
  invoiceResult.innerHTML = "";

  try {
    // =========================
    // Search Backend
    // =========================

    const response = await fetch(
      `http://localhost:3000/api/invoices/${encodeURIComponent(id)}`,
    );

    const data = await response.json();

    // =========================
    // Invoice Not Found
    // =========================

    if (!response.ok) {
      message.textContent = data.message;
      message.style.color = "red";

      invoiceResult.innerHTML = "";

      return;
    }

    // =========================
    // Invoice Found
    // =========================

    const invoice = data.data;

    message.textContent = "Invoice found.";
    message.style.color = "green";

    invoiceResult.innerHTML = `
            <div class="invoice-info">

                <h3>Invoice ID: ${invoice.invoice_id}</h3>

                <p>
                    Created:
                    ${new Date(invoice.created_at).toLocaleString()}
                </p>

            </div>

            <div class="invoice-image">

               <img
    src="http://localhost:3000/api/invoices/${encodeURIComponent(invoice.invoice_id)}/image"
    alt="Invoice ${invoice.invoice_id}"
    style="
        max-width: 100%;
        max-height: 600px;
        object-fit: contain;
    "
>

            </div>
        `;
  } catch (error) {
    console.error(error);

    message.textContent = "Cannot connect to server.";

    message.style.color = "red";

    invoiceResult.innerHTML = "";
  }
});

// =========================
// Back Button
// =========================

backBtn.addEventListener("click", function () {
  window.location.href = "dashboard.html";
});
