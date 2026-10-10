const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const images = {};

const game = {
    status: "idle",
    time: 45,
    timerStartedAt: null,
    elapsedTime: 0,
    assetsReady: true,
    lastFrame: null,
    frameId: 0
};

function startGame() {
    if (!game.assetsReady) {
        return;
    }

    cancelAnimationFrame(game.frameId);
    clearInput();
    game.status = "playing";
    game.time = 45;
    game.timerStartedAt = null;
    game.elapsedTime = 0;
    game.lastFrame = null;

    game.frameId = requestAnimationFrame(gameFrame);
}

function startCountdown() {
    if (game.status === "playing" && game.timerStartedAt === null) {
        game.timerStartedAt = performance.now();
    }
}

function finishGame(won) {
    game.status = "finished";
    clearInput();
}

function gameFrame(timestamp) {
    if (game.lastFrame === null) {
        game.lastFrame = timestamp;
    }

    const elapsed = Math.max(0, (timestamp - game.lastFrame) / 1000);
    game.lastFrame = timestamp;

    if (game.status === "playing") {
        if (game.timerStartedAt !== null) {
            const countdownElapsed = Math.min(
                elapsed,
                Math.max(0, (timestamp - game.timerStartedAt) / 1000)
            );
            game.time = Math.max(0, game.time - countdownElapsed);
            game.elapsedTime += countdownElapsed;
        }

        if (game.time === 0) {
            finishGame(false);
        }
    }

    if (game.status === "playing") {
        game.frameId = requestAnimationFrame(gameFrame);
    }
}