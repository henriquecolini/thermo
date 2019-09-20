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
            struct.xOffset = jsonStruct.xOffset;
            struct.yOffset = jsonStruct.yOffset;
            struct.tiles = [];
            for (var y = 0; y < jsonStruct.tiles.length; y++) {
                for (var x = 0; x < jsonStruct.tiles[y].length; x++) {
                    if (!struct.tiles[x])
                        struct.tiles[x] = [];
                    struct.tiles[x][y] = tileDefs.getById(jsonStruct.tiles[y][x]);
                }
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