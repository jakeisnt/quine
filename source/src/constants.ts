// @ts-nocheck

/**
 * Settings that are necessary for the app to run.
 * Only 'main.js' should import this file.
 */

// declare how the site is configured
// const sitePaths = [
//   { folder: "resources", forceRebuild: true },
//   { folder: "components" },
//   { folder: "src", forceRebuild: true },
//   { folder: "style", forceRebuild: true },
// ];

// const wikiPaths = [
//   {
//     folder: "pages",
//     sortBy: (v: File) => v.lastLog?.commitDate,
//   },
//   {
//     folder: "scripts",
//     sortBy: (v: File) => v.lastLog?.commitDate,
//   },
//   {
//     folder: "journals",
//     sortBy: "name",
//   },
// ];

// const sources = [
//   { dir: sourceDir, paths: sitePaths },
//   { dir: "/home/jake/wiki", paths: wikiPaths },
// ];

// const website = {
//   sources,
//   target: targetDir,
// };

// @ts-ignore
const profiles = [
  {
    name: "Are.na",
    url: "https://are.na/jake-isnt",
    user: "jake-isnt",
  },
  {
    name: "Mastodon",
    url: "https://merveilles.town/@jakeisnt",
    user: "jakeisnt",
  },
  {
    name: "Twitter",
    url: "https://twitter.com/jakeissnt",
    user: "jakeissnt",
  },
  {
    name: "GitHub",
    url: "https://github.com/jakeisnt",
    user: "jakeisnt",
  },
  {
    name: "Gitlab",
    url: "https://gitlab.com/jakeisnt",
    user: "jakeisnt",
  },
  {
    name: "sourcehut",
    url: "https://sr.ht/~jakeisnt/",
    user: "jakeisnt",
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@jakeisnt",
    user: "jakeisnt",
  },
  {
    name: "Email",
    url: "mailto://jake+website@isnt.online",
    user: "jake @ ~",
  },
  {
    name: "Google Maps",
    url: "https://www.google.com/maps/contrib/109731430420919295575/",
    user: "Jake Chvatal",
  },
  {
    name: "OpenStreetMaps",
    url: "https://www.openstreetmap.org/user/jakeisnt",
    user: "jakeisnt",
  },
  {
    name: "Hacker News",
    url: "https://news.ycombinator.com/user?id=jakeisnt",
    user: "jakeisnt",
  },
  {
    name: "Instagram",
    url: "https://instagram.com/jakeisnt",
    user: "jakeisnt",
  },
  {
    name: "read.cv",
    url: "https://read.cv/jakeisnt",
    user: "jakeisnt",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/jacob-chvatal",
    user: "jacob-chvatal",
    deprecated: true,
  },
];

// @ts-ignore
const personal = {
  name: "Jake Chvatal",
  location: "Stockholm, SV",
  occupation: "Software Engineer",
  pronouns: ["he", "him", "his"],
  education: {
    degree: "B.S. Computer Science",
    school: "Northeastern University",
    url: "https://www.khoury.northeastern.edu/",
  },
};

export { website };
