import { create, all } from "/resources/lib";

/**
 * Improve code blocks with button interactivity
 */
const loadCodeBlocks = () => {
  const codeBlocks = "pre code";

  all(codeBlocks).forEach((codeBlock) => {
    const codeContainer = codeBlock.parentElement;

    if (!codeContainer) {
      console.log(`Couldn't find a code container. Running away!`);
      return;
    }

    codeContainer.style.position = "relative";

    const buttonCodeContainer = create(
      "div",
      { class: "insetButtonPanel" },
      codeContainer
    );

    const btn = create(
      "button",
      {
        class: "inset",
        innerText: "Copy",
        onclick: (e: MouseEvent) => {
          const codeContents = (codeBlock as HTMLPreElement).innerText;
          navigator.clipboard.writeText(codeContents);
        },
      },
      buttonCodeContainer
    );

    const label = create(
      "div",
      {
        class: "label inset",
        innerText: codeBlock.classList[0].replace("language-", ""),
      },
      codeContainer
    );

    if (codeBlock.classList[1] === "has-raw-code") {
      const rawCodeURL = codeBlock.classList[2];
      const rawCode = create(
        "button",
        {
          class: "inset",
          innerText: "Raw",
          href: rawCodeURL,
          onclick: (e) => {
            console.log("opening window", rawCodeURL);
            window.open(rawCodeURL, "_blank");
          },
        },
        buttonCodeContainer
      );
    }
  });
};

document.addEventListener("DOMContentLoaded", (event) => {
  loadCodeBlocks();
});
