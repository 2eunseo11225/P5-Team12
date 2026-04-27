let mic;
let started = false;

let raindrops = [];
let particles = [];
let plants = [];

let groundY;
const threshold = 0.02;

function setup() {
  createCanvas(windowWidth, windowHeight);
  mic = new p5.AudioIn();
  groundY = height * 0.8;
}

function mousePressed() {
  if (!started) {
    userStartAudio();
    mic.start();
    started = true;
  }
}

function draw() {
  background(0);

  let vol = started ? mic.getLevel() : 0;

  // 비 생성
  if (vol > threshold) {
    let amount = floor(map(vol, threshold, 0.2, 1, 10));
    for (let i = 0; i < amount; i++) {
      raindrops.push(new RainDrop(random(width), random(-50, 0)));
    }
  }

  // 빗방울
  for (let i = raindrops.length - 1; i >= 0; i--) {
    let r = raindrops[i];
    r.update();
    r.display();

    if (r.y > groundY) {
      createSplash(r.x, groundY);
      createPlant(r.x, groundY); // 식물 생성
      raindrops.splice(i, 1);
    }
  }

  // 비 튀김
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    p.display();

    if (p.alpha <= 0) particles.splice(i, 1);
  }

  // 식물
  for (let i = plants.length - 1; i >= 0; i--) {
    let p = plants[i];
    p.update();
    p.display();

    if (p.life > p.maxLife) {
      plants.splice(i, 1);
    }
  }

  // 땅
  stroke(80);
  line(0, groundY, width, groundY);
  
  if (!started) {
  drawStartScreen();
}
}

function drawStartScreen() {     // 시작화면
  push();

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("Click to Start", width/2, height/2);

  pop();
}


class RainDrop {               //빗방울
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = random(6, 12);
    this.length = random(10, 20);
  }

  update() {
    this.y += this.speed;
  }

  display() {
    stroke(120, 200, 255);
    strokeWeight(2);
    line(this.x, this.y, this.x, this.y + this.length);
  }
}


// ----------------------
// Splash
// ----------------------
class SplashParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-2, 2);
    this.vy = random(-5, -1);
    this.alpha = 255;
    this.size = random(2, 4);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.2;
    this.alpha -= 5;
  }

  display() {
    noStroke();
    fill(120, 200, 255, this.alpha);
    ellipse(this.x, this.y, this.size);
  }
}

function createSplash(x, y) {
  for (let i = 0; i < 8; i++) {
    particles.push(new SplashParticle(x, y));
  }
}


// 줄기+꽃
class Plant {
  constructor(x, y) {
    this.baseX = x;
    this.baseY = y;

    this.height = 0;
    this.maxHeight = random(60, 200);

    this.growthSpeed = random(0.5, 1.5);
    
    //수명
    this.life = 0;
    this.maxLife = random(300, 600); 

    // 바람 효과
    this.offset = random(1000);
    this.swing = random(0.02, 0.05);

    // 꽃 정보
    this.flowerSize = random(10, 25);
    this.petalCount = floor(random(4, 8));

    this.color = color(
      random(150, 255),
      random(100, 200),
      random(150, 255)
    );
  }

  update() {
    this.life++;
    // 성장
    if (this.height < this.maxHeight) {
      this.height += this.growthSpeed;
    }
  }

  display() {
    // 바람 흔들림
    let sway = sin(frameCount * this.swing + this.offset) * 10;

    let topX = this.baseX + sway;
    let topY = this.baseY - this.height;
    
    let alpha = map(this.life, this.maxLife * 0.7, this.maxLife, 255, 0);
    alpha = constrain(alpha, 0, 255);
    
    // 줄기
    stroke(90, 205, 90, alpha);
    strokeWeight(2);
    line(this.baseX, this.baseY, topX, topY);

    // 꽃 (성장 완료 후)
    if (this.height > this.maxHeight * 0.8) {
      this.drawFlower(topX, topY,alpha);
    }
  }

  drawFlower(x, y, alpha) {
    push();
    translate(x, y);
    
    noStroke();

    for (let i = 0; i < this.petalCount; i++) {
      rotate(TWO_PI / this.petalCount);
      fill(red(this.color), green(this.color), blue(this.color), alpha);
      ellipse(0, this.flowerSize / 2, this.flowerSize / 2, this.flowerSize);
    }

    fill(255, 220, 100, alpha);
    ellipse(0, 0, this.flowerSize / 2);

    pop();
  }
}

function createPlant(x, y) {
  plants.push(new Plant(x, y));
}