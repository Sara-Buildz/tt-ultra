(function () {
    // 1. Check local storage for the theme
    const savedTheme = localStorage.getItem("tt_theme");

    // 2. Apply it immediately to avoid the "white flash"
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("themeToggle");

    if (!btn) {
        console.warn("Theme toggle button not found on this page");
        return;
    }

    // 3. Update button icon/text based on current state
    btn.innerText = document.body.classList.contains("dark") ? "☀️" : "🌙";

    btn.addEventListener("click", () => {
        // Toggle the class
        document.body.classList.toggle("dark");

        // Save the preference and update the button icon
        if (document.body.classList.contains("dark")) {
            localStorage.setItem("tt_theme", "dark");
            btn.innerText = "☀️";
        } else {
            localStorage.setItem("tt_theme", "light");
            btn.innerText = "🌙";
        }
    });
});