// =======================================

// WATER BALLOON INFINITE CLIMBER

// FULL VERSION WITH:

// - Scoring

// - Spikes

// - Double Jump

// - Pop + Water Burst

// - Secret Fly Cheat (BojoHead)

// - Auto Score in Fly Mode

// - Spiky Balls (roll down platforms after 100 points)

// =======================================


let lastPlatformY = null;

let lastPlatformId = null;

let lastSpikeY = -Infinity;


let ball;

let gravity = 0.8;

let moveAccel = 0.6;

let maxSpeed = 6;

let friction = 0.9;

let jumpStrength = -16;

let bounceDamp = -0.25;


let onGround = false;


let youCanDoubleJump = false;

let lastDoubleJumpScore = 0;


let scaleX = 1;

let scaleY = 1;

let targetScaleX = 1;

let targetScaleY = 1;


let platforms = [];

let highestPlatformY = 0;

let camY = 0;

let score = 0;


let gameStarted = false;


// Pop system

let isPopping = false;

let popTimer = 0;

let popDuration = 30;


// Water particles

let waterParticles = [];


// Cheat system

let enteringCode = false;

let codeInput = "";

let flyMode = false;

let flyScoreTimer = 0; // auto score in fly mode


// Spiky balls

let spikyBalls = [];

let spikySpawnTimer = 0;

let spikySpawnInterval = 2000; // max 1 ball every 2 sec


// ======================

// SETUP

// ======================


function setup() {

  createCanvas(600, 500);

  resetGame();

}


function draw() {

  background(200, 230, 255);


  if (!gameStarted) {

    textAlign(CENTER, CENTER);

    textSize(36);

    fill(30);

    text("Click to Start", width / 2, height / 2);

    return;

  }


  updateBall();

  updateCamera();

  generatePlatforms();

  cleanPlatforms();

  updateSpikyBalls();


  push();

  translate(0, -camY);


  drawPlatforms();

  drawBalloon();

  drawSpikyBalls();

  updateWaterParticles();


  pop();


  drawUI();

}


// ======================

// BALL LOGIC

// ======================


function updateBall() {

  // POP FREEZE

  if (isPopping) {

    popTimer++;

    if (popTimer >= popDuration) {

      gameStarted = false;

      resetGame();

    }

    return;

  }


  // FLY MODE

  if (flyMode) {

    // console.log("flyMode")

    let dx = mouseX - ball.x;

    let dy = mouseY + camY - ball.y;

    let angle = atan2(dy, dx);


    ball.vx = lerp(ball.vx, cos(angle) * 8, 0.2);

    ball.vy = lerp(ball.vy, sin(angle) * 8, 0.2);


    ball.x += ball.vx;

    ball.y += ball.vy;


    // SPIKE COLLISION IN FLY MODE

    for (let p of platforms) {

      if (p.hasSpike && p.spikeX !== null) {

        let spikeTop = p.y - 10;

        if (

          ball.x + ball.r > p.spikeX &&

          ball.x - ball.r < p.spikeX + 10 &&

          ball.y + ball.r > spikeTop &&

          ball.y - ball.r < p.y

        ) {

          isPopping = true;

          popTimer = 0;

          ball.vx = 0;

          ball.vy = 0;

          flyMode = false;

          createWaterBurst();

        }

      }

    }



    // Auto-score in fly mode

    flyScoreTimer += deltaTime / 1000;

    if (flyScoreTimer >= 1) {

      score += 10; // 1 point per second

      flyScoreTimer = 0;

    }


    return; // skip normal physics

  }


      // SPIKY BALL COLLISION IN FLY MODE

    if (score >= 100 && spikyBalls.length < 2) {

      // console.log("score >= 11")

      spikySpawnTimer += deltaTime;


      if (spikySpawnTimer > spikySpawnInterval) {

        // pick random platform anywhere above camera top

        // console.log("spikySpawnTimer > spikySpawnInterval")

        let candidatePlatforms = platforms.filter(

          (p) => p.y < camY + height && p.y > camY - 50

        );

        if (candidatePlatforms.length > 0) {

         spikyBalls.push({

  x: random(40, width - 40),

  y: camY - 40,

  r: 12,

  vx: random([-2, 2]),

  vy: random(2,5)

});

        }

      }

    }

  

  let prevY = ball.y;


  // Horizontal

  if (keyIsDown(LEFT_ARROW)) ball.vx -= moveAccel;

  if (keyIsDown(RIGHT_ARROW)) ball.vx += moveAccel;


  ball.vx *= friction;

  ball.vx = constrain(ball.vx, -maxSpeed, maxSpeed);

  ball.x += ball.vx;

  ball.x = constrain(ball.x, ball.r, width - ball.r);


  // Gravity

  ball.vy += gravity;

  ball.y += ball.vy;


  onGround = false;


  // PLATFORM COLLISION

  for (let p of platforms) {

    if (

      ball.vy >= 0 &&

      prevY + ball.r <= p.y &&

      ball.y + ball.r >= p.y &&

      ball.x + ball.r > p.x &&

      ball.x - ball.r < p.x + p.w

    ) {

      ball.y = p.y - ball.r;

      ball.vy *= bounceDamp;


      targetScaleY = 0.6;

      targetScaleX = 1.4;

      onGround = true;


      if (lastPlatformId !== null && p.id !== lastPlatformId) {

        if (p.y < lastPlatformY) {

          score += 5;

        } else {

          score -= 5;

          if (score < 0) score = 0;

        }


        while (score >= lastDoubleJumpScore + 10) {

          youCanDoubleJump = true;

          lastDoubleJumpScore += 10;

        }

      }


      lastPlatformY = p.y;

      lastPlatformId = p.id;

      break;

    }

  }


  // SPIKE COLLISION

  for (let p of platforms) {

    if (p.hasSpike && p.spikeX !== null) {

      let spikeTop = p.y - 10;


      if (

        ball.x + ball.r > p.spikeX &&

        ball.x - ball.r < p.spikeX + 10 &&

        ball.y + ball.r > spikeTop &&

        ball.y - ball.r < p.y

      ) {

        isPopping = true;

        popTimer = 0;

        ball.vx = 0;

        ball.vy = 0;

        createWaterBurst();

      }

    }

  }


  // SPIKY BALL COLLISION

  for (let s of spikyBalls) {

    let d = dist(ball.x, ball.y, s.x, s.y);

    if (d < ball.r + s.r) {

      isPopping = true;

      popTimer = 0;

      ball.vx = 0;

      ball.vy = 0;

      createWaterBurst();

    }

  }


  if (!onGround) {

    targetScaleX = 1;

    targetScaleY = 1;

  }


  scaleX = lerp(scaleX, targetScaleX, 0.2);

  scaleY = lerp(scaleY, targetScaleY, 0.2);


  // FALL DEATH

  if (ball.y - camY > height + 120) {

    gameStarted = false;

    resetGame();

  }


  // SPAWN SPIKY BALLS AFTER 100 POINTS

}


function updateCamera() {

  let threshold = height * 0.35;

  if (ball.y - camY < threshold) {

    camY = ball.y - threshold;

  }

}


// ======================

// UI

// ======================


function drawUI() {

  fill(0);

  textSize(20);

  textAlign(LEFT, TOP);

  text("Score: " + score, 15, 15);


  if (youCanDoubleJump) {

    fill(0, 150, 255);

    text("Double Jump Ready!", 15, 40);

  }


  // Code box

  fill(30);

  rect(width - 90, 10, 80, 30, 6);


  fill(255);

  textAlign(CENTER, CENTER);

  textSize(14);

  text("code", width - 50, 25);


  if (enteringCode) {

    fill(0);

    rect(width - 180, 50, 170, 30, 6);


    fill(255);

    textAlign(LEFT, CENTER);

    text(codeInput, width - 170, 65);

  }


  if (flyMode) {

    fill(0, 255, 100);

    textAlign(RIGHT, TOP);

    text("FLY MODE", width - 10, 50);

  }

}


// ======================

// PLATFORMS

// ======================


function generateInitialPlatforms() {

  let y = height - 40;

  let w = 120;

  let x = width / 2 - w / 2;


  platforms.push({ x, y, w, h: 12, id: 0, hasSpike: false, spikeX: null });


  y -= 80;


  for (let i = 0; i < 6; i++) {

    createPlatformLayer(y);

    y -= random(75, 90);

  }


  highestPlatformY = y;

}


function generatePlatforms() {

  while (highestPlatformY > camY - 200) {

    createPlatformLayer(highestPlatformY);

    highestPlatformY -= random(75, 90);

  }

}


function createPlatformLayer(y) {

  let count = random() < 0.25 ? 2 : 1;


  function makePlatform(x, w) {

    let platform = {

      x,

      y,

      w,

      h: 12,

      id: platforms.length,

      hasSpike: false,

      spikeX: null,

    };


    if (

      score >= 50 &&

      random() < 0.3 &&

      (lastSpikeY - y >= 70 || lastSpikeY === -Infinity)

    ) {

      platform.hasSpike = true;

      // platform.spikeX = random(platform.x + 10, platform.x + platform.w - 20);
      platform.spikeX = platform.x + platform.w / 2 - 5; // Center the spike

      lastSpikeY = y;

    }


    platforms.push(platform);

  }


  if (count === 1) {

    let w = random(90, 130);

    let x = random(40, width - w - 40);

    makePlatform(x, w);

  } else {

    let w1 = random(90, 120);

    let w2 = random(90, 120);

    makePlatform(random(40, width / 2 - w1 - 20), w1);

    makePlatform(random(width / 2 + 20, width - w2 - 40), w2);

  }

}


function cleanPlatforms() {

  platforms = platforms.filter((p) => p.y < camY + height + 100);

}


function drawPlatforms() {

  noStroke();

  for (let p of platforms) {

    fill(140, 90, 50);

    rect(p.x, p.y, p.w, p.h, 4);


    if (p.hasSpike) {

      fill(255, 0, 0);

      triangle(p.spikeX, p.y, p.spikeX + 10, p.y, p.spikeX + 5, p.y - 10);

    }

  }

}


// ======================

// BALLOON

// ======================


function drawBalloon() {

  push();

  translate(ball.x, ball.y);

  noStroke();


  let popScale = 1;

  let alpha = 255;


  if (isPopping) {

    let t = popTimer / popDuration;

    if (t < 0.5) popScale = 1 + t * 2;

    else {

      popScale = 2 - t * 2;

      alpha = 255 * (1 - t);

    }

  }


  push();

  scale(scaleX * popScale, scaleY * popScale);


  fill(0, 100, 255, alpha);

  ellipse(0, 0, ball.r * 2, ball.r * 2.6);


  fill(255, 255, 255, 90 * (alpha / 255));

  ellipse(-ball.r * 0.4, -ball.r * 0.4, ball.r * 0.6);


  fill(0, 70, 220, alpha);

  let balloonTop = -ball.r * 1.3;

  let tieHeight = ball.r * 0.5;

  let tieWidth = ball.r * 0.4;


  triangle(

    -tieWidth / 2,

    balloonTop - tieHeight,

    tieWidth / 2,

    balloonTop - tieHeight,

    0,

    balloonTop

  );


  pop();

  pop();

}


// ======================

// WATER PARTICLES

// ======================


function createWaterBurst() {

  for (let i = 0; i < 25; i++) {

    waterParticles.push({

      x: ball.x,

      y: ball.y,

      vx: random(-4, 4),

      vy: random(-6, -1),

      size: random(4, 8),

      alpha: 255,

    });

  }

}


function updateWaterParticles() {

  for (let i = waterParticles.length - 1; i >= 0; i--) {

    let w = waterParticles[i];

    w.vy += 0.3;

    w.x += w.vx;

    w.y += w.vy;

    w.alpha -= 8;


    fill(0, 150, 255, w.alpha);

    ellipse(w.x, w.y, w.size);


    if (w.alpha <= 0) waterParticles.splice(i, 1);

  }

}


// ======================

// SPIKY BALLS

// ======================


function updateSpikyBalls() {

  for (let i = spikyBalls.length - 1; i >= 0; i--) {

    let s = spikyBalls[i];


    // Apply gravity

    s.vy += gravity;

    s.y += s.vy;


    // Horizontal movement only if on platform

    let onPlatform = false;


    for (let p of platforms) {

      if (

        s.vy >= 0 &&

        s.y + s.r >= p.y &&

        s.y + s.r <= p.y + p.h &&

        s.x + s.r > p.x &&

        s.x - s.r < p.x + p.w

      ) {

        // Landed on platform

        s.y = p.y - s.r;

        s.vy = 0;

        onPlatform = true;


        // Roll

        s.x += s.vx;

        break;

      }

    }


    // Free fall if not on platform

    if (!onPlatform) {

      s.x += s.vx; // continue horizontal while falling

    }


    // Remove if below screen

    if (s.y - camY > height + 50) {

      spikyBalls.splice(i, 1);

    }

  }

}

function drawSpikyBalls() {

  for (let s of spikyBalls) {

    push();

    translate(s.x, s.y);

    noStroke();


    // Draw main ball

    fill(150, 0, 0);

    ellipse(0, 0, s.r * 2);


    // Draw spikes around the ball

    fill(200, 0, 0);

    let spikes = 8;

    for (let i = 0; i < spikes; i++) {

      let angle = (TWO_PI / spikes) * i;

      let sx = cos(angle) * s.r;

      let sy = sin(angle) * s.r;

      triangle(

        sx,

        sy,

        sx + cos(angle) * 6,

        sy + sin(angle) * 6,

        sx + cos(angle + 0.2) * 6,

        sy + sin(angle + 0.2) * 6

      );

    }


    // Angry face

    fill(0);

    ellipse(-s.r * 0.3, -s.r * 0.3, s.r * 0.3); // left eye

    ellipse(s.r * 0.3, -s.r * 0.3, s.r * 0.3); // right eye


    noFill();

    stroke(0);

    strokeWeight(2);

    arc(0, s.r * 0.1, s.r, s.r * 0.5, PI, TWO_PI); // angry mouth


    pop();

  }

}

// ======================

// INPUT

// ======================


function keyPressed() {

  if (keyCode === UP_ARROW && onGround) {

    ball.vy = jumpStrength;

    onGround = false;

    targetScaleY = 1.4;

    targetScaleX = 0.6;

  } else if (keyCode === UP_ARROW && youCanDoubleJump) {

    ball.vy = jumpStrength;

    onGround = false;

    targetScaleY = 1.4;

    targetScaleX = 0.6;

    youCanDoubleJump = false;

  }

}


function keyTyped() {

  if (enteringCode) {

    if (key === "Enter") {

      if (codeInput === "Bojo-Head") flyMode = true;

      enteringCode = false;

      return;

    }

    if (key === "Backspace") {

      codeInput = codeInput.slice(0, -1);

      return;

    }

    if (codeInput.length < 20) codeInput += key;

  }

}


function mousePressed() {

  if (

    mouseX > width - 90 &&

    mouseX < width - 10 &&

    mouseY > 10 &&

    mouseY < 40

  ) {

    enteringCode = true;

    codeInput = "";

    return;

  }


  if (!gameStarted) gameStarted = true;

}


// ======================

// RESET

// ======================


function resetGame() {

  camY = 0;

  platforms = [];

  score = 0;


  lastPlatformY = null;

  lastPlatformId = null;

  lastSpikeY = -Infinity;


  youCanDoubleJump = false;

  lastDoubleJumpScore = 0;


  isPopping = false;

  popTimer = 0;

  waterParticles = [];


  flyMode = false;

  flyScoreTimer = 0;

  enteringCode = false;

  codeInput = "";


  spikyBalls = [];

  spikySpawnTimer = 0;


  generateInitialPlatforms();


  let spawnPlatform = platforms[0];


  ball = {

    x: spawnPlatform.x + spawnPlatform.w / 2,

    y: spawnPlatform.y - 22,

    r: 22,

    vx: 0,

    vy: 0,

  };

}