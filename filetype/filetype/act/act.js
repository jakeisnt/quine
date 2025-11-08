
// note: this replacement assumes that the replaced classname is not hte first classname to be modified
function changeClassName(old, neew) {
  Array.from(document.getElementsByClassName(old)).forEach(
    (elem) => {elem.className = elem.className.replace(` ${old}`, ` ${neew}`);});
}

var params = new URLSearchParams(window.location.search);
var characters = undefined;
var currentCharacter = undefined;
var characterSelector = document.getElementById("characterSelector");

/* Get the character names from the character selector. */
function getCharacterNames() {
  return Array.from(characterSelector.childNodes).map((option) => option.value);
}

function characterInUrl() {
  return params.get("actingAs");
}

function setCharacter(charName) {
  currentCharacter = charName;
  characterSelector.value = currentCharacter;
  params.set("actingAs", charName);
  window.history.replaceState({}, '', `${location.pathname}?${params}`);
}

/* Make the chosen character the current character. */
function makeCharacterCurrent(characterName) {
  if (characterName != currentCharacter) {
    // console.log(`Switching to character ${characterName}`)
    changeClassName("right", "left"); // move all to the left
    changeClassName(`${characterName} left`, `${characterName} right`); // make current character the current 'a'
    setCharacter(characterName);
  }
}

/* Fetch info about the current characters from the `<select> element.` */
function cacheCharacters() {
  characters = getCharacterNames();
  makeCharacterCurrent(characterInUrl() || characters[0]);
}

function selectCharacter(e) {
  makeCharacterCurrent(event.target.value);
}

cacheCharacters();
characterSelector.addEventListener('change', selectCharacter);
