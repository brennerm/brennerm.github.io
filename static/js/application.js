const enableDarkModeLabel = "dark mode"
const enableLightModeLabel = "light mode"
const zooming = new Zooming({})

document.addEventListener("DOMContentLoaded", function(){
    console.log(`User prefers color scheme: ${systemInitiatedDark.matches}`)
    console.log(`Local storage stored theme: ${currentTheme}`)

    if (systemInitiatedDark.matches) {
        enableDarkMode(true)
    } else if (currentTheme === "dark") {
        enableDarkMode()
    } else if (currentTheme === "light") {
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
    zooming.config({bgColor: 'var(--main-background-color)'})
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
    loadUtterances(true)

    if (clearCache) {
        localStorage.removeItem('theme');
    } else {
        localStorage.setItem('theme', 'dark');
    }
}

function loadUtterances(darkMode=false) {
    const giscusContainer = document.getElementById("comments-giscus");
    if (giscusContainer !== null) {
        giscusContainer.innerHTML = ''
        const giscusScript = document.createElement("script");
        giscusScript.setAttribute("id", "giscus");
        giscusScript.setAttribute("src", "https://giscus.app/client.js");
        giscusScript.setAttribute("data-repo", "brennerm/brennerm.github.io-comments");
        giscusScript.setAttribute("data-repo-id", "MDEwOlJlcG9zaXRvcnkzMTg1MTk0ODQ=");
        giscusScript.setAttribute("data-category", "Announcements");
        giscusScript.setAttribute("data-category-id", "DIC_kwDOEvw4vM4CAcbV");
        giscusScript.setAttribute("data-mapping", "pathname");
        giscusScript.setAttribute("data-reactions-enabled", "1");
        giscusScript.setAttribute("data-emit-metadata", "0");
        giscusScript.setAttribute("data-theme", darkMode ? "dark" : "light");
        giscusScript.setAttribute("crossorigin", "anonymous");
        giscusScript.setAttribute("async", "true");

        giscusContainer.appendChild(giscusScript);
    }
}