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
                this.world[x][y] = new Tile(0.1, (Math.random() * 600), 0.02, x, y);
            }
        }
    };
    World.prototype.temperatureTick = function () {
        var arr = [];
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                arr.push(this.world[x][y]);
            }
        }
        arr.sort(function (a, b) {
            return a.temperature - b.temperature;
        });
        for (var i = 0; i < arr.length; i++) {
            var t = arr[i];
            var x = t.x;
            var y = t.y;
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
            var sharedTemp = (t.temperature * t.conductivity) / (directions.length + 1);
            for (var i_1 = 0; i_1 < directions.length; i_1++) {
                var dir = directions[i_1];
                var diff = originalTemp - dir.tile.temperature;
                var gained = sharedTemp * (diff / originalTemp);
                dir.tile.temperature += gained;
                t.temperature -= gained;
            }
        }
    };
    World.prototype.tickWarp = function (ticks) {
        for (var i = 0; i < ticks; i++)
            this.tick();
    };
    World.prototype.tick = function () {
        this.temperatureTick();
    };
    World.prototype.getTiles = function () {
        return this.world;
    };
    World.prototype.getTile = function (x, y) {
        var realX = this.wrapAround ? mod(x, this.width) : x;
        var realY = this.wrapAround ? mod(y, this.height) : y;
        return this.world[realX] ? this.world[realX][realY] : undefined;
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