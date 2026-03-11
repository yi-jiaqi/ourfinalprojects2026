let player;

let gravity = 0.6;



let camX = 0;

let finished = false;

let confetti = [];



let currentLevel = 0;

let levels = [];



let platforms = [];

let coins = [];

let enemies = [];

let lavaZones = [];

let bouncePads = [];



let worldWidth = 3000;

let score = 0;



//////////////////////////////////////////////////

// SETUP

//////////////////////////////////////////////////



function setup() {

  createCanvas(800, 400);



  player = {

    x: 100,

    y: 200,

    w: 40,

    h: 60,

    vx: 0,

    vy: 0,

    speed: 5,

    jumpForce: -12,

    onGround: false,

    jumps: 0,

    maxJumps: 2,

    dashPower: 15

  };



  createLevels();

  loadLevel(currentLevel);

}



//////////////////////////////////////////////////

// DRAW LOOP

//////////////////////////////////////////////////



function draw() {



  // Different background per level

  if (currentLevel === 0) background(135, 200, 255);

  if (currentLevel === 1) background(255, 200, 150);

  if (currentLevel === 2) background(200, 150, 255);

  if (currentLevel === 3) background(80, 0, 120);



  if (!finished) {

    handleMovement();

    applyPhysics();

    checkCollisions();

    checkCoins();

    checkEnemies();

    checkLava();

    checkBouncePads();

  }



  camX = constrain(player.x - width / 2, 0, worldWidth - width);



  push();

  translate(-camX, 0);



  drawWorld();

  drawCoins();

  drawEnemies();



  drawPlayer();



  pop();



  drawUI();



  if (finished) {

    updateConfetti();

    drawWinScreen();

  }



  checkFinish();

}



//////////////////////////////////////////////////

// LEVELS

//////////////////////////////////////////////////



function createLevels() {



  levels = [



    //////////////////////////////////////////////////////

    // 🌱 LEVEL 1 — Long Beginner

    //////////////////////////////////////////////////////

    {

      worldWidth: 3000,

      platforms: [

        { x: 0, y: 350, w: 3000, h: 50 },



        { x: 400, y: 300, w: 120, h: 20 },

        { x: 650, y: 260, w: 120, h: 20 },

        { x: 900, y: 220, w: 120, h: 20 },

        { x: 1150, y: 260, w: 120, h: 20 },

        { x: 1400, y: 220, w: 120, h: 20 },

        { x: 1700, y: 260, w: 120, h: 20 },

        { x: 2000, y: 220, w: 120, h: 20 },

        { x: 2300, y: 260, w: 120, h: 20 },

        { x: 2600, y: 220, w: 150, h: 20 }

      ],

      coins: [

        { x: 920, y: 180 },

        { x: 2020, y: 180 }

      ],

      enemies: [],

      lava: [],

      bounce: []

    },



    //////////////////////////////////////////////////////

    // 🚀 LEVEL 2 — Moving + Lava + Bounce

    //////////////////////////////////////////////////////

    {

      worldWidth: 3500,

      platforms: [

        { x: 0, y: 350, w: 3500, h: 50 },



        { x: 500, y: 300, w: 120, h: 20, startX: 500, range: 120 },

        { x: 900, y: 240, w: 120, h: 20 },

        { x: 1300, y: 200, w: 120, h: 20 },

        { x: 1800, y: 250, w: 120, h: 20 },

        { x: 2200, y: 200, w: 120, h: 20 },

        { x: 2600, y: 240, w: 120, h: 20 },

        { x: 3000, y: 180, w: 150, h: 20 }

      ],

      coins: [{ x: 1320, y: 160 }],

      enemies: [],

      lava: [

        { x: 1100, y: 340, w: 120, h: 10 },

        { x: 2400, y: 340, w: 140, h: 10 }

      ],

      bounce: [

        { x: 1600, y: 330, w: 60, h: 20 }

      ]

    },



    //////////////////////////////////////////////////////

    // 🔥 LEVEL 3 — Harder + Enemies

    //////////////////////////////////////////////////////

    {

      worldWidth: 4000,

      platforms: [

        { x: 0, y: 350, w: 4000, h: 50 },



        { x: 600, y: 300, w: 100, h: 20 },

        { x: 850, y: 250, w: 100, h: 20 },

        { x: 1100, y: 200, w: 100, h: 20 },

        { x: 1400, y: 170, w: 100, h: 20 },



        { x: 2000, y: 260, w: 100, h: 20 },

        { x: 2400, y: 220, w: 100, h: 20 },

        { x: 2800, y: 180, w: 100, h: 20 },

        { x: 3200, y: 220, w: 120, h: 20 }

      ],

      coins: [{ x: 2820, y: 140 }],

      enemies: [

        { x: 1700, y: 310, w: 40, h: 40, dir: 1 },

        { x: 3000, y: 310, w: 40, h: 40, dir: 1 }

      ],

      lava: [

        { x: 1750, y: 340, w: 120, h: 10 }

      ],

      bounce: []

    },



    //////////////////////////////////////////////////////

    // 👑 LEVEL 4 — Boss Arena Style

    //////////////////////////////////////////////////////

    {

      worldWidth: 4500,

      platforms: [

        { x: 0, y: 350, w: 4500, h: 50 },



        // Tower climb

        { x: 600, y: 300, w: 100, h: 20 },

        { x: 750, y: 260, w: 100, h: 20 },

        { x: 900, y: 220, w: 100, h: 20 },

        { x: 1050, y: 180, w: 100, h: 20 },



        { x: 1500, y: 260, w: 100, h: 20 },

        { x: 1800, y: 200, w: 100, h: 20 },

        { x: 2100, y: 150, w: 100, h: 20 },

        { x: 2600, y: 220, w: 120, h: 20 },

        { x: 3200, y: 180, w: 120, h: 20 },

        { x: 3800, y: 150, w: 150, h: 20 }

      ],

      coins: [],

      enemies: [

        { x: 2300, y: 310, w: 40, h: 40, dir: 1 },

        { x: 3500, y: 310, w: 40, h: 40, dir: 1 }

      ],

      lava: [

        { x: 1200, y: 340, w: 200, h: 10 },

        { x: 2900, y: 340, w: 200, h: 10 }

      ],

      bounce: [

        { x: 1400, y: 330, w: 60, h: 20 }

      ]

    }



  ];

}



function loadLevel(i) {

  let level = levels[i];



  platforms = level.platforms;

  coins = level.coins.map(c => ({ ...c, collected: false }));

  enemies = level.enemies;

  lavaZones = level.lava;

  bouncePads = level.bounce;



  worldWidth = level.worldWidth;



  player.x = 100;

  player.y = 200;

  player.vx = 0;

  player.vy = 0;

  score = 0;

  finished = false;

  confetti = [];

}



//////////////////////////////////////////////////

// PHYSICS + MOVEMENT

//////////////////////////////////////////////////



function handleMovement() {

  player.vx = 0;

  if (keyIsDown(65)) player.vx = -player.speed;

  if (keyIsDown(68)) player.vx = player.speed;

}



function applyPhysics() {

  player.vy += gravity;

  player.x += player.vx;

  player.y += player.vy;

  player.onGround = false;



  if (player.y > height + 200) resetPlayer();

}



function keyPressed() {

  if (key === 'w' || key === 'W') {

    if (player.jumps < player.maxJumps) {

      player.vy = player.jumpForce;

      player.jumps++;

    }

  }



  if (key === ' ') {

    if (player.vx > 0) player.vx = player.dashPower;

    else if (player.vx < 0) player.vx = -player.dashPower;

  }

}



function checkCollisions() {

  for (let p of platforms) {



    if (p.range) {

      p.x = p.startX + sin(frameCount * 0.05) * p.range;

    }



    if (

      player.x < p.x + p.w &&

      player.x + player.w > p.x &&

      player.y < p.y + p.h &&

      player.y + player.h > p.y

    ) {

      if (player.vy > 0) {

        player.y = p.y - player.h;

        player.vy = 0;

        player.onGround = true;

        player.jumps = 0;

      }

    }

  }

}



//////////////////////////////////////////////////

// GAME LOGIC

//////////////////////////////////////////////////



function checkCoins() {

  for (let c of coins) {

    if (!c.collected &&

        player.x < c.x + 20 &&

        player.x + player.w > c.x &&

        player.y < c.y + 20 &&

        player.y + player.h > c.y) {

      c.collected = true;

      score++;

    }

  }

}



function checkEnemies() {

  for (let e of enemies) {

    e.x += e.dir * 2;

    if (e.x < 1500 || e.x > 3800) e.dir *= -1;



    if (

      player.x < e.x + e.w &&

      player.x + player.w > e.x &&

      player.y < e.y + e.h &&

      player.y + player.h > e.y

    ) resetPlayer();

  }

}



function checkLava() {

  for (let l of lavaZones) {

    if (

      player.x < l.x + l.w &&

      player.x + player.w > l.x &&

      player.y < l.y + l.h &&

      player.y + player.h > l.y

    ) resetPlayer();

  }

}



function checkBouncePads() {

  for (let b of bouncePads) {

    if (

      player.x < b.x + b.w &&

      player.x + player.w > b.x &&

      player.y + player.h > b.y &&

      player.y + player.h < b.y + b.h + 10

    ) {

      player.vy = -20;

    }

  }

}



function resetPlayer() {

  player.x = 100;

  player.y = 200;

  player.vx = 0;

  player.vy = 0;

  score = 0;

}



//////////////////////////////////////////////////

// DRAWING

//////////////////////////////////////////////////



function drawWorld() {

  fill(100);

  for (let p of platforms) rect(p.x, p.y, p.w, p.h);



  fill(255, 0, 0);

  for (let l of lavaZones) rect(l.x, l.y, l.w, l.h);



  fill(0, 255, 0);

  for (let b of bouncePads) rect(b.x, b.y, b.w, b.h);



  fill(255, 215, 0);

  rect(worldWidth - 100, 250, 20, 100);

}



function drawCoins() {

  fill(255, 223, 0);

  for (let c of coins)

    if (!c.collected) ellipse(c.x + 10, c.y + 10, 20);

}



function drawEnemies() {

  fill(200, 0, 200);

  for (let e of enemies) rect(e.x, e.y, e.w, e.h);

}



function drawPlayer() {

  let walking = abs(player.vx) > 0 && player.onGround;

  let armSwing = walking ? sin(frameCount * 0.3) * 10 : 0;



  fill(0, 200, 0);

  rect(player.x, player.y + 40, player.w, 20);



  fill(0, 100, 255);

  rect(player.x, player.y + 15, player.w, 25);



  rect(player.x - 10, player.y + 20 + armSwing, 10, 30);

  rect(player.x + player.w, player.y + 20 - armSwing, 10, 30);



  fill(255, 230, 0);

  rect(player.x + 5, player.y, player.w - 10, 20);

}



function drawUI() {

  fill(255);

  textSize(18);

  text("Level: " + (currentLevel + 1), 20, 25);

  text("Score: " + score, 20, 45);

}



//////////////////////////////////////////////////

// LEVEL COMPLETE

//////////////////////////////////////////////////



function checkFinish() {

  if (player.x > worldWidth - 120 && !finished) {



    finished = true;



    for (let i = 0; i < 150; i++) {

      confetti.push({

        x: random(width),

        y: random(-200, 0),

        size: random(4, 8),

        color: color(random(255), random(255), random(255)),

        speed: random(2, 6)

      });

    }



    setTimeout(() => {

      currentLevel++;

      if (currentLevel >= levels.length) currentLevel = 0;

      loadLevel(currentLevel);

    }, 1500);

  }

}



function updateConfetti() {

  for (let c of confetti) {

    fill(c.color);

    rect(c.x, c.y, c.size, c.size);

    c.y += c.speed;

  }

}



function drawWinScreen() {

  fill(0, 0, 0, 150);

  rect(0, 0, width, height);



  textAlign(CENTER, CENTER);

  textSize(40);

  fill(255);

  text("LEVEL COMPLETE!", width / 2, height / 2);

}