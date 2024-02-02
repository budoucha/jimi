function preload() {
  pixelDensity(1);
  title = loadImage("data/start.png");
  gameover = loadImage("data/gameover.png");
  jimiImg = loadImage("data/jimi.jpg");
  jikiImg = loadImage("data/jiki.png");
  bulletImg = loadImage("data/money_1a.png");
  bg1 = loadImage("data/bg1st.jpg");
  bg2 = loadImage("data/bg2nd.jpg");
  wikiLogoL = loadImage("data/wiki-Logo.png");
  wikiLogoM = loadImage("data/wiki-Logo.png");
  wikiLogoS = loadImage("data/wiki-Logo.png");
  bgm = loadSound('data/bgm.mp3');
  s1 = loadSound('data/s1.mp3');
  s2 = loadSound('data/s2.mp3');
  s3 = loadSound('data/s3.mp3');
  s4 = loadSound('data/s4.mp3');
  mode = 0;
}

function setup() {
  useQuadTree(false);
  n = allSprites.length;
  for (i = 0; i < n; i++) {
    allSprites[0].remove();
  }

  var myCanvas = createCanvas(600, 800);
  myCanvas.parent('sketch-holder');
  hGrid = width / 8;
  vUnit = height / 8;
  hHalf = width / 2;
  vHalf = height / 2;

  jikiSpeedDefault = height / 100;
  jikiSpeedSlow = jikiSpeedDefault / 3;
  jikiSpeed = jikiSpeedDefault;

  maxLife = 16;
  score = 0;
  shtcntdwn = 0;
  jikiDmg = 0;
  jimiDmg = 0;
  pan = 0;
  frameCnt = 0;

  url1 = "https://payments.wikimedia.org/index.php?title=Special:PaypalExpressGateway&appeal=JimmyQuote&currency=JPY&payment_method=paypal&recurring=0&uselang=ja&amount=";
  id = "input_amount_other_box"

  setupSounds();
  setupSprites();
}

function draw() {
  //print(allSprites.length);
  if (mode == 1) {
    update();
    drawbg();
    drawSprites();
    drawDamages();

    //当たり判定範囲描画(大きめ)
    ellipseMode(CENTER);
    strokeWeight(1);
    stroke(255);
    colorMode(HSB);
    fill(0, 216, 255);
    ellipse(jiki.position.x, jiki.position.y - jikiHead, hGrid / 8);

    drawLife();

    noStroke();
    fill(0, 255, 255, 0.4);
    triangle(jimi.position.x, height - hGrid / 4, jimi.position.x - hGrid / 4, height, jimi.position.x + hGrid / 4, height);

    drawTexts();
  } else if (mode === 0) {
    drawTitle();
  } else if (mode == 2) {
    drawGameover();
  }

}

function update() {
  frameCnt++;
  if (!bgm.isPlaying()) {
    bgm.play();
  }
  if (jikiLife < 1) {
    gameOver();
  }

  jimi.overlap(myBullets, myHit);
  jimiBullets.overlap(jiki, jimiHit);
  jimi.overlap(jiki, directHit);
  jimiBullets.overlap(vanishAreas, vanish);

  jimiMove();
  readKey();

  if (shtcntdwn > 0) {
    shtcntdwn--; //再装填カウントダウン
  }

}


function readKey() {
  if (keyDown("RIGHT_ARROW") && jiki.position.x + jiki.width / 2 < width) {
    jiki.position.x += jikiSpeed;
  }
  if (keyDown("LEFT_ARROW") && jiki.position.x - jiki.width / 2 > 0) {
    jiki.position.x -= jikiSpeed;
  }
  if (keyDown("UP_ARROW") && jiki.position.y - jiki.height / 2 > 0) {
    jiki.position.y -= jikiSpeed;
  }
  if (keyDown("DOWN_ARROW") && jiki.position.y + jiki.height / 2 < height) {
    jiki.position.y += jikiSpeed;
  }

  if (keyDown("SHIFT")) {
    jikiSpeed = jikiSpeedSlow;
  } else {
    jikiSpeed = jikiSpeedDefault;
  }

  if (keyDown("Z")) {
    shoot();
  }
}

function shoot() {
  if (shtcntdwn < 1) {
    myBullet = createSprite(jiki.position.x + randomGaussian(0, 5), jiki.position.y - jiki.height / 2, 1, 1);
    myBullet.addImage(bulletImg);
    myBullet.life = 64;
    myBulletSpeed = -height * 0.015;
    myBullet.velocity.x = 0;
    myBullet.velocity.y = myBulletSpeed;
    myBullets.add(myBullet);
    myBullet.setCollider("circle", 0, 0, myBullet.width / 2);
    s1.play();
    shtcntdwn = 3; //再装填時間
  }
}

function jimiMove() {
  jimi.position.x = hHalf + width / 3 * sin(frameCnt / 108);
  if (frameCnt % 47 === 0) {
    jimiShoot(0);
  }
  if (frameCnt % 53 === 0) {
    jimiShoot(1);
  }
  if (frameCnt % 67 === 0) {
    jimiShoot(2);
  }
}

function jimiShoot(type) {
  if (type === 0) {
    jimiBulletSpeed = 1.8;
    jimiBulletAngle = randomGaussian(HALF_PI, 0.8);
    jimiBullet = createSprite(jimi.position.x, jimi.position.y + jimiShotOffset, 4, 4);
    jimiBullet.addImage(wikiLogoL);
    jimiBullet.life = 440;
    jimiBullet.velocity.x = jimiBulletSpeed * cos(jimiBulletAngle);
    jimiBullet.velocity.y = jimiBulletSpeed * sin(jimiBulletAngle);
    jimiBullets.add(jimiBullet);
    jimiBullet.setCollider("circle", 0, 0, jimiBullet.width / 2.1);
  } else if (type == 1) {
    jimiBulletSpeed = height / 200;
    for (i = -1; i < 2; i += 2) {
      jimiBulletAngle = HALF_PI - i * 0.12 - atan2(jiki.position.x - jimi.position.x, jiki.position.y - jikiHead - jimi.position.y - jimiShotOffset);
      jimiBullet = createSprite(jimi.position.x, jimi.position.y + jimiShotOffset, 4, 4);
      jimiBullet.addImage(wikiLogoM);
      jimiBullet.life = 192;
      jimiBullet.velocity.x = jimiBulletSpeed * cos(jimiBulletAngle);
      jimiBullet.velocity.y = jimiBulletSpeed * sin(jimiBulletAngle);
      jimiBullets.add(jimiBullet);
      jimiBullet.setCollider("circle", 0, 0, jimiBullet.width / 2.1);
    }
  } else if (type == 2) {
    jimiBulletSpeed = height / 80;
    for (i = 0; i < 3; i++) {
      jimiBulletAngle = HALF_PI - atan2(jiki.position.x - jimi.position.x, jiki.position.y - jikiHead - jimi.position.y - jimiShotOffset);
      jimiBullet = createSprite(jimi.position.x + i * 4 * jimiBulletSpeed * cos(jimiBulletAngle), jimi.position.y + i * 4 * jimiBulletSpeed * sin(jimiBulletAngle) + jimiShotOffset, 4, 4);
      jimiBullet.addImage(wikiLogoS);
      jimiBullet.life = 80;
      jimiBullet.velocity.x = pow(1.11, i) * jimiBulletSpeed * cos(jimiBulletAngle);
      jimiBullet.velocity.y = pow(1.11, i) * jimiBulletSpeed * sin(jimiBulletAngle);
      jimiBullets.add(jimiBullet);
      jimiBullet.setCollider("circle", 0, 0, jimiBullet.width / 2.1);
    }
  }
}

function jimiHit(jimiBullet, jiki) {
  s4.play();
  jikiDmg = 25;
  jimiBullet.remove();
  jikiLife--;
}

function directHit() {
  s4.play();
  jikiDmg = 25;
  jikiLife -= 2;
}

function myHit(jimi, myBullet) {
  s2.play();
  score++;
  jimiDmg = 3;
  myBullet.remove();
}

function vanish(vanishing) {
  vanishing.remove();
}

function gameOver() {
  mode = 2;
  bgm.stop();
  //document.getElementById("twitter-widget-0").src = document.getElementById("twitter-widget-0").src +"&text="+score+"%E5%86%86%E5%88%86%E5%A5%AE%E9%97%98%E3%81%97%E3%81%BE%E3%81%97%E3%81%9F%E3%80%82%20%20KIFU%20GAME%20-Wikipedia%E3%81%A8%E3%82%B8%E3%83%9F%E3%83%BC%E3%83%BB%E3%82%A6%E3%82%A7%E3%83%BC%E3%83%AB%E3%82%BA%E6%B0%8F%E3%81%AB%E5%AF%84%E4%BB%98%E3%81%99%E3%82%8B%E3%82%B2%E3%83%BC%E3%83%A0-";
}

function drawTexts() {
  textSize(24);
  textAlign(RIGHT);
  strokeWeight(3);
  stroke(0);
  fill(255);
  text("fps: " + nf(frameRate(), 0, 2) + " ", width, height - vUnit / 2);
  text("寄付金額: ￥" + score + "  ", width, vUnit / 2);
}


function setupSprites() {
  myBullets = new Group();
  jimiBullets = new Group();
  vanishAreas = new Group();

  jikiImg.resize(hGrid * 0.8, hGrid * 0.8);
  jiki = createSprite(hHalf, vUnit * 7, hGrid, hGrid);
  jiki.addImage(jikiImg);
  jikiHead = jiki.height * 0.19;
  jiki.setCollider("circle", 0, -jikiHead, hGrid / 10);
  jikiLife = maxLife;

  bulletImg.resize(hGrid, hGrid);

  jimiImg.resize(hGrid * 1.44, hGrid * 1.44);
  jimi = createSprite(hHalf, vUnit, hGrid, hGrid);
  jimi.addImage(jimiImg);
  jimi.setCollider("rectangle", 0, 0, jimi.width, jimi.height * 0.6);
  jimiShotOffset = jimi.height * 0.6;

  wikiLogoL.resize(hGrid * 1.8, hGrid * 1.8);
  wikiLogoM.resize(hGrid * 0.8, hGrid * 0.8);
  wikiLogoS.resize(hGrid * 0.4, hGrid * 0.4);

  title.resize(width, width / title.width * title.height);
  gameover.resize(width, width / gameover.width * gameover.height);

  bg1.resize(width, width / bg1.width * bg1.height);
  bg2.resize(width, width / bg2.width * bg2.height);
  bgHeight = bg1.height + bg2.height;

  vanishAreaL = createSprite(-hGrid * 1.8, vHalf, 10, height);
  vanishAreas.add(vanishAreaL);
  vanishAreaR = createSprite(width + hGrid * 1.8, vHalf, 10, height);
  vanishAreas.add(vanishAreaR);
}

function setupSounds() {
  bgm.setVolume(0.1);
  bgm.playMode('restart');
  s1.setVolume(0.1);
  s1.playMode('sustain');
  s2.setVolume(0.1);
  s2.playMode('sustain');
  s3.setVolume(0.1);
  s3.playMode('sustain');
  s4.setVolume(0.1);
  s4.playMode('sustain');
}

function drawbg() {
  imageMode(CORNER);
  pan = 0 - 2 * frameCnt % bgHeight;
  if (pan < bg1.height) {
    image(bg1, 0, pan, width, bg1.height);
  }
  if (pan + bg1.height < height) {
    image(bg2, 0, pan + bg1.height, width, bg2.height);
  }
  if (pan + bgHeight < height) {
    image(bg1, 0, bgHeight + pan, width, bg1.height);
  }
}

function drawDamages() {
  colorMode(HSB);
  noStroke();

  if (jimiDmg > 0) {
    fill(200, 255, 255, 0.09 * jimiDmg);
    rectMode(CENTER);
    rect(jimi.position.x, jimi.position.y, jimi.width * (1 + 0.08 * jimiDmg), jimi.height * (1 + 0.08 * jimiDmg));
    jimiDmg--;
  }

  if (jikiDmg > 0) {
    fill(20, 255, 255, 0.6);
    ellipseMode(CENTER);
    ellipse(jiki.position.x + randomGaussian(0, 8), jiki.position.y + randomGaussian(0, 8), jiki.width * (0.4 + jikiDmg / 100));
    if (jikiLife <= maxLife / 8) {
      ellipse(jiki.position.x + randomGaussian(0, 8), jiki.position.y + randomGaussian(0, 8), jiki.width * (0.4 + jikiDmg / 100));
    } else {
      jikiDmg--;
    }
  }
}

function drawLife() {
  // Life Gauge
  rectMode(CORNER);
  noStroke();
  if (jikiLife > maxLife / 2) {
    fill('#00FF00');
  } else if (jikiLife > maxLife / 4) {
    fill('#FFFF00');
  } else {
    fill('#FF0000');
  }
  rect(jiki.position.x - jiki.width / 2, jiki.position.y + jiki.height * 0.15, map(jikiLife, 0, maxLife, 0, jiki.width), jiki.width / 8);
  strokeWeight(1);
  stroke(36);
  noFill();
  rect(jiki.position.x - jiki.width / 2, jiki.position.y + jiki.height * 0.15, jiki.width, jiki.width / 8);
}

function drawTitle() {
  imageMode(CORNER);
  image(title, 0, 0);
  push();
  imageMode(CENTER)
  translate(hHalf, vHalf);
  rotate(radians(frameCount));
  image(wikiLogoL, 0, 0);
  pop();
  if (keyDown("X")) {
    mode = 1;
    setup();
  }
}

function drawGameover() {
  imageMode(CORNER);
  image(gameover, 0, 0);
  stroke(255);
  fill(0);
  textSize(64);
  strokeWeight(4);
  textAlign(CENTER);
  text("￥" + score, hHalf, vUnit * 4);
  if (keyDown("X")) {
    mode = 0;
    setup();
  }
  if (keyDown("W")) {
    donate();
  }
}

function donate() { //寄付ページに移動
  url = url1 + score;
  document.location.href = url;
}