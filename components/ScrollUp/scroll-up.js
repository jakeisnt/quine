document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".scroll-up-button");
  if (!btn) {
    console.warn("Could not find scroll up button");
    return;
  }
  btn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  });
});
