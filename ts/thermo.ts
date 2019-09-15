const txtWidth = document.getElementById("txtWidth") as HTMLInputElement;
const txtHeight = document.getElementById("txtHeight") as HTMLInputElement;
const btnReset = document.getElementById("btnReset") as HTMLButtonElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

const tileWitdh = 12;
const tileHeight = 12;

let witdh = 1;
let height = 1;

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
	public x: number;
	public y: number;
	
	constructor(density: number, temperature: number, conductivity: number, x: number, y: number) {
		this.baseDensity = density;
		this.temperature = temperature;
		this.conductivity = conductivity;
		this.x = x;
		this.y = y;
	}

	public getColor(): string {
		return temperatureColor(this.temperature);
	}

	public clone(): Tile {
		return new Tile(this.baseDensity, this.temperature, this.conductivity, this.x, this.y);
	}
	
}

let world: Tile[][];

function generate() {

	world = [];

	for (let x=0; x<witdh; x++) {
		world[x] = [];
		for (let y=0; y<height;y++){
			world[x][y] = new Tile(0.1,(Math.random() * 600), 0.02, x, y);
		}
	}

}

function temperatureTick() {

	let arr: Tile[] = [];

	for (let x=0; x<witdh; x++) {
		for (let y=0; y<height;y++){			
			arr.push(world[x][y]);
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

		if(y > 0        && t.temperature > world[x][y-1].temperature) directions.push({tile: world[x][y-1], xOff: 0, yOff: -1});
		if(y < height-1 && t.temperature > world[x][y+1].temperature) directions.push({tile: world[x][y+1], xOff: 0, yOff: +1});
		if(x > 0        && t.temperature > world[x-1][y].temperature) directions.push({tile: world[x-1][y], xOff: -1, yOff: 0});
		if(x < witdh-1  && t.temperature > world[x+1][y].temperature) directions.push({tile: world[x+1][y], xOff: +1, yOff: 0});

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

	canvas.height = tileHeight * height;
	canvas.width = tileWitdh * witdh;

	generate();
	draw();

}

btnReset.addEventListener("click", reset);

reset();

setInterval(() => {
	temperatureTick();
	draw();
}, 100);