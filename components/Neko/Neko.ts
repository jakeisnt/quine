const Neko = () => ({
  dependsOn: [{ src: './spawnNeko.js' }, { src: './Neko.css' }],
  body: ["span",
         ["div", { class: "neko-bed" }, ""],
         ["div", { class: "neko" }, ""]],
})

export default Neko;
