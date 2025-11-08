import { create, all } from "./lib";

/* enhancements to native html elements */

const loadHeadings = () => {
  /* Allow users to copy links from headings */
  const headings = "h1, h2, h3, h4, h5, h6";

  all(headings).forEach((heading) => {
    const headingId = heading.id;
    const btn = create("button", {
      className: "inlineText",
      innerText: "#",
      onclick: (e) => {
        console.log(e.target);
        const url = window.location.origin + window.location.pathname;
        const link = `${url}#${headingId}`;
        navigator.clipboard.writeText(link);
      },
    });

    heading.prepend(btn);
  });
};

/* Support footnotes */
const supportFootnotes = () => {
  const footnoteReferences = "sup";
  const footnotes = 'li[id^="fn-"]';

  all(footnoteReferences).forEach((footnoteRef) => {
    footnoteRef.classList.add("footnoteRef");
    const footnoteId = footnoteRef.id;
    const refNum = footnoteId.replace("fnref-", "");
    (footnoteRef.children[0] as HTMLPreElement).innerText = `[${refNum}]`;
  });

  all(footnotes).forEach((footnote) => {
    footnote.classList.add("footnote");
  });
};

document.addEventListener("DOMContentLoaded", (event) => {
  loadHeadings();
  supportFootnotes();
});
