function temperatureColor(temperature) {
    var L = 2;
    var K = 0.002;
    var factor = temperature > 0 ? (L / (1 + (Math.pow(Math.E, (-K * (temperature)))))) - L / 2 : 0;
    var lerped = lerpColor(color(0x33224d), color(0xfabb3e), factor);
    return lerped;
}
function lerpColor(a, b, amount) {
    var rr = a.R + amount * (b.R - a.R), rg = a.G + amount * (b.G - a.G), rb = a.B + amount * (b.B - a.B);
    return { R: rr, G: rg, B: rb };
}
var Tile = (function () {
    function Tile(tileDef) {
        this.justChanged = false;
        this.def = tileDef;
        this.temperature = this.def.baseTemperature;
    }
    Tile.prototype.getThermalColor = function () {
        return temperatureColor(this.temperature);
    };
    Tile.prototype.clone = function () {
        return new Tile(this.def);
    };
    Tile.prototype.canPenetrate = function (other) {
        return (other && true) && (!other.def.static) && (this.def.density > other.def.density) && (!other.justChanged);
    };
    return Tile;
}());
//# sourceMappingURL=tile.js.map