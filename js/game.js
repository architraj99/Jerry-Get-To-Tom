const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const images = {};

const game = {
    status: "idle",
    assetsReady: true
};

function startGame() {
    if (!game.assetsReady) {
        return;
    }

    game.status = "playing";
    
}