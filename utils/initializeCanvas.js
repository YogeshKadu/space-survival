import { AudioManager } from "./Entity.js";

window.canvas = document.getElementById("canvas");
window.player1_tile = document.getElementById("player1_icons_tray");
window.player2_tile = document.getElementById("player2_icons_tray");
window.ctx = canvas.getContext("2d");
window.accentColor = "#1f2937";
canvas.style.backgroundColor = accentColor;
window.width = canvas.width = 1000;
window.height = canvas.height = 800;

export const UpdatePlayer1HartsUI = (lives) => {
  player1_tile.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const anchor = document.createElement("a");
    const image = document.createElement("img");

    anchor.href = "https://www.flaticon.com/free-icons/heart";
    anchor.title = "heart icons";

    image.classList = anchor.classList = "h-full";
    if (i < lives) {
      image.src = "./assets/fullheart.png";
      anchor.appendChild(image);
    } else {
      image.src = "./assets/emptyheart.png";
      anchor.appendChild(image);
    }
    player1_tile.appendChild(anchor);
  }
};
export const UpdatePlayer2HartsUI = (lives) => {
  player2_tile.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const anchor = document.createElement("a");
    const image = document.createElement("img");

    anchor.href = "https://www.flaticon.com/free-icons/heart";
    anchor.title = "heart icons";

    image.classList = anchor.classList = "h-full";
    if (i < lives) {
      image.src = "./assets/fullheart.png";
      anchor.appendChild(image);
    } else {
      image.src = "./assets/emptyheart.png";
      anchor.appendChild(image);
    }
    player2_tile.appendChild(anchor);
  }
};
// UpdatePlayer1Harts(2);

window.audioManager = new AudioManager();