var txtWidth = document.getElementById("txtWidth");
var txtHeight = document.getElementById("txtHeight");
var btnReset = document.getElementById("btnReset");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var preCanvas = document.createElement("canvas");
var preCtx = preCanvas.getContext("2d");
var imageData = preCtx.createImageData(1, 1);
var tileWidth = 12;
var tileHeight = 12;
var width = 1;
var height = 1;
var world;
var canPan = false;
var isPanning = false;
var lastPos = { x: undefined, y: undefined };
var camera = { x: 0, y: 0, zoom: 1 };
function generate() {
    world = [];
    for (var x = 0; x < width; x++) {
        world[x] = [];
        for (var y = 0; y < height; y++) {
            world[x][y] = new Tile(0.1, (Math.random() * 600), 0.02, x, y);
        }
    }
}
function temperatureTick() {
    var arr = [];
    for (var x = 0; x < width; x++) {
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
        if (x < width - 1 && t.temperature > world[x + 1][y].temperature)
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
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            var c = world[x][y].getColor();
            var pI = ((y * width) + x) * 4;
            imageData.data[pI] = c.R;
            imageData.data[pI + 1] = c.G;
            imageData.data[pI + 2] = c.B;
            imageData.data[pI + 3] = 255;
        }
    }
    preCtx.putImageData(imageData, 0, 0);
}
function draw() {
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.shadowColor = "rgba(0,0,0,0.1)";
    ctx.shadowBlur = 10;
    ctx.drawImage(preCanvas, camera.x - (tileWidth * camera.zoom * (width / 2)), camera.y - (tileHeight * camera.zoom * (height / 2)), tileWidth * width * camera.zoom, tileHeight * height * camera.zoom);
}
function reset() {
    width = Number(txtWidth.value.trim());
    height = Number(txtHeight.value.trim());
    preCanvas.height = height;
    preCanvas.width = width;
    imageData = preCtx.createImageData(width, height);
    generate();
    drawWorld();
    draw();
}
function updateCanvasSize() {
    canvas.height = document.documentElement.clientHeight;
    canvas.width = document.documentElement.clientWidth;
    draw();
}
function allowPanning() {
    canvas.classList.add("canDrag");
    canPan = true;
}
function disallowPanning() {
    canvas.classList.remove("canDrag");
    canPan = false;
}
function startPanning() {
    isPanning = canPan;
    if (isPanning)
        canvas.classList.add("dragging");
}
function stopPanning() {
    canvas.classList.remove("dragging");
    isPanning = false;
}
function pan(deltaX, deltaY) {
    camera.x += deltaX;
    camera.y += deltaY;
    draw();
}
function handleMouseDown() {
    startPanning();
}
function handleMouseUp() {
    stopPanning();
}
function handleMouseMove(evt) {
    if (lastPos.x === undefined || lastPos.y === undefined) {
        lastPos.x = evt.x;
        lastPos.y = evt.y;
    }
    if (isPanning)
        pan(evt.x - lastPos.x, evt.y - lastPos.y);
    lastPos.x = evt.x;
    lastPos.y = evt.y;
}
var scrollHandler;
function handleScroll(evt) {
    evt.preventDefault();
    var sign = evt.deltaY > 0 ? -1 : evt.deltaY == 0 ? 0 : 1;
    var times = 5;
    var i = 0;
    clearInterval(scrollHandler);
    scrollHandler = setInterval(function () {
        if (i >= times)
            clearInterval(scrollHandler);
        else {
            camera.zoom *= sign > 0 ? 1.01 : 1 / 1.01;
            draw();
            i++;
        }
    }, 1);
}
updateCanvasSize();
camera.x = canvas.width / 2;
camera.y = canvas.height / 2;
reset();
setInterval(function () {
    temperatureTick();
    drawWorld();
    draw();
}, 100);
btnReset.addEventListener("click", reset);
txtHeight.addEventListener("keydown", function (evt) { if (evt.key === "Enter")
    reset(); });
txtWidth.addEventListener("keydown", function (evt) { if (evt.key === "Enter")
    reset(); });
window.addEventListener("resize", updateCanvasSize);
window.addEventListener("keydown", function (evt) { if (evt.key === " ")
    allowPanning(); });
window.addEventListener("keyup", function (evt) { if (evt.key === " ")
    disallowPanning(); });
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mouseup", handleMouseUp);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("wheel", handleScroll);
//# sourceMappingURL=thermo.js.map