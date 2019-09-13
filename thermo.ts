const txtWidth = document.getElementById("txtWidth") as HTMLInputElement;
const txtHeight = document.getElementById("txtHeight") as HTMLInputElement;
const btnReset = document.getElementById("btnReset") as HTMLButtonElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const labelTemperature = document.getElementById("labelTemperature") as HTMLElement;
const ctx = canvas.getContext("2d");

const tileWitdh = 16;
const tileHeight = 16;

let witdh = 1;
let height = 1;

function temperatureColor(temperature: number): string {
	const L = 2;
	const K = 0.002;
	let factor = (L/(1+(Math.E**(-K*(temperature)))))-L/2;
	return "#"+(lerpColor(0x33224d, 0xfabb3e, factor).toString(16));
}

function lerpColor(a: number, b: number, amount: number): number {
    const ar = a >> 16,
          ag = a >> 8 & 0xff,
          ab = a & 0xff,

          br = b >> 16,
          bg = b >> 8 & 0xff,
          bb = b & 0xff,

          rr = ar + amount * (br - ar),
          rg = ag + amount * (bg - ag),
          rb = ab + amount * (bb - ab);

    return (rr << 16) + (rg << 8) + (rb | 0);
}

class Tile {

	public baseDensity: number;
	public temperature: number;
	public entropyRate: number
	
	constructor(density: number, temperature: number, entropyRate: number) {
		this.baseDensity = density;
		this.temperature = temperature;
		this.entropyRate = entropyRate;
	}

	public tick(worldResult: Tile[][], x: number, y: number): void {

		const next = this.clone();
		const directions: {tile: Tile, xOff: number, yOff: number}[] = [];
		
		if(y > 0)        directions.push({tile: world[x][y-1], xOff: 0, yOff: -1});
		if(y < height-1) directions.push({tile: world[x][y+1], xOff: 0, yOff: +1});
		if(x > 0)        directions.push({tile: world[x-1][y], xOff: -1, yOff: 0});
		if(x < witdh-1)  directions.push({tile: world[x+1][y], xOff: +1, yOff: 0});

		for (let i = 0; i < directions.length; i++) {

			const dir = directions[i];			
			
			if (this.temperature > dir.tile.temperature) {
				const transferred = ((dir.tile.entropyRate + this.entropyRate)/2) * (this.temperature - dir.tile.temperature);
				world[x+dir.xOff][y+dir.yOff].temperature += transferred;				
				world[x][y].temperature -= transferred;				
			}

		}

	}

	public getColor(): string {
		return temperatureColor(this.temperature);
	}

	public clone(): Tile {
		return new Tile(this.baseDensity, this.temperature, this.entropyRate);
	}
	
}

let world: Tile[][];

function generate() {

	world = [];

	for (let x=0; x<witdh; x++) {
		world[x] = [];
		for (let y=0; y<height;y++){
			world[x][y] = new Tile(0.1,(Math.random() * 600), 0.008);
		}
	}

}

function tick() {

	const worldResult: Tile[][] = [];
	let totalTemperature = 0;

	for (let x=0; x<witdh; x++) {
		worldResult[x] = [];
		for (let y=0; y<height;y++){			
			worldResult[x][y] = world[x][y].clone();
		}
	}

	for (let x=0; x<witdh; x++) {
		for (let y=0; y<height;y++){			
			world[x][y].tick(worldResult, x, y);
		}
	}

	for (let x=0; x<witdh; x++) {
		for (let y=0; y<height;y++){			
			totalTemperature += worldResult[x][y].temperature;
		}
	}

	labelTemperature.innerHTML = "Average Temperature = " + (totalTemperature/(witdh*height)).toFixed(4) + " K";

	//world = worldResult;

}

function draw() {

	for (let x=0; x<witdh; x++) {
		for (let y=0; y<height;y++){
			ctx.fillStyle = world[x][y].getColor();
			ctx.fillRect(x*tileWitdh, y*tileHeight, tileWitdh, tileHeight);
		}
	}

}

btnReset.addEventListener("click", () => {
	
	witdh = Number(txtWidth.value.trim());
	height = Number(txtHeight.value.trim());

	canvas.height = tileHeight * height;
	canvas.width = tileWitdh * witdh;

	generate();
	draw();

});

generate();

setInterval(() => {
	tick();
	draw();
}, 100);