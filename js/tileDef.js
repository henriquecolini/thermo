;
var TileDefManager = (function () {
    function TileDefManager() {
        this.defs = TileDefManager.defaultDefs;
        this.resetCache();
    }
    TileDefManager.prototype.loadJSON = function (json) {
        var jsonDefs = JSON.parse(json);
        this.defs = [];
        for (var i = 0; i < jsonDefs.length; i++) {
            var jdef = jsonDefs[i];
            jdef.color = color(jdef.color);
            var def = jdef;
            this.defs.push(def);
            if (def.defaultSelected)
                this.defaultSelected = def;
        }
        for (var i = 0; i < TileDefManager.defaultDefs.length; i++) {
            var def = TileDefManager.defaultDefs[i];
            if (!this.getById(def.id, true)) {
                this.defs.unshift(def);
            }
        }
        this.resetCache();
    };
    TileDefManager.prototype.getById = function (id, ignoreCache) {
        if (ignoreCache === void 0) { ignoreCache = false; }
        if (!ignoreCache) {
            return this.cache[id];
        }
        else {
            for (var i = 0; i < this.defs.length; i++) {
                var def = this.defs[i];
                if (def.id === id)
                    return def;
            }
        }
        return undefined;
    };
    TileDefManager.prototype.resetCache = function () {
        this.cache = {};
        for (var i = 0; i < this.defs.length; i++) {
            var def = this.defs[i];
            this.cache[def.id] = def;
        }
    };
    TileDefManager.defaultDefs = [
        { name: "Wall", id: "wall", color: color(0x5c5955), density: Infinity, baseTemperature: 293, conductivity: 0, static: true, defaultSelected: true },
        { name: "Air", id: "air", color: color(0xcfcfcf), density: 1, baseTemperature: 293, conductivity: 0.1, viscosity: 0, solubility: 0.125 }
    ];
    return TileDefManager;
}());
//# sourceMappingURL=tileDef.js.map