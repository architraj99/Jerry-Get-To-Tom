const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const images = {};

const spriteCrops = {
    platform: [25, 33, 450, 89],
    spikes: [5, 5, 110, 37]
};

const game = {
    status: "idle",
    time: 45,
    timerStartedAt: null,
    elapsedTime: 0,
    cameraX: 0,
    checkpoint: 0,
    invincible: 0,
    penaltyTime: 0,
    assetsReady: false,
    lastFrame: null,
    accumulator: 0,
    frameId: 0
};

const player = {
    x: level.start.x,
    y: level.start.y,
    width: 28,
    height: 58,
    vx: 0,
    vy: 0,
    facing: 1,
    grounded: false,
    coyoteTime: 0,
    jumpBuffer: 0
};

function loadImages() {
    const files = {
        background: "background.png",
        platform: "platform.png",
        paper: "manuscript-paper.png",
        jerry: "jerry.png",
        spikes: "spikes.png"
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
    game.checkpoint = 0;
    game.invincible = 0;
    game.penaltyTime = 0;
    game.lastFrame = null;
    game.accumulator = 0;

    player.x = level.start.x;
    player.y = level.start.y;
    player.vx = 0;
    player.vy = 0;
    player.facing = 1;
    player.grounded = true;
    player.coyoteTime = 0.1;
    player.jumpBuffer = 0;
    drawGame();
    game.frameId = requestAnimationFrame(gameFrame);
}

function startCountdown() {
    if (game.status === "playing" && game.timerStartedAt === null) {
        game.timerStartedAt = performance.now();
    }
}

function overlaps(first, second) {
    return first.x < second.x + second.width &&
    first.x + first.width > second.x && 
    first.y < second.y + second.height &&
    first.y + first.height > second.y;
}

function resetPlayer() {
    const checkpoint = level.checkpoints[game.checkpoint];

    player.x = checkpoint.x;
    player.y = checkpoint.y;
    player.vx = 0;
    player.vy = 0;
    player.grounded = true;
    player.coyoteTime = 0.1;
    player.jumpBuffer = 0;
    input.jumpQueued = false;
    game.time = Math.max(0, game.time - 3);
    game.invincible = 0.8;
    game.penaltyTime = 1;
    game.cameraX = Math.max(
        0,
        Math.min(level.width - canvas.width, player.x - 240)
    );

    if (game.time <= 0) {
        finishGame(false);
    }
}

function movePlayer(dt) {
    player.vx = 0;

    if (input.left && !input.right) {
        player.vx = -250;
        player.facing = -1;
    }

    if (input.right && !input.left) {
        player.vx = 250;
        player.facing = 1;
    }

    if (input.jumpQueued) {
        player.jumpBuffer = 0.12;
        input.jumpQueued = false;
    }

    if (player.grounded) {
        player.coyoteTime = 0.1;
    } else {
        player.coyoteTime = Math.max(0, player.coyoteTime - dt);
    }

    if (player.jumpBuffer > 0 && player.coyoteTime > 0) {
        player.vy = -660;
        player.grounded = false;
        player.coyoteTime = 0;
        player.jumpBuffer = 0;
    }

    player.jumpBuffer = Math.max(0, player.jumpBuffer - dt);
    player.x += player.vx * dt;
    player.x = Math.max(0, Math.min(level.width - player.width, player.x));

    for ( const platform of level.platforms) {
        if (!overlaps(player, platform)) {
            continue;
        }

        if (player.vx > 0) {
            player.x = platform.x - player.width;
        } else if (player.vx < 0) {
            player.x = platform.x + platform.width;
        }
    }

    const previousY = player.y;
    player.vy += 1750 * dt;
    player.y += player.vy * dt;
    player.grounded = false;

    for (const platform of level.platforms) {
        if (!overlaps(player, platform)) {
            continue;
        }

        if (
            player.vy >= 0 &&
            previousY + player.height <= platform.y + 1
        ) {
            player.y = platform.y - player.height;
            player.vy = 0;
            player.grounded = true;
        } else if (
            player.vy < 0 &&
            previousY >= platform.y + platform.height - 1
        ) {
            player.y = platform.y + platform.height;
            player.vy = 0;
        }
    }
}

function touchesSpikes() {
    for (const spikes of level.spikes) {
        const hitbox = {
            x: spikes.x + 7,
            y: spikes.y - spikes.height + 6,
            width: spikes.width - 14,
            height: spikes.height - 6
        };

        if (overlaps(player, hitbox)) {
            return true;
        }
    }

    return false;
}

function updateCheckpoint() {
    if (
        !player.grounded ||
        Math.abs(player.y + player.height - 460) > 1
    ) {
        return;
    }

    for (
        let index = game.checkpoint + 1;
        index < level.checkpoints.length;
        index += 1
    ) {
        if (player.x >= level.checkpoints[index].x) {
            game.checkpoint = index;
        }
    }
}

function updateGame(dt) {
    game.invincible = Math.max(0, game.invincible - dt);
    game.penaltyTime = Math.max(0, game.penaltyTime - dt);
    movePlayer(dt);

    if (
        player.y > level.height ||
        (game.invincible === 0 && touchesSpikes())
    ) {
        resetPlayer();
        return;
    }

    updateCheckpoint();
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
        } else {
            game.accumulator += Math.min(elapsed, 0.1);

            while (
                game.accumulator >= 1 / 120 && 
                game.status === "playing"
            ) {
                updateGame(1 / 120);
                game.accumulator -= 1 / 120;
            }
        }
    }

    drawGame();

    if (game.status === "playing") {
        game.frameId = requestAnimationFrame(gameFrame);
    }
}

function drawSprite(name, x, y, width, height) {
    const crop = spriteCrops[name];
    context.drawImage(
        images[name],
        crop[0],
        crop[1],
        crop[2],
        crop[3],
        x,
        y,
        width,
        height
    );
}

function drawPlatforms() {
    for (const platform of level.platforms) {
        const pieces = Math.ceil(platform.width / 450);
        const pieceWidth = platform.width / pieces;

        for (let index = 0; index < pieces; index += 1) {
            const x = platform.x + pieceWidth * index;
            drawSprite(
                "platform",
                x, 
                platform.y,
                pieceWidth + 1,
                pieceWidth * 89 / 450
            );  
        }
    }
}

function drawPlayer() {
    if (game.invincible > 0 && Math.floor(game.invincible * 14) % 2 === 0) {
        return;
    }

    const height = 72;
    const width = height * images.jerry.width / images.jerry.height;
    const centerX = player.x + player.width / 2;
    const bottom = player.y + player.height;
    context.save();
    context.translate(centerX, bottom);
    context.scale(player.facing, 1);
    context.imageSmoothingEnabled = true;
    context.drawImage(images.jerry, -width / 2, -height, width, height);
    context.imageSmoothingEnabled = false;

    context.restore();
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
    const ground = level.platforms.slice(0, 7);
    context.fillStyle = "#543e28";

    for (let index = 0; index < ground.length - 1; index += 1) {
        const start = ground[index].x + ground[index].width;
        const end = ground[index + 1].x;
        context.fillRect(start, 460, end - start, 80);
    }

    drawPlatforms();

    for (const spikes of level.spikes) {
        drawSprite(
            "spikes",
            spikes.x,
            spikes.y - spikes.height,
            spikes.width,
            spikes.height
        );
    }

    drawPlayer();
    context.restore();
}