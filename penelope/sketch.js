let balls = [];

let canvas;

let mooseFont;


// Pastel colors for smileys

let pastelColors = [

  "#FFB3BA",

  "#FFDFBA",

  "#FFFFBA",

  "#BAFFC9",

  "#BAE1FF",

  "#E0BAFF"

];


let rightClickSpawning = false;

let spawnInterval = 5;

let spawnCounter = 0;


let showMoose = false;


function preload() {

  // Load Architects Daughter font

  mooseFont = loadFont("https://fonts.gstatic.com/s/architectsdaughter/v17/KtkxAKiDZI_td1Lkx62xHZHDtgO_Y-bvfY5q4szgE-Q.ttf");

}


function setup() {

  canvas = createCanvas(windowWidth, windowHeight);


  // Prevent context menu on right click

  canvas.elt.oncontextmenu = () => false;


  textFont(mooseFont);

}


function draw() {

  background(8, 67, 69);


  // Top-left curved stripe

  noFill();

  stroke(255, 230, 0);

  strokeWeight(120);

  arc(-100, -100, 600, 600, 0, HALF_PI);


  // Bottom-right curved stripe

  arc(width + 100, height + 100, 600, 600, PI, PI + HALF_PI);


  strokeWeight(1);

  noStroke();


  // Moose mode

  if (showMoose) {

    fill(255); // WHITE text

    textAlign(CENTER, CENTER);

    textSize(150);

    text("Moose", width / 2, height / 2);

    return;

  }


  // Clear all shapes if Ctrl is pressed

  if (keyIsDown(CONTROL)) {

    balls = [];

  }


  // Shift teleport

  if (keyIsDown(SHIFT)) {

    for (let ball of balls) {

      ball.x = mouseX;

      ball.y = mouseY;

    }


    if (random(100) < 1) {

      balls = [];

      for (let i = 0; i < 1000; i++) {

        let x = random(width);

        let y = random(height);

        balls.push(new Ball(x, y, "smiley"));

      }

    }

  }


  // Right-click spawning

  if (rightClickSpawning) {

    spawnCounter++;

    if (spawnCounter >= spawnInterval) {

      balls.push(new Ball(mouseX, mouseY));

      spawnCounter = 0;

    }

  }


  // Update balls

  for (let ball of balls) {

    ball.update();

    ball.display();

  }

}


// Mouse controls

function mousePressed() {

  if (mouseButton === LEFT) {

    balls.push(new Ball(mouseX, mouseY));

  }


  if (mouseButton === RIGHT) {

    rightClickSpawning = true;

  }

}


function mouseReleased() {

  if (mouseButton === RIGHT) {

    rightClickSpawning = false;

  }

}


// TAB activates Moose mode

function keyPressed() {

  if (keyCode === TAB) {

    balls = [];

    showMoose = true;

    return false;

  }

}


class Ball {

  constructor(x, y, forcedType = null) {

    this.x = x;

    this.y = y;

    this.r = random(10, 18);


    this.vx = random(-7, 7);

    this.vy = random(-7, 7);


    this.type = forcedType || random(["circle", "pentagon", "smiley"]);


    this.color = color(

      random(150, 255),

      random(150, 255),

      random(150, 255)

    );


    this.pastelColor = color(random(pastelColors));

  }


  update() {

    this.x += this.vx;

    this.y += this.vy;


    if (this.x < this.r || this.x > width - this.r) this.vx *= -1;

    if (this.y < this.r || this.y > height - this.r) this.vy *= -1;

  }


  display() {

    noStroke();


    if (this.type === "circle") {

      fill(this.color);

      circle(this.x, this.y, this.r * 2);

    }

    else if (this.type === "pentagon") {

      fill(this.color);

      drawPentagon(this.x, this.y, this.r);

    }

    else if (this.type === "smiley") {

      drawSmiley(this.x, this.y, this.r, this.pastelColor);

    }

  }

}


function drawPentagon(x, y, r) {

  beginShape();

  for (let i = 0; i < 5; i++) {

    let angle = TWO_PI / 5 * i - PI / 2;

    vertex(x + cos(angle) * r, y + sin(angle) * r);

  }

  endShape(CLOSE);

}


function drawSmiley(x, y, r, col) {

  push();

  translate(x, y);

  scale(r / 10);


  fill(col);

  circle(0, 0, 20);


  fill(0);

  ellipse(-4, -3, 3, 3);

  ellipse(4, -3, 3, 3);


  noFill();

  stroke(0);

  strokeWeight(1.5);

  arc(0, 2, 10, 6, 0, PI);


  pop();

}