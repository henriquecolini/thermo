// Fixed mod() function

function mod(n: number, m: number): number {
	return ((n % m) + m) % m;
}

class World {

	private width = 1;
	private height = 1;
	private world: Tile[][];
	public wrapAround = false;

	// Generates a new world

	public generate(width: number, height: number) {

		this.width = width;
		this.height = height;

		this.world = [];

		for (let x=0; x<this.width; x++) {
			this.world[x] = [];
			for (let y=0; y<this.height;y++){
				this.world[x][y] = 
					x == 0 || y == 0 || x == width - 1 || y == height - 1?
					new Tile(tileDefs.getById("wall")) :
					new Tile(tileDefs.getById("air"));
			}
		}

	}

	// Runs temperature simulaton once

	private temperatureTick() {

		let arr: {tile: Tile, x: number, y: number}[] = [];

		for (let x=0; x<this.width; x++) {
			for (let y=0; y<this.height;y++){			
				arr.push({tile: this.world[x][y], x: x, y: y});
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
								
				const tile = world.getTile(x,y);
				
				const left = world.getTile(x-1,y);
				const right = world.getTile(x+1,y);

				const canBottom = tile.canPenetrate(world.getTile(x,y+1));
				const canLeft = tile.canPenetrate(world.getTile(x-1,y));
				const canRight = tile.canPenetrate(world.getTile(x+1,y));
				const canBLeft = tile.canPenetrate(world.getTile(x-1,y+1));
				const canBRight = tile.canPenetrate(world.getTile(x+1,y+1));

				if (!tile.justChanged) {
					
					if (!tile.def.static) {

						// Law 1: If something with a lower density is below a tile, they will change places.

						// if (canBottom) {
						// 	this.swap(x,y,x,y+1);
						// }

						// Law 2: Slipperiness is defined by the probability that something will fall to a bottom diagonal.

						// else if (tile.def.slipperiness > 0 && ((canBLeft && canLeft) || (canBRight && canRight))) {
						// 	if (Math.random() <= tile.def.slipperiness) {
						// 		if ((canBLeft && canLeft) && (canBRight && canRight)) {
						// 			this.swap(x,y,x + (Math.random() > 0.5 ? 1 : -1),y);
						// 		}
						// 		else if ((canBLeft && canLeft)) {this.swap(x,y,x-1,y);}
						// 		else {this.swap(x,y,x+1,y);}
						// 	}
						// }

						// Law 3: Viscosity is defined by the probability that something will not randomly move sideways.

						//else
						if (tile.def.viscosity >= 0 && (canLeft || canRight)) {



							if (Math.random() > tile.def.viscosity) {
						
								if (canLeft && !canRight) {
									if (left.def.id != tile.def.id || (Math.random() < 1/8)) {
										this.swap(x, y, x - 1, y);
									}
								}
						
								if (canRight && !canLeft) {
									if (right.def.id != tile.def.id || (Math.random() < 1/8)) {
										this.swap(x, y, x + 1, y);
									}
								}
						
								if (canLeft && canRight) {
									if(Math.random() > 0.5){
										if (left.def.id != tile.def.id || (Math.random() < 1/8)) {
											this.swap(x, y, x - 1, y);
										}
									}else{
										if (right.def.id != tile.def.id || (Math.random() < 1/8)) {
											this.swap(x, y, x + 1, y);
										}
									}
								}
						
							}
						
						}						

					}

				}

				tile.justChanged = false;
				
			}
		}

	}

	public swap(x1: number, y1: number, x2: number, y2: number) {
		let defSwap = this.getTile(x1, y1).def;
		let heatSwap = this.getTile(x1, y1).temperature;
		this.getTile(x1, y1).def = this.getTile(x2, y2).def;
		this.getTile(x2, y2).def = defSwap;
		this.getTile(x1, y1).temperature = this.getTile(x2, y2).temperature;
		this.getTile(x2, y2).temperature = heatSwap;
		this.getTile(x2, y2).justChanged = true;
	}

	public tick() {
		// for (let x = 0; x < this.width; x++) {
		// 	for (let y = 0; y < this.height; y++) {
		// 		this.world[x][y].justChanged = false;
		// 	}
		// }
		this.temperatureTick();
		this.natureTick();
		// console.log(world);
	}

	public tickWarp(ticks: number) {
		for (let i = 0; i < ticks; i++) this.tick();
	}

	public getTiles(): Tile[][] {
		return this.world;
	}

	public getTile(x: number, y: number): Tile {
		
		let realX = this.wrapAround ? mod(x, this.width) : x;
		let realY = this.wrapAround ? mod(y, this.height) : y;
		
		return this.world[realX] ? this.world[realX][realY] : undefined;

	}

	public setTile(x: number, y: number, tile: Tile) {
		
		let realX = this.wrapAround ? mod(x, this.width) : x;
		let realY = this.wrapAround ? mod(y, this.height) : y;
		
		if (this.world[realX])
			this.world[realX][realY] = tile;

	}

	public getWidth(): number {
		return this.width;
	}

	public getHeight(): number {
		return this.height;
	}

}