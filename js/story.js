function showScreen(name) {
  document.getElementById("story-screen").hidden = name !== "story";
  document.getElementById("instructions-screen").hidden = name !== "instructions";
  document.getElementById("game-view").hidden = name === "story" || name === "instructions";
  document.body.classList.toggle("playing", name === "game");
}

function showInstructions() {
  showScreen("instructions");
  document.getElementById("instructions-title").focus();
}

function playFromButton() {
  if (!game.assetsReady) {
    return;
  }

  enterFullscreen();
  showScreen("game");
  resizeGame();
  startGame();
  canvas.focus();
}

document.getElementById("accept").addEventListener("click", showInstructions);
document.getElementById("play").addEventListener("click", playFromButton);