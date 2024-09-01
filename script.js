// module aliases
const Engine = Matter.Engine;
const Render = Matter.Render;
const Runner = Matter.Runner;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;

// create an engine
var engine = Engine.create({
  gravity: {
    x: 0,
    y: 0.5,
  },
});

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const halfScreenWidth = screenWidth / 2;
const halfScreenHeight = screenHeight / 2;

let canvasOptions = {
  height: screenHeight,
  width: screenWidth,
};

// create a renderer
var render = Render.create({
  element: document.body,
  engine: engine,
  options: canvasOptions,
});

const topWall = Bodies.rectangle(screenWidth / 2, -10, screenWidth, 20, {
  isStatic: true,
});

const bottomWall = Bodies.rectangle(
  screenWidth / 2,
  screenHeight + 10,
  screenWidth,
  20,
  {
    isStatic: true,
  }
);

const leftWall = Bodies.rectangle(-10, screenHeight / 2, 20, screenHeight, {
  isStatic: true,
});

// add all of the bodies to the world
Composite.add(engine.world, [topWall, bottomWall, leftWall]);

const createCharacterBox = (e) =>
  Bodies.rectangle(screenWidth / 4, screenHeight / 2 - 25, 50, 50);

const characterBox = createCharacterBox();

Composite.add(engine.world, characterBox);

function characterJump() {
  Matter.Body.setVelocity(characterBox, {
    x: 0,
    y: -5,
  });

}

window.addEventListener("keydown", (e) => {
  e.preventDefault();
  if (e.key == " " || e.code == "Space") {
    characterJump();
  }
});

window.addEventListener("touchstart", (e) => {
  characterJump();
});

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);
