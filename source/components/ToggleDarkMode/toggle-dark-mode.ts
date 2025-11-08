/* A script to toggle dark mode with a button,
 * storing the current state in browser local storage.
 * The button hasn't yet been added...
 */

const loadTheme = () => {
  function svg(url: string) {
    let obj = document.createElement("img");
    obj.src = url;
    obj.style.height = "30px";
    obj.style.width = "30px";
    return obj;
  }

  const THEME = {
    LIGHT: "light",
    DARK: "dark",
  };

  const ICONS = {
    light: svg("/components/ToggleDarkMode/assets/sun_icon.svg"),
    dark: svg("/components/ToggleDarkMode/assets/moon_icon.svg"),
  };

  const possibleThemes = Object.values(THEME).map((theme) => `${theme}-theme`);
  const btn = document.querySelector(".toggle-dark-mode");
  const prefersDarkScheme = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  let currentTheme =
    localStorage.getItem("theme") ??
    (prefersDarkScheme ? THEME.DARK : THEME.LIGHT);

  function switchToTheme(add) {
    console.log("Switching to theme ", add);
    const classes = document.body.classList;
    classes.remove(...possibleThemes);
    classes.add(`${add}-theme`);
    currentTheme = add;

    const ThemeCSS = {
      [THEME.LIGHT]: document.getElementById("light-theme-highlight"),
      [THEME.DARK]: document.getElementById("dark-theme-highlight"),
    };

    [THEME.LIGHT, THEME.DARK].forEach((theme) => {
      console.log("Theme: ", theme);

      if (!ThemeCSS?.[theme]?.["disabled"]) {
        return;
      }

      ThemeCSS[theme]!["disabled"] = theme !== add;
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
    } else {
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
