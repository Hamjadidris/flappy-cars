const characters = [
  {
    name: "Cat",
    src: "./assets/cat.png",
  },
  {
    name: "Solja Boi",
    src: "./assets/soljaBoi.png",
  },
  {
    name: "CuhBoi",
    src: "./assets/cuhBoi.png",
  },
  {
    name: "Kitten",
    src: "./assets/kitten.png",
  },
  {
    name: "Silly Boy",
    src: "./assets/sillyBoi.png",
  },
  {
    name: "Silly Nibbly",
    src: "./assets/sillyNibbly.png",
  },
  {
    name: "Urrgh",
    src: "./assets/urrgh.png",
  },
  {
    name: "Trubgo Tuesday (watch out)",
    src: "./assets/trubgoTuesday.png",
  },
];

const scoreCounterEl = document.querySelector(".score-counter");
const scoreTextEl = document.querySelector(".score-text");
const intructionEl = document.querySelector(".instruct-text");
const startGameBtn = document.querySelector(".start-over");
const charactersContainer = document.querySelector(".characters-container");
const leadershipBoardBtn = document.querySelector(".leadership-board-btn");
const startGameDialogElem = document.getElementById("start-game-dialog");
const gameOverDialogElem = document.getElementById("game-over-dialog");
const characterSelectDialogElem = document.getElementById(
  "character-select-dialog"
);
const leadershipBoardDialogElem = document.getElementById(
  "leadership-board-dialog"
);

// module aliases
const Engine = Matter.Engine;
const Render = Matter.Render;
const Runner = Matter.Runner;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Composite = Matter.Composite;
const Events = Matter.Events;

// create an engine
const engine = Engine.create({
  gravity: {
    x: 0,
    y: 0.5,
  },
});

const world = engine.world;

const barrierCategory = 0x0001;
const characterCategory = 0x0002;

let hasStarted = false;
let hasCollided = false;
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const halfScreenWidth = screenWidth / 2;
const halfScreenHeight = screenHeight / 2;
const characterHeight = 60;
const characterwidth = 50;
const barrierWidth = 100;
const halfBarrierWidth = screenWidth / 10;
let sceneSpeed = 1;
let defaultSceneSpeed = 1;
let sceneInterval = screenWidth < 500 ? 2500 : 3000;
let defaultSceneInterval = screenWidth < 500 ? 2500 : 3000;
let scoreTimer = 0;

let canvasOptions = {
  height: screenHeight,
  width: screenWidth,
  wireframes: false,
  background: "transparent",
};

// create a renderer
const render = Render.create({
  element: document.body,
  engine: engine,
  options: canvasOptions,
});

const wallOptions = {
  collisionFilter: {
    category: barrierCategory,
  },
};

let characterBoxOptions = {
  label: "character",
  collisionFilter: {
    category: characterCategory,
  },
};

const topWall = Bodies.rectangle(screenWidth / 2, -12, screenWidth, 20, {
  isStatic: true,
  ...wallOptions,
});

const bottomWall = Bodies.rectangle(
  screenWidth / 2,
  screenHeight + 12,
  screenWidth,
  20,
  {
    isStatic: true,
    ...wallOptions,
  }
);

const createCharacterBox = (e) => {
  const characterName = localStorage.getItem("characterName") || "Cat";
  const characterData = characters.find(
    (character) => characterName === character.name
  );

  characterBoxOptions = {
    ...characterBoxOptions,
    render: {
      sprite: {
        texture: characterData.src,
      },
    },
  };

  return Bodies.rectangle(
    screenWidth / 4,
    screenHeight / 2 - 25,
    characterwidth,
    characterHeight,
    characterBoxOptions
  );
};

let characterBox = null;

function characterJump() {
  if (!hasStarted) {
    intructionEl.textContent = "";
    // Start game
    GameState.start();
  }

  Matter.Body.setVelocity(characterBox, {
    x: 0,
    y: -5,
  });
}

const setGameState = function () {
  let gameInterval = null;

  let scoreInterval = null;

  return {
    start: () => {
      generateLevelBarriers();
      hasCollided = false;
      gameInterval = setInterval(() => {
        generateLevelBarriers();
      }, sceneInterval);

      scoreInterval = setInterval(() => {
        scoreTimer++;
        scoreCounterEl.textContent = scoreTimer;
      }, 500);

      hasStarted = true;

      scoreCounterEl.parentElement.classList.add("show");
    },

    end: () => {
      hasCollided = true;
      clearInterval(gameInterval);
      clearInterval(scoreInterval);
      Events.off(engine, "beforeUpdate");
      scoreCounterEl.parentElement.classList.remove("show");
      // hasStarted = false;
    },
  };
};

const GameState = setGameState();

startGameBtn.addEventListener("click", (e) => {
  e.preventDefault();
  Composite.remove(world, characterBox);
  // Composite.clear(world);
  // Engine.clear(engine);
  gameOverDialogElem.close();
  resetWorld();
  GameState.start();
});

function generateLevelBarriers() {
  let barrierHeights = randomBarrierHeights();

  const topBarrier = Bodies.rectangle(
    screenWidth + barrierWidth,
    barrierHeights[0] / 2,
    barrierWidth,
    barrierHeights[0],
    {
      collisionFilter: {
        mask: characterCategory,
      },
    }
  );

  const bottomBarrier = Bodies.rectangle(
    screenWidth + barrierWidth,
    screenHeight - barrierHeights[1] / 2,
    barrierWidth,
    barrierHeights[1],
    {
      friction: 0,
      collisionFilter: {
        mask: characterCategory,
      },
    }
  );

  Composite.add(world, [topBarrier, bottomBarrier]);

  Events.on(engine, "beforeUpdate", function (event) {
    Matter.Body.setPosition(
      topBarrier,
      {
        x: topBarrier.position.x - sceneSpeed,
        y: barrierHeights[0] / 2,
      },
      true
    );

    Matter.Body.setPosition(
      bottomBarrier,
      {
        x: bottomBarrier.position.x - sceneSpeed,
        y: screenHeight - barrierHeights[1] / 2,
      },
      true
    );

    Matter.Body.rotate(bottomBarrier, 0);

    if (
      topBarrier.position.x < -barrierWidth &&
      bottomBarrier.position.x < -barrierWidth
    ) {
      Composite.remove(world, [topBarrier, bottomBarrier]);
    }

    const detector = Matter.Detector.create({
      bodies: Composite.allBodies(world),
    });

    const isColliding = Matter.Detector.collisions(detector).some(
      (body) =>
        body.bodyA?.label === "character" || body.bodyB?.label === "character"
    );

    if (isColliding && scoreTimer > 1) {
      if (hasCollided) return;
      handleCollision();
      Matter.Detector.clear(detector);
    }

    handleGameDifficulty();
  });
}

const populateCharactersDisplay = () => {
  characters.forEach((character) => {
    const characterElement = document.createElement("button");
    const joinedName = character.name.replaceAll(" ", "");
    characterElement.classList.add("character-btn", joinedName);
    characterElement.innerHTML = `
    <div onclick="handleShowCharacterSelect().selectCharacter('${character.name}')" class="character-info">
        <img src="${character.src}" alt="${character.name}" class="character-img" >

        <p class="character-name" > ${character.name}</p>
    </div>
    `;
    charactersContainer.appendChild(characterElement);
  });
  toggleActiveCharacter();
};

const toggleActiveCharacter = () => {
  const characterName = localStorage.getItem("characterName") || "Cat";
  const joinedName = characterName.replaceAll(" ", "");
  const children = charactersContainer.children;

  for (const child of children) {
    child.classList.remove("character-active");
    if (child.classList.contains(joinedName)) {
      child.classList.add("character-active");
    }
  }
};
// run the renderer
Render.run(render);

// create runner
const runner = Runner.create();

// run the engine
Runner.run(runner, engine);

initWorld();
populateCharactersDisplay();

//////// Helper Functions ///////

function initWorld() {
  characterBox = createCharacterBox();
  Body.setMass(characterBox, -10);

  Composite.add(world, [topWall, bottomWall]);
  Composite.add(world, characterBox);

  sceneSpeed = defaultSceneSpeed;
  sceneInterval = defaultSceneInterval;
  scoreTimer = 0;

  window.addEventListener("keydown", (e) => {
    e.preventDefault();
    if (e.key == " " || e.code == "Space") {
      characterJump();
    }
  });

  window.addEventListener("touchstart", characterJump);
}

function resetWorld() {
  removeEvents();
  Composite.clear(world, true);
  initWorld();
}

function handleGameScore(score) {
  const highScore = parseInt(localStorage.getItem("highScore"));
  const isNewHighscore = score > highScore;
  const scoreString = `Score <br/> ${scoreTimer}`;
  const highScoreString = `New High Score!!! <br/> ${scoreTimer}`;

  if (!highScore) {
    localStorage.setItem("highScore", score);
    scoreTextEl.innerHTML = scoreString;
  } else if (isNewHighscore) {
    localStorage.setItem("highScore", score);
    scoreTextEl.style.fontSize = "24px";
    scoreTextEl.innerHTML = highScoreString;
  } else {
    scoreTextEl.innerHTML = scoreString;
  }
}

function removeEvents() {
  window.removeEventListener("keydown", (e) => {
    e.preventDefault();
    if (e.key == " " || e.code == "Space") {
      characterJump();
    }
  });
  window.removeEventListener("touchstart", characterJump);
}

function handleCollision() {
  console.log("hit");
  GameState.end();
  removeEvents();
  handleGameScore(scoreTimer);
  gameOverDialogElem.showModal();
}

function handleShowCharacterSelect() {
  const open = () => characterSelectDialogElem.showModal();
  const close = () => characterSelectDialogElem.close();

  const selectCharacter = (character) => {
    localStorage.setItem("characterName", character);
    toggleActiveCharacter();
  };

  return { open, close, selectCharacter };
}

function randomBarrierHeights() {
  let heights = [];
  const randomNum = Math.floor(Math.random() * 5) + 4;

  const firstBarrierHeight =
    screenHeight - Math.floor(screenHeight * (randomNum / 10));

  const secondBarrierHeight =
    screenHeight - (firstBarrierHeight + characterHeight * 3.5);

  heights = [firstBarrierHeight, secondBarrierHeight];
  return heights;
}

function handleGameDifficulty() {
  if (sceneSpeed === 3) return;
  const interval = 50;

  if (scoreTimer < interval) return;
  if (scoreTimer % interval !== 0) return;
  sceneSpeed = defaultSceneSpeed + (scoreTimer / interval) * 0.5;
  sceneInterval = defaultSceneInterval - (scoreTimer / interval) * 200;
}

function debounce(fn, wait) {
  let timer;
  return function (...args) {
    if (timer) {
      clearTimeout(timer);
    }
    const context = this;
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, wait);
  };
}
