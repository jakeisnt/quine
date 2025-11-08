// Script to display the last few are.na blocks a user has seen

const currentPage = 1;
const perPage = 3;
const myArenaId = 210234;
const channelName = "scientific-progress-first-and-forever";

// Get the last three blocks I've posted on are.na
async function getUserBlocks() {
  // `https://api.are.na/v2/channels/${jakeisntArenaId}/contents?page=${current_page}&perPage=${per_page}&direction=desc&sort=position`
  return fetch(
    `https:api.are.na/v2/channels/${channelName}/contents?page=${currentPage}&perPage=${perPage}&direction=desc&sort=position`
  ).then((response) => response.json()).then((js) => js.contents);
}

// create a tag from an are.na block
function createImageTag(block) {
  var img = document.createElement('img');
  var linkTag = document.createElement('a');

  linkTag.className = 'now-playing';

  linkTag.href = `https://www.are.na/block/${block.id}`;
  linkTag.target = "blank";

  img.setAttribute("src", block.image.original.url);
  linkTag.appendChild(img);

  setTimeout(function() {
    linkTag.setAttribute("class", "now-playing loaded");
  }, 100);

  return linkTag;
}

// Add arena images to the document
async function addArenaImages() {
  const parentRow = document.getElementById("site-body");
  const blocks = await getUserBlocks();

  blocks.forEach((block) => {
    if (block.image) { parentRow.appendChild(createImageTag(block)); }
  });
}
