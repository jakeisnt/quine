/* A script to toggle dark mode with a button,
 * storing the current state in browser local storage.
 * The button hasn't yet been added...
 */
var loadTheme = function () {
    var _a;
    function svg(url) {
        var obj = document.createElement("img");
        obj.src = url;
        obj.style.height = "30px";
        obj.style.width = "30px";
        return obj;
    }
    var THEME = {
        LIGHT: "light",
        DARK: "dark",
    };
    var ICONS = {
        light: svg("/components/ToggleDarkMode/assets/sun_icon.svg"),
        dark: svg("/components/ToggleDarkMode/assets/moon_icon.svg"),
    };
    var possibleThemes = Object.values(THEME).map(function (theme) { return "".concat(theme, "-theme"); });
    var btn = document.querySelector(".toggle-dark-mode");
    var prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var currentTheme = (_a = localStorage.getItem("theme")) !== null && _a !== void 0 ? _a : (prefersDarkScheme ? THEME.DARK : THEME.LIGHT);
    function switchToTheme(add) {
        var _a;
        console.log("Switching to theme ", add);
        var classes = document.body.classList;
        classes.remove.apply(classes, possibleThemes);
        classes.add("".concat(add, "-theme"));
        currentTheme = add;
        var ThemeCSS = (_a = {},
            _a[THEME.LIGHT] = document.getElementById("light-theme-highlight"),
            _a[THEME.DARK] = document.getElementById("dark-theme-highlight"),
            _a);
        [THEME.LIGHT, THEME.DARK].forEach(function (theme) {
            var _a;
            console.log("Theme: ", theme);
            if (!((_a = ThemeCSS === null || ThemeCSS === void 0 ? void 0 : ThemeCSS[theme]) === null || _a === void 0 ? void 0 : _a["disabled"])) {
                return;
            }
            ThemeCSS[theme]["disabled"] = theme !== add;
        });
        localStorage.setItem("theme", add);
    }
    function switchTheme() {
        if (!btn) {
            return;
        }
        if (currentTheme == THEME.DARK) {
            switchToTheme(THEME.LIGHT);
            btn.replaceChild(ICONS.light, ICONS.dark);
        }
        else {
            switchToTheme(THEME.DARK);
            btn.replaceChild(ICONS.dark, ICONS.light);
        }
    }
    if (!btn) {
        return;
    }
    btn.addEventListener("click", switchTheme);
    switchToTheme(currentTheme);
    btn.appendChild(ICONS[currentTheme]);
};
document.addEventListener("DOMContentLoaded", loadTheme);
