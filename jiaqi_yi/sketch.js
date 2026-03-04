let points = 0;
let colorOfBackground;
let colorOfBackground_Failed;
let button;
let buy;
let add = 1;
let add_change = 1;
let attempts = 50;

function setup() {
  textSize(30);
  colorOfBackground = color(220, 220, 220);
  colorOfBackground_Failed = color(255, 0, 0);

  createCanvas(400, 500);
  textAlign(CENTER);
  button = createButton("click me");
  button.position(50, 100);
  buy = createButton("buy boost");
  buy.position(300, 100);

  button.mousePressed(plusOne);

  buy.mousePressed(buyBoost);
}

function draw() {
  if (attempts <= 0) {
    background(colorOfBackground_Failed);
  } else {
    background(colorOfBackground);
  }

  text("High Score: ", 200, 50);
  // text("Jayvian - 4891772 - 50 Attempts", 200, 80);
  
  
  text(points, 200, 200);
  text("points:", 200, 150);

  text("add:", 200, 250);
  text(add, 200, 300);

  text("Attempts Left:", 200, 350);
  text(attempts, 200, 400);
}

function plusOne() {
  if (attempts > 0) {
    attempts -= 1;
    points += add;
  }
}
function buyBoost() {
  if (attempts > 0) {
    attempts -= 1;

    let points_copy = points;
    let price = 1;
    let buyable = false;
    if (points_copy >= 10) {
      points_copy /= 10;
      price *= 10;
      add_change *= 2;
      buyable = true;
    }
    if (buyable) {
      points -= price;
      add = add_change;
    }
  }
}
