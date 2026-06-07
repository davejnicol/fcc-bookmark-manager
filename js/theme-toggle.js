// THEME TOGGLE WITH LOCALSTORAGE PERSISTENCE
const themeToggle = document.querySelector("#theme-toggle");

// INITIALIZE THEME ON PAGE LOAD
initializeTheme();

themeToggle.addEventListener("click", () => {
    document.body.getAttribute("data-theme") === "light"
    ? enableDarkTheme()
    : enableLightTheme();
});

function enableDarkTheme() {
    document.body.setAttribute("data-theme", "dark");
    themeToggle.setAttribute("aria-label", "Switch to light theme");
    // SAVE PREFERENCE TO LOCALSTORAGE
    localStorage.setItem("theme-preference", "dark");
}

function enableLightTheme() {
    document.body.setAttribute("data-theme", "light");
    themeToggle.setAttribute("aria-label", "Switch to dark theme");
    // SAVE PREFERENCE TO LOCALSTORAGE
    localStorage.setItem("theme-preference", "light");
}

function initializeTheme() {
    // CHECK IF USER HAS A SAVED PREFERENCES
    const savedTheme = localStorage.getItem("theme-preference");
    
    if (savedTheme) {
        // USE SAVED PREFERENCE
        savedTheme === "dark" ? enableDarkTheme() : enableLightTheme();
    } else {
        // NO SAVED PREFERENCE, USE SYSTEM PREFERENCE
        setThemePreference();
    }
}

function setThemePreference() {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        enableDarkTheme();
        return;
    } else {
        enableLightTheme();
    }
}