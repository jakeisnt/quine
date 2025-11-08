const ToggleDarkMode = () => ({
  dependsOn: [
    {
      src: "components/ToggleDarkMode/toggle-dark-mode.ts",
    },
    {
      src: "components/ToggleDarkMode/toggle-dark-mode.scss",
    },
  ],
  body: [
    "div",
    { class: "toggle-dark-mode-container" },
    ["button", { class: "toggle-dark-mode" }, ""],
  ],
});

export default ToggleDarkMode;
