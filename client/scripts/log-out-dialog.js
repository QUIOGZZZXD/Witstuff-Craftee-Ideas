const logoutBtn = document.getElementById('logout-button');
const logoutModal = document.getElementById("logoutModal");


logoutBtn.onclick = () => {
    logoutModal.style.display = "flex";
    document.body.style.overflow = 'hidden';
};

// Close modal when clicking outside content
logoutModal.addEventListener('click', (e) => {
    if (e.target === logoutModal) {logoutModal.style.display = "none"; document.body.style.overflow = 'auto';}
});

document.getElementById("cancelLogout").onclick = () => {logoutModal.style.display = "none"; document.body.style.overflow = 'auto';};
document.getElementById("confirmLogout").onclick = () => {logoutModal.style.display = "none"; document.body.style.overflow = 'auto';};