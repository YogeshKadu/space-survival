import { audios } from "./AudioManager.js";
import {
  UpdatePlayer1HartsUI,
  UpdatePlayer2HartsUI,
} from "./initializeCanvas.js";
import { keys } from "./input.js";
import { generateRandomId, getAngle, getRadian, lerp } from "./utils.js";

class Entity {
  constructor(x, y, angle, lerpSteering, acceleration, maxSteeringAngle) {
    this.id = generateRandomId(16);
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.maxSteeringAngle = maxSteeringAngle;
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
  static maxLives = 3;
  constructor(
    x = 0,
    y = 0,
    angle = 270,
    lerpSteering = 0.1,
    maxSteeringAngle = 60,
    acceleration = 3,
    ctx = null,
    steeringSpeed = 2.5,
    controller = 1, // 1 or 2
  ) {
    super(x, y, angle, lerpSteering, acceleration, maxSteeringAngle);
    this.ctx = ctx;
    this.radius = 10;
    this.steeringSpeed = steeringSpeed;
    this.lives = Player.maxLives;
    this.controller = controller;
  }
  calculate() {
    if (this.controller == 1) {
      if (keys["A"] || keys["a"]) {
        this.angle -= this.steeringSpeed;
      }
      if (keys["D"] || keys["d"]) {
        this.angle += this.steeringSpeed;
      }
    } else {
      if (keys["ArrowLeft"]) {
        this.angle -= this.steeringSpeed;
      }
      if (keys["ArrowRight"]) {
        this.angle += this.steeringSpeed;
      }
    }

    this.radian = getRadian(this.angle); // needed only to render rays
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
    if(this.controller == 1) {
      this.ctx.fillStyle = "cyan";
    }else {
      this.ctx.fillStyle = "#00FF00";
    }
    this.ctx.fill();
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
    if (this.controller == 1)
      this.ctx.fillStyle = "cyan"; //#00FF00
    else this.ctx.fillStyle = "#00FF00";
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
    if (this.lives == 1 && audioManager) {
      audioManager?.play(audios.lastHeart);
    }
    if (this.controller == 1) UpdatePlayer1HartsUI(this.lives);
    else UpdatePlayer2HartsUI(this.lives);
    if (this.lives <= 0) {
      gameOverEvent.trigger();
      setRipple(this.x, this.y);
      audioManager?.play("endgame");
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
    // player = null,
    player1 = null,
    player2 = null,
    ctx = null,
  ) {
    super(x, y, angle, lerpSteering, acceleration, maxSteeringAngle);
    this.ctx = ctx;
    this.radius = 10;
    // this.playe = player;
    this.player1 = player1;
    this.player2 = player2;
    this.targetPlayer = null;
  }
  calculate() {
    if (this.player2) {
      const dist1 = Math.hypot(
        this.player1.x - this.x,
        this.player1.y - this.y,
      );
      const dist2 = Math.hypot(
        this.player2.x - this.x,
        this.player2.y - this.y,
      );
      this.targetPlayer = dist1 < dist2 ? this.player1 : this.player2;
    } else {
      this.targetPlayer = this.player1;
    }

    const dx = this.targetPlayer.x - this.x;
    const dy = this.targetPlayer.y - this.y;
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
    const dx = this.targetPlayer.x - this.x;
    const dy = this.targetPlayer.y - this.y;
    // const distance = Math.sqrt(dx * dx + dy * dy);
    // return distance <= this.targetPlayer.radius + this.radius;
    const distance = Math.hypot(dx, dy);
    if (distance < this.radius + this.targetPlayer.radius) {
      this.targetPlayer.decreaseLives();
      this.destroyed = true;
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
    this.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
    });

    this.particles = this.particles.filter((p) => p.life > 0);
  }

  draw(ctx) {
    this.particles.forEach((p) => {
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

export class DeathRipple {
  constructor(x, y, maxRadius = 30, speed = 1) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.maxRadius = maxRadius;
    this.speed = speed;
    this.alpha = 1;
    this.lineWidth = 4;
  }

  update() {
    this.radius = Math.min(this.radius + this.speed, this.maxRadius);
    this.alpha = 1 - this.radius / this.maxRadius;
    if(this.radius >= this.maxRadius) {
      this.radius = 0;
    }
  }

  draw(ctx) {
    if (this.finished) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.strokeStyle = "#ff2020";
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  get finished() {
    return this.radius >= this.maxRadius;
  }
}
