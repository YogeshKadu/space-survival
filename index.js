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
  const enemyCount = 4; //6 - for high difficulties 
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
  ENEMIES = ENEMIES.filter((enemy) => !enemy.destroyed);
  ENEMIES.map((enemy, index) => {
    enemy.calculate();
    if(!isGamePause) enemy.update();
    enemy.draw();
    enemy.calculatePlayerCollusion();
  });
  if(!isGamePause)
  for (let i = 0; i < ENEMIES.length; i++) {
    if (ENEMIES[i].destroyed) {
      console.log(`ENEMIES[i] skipped - `, ENEMIES[i]);
      continue;
    };
    for (let j = i + 1; j < ENEMIES.length; j++) {
      if (ENEMIES[j].destroyed) {
        console.log(`ENEMIES[j] skipped - `, ENEMIES[j]);
        continue
      };
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
let animationId = -1;
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
  animationId = requestAnimationFrame(animate);
}
//#endregion

//#region GameEvents
gameStartEvent.subscribe("start-initialize-game", () => {
  ENEMIES = [];
  EXPLOSIONS = [];
  deathRipple = null;
  player1 = new Player(
    width / 2 - 150, // x
    height / 2, // y
    270,     // starting angle
    0.1,    // lerpSteering
    60,    // maxSteeringAngle
    3,    // acceleration
    ctx,   // context
    2.5,  // steeringSpeed
    1    // controller
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
        2,   // controller
      )
    : null;
  spawnEnemyInterval = setInterval(() => {
    AddEnemies();
  }, 5000);
  animationId = requestAnimationFrame(animate);
});
gameOverEvent.subscribe("over-pauseEnemy-stopAnimation",() => {
  if(spawnEnemyInterval) {
    clearInterval(spawnEnemyInterval);
    spawnEnemyInterval = null;
  }
  cancelAnimationFrame(animationId);
  animationId=-1;
});
gamePauseEvent.subscribe("pause-pauseEnemy",() => {
  if(spawnEnemyInterval) {
    clearInterval(spawnEnemyInterval);
    spawnEnemyInterval = null;
  }
});
gameResumeEvent.subscribe("resume-resumeEnemy", () => {
  spawnEnemyInterval = setInterval(() => {
    AddEnemies();
  }, 5000);
});
//#endregion