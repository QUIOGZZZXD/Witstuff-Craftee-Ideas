
const addProductModal = document.getElementById("addProductModal");
const editProductModal = document.getElementById("editProductModal");
const deleteProductModal = document.getElementById("deleteModal");

// Open Add modal
document.getElementById("openAddModal").onclick = () => {
    addProductModal.style.display = "flex";
};

// Open Edit Modal (all edit buttons)
document.querySelectorAll(".openEditModal").forEach(btn => {
    btn.onclick = (e) => {
        const row = e.target.closest("tr");
        const cells = row.querySelectorAll("td");

        // const productID = cells[0].textContent.trim();
        const product = cells[1].textContent.trim();
        const seller = cells[2].textContent.trim();
        const category = cells[3].textContent.trim();
        const price = cells[4].textContent.trim();
        const status = cells[5].textContent.trim();

        document.getElementById("product-name").value = product;
        // document.getElementById("seller").value = seller;
        document.getElementById("category").value = category;
        document.getElementById("price").value = price;
        document.getElementById("status").value = status;

        editProductModal.style.display = "flex";
    };
});

// Close modal when clicking outside content
[addProductModal, editProductModal, deleteProductModal].forEach(modal => {
    modal.addEventListener("click", (e) => {
        if (e.target === addProductModal) addProductModal.style.display = "none";
        if (e.target === editProductModal) editProductModal.style.display = "none";
        if (e.target === deleteProductModal) deleteProductModal.style.display = "none";

        document.getElementById("product-name").value = "";
        // document.getElementById("seller").value = "";
        document.getElementById("category").value = "";
        document.getElementById("price").value = "";
        document.getElementById("status").value = "";
    });
});

// Delete modal buttons
document.querySelectorAll(".openDeleteModal").forEach(btn => {
    btn.onclick = () => deleteProductModal.style.display = "flex";
});

document.getElementById("cancelDelete").onclick = () => deleteProductModal.style.display = "none";
document.getElementById("confirmDelete").onclick = () => deleteProductModal.style.display = "none";