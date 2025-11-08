import { create, all } from "/resources/lib";
/**
 * Improve code blocks with button interactivity
 */
var loadCodeBlocks = function () {
    var codeBlocks = "pre code";
    all(codeBlocks).forEach(function (codeBlock) {
        var codeContainer = codeBlock.parentElement;
        if (!codeContainer) {
            console.log("Couldn't find a code container. Running away!");
            return;
        }
        codeContainer.style.position = "relative";
        var buttonCodeContainer = create("div", { class: "insetButtonPanel" }, codeContainer);
        var btn = create("button", {
            class: "inset",
            innerText: "Copy",
            onclick: function (e) {
                var codeContents = codeBlock.innerText;
                navigator.clipboard.writeText(codeContents);
            },
        }, buttonCodeContainer);
        var label = create("div", {
            class: "label inset",
            innerText: codeBlock.classList[0].replace("language-", ""),
        }, codeContainer);
        if (codeBlock.classList[1] === "has-raw-code") {
            var rawCodeURL_1 = codeBlock.classList[2];
            var rawCode = create("button", {
                class: "inset",
                innerText: "Raw",
                href: rawCodeURL_1,
                onclick: function (e) {
                    console.log("opening window", rawCodeURL_1);
                    window.open(rawCodeURL_1, "_blank");
                },
            }, buttonCodeContainer);
        }
    });
};
document.addEventListener("DOMContentLoaded", function (event) {
    loadCodeBlocks();
});
