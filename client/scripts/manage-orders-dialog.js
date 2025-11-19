const ordModal = document.getElementById("ordDetailModal");
// New global variable to store the ID of the order being viewed/edited
let currentOrderID = null;

// The element for the status form
const orderStatusForm = document.getElementById("order-status-form");
// Placeholder for the update endpoint (You will replace this later)
const UPDATE_ORDER_STATUS_ENDPOINT_BASE = '/api/order-items';


// on load
document.addEventListener("DOMContentLoaded", async () => {
    await loadOrders();
    attachFormSubmitListener(); // Attach the new submit listener on load
});

async function loadOrders() {
    // ... (rest of loadOrders function remains the same)
    try {
        // ✅ Your API endpoint here
        const res = await fetch("/api/admins/order-items");

        if (!res.ok) throw new Error("Failed to fetch orders");

        const result = await res.json();
        const tableBody = document.getElementById("order-table-body");

        tableBody.innerHTML = ""; // Clear existing rows

        result.data.order_items.forEach(order_item => {
            const row = document.createElement("tr");
            // Add data-id attribute to the row for easier retrieval
            row.dataset.id = order_item.order_item_id;

            row.innerHTML = `
            <td>${order_item.order_item_id}</td>
              <td>${order_item.customer_full_name}</td>
              <td>${order_item.seller_name}</td>
              <td>${order_item.item_name}</td>
              <td>${order_item.quantity}</td>
              <td>${order_item.price}</td>
              <td>${order_item.total_price}</td>
              <td><span class="status">${order_item.status}</span></td>
              <td>${order_item.payment_method}</td>
              <td>${new Date(order_item.date).toDateString()}</td>
              <td>
                <button class="edit-btn openOrdDetail">View Details</button>
              </td>
        `;

            tableBody.appendChild(row);
        });

        attachActionButtons();
    } catch (err) {
        console.error(err);
    }
}

// for dialogs
function attachActionButtons() {

    // Open ord details Modal (all edit buttons)
    document.querySelectorAll(".openOrdDetail").forEach(btn => {
        btn.onclick = (e) => {
            const row = e.target.closest("tr");
            const cells = row.querySelectorAll("td");

            // --- Capture the Order ID and store it globally ---
            const orderID = row.dataset.id; // Get ID from the new data-id attribute
            currentOrderID = orderID;

            const customer = cells[1].textContent.trim();
            const seller = cells[2].textContent.trim();
            const item = cells[3].textContent.trim();
            const quantity = cells[4].textContent.trim();
            const price = cells[5].textContent.trim();
            const totalPrice = cells[6].textContent.trim();
            const status = cells[7].textContent.trim();
            const paymentMethod = cells[8].textContent.trim();
            const date = cells[9].textContent.trim();

            document.getElementById("order-detail-content").innerHTML = `
                <ul>
                    <li>Order ID: ${orderID}</li>
                    <li>Customer Name: ${customer}</li>
                    <li>Seller: ${seller}</li>
                    <li>Payment Method: ${paymentMethod}</li>
                    <li>Quantity: ${quantity}</li>
                    <li>Price: ${price}</li>
                    <li>Total Price: ${totalPrice}</li>
                    <li>Product Ordered: ${item}</li>
                    <li>Order Date: ${date}</li>
                </ul>
            `;

            // Set the current status on the dropdown
            document.getElementById("ordStatusDropdown").value = status;

            ordModal.style.display = "flex";
        };
    });

    // Cancel button click
    document.getElementById("closeOrdDetail").onclick = () => {
        ordModal.style.display = "none";
        document.getElementById("order-detail-content").innerHTML = '';
        currentOrderID = null;
    }

    // Close modal only when clicking the background
    ordModal.addEventListener("click", function (event) {
        if (event.target === this) {
            ordModal.style.display = "none";
            document.getElementById("order-detail-content").innerHTML = '';
            currentOrderID = null;
        }
    });
}

// --- New Functionality: Status Update ---

function attachFormSubmitListener() {
    orderStatusForm.addEventListener('submit', async function (e) {
        e.preventDefault(); // Stop the form from submitting traditionally

        const newStatus = document.getElementById("ordStatusDropdown").value;

        if (!currentOrderID) {
            alert("Error: No order selected for update.");
            return;
        }

        // Construct the payload and endpoint
        const payload = { status: newStatus };
        // The API request will look like: PATCH /api/admins/orders/ORDER_ID/status
        const finalEndpoint = `${UPDATE_ORDER_STATUS_ENDPOINT_BASE}/${currentOrderID}/status`;

        try {
            const response = await fetch(finalEndpoint, {
                method: 'PATCH', // Assuming PATCH or PUT is used for updates
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error);
            }

            // Success handling
            showToast(`Order ${currentOrderID} status updated to ${newStatus.toUpperCase()}!`);

            // Close the modal, reset ID, and refresh the list
            ordModal.style.display = "none";
            document.getElementById("order-detail-content").innerHTML = '';
            currentOrderID = null;
            await loadOrders();

        } catch (error) {
            console.error('Status Update Error:', error);
            showToast(`Error: ${error.message}`, 'error');
        }
    });

    // Remove the placeholder function that was closing the modal instantly
    document.getElementById("updateOrdDetail").onclick = null;
}