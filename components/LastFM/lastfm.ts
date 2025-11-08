const LastFM = () => ({
  dependsOn: [
    { src: "/components/LastFM/getCurrentTrack.js", type: "module" },
    { src: "/components/LastFM/lastfm.css" },
  ],
  body: ["div", { class: "lastfm-now-playing-box" }],
});

export default LastFM;
