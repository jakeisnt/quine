import { create, runOnDesktop } from "/resources/lib";

// TODO:
// Go to a specific place to sleep
// Sit next to the left or right of the cursor, whichever is closer
// Sit next to/on/around links if they are hovered

const neko = () => {
  function createNekoImage() {
    return create("img", {
      src: currentAnimation[0],
      width: "32px",
      height: "32px",
      alt: "🐱",
      id: "neko",
    });
  }

  function timestamp() {
    return new Date().getTime();
  }

  const neko: HTMLElement = document.querySelector(".neko");
  const nekoBed = document.querySelector(".neko-bed");

  const nekoUrl = "/components/neko/assets/";

  const Neko = {
    yawn: [nekoUrl + "yawn1.png", nekoUrl + "yawn2.png"],
    wash: [nekoUrl + "wash1.png", nekoUrl + "wash2.png"],
    awake: [nekoUrl + "awake.png", nekoUrl + "awake.png"],
    sleep: [nekoUrl + "sleep1.png", nekoUrl + "sleep2.png"],
    scratch: [nekoUrl + "scratch1.png", nekoUrl + "scratch2.png"],

    up: [nekoUrl + "up1.png", nekoUrl + "up2.png"],
    down: [nekoUrl + "down1.png", nekoUrl + "down2.png"],
    left: [nekoUrl + "left1.png", nekoUrl + "left2.png"],
    right: [nekoUrl + "right1.png", nekoUrl + "right2.png"],
    upLeft: [nekoUrl + "upleft1.png", nekoUrl + "upleft2.png"],
    upRight: [nekoUrl + "upright1.png", nekoUrl + "upright2.png"],
    downLeft: [nekoUrl + "downleft1.png", nekoUrl + "downleft2.png"],
    downRight: [nekoUrl + "downright1.png", nekoUrl + "downright2.png"],
  };

  const idleLevelKeys = [
    "awake",
    "awake",
    "awake",
    "awake",
    "awake",
    "yawn",
    "awake",
    "scratch",
    "wash",
    "awake",
    "yawn",
    "sleep",
  ];

  const Direction = {
    left: "left",
    right: "right",
    up: "up",
    down: "down",
    downLeft: "downLeft",
    downRight: "downRight",
    upLeft: "upLeft",
    upRight: "upRight",
    still: "awake",
  };

  const mouseTolerance = 5;
  const nekoStepLength = 16;
  const animationSpeed = 200;
  var lastMouseMoved;

  let currentX;
  let currentY;
  let mouseX;
  let mouseY;

  const distanceFromCursorX = -30;
  const distanceFromCursorY = 10;

  let currentAnimation = Neko.sleep;

  const nekoImage = createNekoImage();

  document.addEventListener("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    lastMouseMoved = timestamp();
  });

  function animate(first = true) {
    if (currentAnimation) {
      nekoImage.setAttribute("src", currentAnimation[first ? 0 : 1]);
    }

    setTimeout(() => animate(!first), animationSpeed);
  }

  function setAnimation(anim) {
    // console.log("Neko: ", anim);
    currentAnimation = Neko[anim];
  }

  function determineDirection(x, y) {
    if (x === 0 && y === 0) {
      return Direction.still;
    }

    if (x === 0) {
      return y > 0 ? Direction.down : Direction.up;
    }

    if (y === 0) {
      return x > 0 ? Direction.right : Direction.left;
    }

    if (x > 0 && y > 0) {
      return Direction.downRight;
    }

    if (x > 0 && y < 0) {
      return Direction.upRight;
    }

    if (x < 0 && y > 0) {
      return Direction.downLeft;
    }

    if (x < 0 && y < 0) {
      return Direction.upLeft;
    }
  }

  function moveInX() {
    if (mouseX - currentX - distanceFromCursorX > nekoStepLength) {
      return nekoStepLength;
    } else if (mouseX - currentX - distanceFromCursorX < nekoStepLength * -1) {
      return -nekoStepLength;
    } else {
      return 0;
    }
  }

  function moveInY() {
    if (mouseY - currentY - distanceFromCursorY > nekoStepLength) {
      return nekoStepLength;
    } else if (mouseY - currentY - distanceFromCursorY < nekoStepLength * -1) {
      return -nekoStepLength;
    } else {
      return 0;
    }
  }

  function moveNeko(x: number, y: number) {
    currentX += x;
    currentY += y;
    neko.style.left = currentX + "px";
    neko.style.top = currentY + "px";
  }

  let idleLevel = 0;
  let nekoAwake = false;

  function nekoEventLoop() {
    const x = moveInX();
    const y = moveInY();
    if (nekoAwake && (x !== 0 || y !== 0)) {
      // if we can move, we're moving!
      // console.log("moving", x, y);
      idleLevel = 0;
      moveNeko(x, y);
      setAnimation(determineDirection(x, y));
    } else {
      // if we can't move, we're idle
      // console.log("idle", idleLevel);
      if (idleLevel < idleLevelKeys.length - 1) {
        idleLevel++;
        setAnimation(idleLevelKeys[idleLevel]);
      }
    }

    setTimeout(nekoEventLoop, animationSpeed);
  }

  neko.addEventListener("click", function (e: MouseEvent) {
    if (!nekoAwake) {
      currentX = e.clientX - 32;
      currentY = e.clientY - 32;
    }

    nekoAwake = true;
    idleLevel = 0;
    setAnimation("awake");
    nekoEventLoop();
  });

  neko.appendChild(nekoImage);
  animate();
};

runOnDesktop(neko);
