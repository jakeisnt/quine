const LastFM = () => ({
  dependsOn: [
    { src: "components/LastFM/getCurrentTrack.ts", type: "module" },
    { src: "components/LastFM/LastFM.scss", type: "stylesheet" },
  ],
  body: ["div", { class: "lastfm-now-playing-box" }],
});

export default LastFM;
