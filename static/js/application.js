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
            enableDarkMode(true)
        } else {
            enableLightMode(true)
        }
    }
    systemInitiatedDark.addListener(prefersColorTest);

    if (theme === "dark") {
        enableDarkMode()
    } else if (theme === "light") {
        enableLightMode()
    }
})

function switchMode() {
    // it's important to check for overrides again
    let theme = localStorage.getItem('theme');
    if (theme === "dark") {
        enableLightMode()
    }	else if (theme === "light") {
        enableDarkMode()
    } else if (systemInitiatedDark.matches) {
        enableDarkMode()
    } else {
        enableLightMode()
    }
}

function enableLightMode(clearCache=false) {
    document.documentElement.setAttribute('data-theme', 'light');
    document.getElementById("theme-toggle").innerHTML = enableDarkModeLabel;

    document.getElementById('utterances-light').style.display = 'block';
    document.getElementById('utterances-dark').style.display = 'none';

    if (clearCache) {
        localStorage.setItem('theme', '');
    } else {
        localStorage.setItem('theme', 'light');
    }
}


function enableDarkMode(clearCache=false) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById("theme-toggle").innerHTML = enableLightModeLabel;

    document.getElementById('utterances-dark').style.display = 'block';
    document.getElementById('utterances-light').style.display = 'none';

    if (clearCache) {
        localStorage.setItem('theme', '');
    } else {
        localStorage.setItem('theme', 'dark');
    }
}