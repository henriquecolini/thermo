;
var TileDefManager = (function () {
    function TileDefManager() {
        this.defs = TileDefManager.defaultDefs;
    }
    TileDefManager.prototype.loadJSON = function (json) {
        var jsonDefs = JSON.parse(json);
        this.defs = [];
        for (var i = 0; i < jsonDefs.length; i++) {
            var jdef = jsonDefs[i];
            jdef.color = color(jdef.color);
            this.defs.push(jdef);
        }
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
        { name: "Air", id: "air", color: color(0xcfcfcf), density: 1, baseTemperature: 293, conductivity: 0.1, viscosity: 0 },
        { name: "Wall", id: "wall", color: color(0x5c5955), density: Infinity, baseTemperature: 293, conductivity: 0, static: true }
    ];
    return TileDefManager;
}());
//# sourceMappingURL=tileDef.js.map