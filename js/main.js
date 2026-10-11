loadImages().then(function () {
    document.getElementById("play").disabled = false;
    document.getElementById("asset-status").hidden = true;
}). catch(function (error) {
    const status = document.getElementById("asset-status");
    status.textContent = error.message;
    status.hidden = false;
});