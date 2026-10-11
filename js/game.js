const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const images = {};

const game = {
    status: "idle",
    time: 45,
    timerStartedAt: null,
    elapsedTime: 0,
    cameraX: 0,
    assetsReady: false,
    lastFrame: null,
    frameId: 0
};

function loadImages() {
    const files = {
        background: "background.png",
        paper: "manuscript-paper.png"
    };

    const loading = Object.keys(files).map(function (name) {
        return new Promise(function (resolve, reject) {
            const image = new Image();
            image.onload = function () {
                images[name] = image;
                resolve();
            };
            image.onerror = function () {
                reject(new Error("Missing image: assets/" + files[name]));
            };
            image.src = "assets/" + files[name];
        });
    });

    return Promise.all(loading).then(function () {
        game.assetsReady = true;
        context.imageSmoothingEnabled = false;
        drawGame();
    });
}

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
    game.cameraX = 0;
    game.lastFrame = null;

    drawGame();
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

    drawGame();

    if (game.status === "playing") {
        game.frameId = requestAnimationFrame(gameFrame);
    }
}

function drawGame() {
    if (!game.assetsReady) {
        return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    const backgroundX = -(game.cameraX * 0.16) % canvas.width;
    context.drawImage(
        images.background,
        backgroundX,
        0,
        canvas.width,
        canvas.height
    );
    context.drawImage(
        images.background,
        backgroundX + canvas.width,
        0,
        canvas.width,
        canvas.height
    );
    context.save();
    context.translate(-Math.round(game.cameraX), 0);

    context.restore();
}