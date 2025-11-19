
const addSellerModal = document.getElementById("addSellerModal");
const editSellerModal = document.getElementById("editSellerModal");
const deleteModal = document.getElementById("deleteModal");

// on load
document.addEventListener("DOMContentLoaded", async () => {
    await loadOrders();
});

async function loadOrders() {
    try {
        // ✅ Your API endpoint here
        const res = await fetch("/api/sellers");

        if (!res.ok) throw new Error("Failed to fetch orders");

        const result = await res.json();
        const tableBody = document.getElementById("seller-table-body");

        tableBody.innerHTML = ""; // Clear existing rows

        result.data.sellers.forEach(seller => {
            const row = document.createElement("tr");

            row.innerHTML = `
              <td>${seller.user_id}</td>
              <td>${seller.shop_name}</td>
              <td>${seller.full_name}</td>
              <td>${seller.email}</td>
              <td><span class="status ${seller.status == "active" ? "active" : "inactive"}">${seller.status}</span></td>
              <td>
                <button class="edit-btn openEditModal">Edit</button>
                <button class="remove-btn openDeleteModal">Remove</button>
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

    // Open Add modal
    document.getElementById("openAddModal").onclick = () => {
        addSellerModal.style.display = "flex";
    };

    // Open Edit Modal (all edit buttons)
    document.querySelectorAll(".openEditModal").forEach(btn => {
        btn.onclick = (e) => {
            const row = e.target.closest("tr");
            const cells = row.querySelectorAll("td");

            console.log(cells[0].textContent.trim());
            const sellerID = cells[0].textContent.trim();
            const shop = cells[1].textContent.trim();
            const owner = cells[2].textContent.trim();
            const email = cells[3].textContent.trim();
            const status = cells[4].textContent.trim();

            document.getElementById("seller-id").value = sellerID;
            document.getElementById("shop-name").value = shop;
            document.getElementById("owner-name").value = owner;
            document.getElementById("email-field").value = email;
            document.getElementById("status-field").value = status;

            editSellerModal.style.display = "flex";
        };
    });

    // Close modal when clicking outside content
    [addSellerModal, editSellerModal, deleteModal].forEach(modal => {
        modal.addEventListener('click', e => {
            e.preventDefault();
            if (e.target === addSellerModal) {
                addSellerModal.style.display = "none";

            }
            if (e.target === editSellerModal) {
                editSellerModal.style.display = "none";

                editSellerForm.reset();
            }
            if (e.target === deleteModal) deleteModal.style.display = "none";
        }
        );
    });

    // Delete modal buttons
    document.querySelectorAll(".openDeleteModal").forEach(btn => {
        btn.onclick = (e) => {
            const row = e.target.closest('tr');
            const cells = row.querySelectorAll('td');

            document.getElementById('user_id').value = cells[0].textContent.trim();
            deleteModal.style.display = "flex";
        }
    });

    document.getElementById("cancelDelete").onclick = () => {
        document.getElementById('user_id').value = "";
        deleteModal.style.display = "none";
    }

}
