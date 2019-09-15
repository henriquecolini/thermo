var txtWidth = document.getElementById("txtWidth");
var txtHeight = document.getElementById("txtHeight");
var btnReset = document.getElementById("btnReset");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var preCanvas = document.createElement("canvas");
var preCtx = preCanvas.getContext("2d");
var tileWitdh = 12;
var tileHeight = 12;
var witdh = 1;
var height = 1;
var world;
var camera = { x: 0, y: 0, zoom: 1 };
function generate() {
    world = [];
    for (var x = 0; x < witdh; x++) {
        world[x] = [];
        for (var y = 0; y < height; y++) {
            world[x][y] = new Tile(0.1, (Math.random() * 600), 0.02, x, y);
        }
    }
}
function temperatureTick() {
    var arr = [];
    for (var x = 0; x < witdh; x++) {
        for (var y = 0; y < height; y++) {
            arr.push(world[x][y]);
        }
    }
    arr.sort(function (a, b) {
        return a.temperature - b.temperature;
    });
    for (var i = 0; i < arr.length; i++) {
        var t = arr[i];
        var x = t.x;
        var y = t.y;
        var directions = [];
        if (y > 0 && t.temperature > world[x][y - 1].temperature)
            directions.push({ tile: world[x][y - 1], xOff: 0, yOff: -1 });
        if (y < height - 1 && t.temperature > world[x][y + 1].temperature)
            directions.push({ tile: world[x][y + 1], xOff: 0, yOff: +1 });
        if (x > 0 && t.temperature > world[x - 1][y].temperature)
            directions.push({ tile: world[x - 1][y], xOff: -1, yOff: 0 });
        if (x < witdh - 1 && t.temperature > world[x + 1][y].temperature)
            directions.push({ tile: world[x + 1][y], xOff: +1, yOff: 0 });
        var originalTemp = t.temperature;
        var sharedTemp = (t.temperature * t.conductivity) / (directions.length + 1);
        for (var i_1 = 0; i_1 < directions.length; i_1++) {
            var dir = directions[i_1];
            var diff = originalTemp - dir.tile.temperature;
            var gained = sharedTemp * (diff / originalTemp);
            dir.tile.temperature += gained;
            t.temperature -= gained;
        }
    }
}
function drawWorld() {
    for (var x = 0; x < witdh; x++) {
        for (var y = 0; y < height; y++) {
            preCtx.fillStyle = world[x][y].getColor();
            preCtx.fillRect(x * tileWitdh, y * tileHeight, tileWitdh, tileHeight);
        }
    }
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(preCanvas, camera.x - (preCanvas.width / 2), camera.y - (preCanvas.height / 2));
}
function reset() {
    witdh = Number(txtWidth.value.trim());
    height = Number(txtHeight.value.trim());
    preCanvas.height = tileHeight * height;
    preCanvas.width = tileWitdh * witdh;
    generate();
    drawWorld();
    draw();
}
function updateCanvasSize() {
    canvas.height = document.documentElement.clientHeight;
    canvas.width = document.documentElement.clientWidth;
}
function startDragging() {
    document.body.classList.add("dragging");
}
function stopDragging() {
    document.body.classList.remove("dragging");
}
updateCanvasSize();
camera.x = canvas.width / 2;
camera.y = canvas.height / 2;
reset();
setInterval(function () {
    temperatureTick();
    drawWorld();
}, 100);
setInterval(function () {
    draw();
}, 1000 / 30);
btnReset.addEventListener("click", reset);
window.addEventListener("resize", updateCanvasSize);
window.addEventListener("keydown", function (evt) { if (evt.key === " ")
    startDragging(); });
window.addEventListener("keyup", function (evt) { if (evt.key === " ")
    stopDragging(); });
//# sourceMappingURL=thermo.js.map