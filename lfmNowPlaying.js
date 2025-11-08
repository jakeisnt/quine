/* OLD SCHOOL CURRENT PLAYING STUFF */
/* source: https://gist.github.com/trisweb/2c0c94273f653c81f34dbe8e85ad30e7 via https://www.trisweb.com/ */
/*
/other cool idea: changing color and contrast of tbe website background when pressing a key, tapping or clicking
*/

var LFM_API = "https://ws.audioscrobbler.com/2.0/";
var LFM_KEY = "14eb0c0c914456103f2c584d930a44ba"; // Get one at https://secure.last.fm/login?next=/api/account/create
var LFM_USER = "jakeisnt";

function getNowPlaying() {
  var recentTracksUrl =
    LFM_API+"?method=user.getrecenttracks&user="+LFM_USER+"&api_key="+LFM_KEY+"+&format=json&limit=1";

  if (window.XMLHttpRequest) {
      httpRequest = new XMLHttpRequest();
  } else if (window.ActiveXObject) {
      httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
  }
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        // All set
        var response = JSON.parse(httpRequest.responseText);
        console.log(response);
        var currentTrack = response.recenttracks.track[0];

        // Check if it's the same, if not then rerender
        if (!window.nowPlaying || window.nowPlaying.mbid != currentTrack.mbid) {
          window.nowPlaying = currentTrack;
          renderNowPlaying(currentTrack);
        }
        setTimeout(getNowPlaying, 60*1000);
      } else {
        console.log('There was a problem with the last.fm request.');
      }
    }
  };
  httpRequest.open('GET', recentTracksUrl, true);
  httpRequest.send();
}


var nowPlayingNode = null;

function renderNowPlaying(track) {
  console.log(track);
  if (nowPlayingNode) {
    nowPlayingNode.remove();
  }
  nowPlayingNode = document.createElement("a");
  nowPlayingNode.className = "now-playing";

  var imageurl = track.image.slice(-1)[0]["#text"];
  var nowPlayingImage = document.createElement("img");
  nowPlayingImage.src = imageurl;
  nowPlayingNode.appendChild(nowPlayingImage);

  var currently = track["@attr"] && track["@attr"].nowplaying == "true";

  var metadata = document.createElement("div");
  metadata.setAttribute("class", "np-metadata");
  metadata.innerHTML =
    (currently ?
      "<span class=\"np-date\">Playing</span>" :
     "<span class=\"np-date\">Played on "+track.date["#text"]+"</span>") +
    "<br>" +
    "<span class=\"np-title\"><strong>" + track.name + "</strong></span>" +
    "<br/>" +
    "<span class=\"np-artist\">"+track.artist["#text"]+"</span>";

  nowPlayingNode.appendChild(metadata);
  nowPlayingNode.href = track.url;
  nowPlayingNode.target = "blank";

  document.getElementsByClassName("lastfm-now-playing-box")[0].appendChild(nowPlayingNode);

  setTimeout(function() {
    nowPlayingNode.setAttribute("class", "now-playing loaded");
  }, 100);
}
