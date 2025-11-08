// https://stackoverflow.com/questions/260857/changing-website-favicon-dynamically
const CANVAS_WIDTH = 64;

function drawCircle(ctx, x, y, radius, fill, stroke, strokeWidth) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

function createElem(tag, props = {}, parent) {
  const elem = document.createElement(tag);
  Object.keys(props).forEach(key => {
    elem[key] = props[key];
  });

  if (parent) {
    parent.appendChild(elem);
  }

  return elem;
}

function changeFavicon(color) {
  const canvas = document.createElement('canvas');
  canvas.height = CANVAS_WIDTH;
  canvas.width = CANVAS_WIDTH;
  const ctx = canvas.getContext('2d');

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = centerX;

  drawCircle(ctx, centerX, centerY, radius, color, null, 0);

  const link = createElem('link', {
    id: 'dynamic-favicon',
    type: 'image/x-icon',
    rel: 'shortcut icon',
    href: canvas.toDataURL(),
  }, document.head);

  const oldLinks = document.querySelectorAll('link[rel="shortcut icon"]');
  oldLinks.forEach(e => e.parentNode.removeChild(e));
}

// changeFavicon('blue');
