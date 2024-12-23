const characters = [
  {
    name: "Cat",
    src: "./assets/cat.png",
  },
  {
    name: "Kitten",
    src: "./assets/kitten.png",
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
    name: "Silly Boy",
    src: "./assets/sillyBoi.png",
  },
  {
    name: "Un-silly Boy",
    src: "./assets/un-sillyBoi.png",
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
    name: "Quetzkol The Incomprehensible Deity",
    src: "./assets/QuetzkolTheIncomprehensibleDeity.png",
  },
  {
    name: "Eepy Sleebjy",
    src: "./assets/eepySleebjy.png",
  },
  {
    name: "Trubgo Tuesday (watch out)",
    src: "./assets/trubgoTuesday.png",
  },
];

const gameOverContent = [
  {
    text: "Game Over",
    src: "./assets/spinLad.gif",
  },
  {
    text: "You lost, how- how could you?",
    src: "./assets/sadcat.gif",
  },
  {
    text: "Better luck next time!!",
    src: "./assets/spinLad.gif",
  },
  {
    text: "Pretty decent score you got there",
    src: "./assets/gromker.gif",
  },
  {
    text: "Hell Yeah",
    src: "./assets/gromker.gif",
  },
];

const scoreCounterEl = document.querySelector(".score-counter");
const scoreTextEl = document.querySelector(".score-text");
const intructionEl = document.querySelector(".instruct-text");
const startGameBtn = document.querySelector(".start-over");
const charactersContainer = document.querySelector(".characters-container");
const leadershipContainer = document.getElementById("leadership-container");
const leadershipBoardBtn = document.querySelector(".leadership-board-btn");
const leadershipJoinBtn = document.querySelector(".leadership-join-btn");
const joinLeadershipForm = document.querySelector(".join-leadership-form");
const leadershipLoaderEl = document.querySelector(".leadership-loader");
const startGameDialogElem = document.getElementById("start-game-dialog");
const gameOverDialogElem = document.getElementById("game-over-dialog");
const gameOverText = document.querySelector(".game-over-text");
const gameOverImg = document.querySelector(".game-over-img");
const characterSelectDialogElem = document.getElementById(
  "character-select-dialog"
);
const leadershipBoardDialogElem = document.getElementById(
  "leadership-board-dialog"
);
const leadershipBoardUrl = "https://flappycar.onrender.com";

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
let showloading = false;

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
  if (charactersContainer.childNodes.length) return;
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
  initWorld();
}

function handleGameScore(score) {
  const highScore = parseInt(localStorage.getItem("highScore"));
  const isNewHighscore = score > highScore;
  const scoreString = `Score <br/> ${scoreTimer}`;
  scoreTextEl.style.fontSize = "1.5rem";
  const highScoreString = `New High Score!!! <br/> ${scoreTimer}`;
  const gameOverContentAmount = gameOverContent.length;

  if (!highScore) {
    localStorage.setItem("highScore", score);
    scoreTextEl.innerHTML = scoreString;
    setGameModalContent(gameOverContent[0]);
  } else if (isNewHighscore) {
    localStorage.setItem("highScore", score);
    scoreTextEl.style.fontSize = "24px";
    scoreTextEl.innerHTML = highScoreString;
    setGameModalContent(
      gameOverContent[getRandomNumber(2) + (gameOverContentAmount - 2)]
    );
  } else {
    setGameModalContent(
      gameOverContent[getRandomNumber(gameOverContentAmount - 2)]
    );
    scoreTextEl.innerHTML = scoreString;
  }
}

function setGameModalContent({ text, src } = { text: "", src: "" }) {
  gameOverText.innerHTML = text;
  gameOverImg.src = src;
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
  GameState.end();
  removeEvents();
  handleGameScore(scoreTimer);
  gameOverDialogElem.showModal();
  setTimeout(() => {
    Composite.clear(world, true);
  }, 1000);
}

function handleShowCharacterSelect() {
  const open = () => {
    populateCharactersDisplay();
    characterSelectDialogElem.showModal();
  };

  const close = () => characterSelectDialogElem.close();

  const selectCharacter = (character) => {
    localStorage.setItem("characterName", character);
    toggleActiveCharacter();
  };

  return { open, close, selectCharacter };
}

function handleShowLeadershipBoard() {
  const open = () => {
    leadershipBoardDialogElem.showModal();
    fetchLeadershipBoard();
  };

  const close = () => leadershipBoardDialogElem.close();

  return { open, close };
}

async function fetchLeadershipBoard() {
  joinLeadershipForm.style.display = "none";
  leadershipLoaderEl.style.display = "flex";

  try {
    const res = await fetch(leadershipBoardUrl + "/getLeadershipBoard");
    const data = await res.json();
    leadershipJoinBtn.style.display = "inline-block";
    leadershipLoaderEl.style.display = "none";
    leadershipContainer.innerHTML = "";
    leadershipContainer.style.display = "block";
    data.forEach(populateLeadershipBoard);
  } catch (error) {
    console.log(error);
  } finally {
    showloading = false;
  }
}

function populateLeadershipBoard(entry) {
  const scoreEl = document.createElement("div");

  const characterData = characters.find(
    (character) => character.name === entry.character
  );

  const characterImage = characterData?.src || characters[0].src;

  scoreEl.classList.add("board-entry-container");

  scoreEl.innerHTML = `
      <img src="${characterImage}" alt="${entry.playerName}" class="entry-img" >

      <div>
        <p class="board-entry-name" > ${entry.playerName}</p>
        <p class="board-entry-character" > ${entry.character}</p>
      </div>

      <p class="pixel-font">
        ${entry.playerScore}
      </p>
  `;

  leadershipContainer.appendChild(scoreEl);
}

leadershipJoinBtn.addEventListener("click", () => {
  leadershipLoaderEl.style.display = "none";
  leadershipContainer.style.display = "none";
  leadershipJoinBtn.style.display = "none";
  joinLeadershipForm.style.display = "flex";
});

joinLeadershipForm.addEventListener("submit", (e) => {
  e.preventDefault();
  submitScore(e.target);
});

async function submitScore(formEl) {
  const character = localStorage.getItem("characterName") || "Cat";
  const playerScore = scoreTimer;
  const playerName = formEl.children[0].value;
  formEl.children[1].innerHTML = "Submitting...";

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({ character, playerName, playerScore });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  try {
    const res = await fetch(
      leadershipBoardUrl + "/joinLeadershipBoard",
      requestOptions
    );
    const data = await res.json();
    fetchLeadershipBoard();
  } catch (error) {
    formEl.children[1].innerHTML = "Submit";
    console.log(error);
  }
}

function randomBarrierHeights() {
  let heights = [];
  const randomNum = getRandomNumber(5) + 4;

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

function getRandomNumber(maxNumber = 1) {
  const randomNum = Math.floor(Math.random() * maxNumber);
  return randomNum;
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
