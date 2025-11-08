/* enhancements to native html elements */

/* code blocks */
const codeBlocks = 'pre code';

all(codeBlocks).forEach((codeBlock) => {
  const codeContainer = codeBlock.parentElement;
  codeContainer.style = 'position: relative';

  const btn = create('button', {
    class: 'inset',
    innerText: 'Copy',
    onclick: (e) => {
      const codeContents = codeBlock.innerText;
      navigator.clipboard.writeText(codeContents);
    },
  }, codeContainer);

  const label = create('div', {
    class: 'label inset',
    innerText: codeBlock.classList[0].replace('language-', ''),
  }, codeContainer);
});

document.addEventListener('DOMContentLoaded', (event) => {
  all(codeBlocks).forEach((block) => {
    hljs.highlightElement(block);
  });
});

/* Allow users to copy links from headings */
const headings = 'h1, h2, h3, h4, h5, h6';

all(headings).forEach((heading) => {
  const headingId = heading.id;
  const btn = create('button', {
    className: 'inlineText',
    innerText: '#',
    onclick: (e) => {
      console.log(e.target);
      const url = window.location.origin + window.location.pathname;
      const link = `${url}#${headingId}`;
      navigator.clipboard.writeText(link);
    },
  });

  heading.prepend(btn);
});

/* Support footnotes */
const footnoteReferences = 'sup';
const footnotes = 'li[id^="fn-"]';

all(footnoteReferences).forEach((footnoteRef) => {
  footnoteRef.classList.add('footnoteRef');
  const footnoteId = footnoteRef.id;
  const refNum = footnoteId.replace('fnref-', '');
  footnoteRef.children[0].innerText = `[${refNum}]`;
});

all(footnotes).forEach((footnote) => {
  footnote.classList.add('footnote');
});

