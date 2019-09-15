var txtWidth = document.getElementById("txtWidth");
var txtHeight = document.getElementById("txtHeight");
var btnReset = document.getElementById("btnReset");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var tileWitdh = 12;
var tileHeight = 12;
var witdh = 1;
var height = 1;
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
    function Tile(density, temperature, conductivity, x, y) {
        this.baseDensity = density;
        this.temperature = temperature;
        this.conductivity = conductivity;
        this.x = x;
        this.y = y;
    }
    Tile.prototype.getColor = function () {
        return temperatureColor(this.temperature);
    };
    Tile.prototype.clone = function () {
        return new Tile(this.baseDensity, this.temperature, this.conductivity, this.x, this.y);
    };
    return Tile;
}());
var world;
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
    temperatureTick();
    draw();
}, 100);
//# sourceMappingURL=thermo.js.map