var txtWidth = document.getElementById("txtWidth");
var txtHeight = document.getElementById("txtHeight");
var btnReset = document.getElementById("btnReset");
var toggleThermal = document.getElementById("toggleThermal");
var canvas = document.getElementById("canvas");
var elementsPanel = document.getElementById("elements");
var tileDefs = new TileDefManager();
var world = new World();
var ctx = canvas.getContext("2d");
var preCanvas = document.createElement("canvas");
var preCtx = preCanvas.getContext("2d");
var imageData = preCtx.createImageData(1, 1);
var tileWidth = 10;
var tileHeight = 10;
var canPan = false;
var isPanning = false;
var lastPos = { x: undefined, y: undefined };
var camera = { x: 0, y: 0, zoom: 1 };
var isMouseDown = false;
var selectedDef = tileDefs.getById("wall");
var thermalView = false;
function drawWorld() {
    for (var x = 0; x < world.getWidth(); x++) {
        for (var y = 0; y < world.getHeight(); y++) {
            var c = thermalView ? world.getTile(x, y).getThermalColor() : world.getTile(x, y).def.color;
            var pI = ((y * world.getWidth()) + x) * 4;
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
    ctx.drawImage(preCanvas, camera.x - (tileWidth * camera.zoom * (world.getWidth() / 2)), camera.y - (tileHeight * camera.zoom * (world.getHeight() / 2)), tileWidth * world.getWidth() * camera.zoom, tileHeight * world.getHeight() * camera.zoom);
}
function resetWorld() {
    var width = Number(txtWidth.value.trim());
    var height = Number(txtHeight.value.trim());
    preCanvas.height = height;
    preCanvas.width = width;
    imageData = preCtx.createImageData(width, height);
    world.generate(width, height);
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
function placeTile(x, y, redraw) {
    if (redraw === void 0) { redraw = true; }
    world.setTile(x, y, new Tile(selectedDef));
    if (redraw) {
        drawWorld();
        draw();
    }
}
function placeTileAtMouse(mouseX, mouseY) {
    var coords = mouseToTileCoords(mouseX, mouseY);
    if (coords) {
        var x = coords.x, y = coords.y;
        placeTile(x, y);
    }
}
function placeTileLine(mouseX0, mouseY0, mouseX1, mouseY1) {
    var c0 = mouseToTileCoords(mouseX0, mouseY0);
    var c1 = mouseToTileCoords(mouseX1, mouseY1);
    if (c0 && c1) {
        var x0 = c0.x;
        var y0 = c0.y;
        var x1 = c1.x;
        var y1 = c1.y;
        var dx = Math.abs(x1 - x0);
        var dy = Math.abs(y1 - y0);
        var sx = (x0 < x1) ? 1 : -1;
        var sy = (y0 < y1) ? 1 : -1;
        var err = dx - dy;
        while (true) {
            placeTile(x0, y0, false);
            if ((x0 === x1) && (y0 === y1))
                break;
            var e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
    }
    drawWorld();
    draw();
}
function mouseToTileCoords(mouseX, mouseY) {
    var gridW = tileWidth * world.getWidth() * camera.zoom;
    var gridH = tileHeight * world.getHeight() * camera.zoom;
    var worldX = mouseX - camera.x;
    var worldY = mouseY - camera.y;
    if (worldX > -gridW / 2 && worldX < gridW / 2 &&
        worldY > -gridH / 2 && worldY < gridH / 2) {
        return {
            x: Math.floor(((worldX + gridW / 2) / gridW) * world.getWidth()),
            y: Math.floor(((worldY + gridH / 2) / gridH) * world.getHeight())
        };
    }
    return undefined;
}
function handleMouseDown(evt) {
    isMouseDown = true;
    if (evt.button == 1)
        allowPanning();
    if (evt.button == 0 && isMouseDown && !isPanning && !canPan)
        placeTileAtMouse(evt.x, evt.y);
    startPanning();
}
function handleMouseUp(evt) {
    isMouseDown = false;
    if (evt.button == 1)
        disallowPanning();
    stopPanning();
}
function handleMouseMove(evt) {
    if (lastPos.x === undefined || lastPos.y === undefined) {
        lastPos.x = evt.x;
        lastPos.y = evt.y;
    }
    if (isPanning)
        pan(evt.x - lastPos.x, evt.y - lastPos.y);
    if (isMouseDown && !isPanning) {
        placeTileLine(evt.x, evt.y, lastPos.x, lastPos.y);
    }
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
function loadDefs(callback) {
    var request = new XMLHttpRequest();
    var url = "elements.json";
    request.open("GET", url);
    request.send();
    request.onreadystatechange = function (ev) {
        if (request.readyState == 4) {
            var success = request.status == 200;
            if (success) {
                tileDefs.loadJSON(request.responseText);
                while (elementsPanel.lastChild) {
                    elementsPanel.removeChild(elementsPanel.lastChild);
                }
                var lastSelected_1;
                var _loop_1 = function (i) {
                    var def = tileDefs.defs[i];
                    var elementSpan = document.createElement("span");
                    var textNode = document.createTextNode(def.name);
                    elementSpan.appendChild(textNode);
                    elementSpan.className = "element";
                    elementSpan.style.background = colorToHex(def.color);
                    if (((def.color.R + def.color.G + def.color.B) / 3) < (0xff / 2)) {
                        elementSpan.classList.add("dark");
                    }
                    if (tileDefs.defaultSelected === def) {
                        selectedDef = def;
                        lastSelected_1 = elementSpan;
                        elementSpan.classList.add("selected");
                    }
                    elementSpan.addEventListener("click", function () {
                        selectedDef = def;
                        if (lastSelected_1) {
                            lastSelected_1.classList.remove("selected");
                        }
                        elementSpan.classList.add("selected");
                        lastSelected_1 = elementSpan;
                    });
                    elementsPanel.appendChild(elementSpan);
                };
                for (var i = 0; i < tileDefs.defs.length; i++) {
                    _loop_1(i);
                }
            }
            callback(success, request.responseText);
        }
    };
}
updateCanvasSize();
camera.x = canvas.width / 2;
camera.y = canvas.height / 2;
loadDefs(function (success, data) {
    if (success) {
        console.log("Successfully loaded tile definitions.");
        console.log(tileDefs.defs);
        resetWorld();
        setInterval(function () {
            world.tick();
            drawWorld();
            draw();
        }, 100);
    }
    else {
        console.error("Failed loading tile definitions!");
    }
});
btnReset.addEventListener("click", resetWorld);
txtHeight.addEventListener("keydown", function (evt) { if (evt.key === "Enter")
    resetWorld(); });
txtWidth.addEventListener("keydown", function (evt) { if (evt.key === "Enter")
    resetWorld(); });
toggleThermal.addEventListener("click", function (evt) { thermalView = !thermalView; });
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