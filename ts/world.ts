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
				this.world[x][y] = new Tile(0.1,(Math.random() * 600), 0.02, x, y);
			}
		}

	}

	// Runs temperature simulaton once

	private temperatureTick() {

		let arr: Tile[] = [];

		for (let x=0; x<this.width; x++) {
			for (let y=0; y<this.height;y++){			
				arr.push(this.world[x][y]);
			}
		}

		arr.sort((a,b)=>{
			return a.temperature-b.temperature;
		});

		for (let i = 0; i < arr.length; i++) {

			const t = arr[i];
			const x = t.x;
			const y = t.y;
			let directions: {tile: Tile, xOff: number, yOff: number}[] = [];

			if(this.getTile(x, y-1) && t.temperature > this.getTile(x, y-1).temperature) directions.push({tile: this.getTile(x, y-1), xOff: 0, yOff: -1});
			if(this.getTile(x, y+1) && t.temperature > this.getTile(x, y+1).temperature) directions.push({tile: this.getTile(x, y+1), xOff: 0, yOff: +1});
			if(this.getTile(x-1, y) && t.temperature > this.getTile(x-1, y).temperature) directions.push({tile: this.getTile(x-1, y), xOff: -1, yOff: 0});
			if(this.getTile(x+1, y) && t.temperature > this.getTile(x+1, y).temperature) directions.push({tile: this.getTile(x+1, y), xOff: +1, yOff: 0});

			let originalTemp = t.temperature;
			let sharedTemp = (t.temperature * t.conductivity)/(directions.length+1);

			for (let i = 0; i < directions.length; i++) {
				const dir = directions[i];
				let diff = originalTemp - dir.tile.temperature;
				let gained = sharedTemp * (diff/originalTemp);
				dir.tile.temperature += gained;
				t.temperature -= gained;
			}

		}

	}

	public tickWarp(ticks: number) {
		for (let i = 0; i < ticks; i++) this.tick();
	}

	public tick() {
		this.temperatureTick();
	}

	public getTiles(): Tile[][] {
		return this.world;
	}

	public getTile(x: number, y: number): Tile {
		
		let realX = this.wrapAround ? mod(x, this.width) : x;
		let realY = this.wrapAround ? mod(y, this.height) : y;
		
		return this.world[realX] ? this.world[realX][realY] : undefined;

	}

	public getWidth(): number {
		return this.width;
	}

	public getHeight(): number {
		return this.height;
	}

}