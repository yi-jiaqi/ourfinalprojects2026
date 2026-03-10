let player;

let enemies = [];

let bullets = [];


let playerSize = 30;

let enemySize = 30;

let bulletSize = 8;


let speed = 9;

let lives = 3;


let gameOver = false;

let startTime = 0;

let survivedTime = 0;


let bossActive = false;

let shootCooldown = 0;


// Boss cycle timers

let bossStartTime = 0;

let bossCooldownStart = 0;


function setup() {

  createCanvas(800, 500);

  resetGame();

}


function draw() {

  background(15);


  if (!gameOver) {

    updatePlayer();

    updateEnemies();

    updateBullets();

    checkCollisions();


    survivedTime = floor((millis() - startTime) / 1000);

    activateBossMode();


    if (shootCooldown > 0) shootCooldown--;

  }


  drawPlayer();

  drawEnemies();

  drawBullets();

  drawUI();

}


function resetGame() {

  player = createVector(width / 2, height / 2);

  enemies = [];

  bullets = [];

  lives = 3;

  gameOver = false;

  bossActive = false;

  startTime = millis();

  survivedTime = 0;

  shootCooldown = 0;


  bossStartTime = 0;

  bossCooldownStart = 0;


  for (let i = 0; i < 2; i++) spawnEnemy(3);

}


function spawnEnemy(baseSpeed) {

  enemies.push({

    pos: createVector(random(width), random(height)),

    speed: baseSpeed,

    alive: true,

    respawnTimer: 0

  });

}


function updatePlayer() {

  if (keyIsDown(LEFT_ARROW)) player.x -= speed;

  if (keyIsDown(RIGHT_ARROW)) player.x += speed;

  if (keyIsDown(UP_ARROW)) player.y -= speed;

  if (keyIsDown(DOWN_ARROW)) player.y += speed;


  player.x = constrain(player.x, 0, width - playerSize);

  player.y = constrain(player.y, 0, height - playerSize);

}


function updateEnemies() {


  for (let enemy of enemies) {


    if (!enemy.alive) {

      enemy.respawnTimer--;

      if (enemy.respawnTimer <= 0) {

        enemy.pos = createVector(random(width), random(height));

        enemy.alive = true;

      }

      continue;

    }


    let direction = p5.Vector.sub(player, enemy.pos);

    direction.normalize();

    direction.mult(enemy.speed);

    enemy.pos.add(direction);

  }


  // Enemy-to-enemy collision (bounce apart)

  for (let i = 0; i < enemies.length; i++) {

    for (let j = i + 1; j < enemies.length; j++) {


      let e1 = enemies[i];

      let e2 = enemies[j];


      if (!e1.alive || !e2.alive) continue;


      let d = dist(e1.pos.x, e1.pos.y, e2.pos.x, e2.pos.y);

      let minDist = enemySize;


      if (d < minDist) {


        let push = p5.Vector.sub(e1.pos, e2.pos);

        push.normalize();

        push.mult((minDist - d) / 2);


        e1.pos.add(push);

        e2.pos.sub(push);

      }

    }

  }

}


function updateBullets() {

  for (let bullet of bullets) {

    bullet.pos.add(bullet.vel);

  }


  bullets = bullets.filter(b =>

    b.pos.x > 0 && b.pos.x < width &&

    b.pos.y > 0 && b.pos.y < height

  );

}


function keyPressed() {

  if (key === ' ') {

    if (shootCooldown === 0 && !gameOver) {


      let angle = random(TWO_PI);

      let dir = p5.Vector.fromAngle(angle);

      dir.mult(12);


      bullets.push({

        pos: createVector(player.x + playerSize / 2, player.y + playerSize / 2),

        vel: dir

      });


      shootCooldown = 15;

    }

  }


  if (key === 'r' || key === 'R') resetGame();

}


function activateBossMode() {


  if (!bossActive && survivedTime >= 30 && bossStartTime === 0) {

    bossActive = true;

    bossStartTime = survivedTime;


    for (let i = 0; i < 2; i++) spawnEnemy(5);

  }


  if (bossActive) {

    if (survivedTime - bossStartTime >= 20) {

      bossActive = false;

      bossCooldownStart = survivedTime;

    }

  } else {

    if (bossCooldownStart > 0 && survivedTime - bossCooldownStart >= 30) {

      bossActive = true;

      bossStartTime = survivedTime;


      for (let i = 0; i < 2; i++) spawnEnemy(5);

    }

  }

}


function checkCollisions() {

  for (let enemy of enemies) {

    if (!enemy.alive) continue;


    if (

      player.x < enemy.pos.x + enemySize &&

      player.x + playerSize > enemy.pos.x &&

      player.y < enemy.pos.y + enemySize &&

      player.y + playerSize > enemy.pos.y

    ) {

      lives--;

      player = createVector(width / 2, height / 2);

      if (lives <= 0) gameOver = true;

    }


    for (let bullet of bullets) {

      if (

        bullet.pos.x > enemy.pos.x &&

        bullet.pos.x < enemy.pos.x + enemySize &&

        bullet.pos.y > enemy.pos.y &&

        bullet.pos.y < enemy.pos.y + enemySize

      ) {

        enemy.alive = false;

        enemy.respawnTimer = 600;

      }

    }

  }

}


function drawPlayer() {

  fill("orange");

  rect(player.x, player.y, playerSize, playerSize);

}


function drawEnemies() {

  for (let enemy of enemies) {

    if (!enemy.alive) continue;

    fill(bossActive && enemy.speed >= 5 ? "purple" : "blue");

    rect(enemy.pos.x, enemy.pos.y, enemySize, enemySize);

  }

}


function drawBullets() {

  fill("yellow");

  for (let bullet of bullets) ellipse(bullet.pos.x, bullet.pos.y, bulletSize);

}


function drawUI() {

  fill(255);

  textSize(18);

  textAlign(LEFT);

  text("Lives: " + lives, 20, 30);


  textAlign(CENTER);

  textSize(22);

  text("Time Alive: " + survivedTime + "s", width / 2, 30);


  if (bossActive) {

    fill("red");

    text("BOSS MODE", width / 2, 60);

  }


  if (gameOver) {

    textAlign(CENTER, CENTER);

    textSize(50);

    text("GAME OVER", width / 2, height / 2 - 30);

    textSize(22);

    text("Press R to Restart", width / 2, height / 2 + 30);

  }

}

