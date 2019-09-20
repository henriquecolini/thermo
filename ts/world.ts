// Fixed mod() function

function mod(n: number, m: number): number {
	return ((n % m) + m) % m;
}

// A 2D tile-based world, simulating physics and chemistry.
//
// LAWS OF NATURE
//
// 0th Law: Something may only take the place of something of lower density.
// 1st Law: If something with a lower density is below a tile, they will change places.
// 2nd Law: Slipperiness is defined by the probability that something will fall to a bottom diagonal.
// 3rd Law: Viscosity is defined by the probability that something will not randomly move sideways.
// 4th Law: Solubility is defined by the probability that something less dense than whatever it is immersed in randomly moves sideways.

class World {

	private width = 1;
	private height = 1;
	private tiles: Tile[][];
	public wrapAround = false;

	// Generates a new world

	public generate(width: number, height: number) {

		this.width = width;
		this.height = height;

		this.tiles = [];

		for (let x=0; x<this.width; x++) {
			this.tiles[x] = [];
			for (let y=0; y<this.height;y++){
				this.tiles[x][y] = new Tile(tileDefs.getById("air"));
			}
		}

	}

	// Builds a structure

	public build(structureId: string, x: number, y: number) {
		let struct = structs.getById(structureId);
		let index = Math.floor(Math.random() * struct.variants.length);
		for (let xOff = 0; xOff < struct.variants[index].length; xOff++) {
			for (let yOff = 0; yOff < struct.variants[index][xOff].length; yOff++) {
				const def = struct.variants[index][xOff][yOff];
				if (def) {
					const realX = x + xOff + (struct.xOffset? struct.xOffset : 0);
					const realY = y + yOff + (struct.yOffset? struct.yOffset : 0);
					const tile = this.getTile(realX, realY);
					if (tile && ((x === realX && y === realY) || def.density > tile.def.density)) {
						tile.resetDef(def);
					}
				}
			}
		}
	}

	// Runs temperature simulaton once

	private temperatureTick() {

		let arr: {tile: Tile, x: number, y: number}[] = [];
		const world = this;

		for (let x=0; x<this.width; x++) {
			for (let y=0; y<this.height;y++){			
				arr.push({tile: world.tiles[x][y], x: x, y: y});
			}
		}

		arr.sort((a,b)=>{
			return a.tile.temperature-b.tile.temperature;
		});

		for (let i = 0; i < arr.length; i++) {

			const t = arr[i].tile;
			const x = arr[i].x;
			const y = arr[i].y;
			let directions: {tile: Tile, xOff: number, yOff: number}[] = [];

			if(this.getTile(x, y-1) && t.temperature > this.getTile(x, y-1).temperature) directions.push({tile: this.getTile(x, y-1), xOff: 0, yOff: -1});
			if(this.getTile(x, y+1) && t.temperature > this.getTile(x, y+1).temperature) directions.push({tile: this.getTile(x, y+1), xOff: 0, yOff: +1});
			if(this.getTile(x-1, y) && t.temperature > this.getTile(x-1, y).temperature) directions.push({tile: this.getTile(x-1, y), xOff: -1, yOff: 0});
			if(this.getTile(x+1, y) && t.temperature > this.getTile(x+1, y).temperature) directions.push({tile: this.getTile(x+1, y), xOff: +1, yOff: 0});

			let originalTemp = t.temperature;
			let sharedTemp = (t.temperature * t.def.heatTransmission)/(directions.length+1);

			for (let i = 0; i < directions.length; i++) {
				const dir = directions[i];
				let diff = originalTemp - dir.tile.temperature;
				let gained = dir.tile.def.heatAbsorption * sharedTemp * (diff/originalTemp);
				dir.tile.temperature += gained;
				t.temperature -= gained;
			}

		}

	}

	private natureTick() {

		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				
				const tile = this.tiles[x][y]; // Access world[][] directly only when confident the tile exists
				tile.justReacted = false;				

				if (!tile.justChanged) {

					const left = this.getTile(x-1,y);
					const right = this.getTile(x+1,y);
					const top = this.getTile(x,y-1);
					const bottom = this.getTile(x,y+1);				
					const topLeft = this.getTile(x-1,y-1);
					const topRight = this.getTile(x+1,y-1);

					const canBottom = tile.canReplace(bottom);
					const canLeft = tile.canReplace(left);
					const canRight = tile.canReplace(right);
					const canBottomLeft = tile.canReplace(this.getTile(x-1,y+1));
					const canBottomRight = tile.canReplace(this.getTile(x+1,y+1));	

					let directions = [
						{tile: top, xOff: 0, yOff: -1},
						{tile: bottom, xOff: 0, yOff: 1},
						{tile: left, xOff: -1, yOff: 0},
						{tile: right, xOff: 1, yOff: 0}
					];

					for (let i = 0; i < directions.length; i++) {

						const dir = directions[i];
						const other = dir.tile;

						let reaction = other && other.def.reactions ? other.def.reactions[tile.def.id] : undefined;
						reaction = reaction && Math.random() <= reaction.speed ? reaction : undefined;

						if (reaction) {
							if (reaction.makes.charAt(0) === '$') {
								this.build(reaction.makes.substr(1), x + dir.xOff, y + dir.yOff);
							}
							else {
								other.resetDef(tileDefs.getById(reaction.makes));
							}
							if (reaction.byproduct) tile.resetDef(tileDefs.getById(reaction.byproduct));
							other.justReacted = true;
							tile.justReacted = true;
							break;
						}	

					}

					if (!tile.justReacted && !tile.def.static) {

						// Law 1

						if (canBottom) {
							this.replace(x,y,x,y+1);
						}

						// Law 2

						else if (tile.def.slipperiness > 0 && ((canBottomLeft && canLeft) || (canBottomRight && canRight))) {
							if (Math.random() <= tile.def.slipperiness) {
								if ((canBottomLeft && canLeft) && (canBottomRight && canRight)) {
									this.replace(x,y,x + (Math.random() > 0.5 ? 1 : -1),y);
								}
								else if ((canBottomLeft && canLeft)) {this.replace(x,y,x-1,y);}
								else {this.replace(x,y,x+1,y);}
							}
						}

						// Law 3

						else if (tile.def.viscosity >= 0 && (canLeft || canRight)) {

							if (Math.random() > tile.def.viscosity) {
						
								// Law 4

								const mixProbability = tile.def.solubility > 0 ? Math.random() < tile.def.solubility : 0;
								const reallyCanLeft = !topLeft || (canLeft && !topLeft.canReplace(left)) || mixProbability;
								const reallyCanRight = !topRight || (canRight && !topRight.canReplace(right)) || mixProbability;

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
									if(Math.random() > 0.5){
										if (reallyCanLeft) {
											this.replace(x, y, x - 1, y);
										}
									}else{
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

		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {

				const tile = this.tiles[x][y];

				if (tile.def.decaySpeed && Math.random() < tile.def.decaySpeed) {
					if (tile.def.decaysTo) {
						const newDef = tileDefs.getById(tile.def.decaysTo);
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
						const newDef = tileDefs.getById(tile.def.boilsTo);
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
						const newDef = tileDefs.getById(tile.def.freezesTo);
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

	}

	public replace(x1: number, y1: number, x2: number, y2: number) {
		let replace = this.getTile(x1, y1);
		this.setTile(x1, y1, this.getTile(x2, y2));
		this.setTile(x2, y2, replace);
		replace.justChanged = true;
	}

	public tick() {		
		this.temperatureTick();
		this.natureTick();
	}

	public tickWarp(ticks: number) {
		for (let i = 0; i < ticks; i++) this.tick();
	}

	public getTiles(): Tile[][] {
		return this.tiles;
	}

	public getRealPos(x: number, y: number): {realX: number, realY: number} {
		return {
			realX: this.wrapAround ? mod(x, this.width) : x,
			realY: this.wrapAround ? mod(y, this.height) : y
		};
	}

	public getTile(x: number, y: number): Tile {
		
		let {realX, realY} = this.getRealPos(x,y);
		
		return this.tiles[realX] ? this.tiles[realX][realY] : undefined;

	}

	public setTile(x: number, y: number, tile: TileDef|Tile) {
		
		let {realX, realY} = this.getRealPos(x,y);
		
		if (this.tiles[realX] && this.tiles[realX][realY]){
			if (tile instanceof Tile) {				
				this.tiles[realX][realY] = tile;
			}
			else {
				this.tiles[realX][realY].resetDef(tile);
			}
		}

	}

	public removeTile(x: number, y: number) {

		let {realX, realY} = this.getRealPos(x,y);
		
		if (this.tiles[realX] && this.tiles[realX][realY])
			this.tiles[realX][realY].resetDef(tileDefs.getById("air"));

	}

	public getWidth(): number {
		return this.width;
	}

	public getHeight(): number {
		return this.height;
	}

}