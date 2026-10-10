function showScreen(name) {
  document.getElementById("story-screen").hidden = name !== "story";
  document.getElementById("instructions-screen").hidden = name !== "instructions";
}

function showInstructions() {
  showScreen("instructions");
  document.getElementById("instructions-title").focus();
}

document.getElementById("accept").addEventListener("click", showInstructions);