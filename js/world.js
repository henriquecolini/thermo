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
        this.world = [];
        for (var x = 0; x < this.width; x++) {
            this.world[x] = [];
            for (var y = 0; y < this.height; y++) {
                this.world[x][y] =
                    x == 0 || y == 0 || x == width - 1 || y == height - 1 ?
                        new Tile(tileDefs.getById("wall")) :
                        new Tile(tileDefs.getById("air"));
            }
        }
    };
    World.prototype.temperatureTick = function () {
        var arr = [];
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                arr.push({ tile: this.world[x][y], x: x, y: y });
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
                var tile = world.getTile(x, y);
                var top_1 = world.getTile(x, y - 1);
                var bottom = world.getTile(x, y + 1);
                var left = world.getTile(x - 1, y);
                var right = world.getTile(x + 1, y);
                var bottomLeft = world.getTile(x - 1, y + 1);
                var bottomRight = world.getTile(x + 1, y + 1);
                if (!tile.justChanged) {
                    if (!tile.def.static) {
                        if (bottom && tile.canPenetrate(bottom)) {
                            this.swap(x, y, x, y + 1);
                        }
                        else if (tile.def.slipperiness > 0) {
                            var canLeft = bottomLeft && tile.canPenetrate(left) && tile.canPenetrate(bottomLeft);
                            var canRight = bottomRight && tile.canPenetrate(right) && tile.canPenetrate(bottomRight);
                            if (canLeft || canRight) {
                                if (Math.random() <= tile.def.slipperiness) {
                                    if (canLeft && canRight) {
                                        this.swap(x, y, x + (Math.random() > 0.5 ? 1 : -1), y);
                                    }
                                    else if (canLeft) {
                                        this.swap(x, y, x - 1, y);
                                    }
                                    else {
                                        this.swap(x, y, x + 1, y);
                                    }
                                }
                            }
                        }
                    }
                }
                tile.justChanged = false;
            }
        }
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
        return this.world;
    };
    World.prototype.getTile = function (x, y) {
        var realX = this.wrapAround ? mod(x, this.width) : x;
        var realY = this.wrapAround ? mod(y, this.height) : y;
        return this.world[realX] ? this.world[realX][realY] : undefined;
    };
    World.prototype.setTile = function (x, y, tile) {
        var realX = this.wrapAround ? mod(x, this.width) : x;
        var realY = this.wrapAround ? mod(y, this.height) : y;
        if (this.world[realX])
            this.world[realX][realY] = tile;
    };
    World.prototype.swap = function (x1, y1, x2, y2) {
        var defSwap = this.getTile(x1, y1).def;
        var heatSwap = this.getTile(x1, y1).temperature;
        this.getTile(x1, y1).def = this.getTile(x2, y2).def;
        this.getTile(x2, y2).def = defSwap;
        this.getTile(x1, y1).temperature = this.getTile(x2, y2).temperature;
        this.getTile(x2, y2).temperature = heatSwap;
        this.getTile(x2, y2).justChanged = true;
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