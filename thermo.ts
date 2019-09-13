const txtWidth = document.getElementById("txtWidth") as HTMLInputElement;
const txtHeight = document.getElementById("txtHeight") as HTMLInputElement;
const btnReset = document.getElementById("btnReset") as HTMLButtonElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

const tileWitdh = 16;
const tileHeight = 16;

let witdh = 1;
let height = 1;

function temperatureColor(temperature: number): string {
	const L = 1;
	const K = 0.004;
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

	private baseDensity: number;
	private temperature: number;
	
	constructor(density: number, temperature: number) {
		this.baseDensity = density;
		this.temperature = temperature;
	}

	public getColor(): string {
		return temperatureColor(this.temperature);
	}
	
}

let world: Tile[][];

function generate() {

	world = [];

	for (let x=0; x<witdh; x++) {
		world[x] = [];
		for (let y=0; y<witdh;y++){
			world[x][y] = new Tile(0.1,(Math.random() * 800));
		}
	}

}

function draw() {

	for (let x=0; x<witdh; x++) {
		for (let y=0; y<witdh;y++){
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