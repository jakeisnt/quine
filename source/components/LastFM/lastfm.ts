const LastFM = () => ({
  dependsOn: [
    { src: "components/LastFM/getCurrentTrack.ts", type: "module" },
    { src: "components/LastFM/lastfm.scss", type: "stylesheet" },
  ],
  body: ["div", { class: "lastfm-now-playing-box" }],
});

export default LastFM;
