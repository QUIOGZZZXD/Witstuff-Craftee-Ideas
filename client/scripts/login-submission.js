document.getElementById("login_form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const { error, data: responseData } = await res.json();

    if (error) {
      showToast(error, "error");
      return;
    }

    window.location.href = responseData.redirect;
  } catch (error) {
    console.log(error);
    showToast("Something went wrong. Please try again.", "warning");
  }
});
