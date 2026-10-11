const input = {
    left: false,
    right: false,
    jumpQueued: false
};

const heldKeys = new Set();
const heldPointers = new Map();
const moveKeys = ["ArrowLeft", "ArrowRight", "KeyA", "KeyD"];
const jumpKeys = ["ArrowUp", "KeyW", "Space"];

function updateHeldInput() {
    const touches = Array.from(heldPointers.values());
    input.left = 
      heldKeys.has("ArrowLeft") ||
      heldKeys.has("KeyA") || 
      touches.includes("left");
    input.right =
      heldKeys.has("ArrowRight") ||
      heldKeys.has("KeyD") ||
      touches.includes("right");

    document.querySelectorAll("[data-control").forEach(function (button) {
        button.classList.toggle("held", touches.includes(button.dataset.control));
    });
}

function clearInput() {
    heldKeys.clear();
    heldPointers.clear();
    input.jumpQueued = false;
    updateHeldInput();
}

function useTouchControls(enabled) {
    document.body.classList.toggle("touch-input", enabled);
    document.dispatchEvent(new Event("inputchange") );
}

window.addEventListener("keydown", function (event) {
    if (!document.body.classList.contains("playing")) {
        return;
    }

    if(
        !moveKeys.includes(event.code) && 
        !jumpKeys.includes(event.code)
    ) {
        return;
    }

    event.preventDefault();
    startCountdown();
    heldKeys.add(event.code);

    if (jumpKeys.includes(event.code) && !event.repeat) {
        input.jumpQueued = true;
    }

    useTouchControls(false);
    updateHeldInput();
});

window.addEventListener("keyup", function (event) {
    heldKeys.delete(event.code);
    updateHeldInput();
});

document.querySelectorAll("[data-control]").forEach(function (button) {
    button.addEventListener("pointerdown", function (event) {
        event.preventDefault();
        startCountdown();
        button.setPointerCapture(event.pointerId);
        heldPointers.set(event.pointerId, button.dataset.control);

        if (button.dataset.control === "jump") {
            input.jumpQueued = true;
        }

        updateHeldInput();
    });

    function releasePointer(event) {
        heldPointers.delete(event.pointerId);
        updateHeldInput();
    }

    button.addEventListener("pointerup", releasePointer);
    button.addEventListener("pointercancel", releasePointer);
    button.addEventListener("lostpointercapture", releasePointer);
    button.addEventListener("contextmenu", function (event) {
        event.preventDefault();
    });
});

document.addEventListener("pointerdown", function (event) {
    if (event.pointerType === "touch") {
        useTouchControls(true);
    }
});

window.addEventListener("blur", clearInput);
document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
        clearInput();
    }
});

useTouchControls(window.matchMedia("(pointer: coarse)").matches);