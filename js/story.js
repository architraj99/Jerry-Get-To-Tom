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

  prepareAudio();
  showScreen("game");
  startGame();
  canvas.focus();
}

function showResult(event) {
  const result = event.detail;
  showRescueRecord(result);
  const title = document.getElementById("result-title");
  const message = document.getElementById("result-message");
  const reward = document.getElementById("reward");
  const finalTime = document.getElementById("final-time");
  const retry = document.getElementById("retry");
  document.getElementById("fail-tom").hidden = result.won;
  document.getElementById("run-stats").textContent = "CHEESE: " + result.cheese + "/" + level.cheese.length +
  " JUMPS: " + result.jumps +
  " RESETS: " + result.deaths +
  " BONUS: +" + result.bonusSeconds + "s";

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

function togglePause() {
  if (game.status === "paused") {
    game.status = game.pausedFrom;
    game.lastFrame = null;
    game.accumulator = 0;
    clearInput();
    document.getElementById("pause-panel").hidden = true;

    if (audioContext && !game.muted) {
      audioContext.resume().catch(function () {});
    }

    game.frameId = requestAnimationFrame(gameFrame);
    canvas.focus();
  }

  else if (game.status === "playing" || game.status === "healing") {
    game.pausedFrom = game.status;
    game.status = "paused";

    cancelAnimationFrame(game.frameId);
    clearInput();

    document.getElementById("pause-panel").hidden = false;

    if (audioContext) {
      audioContext.suspend().catch(function () {});
    }
    document.getElementById("resume").focus();
  }
}

function toggleSound() {
  game.muted = !game.muted;

  document.getElementById("sound").textContent = game.muted ? "SOUND OFF" : "SOUND ON";

  if (!audioContext) {
    return;
  }

  if (game.muted) {
    audioContext.suspend().catch(function () {});
  }
  else if (game.status !== "paused") {
    audioContext.resume().catch(function () {});
  }
}

document.getElementById("pause").addEventListener("click", togglePause);
document.getElementById("resume").addEventListener("click", togglePause);
document.getElementById("sound").addEventListener("click", toggleSound);

function rescueMedal(result) {
  if (result.elapsedTime <= 20 && result.cheese >= 2 && result.deaths === 0) {
    return "GOLD";
  }

  if (result.elapsedTime <= 28 && result.cheese >= 1 && result.deaths <=3) {
    return "SILVER";
  }

  return "BRONZE";
}

function readBest () {
  try {
    const saved = localStorage.getItem("jerry-rescue-best");

    if (saved === null) {
      return null;
    }

    const time = Number(saved);

    if (Number.isFinite(time) && time > 0) {
      return time;
    }
  }
  catch (error) {
    return null;
  }
  return null;
}

function saveBest(result) {
  const best = readBest();

  if (!result.won || !Number.isFinite(result.elapsedTime) || result.elapsedTime <= 0) {
    return false;
  }

  if (best !== null && result.elapsedTime >= best) {
    return false;
  }

  try {
    localStorage.setItem(
      "jerry-rescue-best",
      String(result.elapsedTime)
    );

    return true;
  }

  catch (error) {
    return false;
  }
}

function showRescueRecord(result) {
  const improved = saveBest(result);
  const best = readBest();
  const label = document.getElementById("rescue-record");

  let text = result.won ? rescueMedal(result) + " RESCUE" : "";

  if ( best !== null) {
    if (text) {
      text += " · ";
    }

    text += "BEST " + best.toFixed(1) + "s";
  }

  if (improved) {
    text += " · NEW BEST";
  }

  label.textContent = text;
  label.hidden = text === "";
}