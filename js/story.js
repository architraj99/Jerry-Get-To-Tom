function showScreen(name) {
  document.getElementById("story-screen").hidden = name !== "story";
  document.getElementById("instructions-screen").hidden = name !== "instructions";
  document.getElementById("result-screen").hidden = name !== "result";
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
  prepareAudio();
  showScreen("game");
  resizeGame();
  startGame();
  canvas.focus();
}

function showResult(event) {
  const result = event.detail;
  const title = document.getElementById("result-title");
  const message = document.getElementById("result-message");
  const reward = document.getElementById("reward");
  const finalTime = document.getElementById("final-time");
  const retry = document.getElementById("retry");
  document.getElementById("fail-tom").hidden = result.won;

  if (result.won) {
    title.textContent = "THANKS JERRY!";
    message.textContent = "YOU HELPED TOM LIVE.";
    reward.hidden =false;
    finalTime.hidden = false;
    finalTime.textContent = "TIME TAKEN: " + result.elapsedTime.toFixed(1) + "SECONDS";
    retry.textContent = "PLAY AGAIN";
  }
  else {
    title.textContent = "TOO LATE...";
    message.textContent = "TOM STILL NEEDS YOU.";
    reward.hidden = true;
    finalTime.hidden = true;
    retry.textContent = "TRY AGAIN";
  }

  showScreen("result");
  title.focus();
}

function goHome() {
  cancelAnimationFrame(game.frameId);
  game.status = "idle";
  clearInput();
  showScreen("story");
  document.getElementById("story-title").focus();
}

document.getElementById("accept").addEventListener("click", showInstructions);
document.getElementById("play").addEventListener("click", playFromButton);
document.getElementById("retry").addEventListener("click", playFromButton);
document.getElementById("home").addEventListener("click", goHome);
document.addEventListener("gameresult", showResult);