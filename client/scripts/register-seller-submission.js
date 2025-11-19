document.getElementById('register_form').addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const res = await fetch("/api/auth/seller/register", {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const { error } = await res.json();

        if (error) {
            showToast(error, 'error');
        } else {
            showToast('Redirecting to login page...', 'success');
            form.reset();
            setTimeout(() => {
                window.location.href = '/login';
            }, 1200);
        }
    } catch {
        showToast('Network error. Please try again.', 'warning');
    }
    
});