;
var TileDefManager = (function () {
    function TileDefManager() {
        this.defs = TileDefManager.defaultDefs;
    }
    TileDefManager.prototype.loadJSON = function (json) {
        this.defs = JSON.parse(json);
        for (var i = 0; i < TileDefManager.defaultDefs.length; i++) {
            var def = TileDefManager.defaultDefs[i];
            if (!this.getById(def.id)) {
                this.defs.push(def);
            }
        }
    };
    TileDefManager.prototype.getById = function (id) {
        for (var i = 0; i < this.defs.length; i++) {
            var def = this.defs[i];
            if (def.id === id)
                return def;
        }
        return undefined;
    };
    TileDefManager.defaultDefs = [
        { name: "Air", id: "air", color: "cfcfcf", density: 1, baseTemperature: 293, conductivity: 0.3, viscosity: 0 },
        { name: "Wall", id: "wall", color: "5c5955", density: Infinity, baseTemperature: 293, conductivity: 0, static: true }
    ];
    return TileDefManager;
}());
//# sourceMappingURL=tileDef.js.map