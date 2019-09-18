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
                this.tiles[x][y] =
                    x == 0 || y == 0 || x == width - 1 || y == height - 1 ?
                        new Tile(tileDefs.getById("wall")) :
                        new Tile(tileDefs.getById("air"));
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
            var sharedTemp = (t.temperature * t.def.conductivity) / (directions.length + 1);
            for (var i_1 = 0; i_1 < directions.length; i_1++) {
                var dir = directions[i_1];
                var diff = originalTemp - dir.tile.temperature;
                var gained = sharedTemp * (diff / originalTemp);
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
                    var possibleReactions = [];
                    if (top_1 && !top_1.justReacted && tile.def.reactions && tile.def.reactions[top_1.def.id])
                        possibleReactions.push({ reaction: tile.def.reactions[top_1.def.id], xOff: 0, yOff: -1 });
                    if (bottom && !bottom.justReacted && tile.def.reactions && tile.def.reactions[bottom.def.id])
                        possibleReactions.push({ reaction: tile.def.reactions[bottom.def.id], xOff: 0, yOff: 1 });
                    if (left && !left.justReacted && tile.def.reactions && tile.def.reactions[left.def.id])
                        possibleReactions.push({ reaction: tile.def.reactions[left.def.id], xOff: -1, yOff: 0 });
                    if (right && !right.justReacted && tile.def.reactions && tile.def.reactions[right.def.id])
                        possibleReactions.push({ reaction: tile.def.reactions[right.def.id], xOff: 1, yOff: 0 });
                    var reacted = false;
                    if (possibleReactions.length > 0) {
                        var greatest = 0;
                        for (var i = 0; i < possibleReactions.length; i++) {
                            if (possibleReactions[greatest].reaction.speed < possibleReactions[i].reaction.speed)
                                greatest = i;
                        }
                        var selected = possibleReactions[greatest];
                        if (Math.random() <= selected.reaction.speed) {
                            var newDef = tileDefs.getById(selected.reaction.makes);
                            if (newDef) {
                                tile.resetDef(newDef);
                                if (selected.reaction.byproduct) {
                                    var byDef = tileDefs.getById(selected.reaction.byproduct);
                                    if (byDef) {
                                        this.setTile(x + selected.xOff, y + selected.yOff, tileDefs.getById(selected.reaction.byproduct));
                                    }
                                    else {
                                        console.error("A " + tile.def.id + " tried to make a byproduct of " + selected.reaction.makes + ", but that doesn't exist!");
                                    }
                                }
                                reacted = true;
                                this.getTile(x + selected.xOff, y + selected.yOff).justReacted = true;
                                tile.justReacted = true;
                            }
                            else {
                                console.error("A " + tile.def.id + " tried to produce a " + selected.reaction.makes + ", but that doesn't exist!");
                            }
                        }
                    }
                    if (!reacted && !tile.def.static) {
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
                                var reallyCanLeft = (canLeft && !topLeft.canReplace(left)) || mixProbability;
                                var reallyCanRight = (canRight && !topRight.canReplace(right)) || mixProbability;
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