function temperatureColor(temperature) {
    var L = 2;
    var K = 0.002;
    var factor = temperature > 0 ? (L / (1 + (Math.pow(Math.E, (-K * (temperature)))))) - L / 2 : 0;
    var lerped = lerpColor(0x33224d, 0xfabb3e, factor);
    return { R: lerped >> 16, G: lerped >> 8 & 0xff, B: lerped & 0xff };
}
function lerpColor(a, b, amount) {
    var ar = a >> 16, ag = a >> 8 & 0xff, ab = a & 0xff, br = b >> 16, bg = b >> 8 & 0xff, bb = b & 0xff, rr = ar + amount * (br - ar), rg = ag + amount * (bg - ag), rb = ab + amount * (bb - ab);
    return (rr << 16) + (rg << 8) + (rb | 0);
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
//# sourceMappingURL=tile.js.map