import { create, all } from "./lib";
/* enhancements to native html elements */
var loadHeadings = function () {
    /* Allow users to copy links from headings */
    var headings = "h1, h2, h3, h4, h5, h6";
    all(headings).forEach(function (heading) {
        var headingId = heading.id;
        var btn = create("button", {
            className: "inlineText",
            innerText: "#",
            onclick: function (e) {
                console.log(e.target);
                var url = window.location.origin + window.location.pathname;
                var link = "".concat(url, "#").concat(headingId);
                navigator.clipboard.writeText(link);
            },
        });
        heading.prepend(btn);
    });
};
/* Support footnotes */
var supportFootnotes = function () {
    var footnoteReferences = "sup";
    var footnotes = 'li[id^="fn-"]';
    all(footnoteReferences).forEach(function (footnoteRef) {
        footnoteRef.classList.add("footnoteRef");
        var footnoteId = footnoteRef.id;
        var refNum = footnoteId.replace("fnref-", "");
        footnoteRef.children[0].innerText = "[".concat(refNum, "]");
    });
    all(footnotes).forEach(function (footnote) {
        footnote.classList.add("footnote");
    });
};
document.addEventListener("DOMContentLoaded", function (event) {
    loadHeadings();
    supportFootnotes();
});
