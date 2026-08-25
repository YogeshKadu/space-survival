export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export const getRadian = (angle) => angle * (Math.PI / 180);

export const getAngle = (radian) => radian * (180 / Math.PI);

export const randomClouds = (ctx) => {
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

  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "white";
  ctx.rect(600, 700, 40, 80);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "white";
  ctx.rect(800, 400, 70, 20);
  ctx.stroke();
  ctx.save();
};

export function spawnEnemy() {
  const margin = 50;
  const side = Math.floor(Math.random() * 4);
  const position = {
    x: 0, y: 0
  }

  switch (side) {
    case 0: // top
      position.x = Math.random() * width;
      position.y = -margin;
      break;

    case 1: // right
      position.x = width + margin;
      position.y = Math.random() * height;
      break;

    case 2: // bottom
      position.x = Math.random() * width;
      position.y = height + margin;
      break;

    case 3: // left
      position.x = -margin;
      position.y = Math.random() * height;
      break;
  }
  return position;
}

export function generateRandomId(length = 10) {
  return Math.random().toString(36).substring(2, 2 + length);
}