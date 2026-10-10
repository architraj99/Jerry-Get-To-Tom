function enterFullscreen() {
    if (document.fullscreenElement || !document.documentElement.requestFullscreen) {
        return;
    }

    try {
        const request = document.documentElement.requestFullscreen();

        if (request && request.catch) {
            request.catch(function () {
                resizeGame();
            });
        }
    }
    catch (error) {
        resizeGame();
    }
}

function resizeGame() {
    const controls = document.getElementById("touch-controls");
    const controlsHeight = controls.getBoundingClientRect().height;
    const availableWidth = document.documentElement.clientWidth;
    const availableHeight = window.innerHeight - controlsHeight;
    const width = Math.min(availableWidth, availableWidth * 16 / 9);

    document.getElementById("game-stage").style.width = Math.max(1, width) + "px";
}

window.addEventListener("resize", resizeGame);
document.addEventListener("fullscreenchange", resizeGame);
document.addEventListener("inputchange", resizeGame);