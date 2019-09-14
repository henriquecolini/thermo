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

let wArray = [0];
let hArray = [0];

function temperatureColor(temperature: number): string {
	const L = 2;
	const K = 0.002;
	let factor = temperature > 0 ? (L/(1+(Math.E**(-K*(temperature)))))-L/2 : 0;
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

function shuffle(array: any[]) {
	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

class Tile {

	public baseDensity: number;
	public temperature: number;
	public conductivity: number;
	
	constructor(density: number, temperature: number, conductivity: number) {
		this.baseDensity = density;
		this.temperature = temperature;
		this.conductivity = conductivity;
	}

	public getColor(): string {
		return temperatureColor(this.temperature);
	}

	public clone(): Tile {
		return new Tile(this.baseDensity, this.temperature, this.conductivity);
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

	const heatMap: number[][] = [];
	let totalTemperature = 0;

	for (let x=0; x<witdh; x++) {
		heatMap[x] = [];
		for (let y=0; y<height;y++){			
			heatMap[x][y] = world[x][y].temperature;
		}
	}

	shuffle(wArray);
	shuffle(hArray);

	for (let iX=0; iX<wArray.length; iX++) {
		for (let iY=0; iY<hArray.length;iY++){

			const x = wArray[iX];
			const y = hArray[iY];
			
			const directions: {heat: number, tile: Tile, xOff: number, yOff: number}[] = [];
		
			if(y > 0)        directions.push({heat: heatMap[x][y-1], tile: world[x][y-1], xOff: 0, yOff: -1});
			if(y < height-1) directions.push({heat: heatMap[x][y+1], tile: world[x][y+1], xOff: 0, yOff: +1});
			if(x > 0)        directions.push({heat: heatMap[x-1][y], tile: world[x-1][y], xOff: -1, yOff: 0});
			if(x < witdh-1)  directions.push({heat: heatMap[x+1][y], tile: world[x+1][y], xOff: +1, yOff: 0});

			shuffle(directions);

			for (let i = 0; i < directions.length; i++) {

				const dir = directions[i];			
				const totalConductivity = dir.tile.conductivity + world[x][y].conductivity;
				const factor = ((totalConductivity/2) + Math.min(dir.tile.conductivity, world[x][y].conductivity))/2;
				const transferred = factor * (Math.abs(dir.heat - heatMap[x][y]));

				if (heatMap[x][y] > dir.heat) {
					heatMap[x][y] -= transferred;
					heatMap[x+dir.xOff][y+dir.yOff] += transferred;
				}
				else {
					heatMap[x][y] += transferred;
					heatMap[x+dir.xOff][y+dir.yOff] -= transferred;
				}

			}

		}
	}

	for (let x=0; x<witdh; x++) {
		for (let y=0; y<height;y++){
			world[x][y].temperature = heatMap[x][y];
			totalTemperature += world[x][y].temperature;
		}
	}

	labelTemperature.innerHTML = "Average Temperature = " + (totalTemperature/(witdh*height)).toFixed(4) + " K";

}

function draw() {

	for (let x=0; x<witdh; x++) {
		for (let y=0; y<height;y++){
			ctx.fillStyle = world[x][y].getColor();
			ctx.fillRect(x*tileWitdh, y*tileHeight, tileWitdh, tileHeight);
		}
	}

}

function reset() {
	witdh = Number(txtWidth.value.trim());
	height = Number(txtHeight.value.trim());

	wArray = [];
	hArray = [];

	for (let i = 0; i < witdh; i++) wArray[i] = i;
	for (let i = 0; i < height; i++) hArray[i] = i;

	canvas.height = tileHeight * height;
	canvas.width = tileWitdh * witdh;

	generate();
	draw();
}

btnReset.addEventListener("click", reset);

reset();

setInterval(() => {
	tick();
	draw();
}, 100);