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
function temperatureColor(temperature) {
    var L = 2;
    var K = 0.002;
    var factor = (L / (1 + (Math.pow(Math.E, (-K * (temperature)))))) - L / 2;
    return "#" + (lerpColor(0x33224d, 0xfabb3e, factor).toString(16));
}
function lerpColor(a, b, amount) {
    var ar = a >> 16, ag = a >> 8 & 0xff, ab = a & 0xff, br = b >> 16, bg = b >> 8 & 0xff, bb = b & 0xff, rr = ar + amount * (br - ar), rg = ag + amount * (bg - ag), rb = ab + amount * (bb - ab);
    return (rr << 16) + (rg << 8) + (rb | 0);
}
var Tile = (function () {
    function Tile(density, temperature, entropyRate) {
        this.baseDensity = density;
        this.temperature = temperature;
        this.entropyRate = entropyRate;
    }
    Tile.prototype.tick = function (worldResult, x, y) {
        var next = this.clone();
        var directions = [];
        if (y > 0)
            directions.push({ tile: world[x][y - 1], xOff: 0, yOff: -1 });
        if (y < height - 1)
            directions.push({ tile: world[x][y + 1], xOff: 0, yOff: +1 });
        if (x > 0)
            directions.push({ tile: world[x - 1][y], xOff: -1, yOff: 0 });
        if (x < witdh - 1)
            directions.push({ tile: world[x + 1][y], xOff: +1, yOff: 0 });
        for (var i = 0; i < directions.length; i++) {
            var dir = directions[i];
            if (this.temperature > dir.tile.temperature) {
                var transferred = ((dir.tile.entropyRate + this.entropyRate) / 2) * (this.temperature - dir.tile.temperature);
                world[x + dir.xOff][y + dir.yOff].temperature += transferred;
                world[x][y].temperature -= transferred;
            }
        }
    };
    Tile.prototype.getColor = function () {
        return temperatureColor(this.temperature);
    };
    Tile.prototype.clone = function () {
        return new Tile(this.baseDensity, this.temperature, this.entropyRate);
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
    var worldResult = [];
    var totalTemperature = 0;
    for (var x = 0; x < witdh; x++) {
        worldResult[x] = [];
        for (var y = 0; y < height; y++) {
            worldResult[x][y] = world[x][y].clone();
        }
    }
    for (var x = 0; x < witdh; x++) {
        for (var y = 0; y < height; y++) {
            world[x][y].tick(worldResult, x, y);
        }
    }
    for (var x = 0; x < witdh; x++) {
        for (var y = 0; y < height; y++) {
            totalTemperature += worldResult[x][y].temperature;
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