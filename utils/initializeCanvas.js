import { AudioManager, Player } from "./Entity.js";
import GameEvent from "./GameEvent.js";

window.canvas = document.getElementById("canvas");
window.player1_tile = document.getElementById("player1_icons_tray");
window.player2_tile = document.getElementById("player2_icons_tray");
const startMenuElement = document.getElementById("start_menu");
const gameSceneElement = document.getElementById("game_scene");

window.ctx = canvas.getContext("2d");
window.accentColor = "#1f2937";
canvas.style.backgroundColor = accentColor;

// Initialize Events
window.gameStartEvent = new GameEvent();
window.gameOverEvent = new GameEvent(); //Done
window.gamePauseEvent = new GameEvent();
window.gameResumeEvent = new GameEvent();
window.isDebug = false;
window.isGamePause = false;
window.isGameOver = false;
window.isSolo = false;
window.audioManager = new AudioManager();

const resizeCanvas = () => {
  window.width =  canvas.width = canvas.clientWidth * 1.5;
  window.height =  canvas.height = canvas.clientHeight * 1.5;
}
window.addEventListener('resize', resizeCanvas);

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

const debugbutton = document.getElementById("debug-control")
if(debugbutton) {
  debugbutton.addEventListener("click", (event) => {
    if(isDebug) {
      event.currentTarget.children[0].innerHTML = "DEBUGGER - ON"
    } else {
      event.currentTarget.children[0].innerHTML = "DEBUGGER - OFF"
    }
    isDebug=!isDebug;
    debugbutton.classList.toggle("bg-pink-600")
    debugbutton.classList.toggle("bg-slate-900");
  });
} else {
  console.error("debug-control - not found");
}


const pausebutton = document.getElementById("pause-control")
if(pausebutton) {
  pausebutton.addEventListener("click",(event)=>{
    isGamePause = !isGamePause;
    if(isGameOver) {
      isGameOver = false;
      gameStartEvent.trigger();
    }
    if(isGamePause) {
      pausebutton.children[0].innerHTML = "PLAY";
      // spownEnemy();
      gameResumeEvent.trigger();
    } else {
      pausebutton.children[0].innerHTML = "PAUSE";
      // pauseEnemy();
      gamePauseEvent.trigger();
    }
    pausebutton.classList.toggle("bg-pink-600")
    pausebutton.classList.toggle("bg-slate-900");
  });
}else{
  console.error("pause-control - not found");
}
gameOverEvent.addHandler("over-GameUI-settings", () => {
  console.log("over-GameUI-settings called")
  pausebutton.children[0].innerHTML = "RESTART";
  if(pausebutton.classList.contains("bg-pink-600")) {
    // was in pause state
    pausebutton.classList.toggle("bg-slate-900");
    pausebutton.classList.toggle("bg-pink-600");
    window.isGamePause = true;
    window.isGameOver = true;
  }
});

const audioButton = document.getElementById("audio-control")
if(audioButton) {
  audioButton.addEventListener("click", (event) => {
    if(audioManager.isMute) {
      audioManager.unmuteAudio();
      audioButton.children[0].innerHTML = "MUTE";
    } else {
      audioManager.muteAudio();
      audioButton.children[0].innerHTML = "UNMUTE";
    }
    audioButton.classList.toggle("bg-slate-900");
    audioButton.classList.toggle("bg-pink-600")
  });
} else {
  console.error("debug-control - not found");
}


gameStartEvent.addHandler("start_re-initialize-ui_objects",()=> {
  console.log("start_re-initialize-ui_objects called")

  startMenuElement.classList.add("hidden");
  if(gameSceneElement.classList.contains("hidden")) {
    gameSceneElement.classList.remove("hidden");
    gameSceneElement.classList.add("flex");
  }
  isGamePause = false;
  isGameOver = false;
  resizeCanvas();

  document.querySelectorAll(".player")[1].classList.toggle("hidden", isSolo);
  if(!isSolo) {
    UpdatePlayer2HartsUI(Player.maxLives);
  }
  UpdatePlayer1HartsUI(Player.maxLives);
});

document.getElementById("solo_button").addEventListener("click", () => {
  window.isSolo = true;
  gameStartEvent.trigger();
});
document.getElementById("multiplayer_button").addEventListener("click", () => {
  window.isSolo = false;
  gameStartEvent.trigger();
});
