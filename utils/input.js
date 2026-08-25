const keys = {};
const keydownCallback = [];
const keyupCallback = [];
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  keydownCallback.forEach((callback) => callback(e));
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
  keyupCallback.forEach((callback) => callback(e));
});

export { keys, keydownCallback, keyupCallback };
