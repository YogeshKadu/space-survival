import { Player, Enemy, Explosion, DeathRipple } from "./utils/Entity.js";
import { randomClouds, spawnEnemy } from "./utils/utils.js";

window.setRipple = (x = 0, y = 0) => deathRipple=new DeathRipple(x,y);
window.addExplosion = (x = 0, y = 0) => {
  EXPLOSIONS.push(new Explosion(x, y));
};

let player1, player2;
let spawnEnemyInterval = null;


//#region Enemy Handling
let ENEMIES = [];
let EXPLOSIONS = [];
let deathRipple = null;
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
        player2,
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
    if(!isGamePause) ENEMIES[i].update();
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
    if(isGamePause) {
      // only animate when game is paused
    } else {
      // only animate when game is **not** paused
    }
    if (player1) {
      player1?.calculate();
      if(!isGamePause) player1?.update();
      player1?.draw();
    }
    if (player2) {
      player2?.calculate();
      if(!isGamePause) player2?.update();
      player2?.draw();
    }
    UpdateEnemies();

    if(deathRipple) {
      deathRipple.update();
      deathRipple.draw(ctx);
    }
    UpdateExplosions();
    randomClouds(ctx);
  }
  requestAnimationFrame(animate);
}
//#endregion

gameStartEvent.addHandler("start-initialize-js", () => {
  console.log("start-initialize-js called")
  ENEMIES = [];
  EXPLOSIONS = [];
  deathRipple = null;
  player1 = new Player(
    width / 2 - 150, // x
    height / 2, // y
    270, // starting angle
    0.1, // lerpSteering
    60, // maxSteeringAngle
    3, // acceleration
    ctx, // context
    2.5, // steeringSpeed
    1
  );
  player2 = !isSolo
    ? new Player(
        width / 2 + 150, // x
        height / 2, // y
        270, // starting angle
        0.1, // lerpSteering
        60, // maxSteeringAngle
        3, // acceleration
        ctx, // context
        2.5, // steeringSpeed
        2,
      )
    : null;
  spawnEnemyInterval = setInterval(() => {
    console.log("spawnEnemyInterval called");
    AddEnemies();
  }, 5000);
});
requestAnimationFrame(animate);
gameOverEvent.addHandler("pauseEnemy",() => {
  if(spawnEnemyInterval)
    clearInterval(spawnEnemyInterval);
});
gamePauseEvent.addHandler("pause-enemy",() => {
  if(spawnEnemyInterval)
    clearInterval(spawnEnemyInterval);
});
gameResumeEvent.addHandler("resume-enemy", () => {
  spawnEnemyInterval = setInterval(() => {
    AddEnemies();
  }, 5000);
});