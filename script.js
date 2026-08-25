import { keys, keydownCallback, keyupCallback } from "./utils/input.js";
import { getAngle } from "./utils/utils.js";

function lerp(a, b, t) {
  return a + (b - a) * t;
}

class Player {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
    this.angle = 270; // where we want to go - in angle.
    this.radian = this.angle * (Math.PI / 180);
    this.steeringSpeed = 5;
    this.lerpSteering = 0.1;

    this.velocity = this.angle; // where we are going now - in angle.
    this.velocityRadian = this.radian;
    this.velocityLerp = 0.2;
    this.acceleration = 2; // cause of angle and velocity difference.
  }
  #clampPosition() {
    if (this.x < -20) this.x = width + 20;
    if (this.x > width + 20) this.x = -20;
    if (this.y < -20) this.y = height + 20;
    if (this.y > height + 20) this.y = -20;
  }
  update() {
    if (keys["A"] || keys["a"] || keys["ArrowLeft"]) {
      this.angle -= this.steeringSpeed;
    }
    if (keys["D"] || keys["d"] || keys["ArrowRight"]) {
      this.angle += this.steeringSpeed;
    }
    this.radian = this.angle * (Math.PI / 180);
    this.velocity = lerp(this.velocity, this.angle, this.lerpSteering);
    this.velocityRadian = this.velocity * (Math.PI / 180);

    this.x += Math.cos(this.velocityRadian) * this.acceleration;
    this.y += Math.sin(this.velocityRadian) * this.acceleration;

    this.#clampPosition();
  }
  DrawGizmos() {
    const angleX = Math.cos(this.radian) * 40;
    const angleY = Math.sin(this.radian) * 40;

    ctx.save();
    ctx.beginPath();
    ctx.translate(this.x, this.y);
    ctx.moveTo(angleX, angleY);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    const velocityX = Math.cos(this.velocityRadian) * 40;
    const velocityY = Math.sin(this.velocityRadian) * 40;
    ctx.save();
    ctx.beginPath();
    ctx.translate(this.x, this.y);
    ctx.moveTo(velocityX, velocityY);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "#FFF";
    ctx.fill();

    ctx.save(); // Save current canvas state
  }
}


class Enemy {
  constructor(player) {
    this.player = player;
    this.x = width / 2 + 200;
    this.y = height / 2;

    // 1. Calculate direction to player
    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    // Get target angle in degrees (0-360)
    this.angle = Math.atan2(dy, dx) * (180 / Math.PI);
    this.radian = this.angle * (Math.PI / 180);
    this.velocity = this.angle;
    this.velocityRadian = this.radian;
    this.lerpSteering = 0.05;
    this.acceleration = 3; // cause of angle and velocity difference.
    this.maxSteeringAngle = 60;
    this.maxSteeringRadial = (this.maxSteeringAngle * Math.PI) / 180; // 10 degrees
  }
  #clampPosition() {
    if (this.x < -20) this.x = width + 20;
    if (this.x > width + 20) this.x = -20;
    if (this.y < -20) this.y = height + 20;
    if (this.y > height + 20) this.y = -20;
  }
  update() {
    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    this.radian = Math.atan2(dy, dx);
    const diff = Math.atan2(
      Math.sin(this.radian - this.velocityRadian),
      Math.cos(this.radian - this.velocityRadian),
    );
    this.angle = getAngle(this.radian);
    const steering = Math.max(
      -this.maxSteeringRadial,
      Math.min(this.maxSteeringRadial, diff),
    );
    const newRadian = this.velocityRadian + steering * this.lerpSteering;
    this.velocity = (newRadian * 180) / Math.PI;
    this.velocityRadian = newRadian;

    // console.log("Angle - ", this.angle, " Radian - ", this.radian);
    this.x += Math.cos(this.velocityRadian) * this.acceleration;
    this.y += Math.sin(this.velocityRadian) * this.acceleration;
  }
  DrawGizmos() {
    const angleX = Math.cos(this.radian) * 40;
    const angleY = Math.sin(this.radian) * 40;

    ctx.save();
    ctx.beginPath();
    ctx.translate(this.x, this.y);
    ctx.moveTo(angleX, angleY);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.strokeStyle = "#00ff00"; // green - target angle
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    const velocityX = Math.cos(this.velocityRadian) * 40;
    const velocityY = Math.sin(this.velocityRadian) * 40;
    ctx.save();
    ctx.beginPath();
    ctx.translate(this.x, this.y);
    ctx.moveTo(velocityX, velocityY);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.strokeStyle = "#ff00ff"; // pink - target velocity
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "#ff00ff";
    ctx.fill();

    ctx.save(); // Save current canvas state
  }
}

const player = new Player();
const enemy = new Enemy(player);
//#region animation
let lastTime = 0;
const fps = 60;
const interval = 1000 / fps;
function animate(timestamp) {
  const deltaTime = timestamp - lastTime;
  if (deltaTime > interval) {
    lastTime = timestamp - (deltaTime % interval);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.update();
    player.DrawGizmos();

    enemy.update();
    enemy.DrawGizmos();

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "white";
    ctx.rect(100, 100, 50, 50);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "white";
    ctx.rect(300, 400, 80, 50);
    ctx.stroke();
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
//#endregion
