document.addEventListener("DOMContentLoaded", () => {
  const navIconsContainer = document.querySelector(".nav-icons");

  // Function to call the API and update the UI
  const checkSessionAndRenderUI = async () => {
    try {
      // 1. Call the session check API
      const response = await fetch("/api/auth/check-session");
      if (!response.ok) {
        throw new Error("Failed to check session status");
      }

      const { data } = await response.json();

      // 2. Check the loggedIn status
      if (data.loggedIn) {
        // User is logged in: Append profile icon
        const profileLink = document.createElement("a");
        profileLink.href = "/me";
        // Using a more standard icon for a user profile
        profileLink.innerHTML = "👤";

        const profileSpan = document.createElement("span");
        profileSpan.appendChild(profileLink);

        navIconsContainer.appendChild(profileSpan);
      } else {
        // User is not logged in: Append login button
        const loginLink = document.createElement("a");
        loginLink.href = "/login"; // Assuming your login page is at /login
        loginLink.className = "login-btn";
        loginLink.textContent = "Login";
        loginLink.style.color = "var(--cream-white)";

        const loginSpan = document.createElement("span");
        loginSpan.style.backgroundColor = "var(--warm-mocha)";
        loginSpan.style.borderRadius = "5px";
        loginSpan.style.padding = ".5rem 1rem";
        loginSpan.appendChild(loginLink);

        navIconsContainer.appendChild(loginSpan);
      }
    } catch (error) {
      console.error("Error handling session check:", error);
      // Optional: Display a generic login button or error state if API fails
    }
  };

  checkSessionAndRenderUI();
});
