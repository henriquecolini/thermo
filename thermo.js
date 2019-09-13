var txtWidth = document.getElementById("txtWidth");
var txtHeight = document.getElementById("txtHeight");
var btnReset = document.getElementById("btnReset");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var tileWitdh = 16;
var tileHeight = 16;
var witdh = 1;
var height = 1;
var Tile = (function () {
    function Tile(color) {
        this.color = color;
    }
    return Tile;
}());
var world;
function generate() {
    world = [];
    for (var x = 0; x < witdh; x++) {
        world[x] = [];
        for (var y = 0; y < witdh; y++) {
            world[x][y] = new Tile("gray");
        }
    }
}
function draw() {
    for (var x = 0; x < witdh; x++) {
        for (var y = 0; y < witdh; y++) {
            ctx.fillStyle = world[x][y].color;
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