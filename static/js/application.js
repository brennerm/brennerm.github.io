const enableDarkModeLabel = "dark mode"
const enableLightModeLabel = "light mode"

let systemInitiatedDark = window.matchMedia("(prefers-color-scheme: dark)");
const zooming = new Zooming({})


document.addEventListener("DOMContentLoaded", function(){
    let theme = localStorage.getItem('theme');
    console.log(`User prefers color scheme: ${systemInitiatedDark.matches}`)
    console.log(`Local storage stored theme: ${theme}`)

    if (systemInitiatedDark.matches) {
        enableDarkMode(true)
    } else if (theme === "dark") {
        enableDarkMode()
    } else if (theme === "light") {
        enableLightMode()
    } else {
        enableLightMode()
    }

    function prefersColorTest(systemInitiatedDark) {
        console.log("prefers-color-scheme change detected")
        if (systemInitiatedDark.matches) {
            enableDarkMode(true)
        } else {
            enableLightMode(true)
        }
    }

    systemInitiatedDark.addEventListener("change", listener=prefersColorTest)
    zooming.listen('.img-zoomable')
})

function switchMode() {
    let currentTheme = localStorage.getItem('theme');
    if (currentTheme === "dark") {
        enableLightMode()
    } else if (currentTheme === "light") {
        enableDarkMode()
    } else if (systemInitiatedDark.matches) {
        enableLightMode()
    } else {
        enableLightMode()
    }
}

function enableLightMode(clearCache=false) {
    console.log("Enabling light mode")
    document.documentElement.setAttribute('data-theme', 'light');
    document.getElementById("theme-toggle").innerHTML = enableDarkModeLabel;
    zooming.config({bgColor: 'rgb(255, 255, 255)'})
    loadUtterances(false)

    if (clearCache) {
        localStorage.removeItem('theme');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

function enableDarkMode(clearCache=false) {
    console.log("Enabling dark mode")
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById("theme-toggle").innerHTML = enableLightModeLabel;
    zooming.config({bgColor: 'rgb(28, 28, 30)'})
    loadUtterances(true)

    if (clearCache) {
        localStorage.removeItem('theme');
    } else {
        localStorage.setItem('theme', 'dark');
    }
}

function loadUtterances(darkMode=false) {
    const commentsContainer = document.getElementById("comments");
    if (commentsContainer !== null) {
        commentsContainer.innerHTML = ''
        const utterancesScript = document.createElement("script");
        utterancesScript.setAttribute("id", "utterances");
        utterancesScript.setAttribute("src", "https://utteranc.es/client.js");
        utterancesScript.setAttribute("repo", "brennerm/brennerm.github.io-comments");
        utterancesScript.setAttribute("issue-term", "pathname");
        utterancesScript.setAttribute("theme", darkMode ? "github-dark" : "github-light");
        utterancesScript.setAttribute("crossorigin", "anonymous");
        utterancesScript.setAttribute("async", "true");

        commentsContainer.appendChild(utterancesScript);
    }
}