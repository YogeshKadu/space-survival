import { Player, Enemy, Explosion } from "./utils/Entity.js";
import { randomClouds, spawnEnemy } from "./utils/utils.js";

window.isDebug = false;
window.isGamePause = false;
window.addExplosion = (x = 0, y = 0) => {
  EXPLOSIONS.push(new Explosion(x, y));
};

window.HandleGameOver = () => {
  clearInterval(spownEnemyInterval);
  player1 = null;
};

let player1, player2;
// AddEnemies();
let spownEnemyInterval;
const StartGame = () => {
  ENEMIES = [];
  EXPLOSIONS = [];
  player1 = new Player(
    width / 2, // x
    height / 2, // y
    270, // starting angle
    0.1, // lerpSteering
    60, // maxSteeringAngle
    3, // acceleration
    ctx, // context
    2.5, // steeringSpeed
  );
  spownEnemyInterval = setInterval(() => {
    AddEnemies();
  }, 5000);
  requestAnimationFrame(animate);
};

//#region Enemy Handling
let ENEMIES = [];
let EXPLOSIONS = [];
const AddEnemies = () => {
  const enemyCount = 3;
  const lerpSteering = 0.04;
  const maxSteeringAngle = 40;
  const acceleration = 4;
  for (let i = 0; i < enemyCount; i++) {
    const { x, y } = spawnEnemy();
    const angle = Math.floor(Math.random() * (360 - 0 + 1)) + 0;
    ENEMIES.push(
      new Enemy(
        x,
        y,
        angle,
        lerpSteering,
        maxSteeringAngle,
        acceleration,
        player1,
        ctx,
      ),
    );
  }
};
const UpdateEnemies = () => {
  for (let i = ENEMIES.length - 1; i >= 0; i--) {
    if (!ENEMIES[i] || ENEMIES[i].destroyed) {
      console.log(`ENEMIES[${i}] skipped - `, ENEMIES[i]);
      continue;
    }
    ENEMIES[i].calculate();
    ENEMIES[i].update();
    ENEMIES[i].draw();
    ENEMIES[i].calculatePlayerCollusion();

    for (let i = 0; i < ENEMIES.length; i++) {
      if (ENEMIES[i].destroyed) continue;
      for (let j = i + 1; j < ENEMIES.length; j++) {
        if (ENEMIES[j].destroyed) continue;
        const e1 = ENEMIES[i];
        const e2 = ENEMIES[j];

        const dx = e1.x - e2.x;
        const dy = e1.y - e2.y;

        if (Math.hypot(dx, dy) < e1.radius + e2.radius) {
          e1.destroyed = true;
          e2.destroyed = true;
          audioManager?.play("hit");
          addExplosion(e1.x, e1.y);
        }
      }
    }
  }
  ENEMIES = ENEMIES.filter((enemy) => !enemy.destroyed);
};

const UpdateExplosions = () => {
  EXPLOSIONS.forEach((explosion) => {
    explosion.update();
    explosion.draw(ctx);
  });
  EXPLOSIONS = EXPLOSIONS.filter((explosion) => !explosion.finished);
};
//#endregion

//#region animation
let lastTime = 0;
const fps = 60;
const interval = 1000 / fps;
function animate(timestamp) {
  const deltaTime = timestamp - lastTime;
  if (deltaTime > interval) {
    lastTime = timestamp - (deltaTime % interval);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (player1) {
      player1?.calculate();
      player1?.update();
      player1?.draw();
    }

    UpdateEnemies();
    UpdateExplosions();

    randomClouds(ctx);
  }
  if (!isGamePause) requestAnimationFrame(animate);
}
//#endregion

StartGame();
