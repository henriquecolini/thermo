var StructureManager = (function () {
    function StructureManager() {
        this.structures = [];
        this.resetCache();
    }
    StructureManager.prototype.loadJSON = function (json) {
        var jsonStructs = JSON.parse(json);
        this.structures = [];
        for (var i = 0; i < jsonStructs.length; i++) {
            var jsonStruct = jsonStructs[i];
            var struct = {};
            struct.id = jsonStruct.id;
            struct.variants = [];
            for (var i_1 = 0; i_1 < jsonStruct.variants.length; i_1++) {
                var jsonVariant = jsonStruct.variants[i_1];
                var variant = {
                    xOffset: jsonVariant.xOffset ? jsonVariant.xOffset : 0,
                    yOffset: jsonVariant.yOffset ? jsonVariant.yOffset : 0,
                    tiles: []
                };
                for (var y = 0; y < jsonVariant.tiles.length; y++) {
                    for (var x = 0; x < jsonVariant.tiles[y].length; x++) {
                        if (!variant.tiles[x])
                            variant.tiles[x] = [];
                        variant.tiles[x][y] = tileDefs.getById(jsonVariant.tiles[y][x]);
                    }
                }
                struct.variants.push(variant);
            }
            this.structures.push(struct);
        }
        this.resetCache();
    };
    StructureManager.prototype.getById = function (id, ignoreCache) {
        if (ignoreCache === void 0) { ignoreCache = false; }
        if (!ignoreCache) {
            return this.cache[id];
        }
        else {
            for (var i = 0; i < this.structures.length; i++) {
                var def = this.structures[i];
                if (def.id === id)
                    return def;
            }
        }
        return undefined;
    };
    StructureManager.prototype.resetCache = function () {
        this.cache = {};
        for (var i = 0; i < this.structures.length; i++) {
            var def = this.structures[i];
            this.cache[def.id] = def;
        }
    };
    return StructureManager;
}());
//# sourceMappingURL=structures.js.map