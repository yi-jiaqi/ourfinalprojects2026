// ===== GAME STATE =====
let gameState = "intro"; // intro or play

// ===== WORLD SETTINGS =====
let cols = 20;
let rows = 15;
let blockSize = 40;
let worldWidth = 200;

let world = [];
let offsetX = 0;

// ===== PLAYER =====
let player = {
  x: 100,
  y: 0,
  vx: 0,
  vy: 0,
  w: 28,
  h: 32
};

let onGround = false;

// ===== INVENTORY =====
let inventory = {
  mycelium: 0,
  wood: 0,
  mushroom: 0,
  glowshroom: 0,
  pickaxe: 0,
  axe: 0
};

let selectedTool = "hand";

// ===== GAME PROGRESS =====
let mushroomsCollected = 0;
let islandHealth = 0;
let goalReached = false;

// ===== MUSHROOM TYPES =====
let mushroomTypes = ["mushroom", "glowshroom"];

// ===== TREE TYPES =====
let treeTypes = ["treeTrunk", "treeLeaves"];

// ===== SETUP =====
function setup() {
  createCanvas(cols * blockSize, rows * blockSize);
  generateWorld();
  player.y = rows / 2 * blockSize;
}

// ===== SAFE BLOCK FUNCTIONS =====
function getBlock(x, y) {
  if (x < 0 || x >= worldWidth) return "air";
  if (y < 0 || y >= rows) return "air";
  return world[y][x];
}

function setBlock(x, y, type) {
  if (x < 0 || x >= worldWidth) return;
  if (y < 0 || y >= rows) return;
  world[y][x] = type;
}

// ===== WORLD GENERATION =====
function generateWorld() {
  world = [];
  let ground = floor(rows * 0.6);

  for (let y = 0; y < rows; y++) {
    let row = [];
    for (let x = 0; x < worldWidth; x++) {
      if (y > ground) row.push("mycelium");
      else row.push("air");
    }
    world.push(row);
  }

  // mushrooms
  for (let i = 0; i < 80; i++) {
    let x = floor(random(worldWidth));
    setBlock(x, ground - 1, random(mushroomTypes));
  }

  // trees
  for (let i = 0; i < 20; i++) {
    let x = floor(random(5, worldWidth - 5));
    createTree(x, ground - 1);
  }

  // villages
  for (let v = 0; v < 4; v++) {
    let vx = floor(random(10, worldWidth - 15));
    createVillage(vx, ground);
  }
}

// ===== TREES =====
function createTree(x, ground) {
  // trunk
  for (let h = 0; h < 3; h++) {
    setBlock(x, ground - h, "treeTrunk");
  }
  // leaves
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = 3; dy <= 4; dy++) {
      setBlock(x + dx, ground - dy, "treeLeaves");
    }
  }
}

// ===== VILLAGES =====
function createVillage(x, ground) {
  for (let i = 0; i < 3; i++) {
    createHouse(x + i * 6, ground);
  }
}

function createHouse(x, ground) {
  // floor
  for (let i = 0; i < 5; i++) {
    setBlock(x + i, ground, "floor");
  }
  // walls
  for (let y = 1; y <= 3; y++) {
    setBlock(x, ground - y, "wall");
    setBlock(x + 4, ground - y, "wall");
  }
  // roof
  for (let i = 0; i < 5; i++) {
    setBlock(x + i, ground - 4, "roof");
  }
  // door
  setBlock(x + 2, ground, "door");
}

// ===== DRAW LOOP =====
function draw() {
  background(80, 130, 80);

  if (gameState === "intro") {
    drawIntro();
  } else if (gameState === "play") {
    updatePlayer();
    offsetX = player.x / blockSize - cols / 2;
    offsetX = constrain(offsetX, 0, worldWidth - cols);

    drawWorld();
    drawPlayer();
    drawHUD();
    checkGoal();
  }
}

// ===== INTRO =====
function drawIntro() {
  background(70, 110, 70);
  // villager
  fill(200, 150, 100);
  rect(width / 2 - 20, height / 2 + 40, 40, 40);
  // speech bubble
  fill(255);
  rect(width / 2 - 180, height / 2 - 120, 360, 100, 10);
  fill(0);
  textAlign(CENTER);
  textSize(16);
  text(
    "Please help!\nPoisonous glowshrooms were planted\nby an evil creeper!\nDestroy them to save the island!",
    width / 2,
    height / 2 - 80
  );
  fill(255);
  textSize(20);
  text("Press SPACE to start your quest", width / 2, height / 2 + 120);
}

// ===== PLAYER MOVEMENT =====
function updatePlayer() {
  let accel = 0.4;
  let friction = 0.85;
  let gravity = 0.6;

  if (keyIsDown(LEFT_ARROW)) player.vx -= accel;
  if (keyIsDown(RIGHT_ARROW)) player.vx += accel;

  player.vx *= friction;
  player.vx = constrain(player.vx, -4, 4);

  player.vy += gravity;

  player.x += player.vx;
  player.y += player.vy;

  handleCollision();
}

// ===== COLLISION =====
function handleCollision() {
  let px = floor(player.x / blockSize);
  let py = floor((player.y + player.h) / blockSize);
  if (getBlock(px, py) !== "air") {
    player.y = py * blockSize - player.h;
    player.vy = 0;
    onGround = true;
  } else {
    onGround = false;
  }
}

// ===== KEY PRESSES =====
function keyPressed() {
  // START GAME
  if (gameState === "intro" && keyCode === 32) {
    gameState = "play";
    return;
  }

  // jump
  if (keyCode === UP_ARROW && onGround) {
    player.vy = -10;
  }

  // tool select
  if (key === "1") selectedTool = "hand";
  if (key === "2") selectedTool = "pickaxe";
  if (key === "3") selectedTool = "axe";

  // crafting
  if (key === "c") craftMenu();
}

// ===== BLOCK HARVEST =====
function mousePressed() {
  let x = floor(mouseX / blockSize) + floor(offsetX);
  let y = floor(mouseY / blockSize);

  let block = getBlock(x, y);

  if (block === "mycelium") {
    inventory.mycelium++;
    setBlock(x, y, "air");
  }

  if (block === "mushroom") {
    inventory.mushroom++;
    mushroomsCollected++;
    islandHealth += 5;
    setBlock(x, y, "air");
  }

  if (block === "glowshroom") {
    inventory.glowshroom++;
    mushroomsCollected++;
    islandHealth += 8;
    setBlock(x, y, "air");
  }

  if (block === "treeTrunk") {
    inventory.wood++;
    setBlock(x, y, "air");
  }

  if (block === "treeLeaves") {
    inventory.wood++;
    setBlock(x, y, "air");
  }
}

// ===== CRAFTING =====
function craftMenu() {
  let crafted = false;
  if (inventory.wood >= 3 && inventory.mycelium >= 2 && inventory.pickaxe === 0) {
    inventory.pickaxe = 1;
    inventory.wood -= 3;
    inventory.mycelium -= 2;
    crafted = true;
  }
  if (inventory.wood >= 3 && inventory.axe === 0) {
    inventory.axe = 1;
    inventory.wood -= 3;
    crafted = true;
  }
  if (crafted) {
    console.log("Crafting successful!");
  } else {
    console.log("Not enough resources to craft.");
  }
}

// ===== DRAW WORLD =====
function drawWorld() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < worldWidth; x++) {
      let block = getBlock(x, y);
      let screenX = (x - offsetX) * blockSize;
      if (screenX < -40 || screenX > width + 40) continue;

      if (block === "mycelium") {
        fill(160, 120, 180);
        rect(screenX, y * blockSize, blockSize, blockSize);
      }
      if (block === "mushroom") {
        fill(255, 0, 200);
        ellipse(screenX + 20, y * blockSize + 20, 30, 25);
      }
      if (block === "glowshroom") {
        fill(0, 255, 255);
        ellipse(screenX + 20, y * blockSize + 20, 30, 25);
      }
      if (block === "treeTrunk") {
        fill(120, 60, 20);
        rect(screenX, y * blockSize, blockSize, blockSize);
      }
      if (block === "treeLeaves") {
        fill(30, 200, 30);
        rect(screenX, y * blockSize, blockSize, blockSize);
      }
      if (block === "wall") {
        fill(120, 80, 60);
        rect(screenX, y * blockSize, blockSize, blockSize);
      }
      if (block === "roof") {
        fill(180, 60, 60);
        triangle(screenX, y * blockSize + 40, screenX + 40, y * blockSize + 40, screenX + 20, y * blockSize);
      }
      if (block === "floor") {
        fill(140, 100, 80);
        rect(screenX, y * blockSize, blockSize, blockSize);
      }
      if (block === "door") {
        fill(90, 50, 20);
        rect(screenX + 10, y * blockSize, 20, 40);
      }
    }
  }
}

// ===== PLAYER DRAW =====
function drawPlayer() {
  fill(255, 200, 0);
  rect(width / 2 - player.w / 2, player.y, player.w, player.h);
}

// ===== HUD =====
function drawHUD() {
  fill(255);
  textSize(14);
  text("Mushrooms: " + mushroomsCollected, 10, 20);
  text("Island Health: " + islandHealth, 10, 40);
  text("Tool: " + selectedTool, 10, 60);
  text("Inventory:", 10, 90);
  text("Mycelium " + inventory.mycelium, 10, 110);
  text("Glowshroom " + inventory.glowshroom, 10, 130);
  text("Wood " + inventory.wood, 10, 150);
  text("Pickaxe " + inventory.pickaxe, 10, 170);
  text("Axe " + inventory.axe, 10, 190);
  text("Press C to craft", 10, 210);
}

// ===== GOAL CHECK =====
function checkGoal() {
  if (mushroomsCollected >= 10 && islandHealth >= 100) {
    goalReached = true;
    fill(0, 200);
    rect(0, 0, width, height);
    fill(255);
    textSize(40);
    textAlign(CENTER);
    text("Island Restored!", width / 2, height / 2);
  }
}