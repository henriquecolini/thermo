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
				this.tiles[x][y] = 
					x == 0 || y == 0 || x == width - 1 || y == height - 1?
					new Tile(tileDefs.getById("wall")) :
					new Tile(tileDefs.getById("air"));
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
			let sharedTemp = (t.temperature * t.def.conductivity)/(directions.length+1);

			for (let i = 0; i < directions.length; i++) {
				const dir = directions[i];
				let diff = originalTemp - dir.tile.temperature;
				let gained = sharedTemp * (diff/originalTemp);
				dir.tile.temperature += gained;
				t.temperature -= gained;
			}

		}

	}

	private natureTick() {

		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				
				const tile = this.tiles[x][y]; // Access world[][] directly only when confident the tile exists
				
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

					let possibleReactions: {reaction: {makes: string, speed: number, byproduct?: string}, xOff: number, yOff: number}[] = [];

					if(top && tile.def.reactions && tile.def.reactions[top.def.id])
						possibleReactions.push({reaction: tile.def.reactions[top.def.id], xOff: 0, yOff: -1});

					if(bottom && tile.def.reactions && tile.def.reactions[bottom.def.id])
						possibleReactions.push({reaction: tile.def.reactions[bottom.def.id], xOff: 0, yOff: 1});

					if(left && tile.def.reactions && tile.def.reactions[left.def.id])
						possibleReactions.push({reaction: tile.def.reactions[left.def.id], xOff: -1, yOff: 0});

					if(right && tile.def.reactions && tile.def.reactions[right.def.id])
						possibleReactions.push({reaction: tile.def.reactions[right.def.id], xOff: 1, yOff: 0});

					let reacted = false;

					if (possibleReactions.length > 0) {

						let greatest = 0;
						for (let i = 0; i < possibleReactions.length; i++) {
							if (possibleReactions[greatest].reaction.speed < possibleReactions[i].reaction.speed) greatest = i;
						}
						
						let selected = possibleReactions[greatest];

						if (Math.random() <= selected.reaction.speed) {
							const newDef = tileDefs.getById(selected.reaction.makes);
							if (newDef) {
								tile.resetDef(newDef);
								if (selected.reaction.byproduct) {
									const byDef = tileDefs.getById(selected.reaction.byproduct);
									if (byDef) {
										this.setTile(x+selected.xOff, y+selected.yOff, tileDefs.getById(selected.reaction.byproduct));
									}
									else {
										console.error("A " + tile.def.id + " tried to make a byproduct of " + selected.reaction.makes + ", but that doesn't exist!");
									}
								}
								reacted = true;
							}
							else {
								console.error("A " + tile.def.id + " tried to produce a " + selected.reaction.makes + ", but that doesn't exist!");
							}
						}

					}

					if (!reacted && !tile.def.static) {

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
								const reallyCanLeft = (canLeft && !topLeft.canReplace(left)) || mixProbability;
								const reallyCanRight = (canRight && !topRight.canReplace(right)) || mixProbability;

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