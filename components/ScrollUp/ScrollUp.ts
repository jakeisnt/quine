const ScrollUp = () => ({
  dependsOn: [{ src: '/components/ScrollUp/scroll-up.js' }, { src: '/components/ScrollUp/scroll-up.css' }],
  body: ["div", { class: 'git-hist-table' },
         ["button", { class: 'scroll-up-button' }, "Scroll Up"]]
});

export default ScrollUp;
