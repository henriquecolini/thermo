var txtWidth = document.getElementById("txtWidth");
var txtHeight = document.getElementById("txtHeight");
var btnReset = document.getElementById("btnReset");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var tileWitdh = 16;
var tileHeight = 16;
var witdh = 1;
var height = 1;
function temperatureColor(temperature) {
    var L = 1;
    var K = 0.004;
    var factor = (L / (1 + (Math.pow(Math.E, (-K * (temperature)))))) - L / 2;
    return "#" + (lerpColor(0x33224d, 0xfabb3e, factor).toString(16));
}
function lerpColor(a, b, amount) {
    var ar = a >> 16, ag = a >> 8 & 0xff, ab = a & 0xff, br = b >> 16, bg = b >> 8 & 0xff, bb = b & 0xff, rr = ar + amount * (br - ar), rg = ag + amount * (bg - ag), rb = ab + amount * (bb - ab);
    return (rr << 16) + (rg << 8) + (rb | 0);
}
var Tile = (function () {
    function Tile(density, temperature) {
        this.baseDensity = density;
        this.temperature = temperature;
    }
    Tile.prototype.getColor = function () {
        return temperatureColor(this.temperature);
    };
    return Tile;
}());
var world;
function generate() {
    world = [];
    for (var x = 0; x < witdh; x++) {
        world[x] = [];
        for (var y = 0; y < witdh; y++) {
            world[x][y] = new Tile(0.1, (Math.random() * 800));
        }
    }
}
function draw() {
    for (var x = 0; x < witdh; x++) {
        for (var y = 0; y < witdh; y++) {
            ctx.fillStyle = world[x][y].getColor();
            ctx.fillRect(x * tileWitdh, y * tileHeight, tileWitdh, tileHeight);
        }
    }
}
btnReset.addEventListener("click", function () {
    witdh = Number(txtWidth.value.trim());
    height = Number(txtHeight.value.trim());
    canvas.height = tileHeight * height;
    canvas.width = tileWitdh * witdh;
    generate();
    draw();
});
generate();
//# sourceMappingURL=thermo.js.map