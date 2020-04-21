const enableDarkModeLabel = "dark mode"
const enableLightModeLabel = "light mode"

let systemInitiatedDark = window.matchMedia("(prefers-color-scheme: dark)");
let theme = localStorage.getItem('theme');


document.addEventListener("DOMContentLoaded", function(){
    if (systemInitiatedDark.matches) {
        document.getElementById("theme-toggle").innerHTML = enableLightModeLabel;
    } else {
        document.getElementById("theme-toggle").innerHTML = enableDarkModeLabel;
    }

    function prefersColorTest(systemInitiatedDark) {
        if (systemInitiatedDark.matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.getElementById("theme-toggle").innerHTML = enableLightModeLabel;
            // this clears the session storage
            localStorage.setItem('theme', '');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            document.getElementById("theme-toggle").innerHTML = enableDarkModeLabel;
            localStorage.setItem('theme', '');
        }
    }
    systemInitiatedDark.addListener(prefersColorTest);

    if (theme === "dark") {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        document.getElementById("theme-toggle").innerHTML = enableLightModeLabel;
    } else if (theme === "light") {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        document.getElementById("theme-toggle").innerHTML = enableDarkModeLabel;
    }
})

function switchMode() {
// it's important to check for overrides again
    let theme = localStorage.getItem('theme');
    // checks if reader selected dark mode
    if (theme === "dark") {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        document.getElementById("theme-toggle").innerHTML = enableDarkModeLabel;
        // checks if reader selected light mode
    }	else if (theme === "light") {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        document.getElementById("theme-toggle").innerHTML = enableLightModeLabel;
        // checks if system set dark mode
    } else if (systemInitiatedDark.matches) {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        document.getElementById("theme-toggle").innerHTML = enableDarkModeLabel;
        // the only option left is system set light mode
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        document.getElementById("theme-toggle").innerHTML = enableLightModeLabel;
    }
}