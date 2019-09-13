const txtWidth = document.getElementById("txtWidth") as HTMLInputElement;
const txtHeight = document.getElementById("txtHeight") as HTMLInputElement;
const btnReset = document.getElementById("btnReset") as HTMLButtonElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

const tileWitdh = 16;
const tileHeight = 16;

let witdh = 1;
let height = 1;

class Tile {

	public color: string;
	
	constructor(color: string) {
		this.color = color;
	}
}

let world: Tile[][];

function generate() {

	world = [];

	for (let x=0; x<witdh; x++) {
		world[x] = [];
		for (let y=0; y<witdh;y++){
			world[x][y] = new Tile("gray");
		}
	}

}

function draw() {

	for (let x=0; x<witdh; x++) {
		for (let y=0; y<witdh;y++){
			ctx.fillStyle = world[x][y].color;
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