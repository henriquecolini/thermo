function mod(n, m) {
    return ((n % m) + m) % m;
}
var World = (function () {
    function World() {
        this.width = 1;
        this.height = 1;
        this.wrapAround = false;
    }
    World.prototype.generate = function (width, height) {
        this.width = width;
        this.height = height;
        this.tiles = [];
        for (var x = 0; x < this.width; x++) {
            this.tiles[x] = [];
            for (var y = 0; y < this.height; y++) {
                this.tiles[x][y] = new Tile(tileDefs.getById("air"));
            }
        }
    };
    World.prototype.temperatureTick = function () {
        var arr = [];
        var world = this;
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                arr.push({ tile: world.tiles[x][y], x: x, y: y });
            }
        }
        arr.sort(function (a, b) {
            return a.tile.temperature - b.tile.temperature;
        });
        for (var i = 0; i < arr.length; i++) {
            var t = arr[i].tile;
            var x = arr[i].x;
            var y = arr[i].y;
            var directions = [];
            if (this.getTile(x, y - 1) && t.temperature > this.getTile(x, y - 1).temperature)
                directions.push({ tile: this.getTile(x, y - 1), xOff: 0, yOff: -1 });
            if (this.getTile(x, y + 1) && t.temperature > this.getTile(x, y + 1).temperature)
                directions.push({ tile: this.getTile(x, y + 1), xOff: 0, yOff: +1 });
            if (this.getTile(x - 1, y) && t.temperature > this.getTile(x - 1, y).temperature)
                directions.push({ tile: this.getTile(x - 1, y), xOff: -1, yOff: 0 });
            if (this.getTile(x + 1, y) && t.temperature > this.getTile(x + 1, y).temperature)
                directions.push({ tile: this.getTile(x + 1, y), xOff: +1, yOff: 0 });
            var originalTemp = t.temperature;
            var sharedTemp = (t.temperature * t.def.heatTransmission) / (directions.length + 1);
            for (var i_1 = 0; i_1 < directions.length; i_1++) {
                var dir = directions[i_1];
                var diff = originalTemp - dir.tile.temperature;
                var gained = dir.tile.def.heatAbsorption * sharedTemp * (diff / originalTemp);
                dir.tile.temperature += gained;
                t.temperature -= gained;
            }
        }
    };
    World.prototype.natureTick = function () {
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var tile = this.tiles[x][y];
                tile.justReacted = false;
                if (!tile.justChanged) {
                    var left = this.getTile(x - 1, y);
                    var right = this.getTile(x + 1, y);
                    var top_1 = this.getTile(x, y - 1);
                    var bottom = this.getTile(x, y + 1);
                    var topLeft = this.getTile(x - 1, y - 1);
                    var topRight = this.getTile(x + 1, y - 1);
                    var canBottom = tile.canReplace(bottom);
                    var canLeft = tile.canReplace(left);
                    var canRight = tile.canReplace(right);
                    var canBottomLeft = tile.canReplace(this.getTile(x - 1, y + 1));
                    var canBottomRight = tile.canReplace(this.getTile(x + 1, y + 1));
                    var directions = [top_1, bottom, left, right];
                    for (var i = 0; i < directions.length; i++) {
                        var dir = directions[i];
                        var reaction = dir && dir.def.reactions ? dir.def.reactions[tile.def.id] : undefined;
                        reaction = reaction && Math.random() <= reaction.speed ? reaction : undefined;
                        if (reaction) {
                            dir.resetDef(tileDefs.getById(reaction.makes));
                            if (reaction.byproduct)
                                tile.resetDef(tileDefs.getById(reaction.byproduct));
                            dir.justReacted = true;
                            tile.justReacted = true;
                            break;
                        }
                    }
                    if (!tile.justReacted && !tile.def.static) {
                        if (canBottom) {
                            this.replace(x, y, x, y + 1);
                        }
                        else if (tile.def.slipperiness > 0 && ((canBottomLeft && canLeft) || (canBottomRight && canRight))) {
                            if (Math.random() <= tile.def.slipperiness) {
                                if ((canBottomLeft && canLeft) && (canBottomRight && canRight)) {
                                    this.replace(x, y, x + (Math.random() > 0.5 ? 1 : -1), y);
                                }
                                else if ((canBottomLeft && canLeft)) {
                                    this.replace(x, y, x - 1, y);
                                }
                                else {
                                    this.replace(x, y, x + 1, y);
                                }
                            }
                        }
                        else if (tile.def.viscosity >= 0 && (canLeft || canRight)) {
                            if (Math.random() > tile.def.viscosity) {
                                var mixProbability = tile.def.solubility > 0 ? Math.random() < tile.def.solubility : 0;
                                var reallyCanLeft = !topLeft || (canLeft && !topLeft.canReplace(left)) || mixProbability;
                                var reallyCanRight = !topRight || (canRight && !topRight.canReplace(right)) || mixProbability;
                                if (canLeft && !canRight) {
                                    if (reallyCanLeft) {
                                        this.replace(x, y, x - 1, y);
                                    }
                                }
                                if (canRight && !canLeft) {
                                    if (reallyCanRight) {
                                        this.replace(x, y, x + 1, y);
                                    }
                                }
                                if (canLeft && canRight && (reallyCanLeft || reallyCanRight)) {
                                    if (Math.random() > 0.5) {
                                        if (reallyCanLeft) {
                                            this.replace(x, y, x - 1, y);
                                        }
                                    }
                                    else {
                                        if (reallyCanRight) {
                                            this.replace(x, y, x + 1, y);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                this.tiles[x][y].justChanged = false;
            }
        }
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var tile = this.tiles[x][y];
                if (tile.def.decaySpeed && Math.random() < tile.def.decaySpeed) {
                    if (tile.def.decaysTo) {
                        var newDef = tileDefs.getById(tile.def.decaysTo);
                        if (newDef) {
                            tile.resetDef(newDef, !tile.def.forceTemperatureChange);
                            tile.justReacted = true;
                        }
                        else {
                            console.error("A " + tile.def.id + " tried decaying to " + tile.def.decaysTo + ", but that doesn't exist!");
                        }
                    }
                    else {
                        console.warn(tile.def.id + " has a decay speed but no decay is specified!");
                    }
                }
                if (tile.def.boilsAt !== undefined && !tile.justReacted && tile.temperature >= tile.def.boilsAt && (tile.def.boilSpeed === undefined || Math.random() < tile.def.boilSpeed)) {
                    if (tile.def.boilsTo) {
                        var newDef = tileDefs.getById(tile.def.boilsTo);
                        if (newDef) {
                            tile.resetDef(newDef, !tile.def.forceTemperatureChange);
                            tile.justReacted = true;
                        }
                        else {
                            console.error("A " + tile.def.id + " tried boiling to " + tile.def.boilsTo + ", but that doesn't exist!");
                        }
                    }
                    else {
                        console.warn(tile.def.id + " has a boiling point but no molten version is specified!");
                    }
                }
                if (tile.def.freezesAt !== undefined && !tile.justReacted && tile.temperature < tile.def.freezesAt && (tile.def.freezeSpeed === undefined || Math.random() < tile.def.freezeSpeed)) {
                    if (tile.def.freezesTo) {
                        var newDef = tileDefs.getById(tile.def.freezesTo);
                        if (newDef) {
                            tile.resetDef(newDef, !tile.def.forceTemperatureChange);
                            tile.justReacted = true;
                        }
                        else {
                            console.error("A " + tile.def.id + " tried freezing to " + tile.def.freezesTo + ", but that doesn't exist!");
                        }
                    }
                    else {
                        console.warn(tile.def.id + " has a freezing point but no molten version is specified!");
                    }
                }
            }
        }
    };
    World.prototype.replace = function (x1, y1, x2, y2) {
        var replace = this.getTile(x1, y1);
        this.setTile(x1, y1, this.getTile(x2, y2));
        this.setTile(x2, y2, replace);
        replace.justChanged = true;
    };
    World.prototype.tick = function () {
        this.temperatureTick();
        this.natureTick();
    };
    World.prototype.tickWarp = function (ticks) {
        for (var i = 0; i < ticks; i++)
            this.tick();
    };
    World.prototype.getTiles = function () {
        return this.tiles;
    };
    World.prototype.getRealPos = function (x, y) {
        return {
            realX: this.wrapAround ? mod(x, this.width) : x,
            realY: this.wrapAround ? mod(y, this.height) : y
        };
    };
    World.prototype.getTile = function (x, y) {
        var _a = this.getRealPos(x, y), realX = _a.realX, realY = _a.realY;
        return this.tiles[realX] ? this.tiles[realX][realY] : undefined;
    };
    World.prototype.setTile = function (x, y, tile) {
        var _a = this.getRealPos(x, y), realX = _a.realX, realY = _a.realY;
        if (this.tiles[realX] && this.tiles[realX][realY]) {
            if (tile instanceof Tile) {
                this.tiles[realX][realY] = tile;
            }
            else {
                this.tiles[realX][realY].resetDef(tile);
            }
        }
    };
    World.prototype.removeTile = function (x, y) {
        var _a = this.getRealPos(x, y), realX = _a.realX, realY = _a.realY;
        if (this.tiles[realX] && this.tiles[realX][realY])
            this.tiles[realX][realY].resetDef(tileDefs.getById("air"));
    };
    World.prototype.getWidth = function () {
        return this.width;
    };
    World.prototype.getHeight = function () {
        return this.height;
    };
    return World;
}());
//# sourceMappingURL=world.js.map