import { UpdatePlayer1HartsUI } from "./initializeCanvas.js";
import { keys } from "./input.js";
import { generateRandomId, getAngle, getRadian, lerp } from "./utils.js";
// import "./../assets/sounds/endgame/meme-de-creditos-finales.mp3"

class Entity {
  constructor(x, y, angle, lerpSteering, acceleration, maxSteeringAngle) {
    this.id = generateRandomId(16);
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.maxSteeringAngle = maxSteeringAngle
    this.maxSteeringRadial = getRadian(maxSteeringAngle);
    this.velocity = angle;
    this.lerpSteering = lerpSteering;
    this.acceleration = acceleration;

    // radials
    this.radian = getRadian(angle);
    this.velocityRadian = this.radian;
  }
  calculate() {} // update input values
  #clampPosition() {
    if (this.x < -20) this.x = width + 20;
    if (this.x > width + 20) this.x = -20;
    if (this.y < -20) this.y = height + 20;
    if (this.y > height + 20) this.y = -20;
  }
  shortestAngleDegrees(from, to) {
    return ((((to - from + 180) % 360) + 360) % 360) - 180;
  }
  update() {
    const angleDifference = this.shortestAngleDegrees(
      this.velocity,
      this.angle,
    );
    const streeing = Math.max(
      -this.maxSteeringAngle,
      Math.min(this.maxSteeringAngle, angleDifference),
    );
    this.velocity += streeing * this.lerpSteering;
    this.velocityRadian = getRadian(this.velocity);

    this.x += Math.cos(this.velocityRadian) * this.acceleration;
    this.y += Math.sin(this.velocityRadian) * this.acceleration;

    this.#clampPosition();
  }
}

export class Player extends Entity {
  constructor(
    x = 0,
    y = 0,
    angle = 270,
    lerpSteering = 0.1,
    maxSteeringAngle = 60,
    acceleration = 3,
    ctx = null,
    steeringSpeed = 2.5,
  ) {
    super(x, y, angle, lerpSteering, acceleration, maxSteeringAngle);
    this.ctx = ctx;
    this.radius = 10;
    this.steeringSpeed = steeringSpeed;
    this.lives = 3;
  }
  calculate() {
    if (keys["A"] || keys["a"] || keys["ArrowLeft"]) {
      this.angle -= this.steeringSpeed;
    }
    if (keys["D"] || keys["d"] || keys["ArrowRight"]) {
      this.angle += this.steeringSpeed;
    }

    this.radian = getRadian(this.angle); // needed only to render rays
  }
  #DrawGizmos() {
    const angleX = Math.cos(this.radian) * 40;
    const angleY = Math.sin(this.radian) * 40;

    this.ctx.save();
    // this.ctx.beginPath();
    this.ctx.translate(this.x, this.y);
    this.ctx.moveTo(angleX, angleY);
    this.ctx.lineTo(0, 0);
    this.ctx.closePath();
    this.ctx.strokeStyle = "#00ff00";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();

    const velocityX = Math.cos(this.velocityRadian) * 40;
    const velocityY = Math.sin(this.velocityRadian) * 40;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.translate(this.x, this.y);
    this.ctx.moveTo(velocityX, velocityY);
    this.ctx.lineTo(0, 0);
    this.ctx.closePath();
    this.ctx.strokeStyle = "#ff00ff";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();

    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.ctx.closePath();
    this.ctx.strokeStyle = "#FFF";
    this.ctx.stroke();
    this.ctx.save();
  }
  draw() {
    if (isDebug) {
      this.#DrawGizmos();
      return;
    }

    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.rotate(this.velocityRadian);
    this.ctx.fillStyle = "cyan"; //#00FF00
    this.ctx.beginPath();
    this.ctx.moveTo(15, 0);
    this.ctx.lineTo(-10, -10);
    this.ctx.lineTo(-5, 0);
    this.ctx.lineTo(-10, 10);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }
  decreaseLives() {
    this.lives -= 1;
    if(this.lives == 1 && audioManager) {
      audioManager?.play(audios.lastHeart);
    }
    UpdatePlayer1HartsUI(this.lives);
    if (this.lives <= 0) {
      HandleGameOver();
      console.log("Player died");
      audioManager?.play("endgame");
      isGamePause= true;
    } else {
      addExplosion(this.x, this.y);
      audioManager?.play("hit");
    }
  }
}

export class Enemy extends Entity {
  constructor(
    x = 0,
    y = 0,
    angle = 180,
    lerpSteering = 0.04,
    maxSteeringAngle = 40,
    acceleration = 4,
    player = null,
    ctx = null,
  ) {
    super(x, y, angle, lerpSteering, acceleration, maxSteeringAngle);
    this.ctx = ctx;
    this.radius = 10;
    this.player = player;
    this.targetPlayer = null;
  }
  calculate() {
    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    this.radian = Math.atan2(dy, dx);
    this.angle = getAngle(this.radian);
  }
  #DrawGizmos() {
    const angleX = Math.cos(this.radian) * 40;
    const angleY = Math.sin(this.radian) * 40;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.translate(this.x, this.y);
    this.ctx.moveTo(angleX, angleY);
    this.ctx.lineTo(0, 0);
    this.ctx.closePath();
    this.ctx.strokeStyle = "#00ff00"; // green - target angle
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();

    const velocityX = Math.cos(this.velocityRadian) * 40;
    const velocityY = Math.sin(this.velocityRadian) * 40;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.translate(this.x, this.y);
    this.ctx.moveTo(velocityX, velocityY);
    this.ctx.lineTo(0, 0);
    this.ctx.closePath();
    this.ctx.strokeStyle = "#ff00ff"; // pink - target velocity
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();

    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.ctx.closePath();
    this.ctx.strokeStyle = "#ff00ff";
    this.ctx.stroke();

    this.ctx.save(); // Save current canvas state
  }
  draw() {
    if (isDebug) {
      this.#DrawGizmos();
      return;
    }
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.rotate(this.velocityRadian);
    this.ctx.fillStyle = "#FF5C5C";
    this.ctx.beginPath();
    this.ctx.moveTo(15, 0);
    this.ctx.lineTo(-10, -10);
    this.ctx.lineTo(-5, 0);
    this.ctx.lineTo(-10, 10);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }
  calculatePlayerCollusion() {
    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    // const distance = Math.sqrt(dx * dx + dy * dy);
    // return distance <= this.player.radius + this.radius;
    const distance = Math.hypot(dx, dy);
    if(distance < this.radius + this.player.radius) {
      this.player.decreaseLives();
      this.destroyed =true;
    }
  }
}

export class Explosion {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.particles = [];

    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30,
      });
    }
  }

  update() {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
    });

    this.particles = this.particles.filter(p => p.life > 0);
  }

  draw(ctx) {
    this.particles.forEach(p => {
      ctx.globalAlpha = p.life / 30;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "orange";
      ctx.fill();
    });

    ctx.globalAlpha = 1;
  }

  get finished() {
    return this.particles.length === 0;
  }
}

const audios = {
  lastHeart: "lastHeart",
  hit:"hit",
  endgame: "endgame"
}
export class AudioManager {
  constructor() {
    this.sounds = {
      lastHeart: new Audio("./assets/sounds/lastheart/run-vine-sound-effect.mp3"),
      hit: new Audio("./assets/sounds/hit/punch_u4LmMsr.mp3"),
      endgame: new Audio("./assets/sounds/endgame/meme-de-creditos-finales.mp3")
    };

    Object.values(this.sounds).forEach(audio => {
      audio.preload = "auto";
      audio.load();
    });
  }

  play(name) {
    const audio = this.sounds[name];

    if (!audio) return;

    audio.currentTime = 0;
    audio.play();
  }
}