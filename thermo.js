var txtWidth = document.getElementById("txtWidth");
var txtHeight = document.getElementById("txtHeight");
var btnReset = document.getElementById("btnReset");
var canvas = document.getElementById("canvas");
var labelTemperature = document.getElementById("labelTemperature");
var ctx = canvas.getContext("2d");
var tileWitdh = 16;
var tileHeight = 16;
var witdh = 1;
var height = 1;
var wArray = [0];
var hArray = [0];
function temperatureColor(temperature) {
    var L = 2;
    var K = 0.002;
    var factor = temperature > 0 ? (L / (1 + (Math.pow(Math.E, (-K * (temperature)))))) - L / 2 : 0;
    return "#" + (lerpColor(0x33224d, 0xfabb3e, factor).toString(16));
}
function lerpColor(a, b, amount) {
    var ar = a >> 16, ag = a >> 8 & 0xff, ab = a & 0xff, br = b >> 16, bg = b >> 8 & 0xff, bb = b & 0xff, rr = ar + amount * (br - ar), rg = ag + amount * (bg - ag), rb = ab + amount * (bb - ab);
    return (rr << 16) + (rg << 8) + (rb | 0);
}
function shuffle(array) {
    var _a;
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [array[j], array[i]], array[i] = _a[0], array[j] = _a[1];
    }
}
var Tile = (function () {
    function Tile(density, temperature, conductivity) {
        this.baseDensity = density;
        this.temperature = temperature;
        this.conductivity = conductivity;
    }
    Tile.prototype.getColor = function () {
        return temperatureColor(this.temperature);
    };
    Tile.prototype.clone = function () {
        return new Tile(this.baseDensity, this.temperature, this.conductivity);
    };
    return Tile;
}());
var world;
function generate() {
    world = [];
    for (var x = 0; x < witdh; x++) {
        world[x] = [];
        for (var y = 0; y < height; y++) {
            world[x][y] = new Tile(0.1, (Math.random() * 600), 0.008);
        }
    }
}
function tick() {
    var heatMap = [];
    var totalTemperature = 0;
    for (var x = 0; x < witdh; x++) {
        heatMap[x] = [];
        for (var y = 0; y < height; y++) {
            heatMap[x][y] = world[x][y].temperature;
        }
    }
    shuffle(wArray);
    shuffle(hArray);
    for (var iX = 0; iX < wArray.length; iX++) {
        for (var iY = 0; iY < hArray.length; iY++) {
            var x = wArray[iX];
            var y = hArray[iY];
            var directions = [];
            if (y > 0)
                directions.push({ heat: heatMap[x][y - 1], tile: world[x][y - 1], xOff: 0, yOff: -1 });
            if (y < height - 1)
                directions.push({ heat: heatMap[x][y + 1], tile: world[x][y + 1], xOff: 0, yOff: +1 });
            if (x > 0)
                directions.push({ heat: heatMap[x - 1][y], tile: world[x - 1][y], xOff: -1, yOff: 0 });
            if (x < witdh - 1)
                directions.push({ heat: heatMap[x + 1][y], tile: world[x + 1][y], xOff: +1, yOff: 0 });
            shuffle(directions);
            for (var i = 0; i < directions.length; i++) {
                var dir = directions[i];
                var totalConductivity = dir.tile.conductivity + world[x][y].conductivity;
                var factor = ((totalConductivity / 2) + Math.min(dir.tile.conductivity, world[x][y].conductivity)) / 2;
                var transferred = factor * (Math.abs(dir.heat - heatMap[x][y]));
                if (heatMap[x][y] > dir.heat) {
                    heatMap[x][y] -= transferred;
                    heatMap[x + dir.xOff][y + dir.yOff] += transferred;
                }
                else {
                    heatMap[x][y] += transferred;
                    heatMap[x + dir.xOff][y + dir.yOff] -= transferred;
                }
            }
        }
    }
    for (var x = 0; x < witdh; x++) {
        for (var y = 0; y < height; y++) {
            world[x][y].temperature = heatMap[x][y];
            totalTemperature += world[x][y].temperature;
        }
    }
    labelTemperature.innerHTML = "Average Temperature = " + (totalTemperature / (witdh * height)).toFixed(4) + " K";
}
function draw() {
    for (var x = 0; x < witdh; x++) {
        for (var y = 0; y < height; y++) {
            ctx.fillStyle = world[x][y].getColor();
            ctx.fillRect(x * tileWitdh, y * tileHeight, tileWitdh, tileHeight);
        }
    }
}
function reset() {
    witdh = Number(txtWidth.value.trim());
    height = Number(txtHeight.value.trim());
    wArray = [];
    hArray = [];
    for (var i = 0; i < witdh; i++)
        wArray[i] = i;
    for (var i = 0; i < height; i++)
        hArray[i] = i;
    canvas.height = tileHeight * height;
    canvas.width = tileWitdh * witdh;
    generate();
    draw();
}
btnReset.addEventListener("click", reset);
reset();
setInterval(function () {
    tick();
    draw();
}, 100);
//# sourceMappingURL=thermo.js.map