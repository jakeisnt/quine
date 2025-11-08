function id(id) {
    return document.getElementById(id);
};

function filetype(path) {
  return path.split('.').pop();
}

function reload_html(path) {
  console.log('Reloading HTML');

  const pathname = window.location.pathname;
  const pathWithIndex = window.location.pathname + "index.html";
  if(pathname === path || pathWithIndex === path) {
    window.location.reload();
  }
}

function reload_js(path) {
  id(path).src = `${path}?${Date.now()}`;
}

function add_css(path, onload) {
  const elem = document.createElement('link', onload);
  elem.rel = "stylesheet";
  elem.type = "text/css";
  elem.href = path;
  elem.id = path;
  elem.onload = onload;
  document.body.appendChild(elem);
}

const last_ids = {};

function reload_css(path) {
  let path_hashed = `${path}?${Date.now()}`;
  add_css(path_hashed, () => {
    // TODO: This is supposed to avoid style flicker by adding a new stylesheet
    // i think this is a light->darkmode thing?
    if (last_ids[path]) {
      id(last_ids[path]).remove();
    } else {
      id(path).remove();
    }

    last_ids[path] = path_hashed;
  });
}

// connect to dev server websocket
const ws = new WebSocket('ws://127.0.0.1:4242/__hmr');

ws.onopen = () => {
  console.log('Connected to dev server');
};

ws.onmessage = (msg) => {
  console.log('Received message from dev server', msg);
  if (msg.data === 'reload') {
    window.location.reload();
  } else {
    // assume that a path has been sent for a specific file to refresh
    switch (filetype(msg.data)) {
      case 'html':
        reload_html(msg.data);
        break;
      case 'js':
        reload_js(msg.data);
        break;
      case 'css':
        reload_css(msg.data);
        break;
      default:
        console.log('Unknown file type', msg.data);
    }
  }
};

ws.onerror = (err) => {
  console.error('Error connecting to dev server', err);
};

ws.onclose = () => {
  console.log('Connection closed to the dev server');
}
