const currentTheme = localStorage.getItem('theme');
const systemInitiatedDark = window.matchMedia("(prefers-color-scheme: dark)");

if (systemInitiatedDark.matches || currentTheme === "dark") {
    document.documentElement.setAttribute('data-theme', 'dark');
} else {
    document.documentElement.setAttribute('data-theme', 'light');
}