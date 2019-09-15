const txtWidth = document.getElementById("txtWidth") as HTMLInputElement;
const txtHeight = document.getElementById("txtHeight") as HTMLInputElement;
const btnReset = document.getElementById("btnReset") as HTMLButtonElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
const preCanvas = document.createElement("canvas");
const preCtx = preCanvas.getContext("2d");

const tileWitdh = 12;
const tileHeight = 12;

let witdh = 1;
let height = 1;

let world: Tile[][];
let camera = {x: 0, y: 0, zoom: 1};

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

function drawWorld() {
	for (let x=0; x<witdh; x++) {
		for (let y=0; y<height;y++){
			preCtx.fillStyle = world[x][y].getColor();
			preCtx.fillRect(x*tileWitdh, y*tileHeight, tileWitdh, tileHeight);
		}
	}
}

function draw() {
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(preCanvas,camera.x-(preCanvas.width/2),camera.y-(preCanvas.height/2));

}

function reset() {

	witdh = Number(txtWidth.value.trim());
	height = Number(txtHeight.value.trim());

	preCanvas.height = tileHeight * height;
	preCanvas.width = tileWitdh * witdh;

	generate();
	drawWorld();
	draw();

}

function updateCanvasSize() {
	canvas.height = document.documentElement.clientHeight;
	canvas.width = document.documentElement.clientWidth;
}

function startDragging() {
	document.body.classList.add("dragging");
}

function stopDragging() {
	document.body.classList.remove("dragging");
}

updateCanvasSize();
camera.x = canvas.width/2;
camera.y = canvas.height/2;
reset();

setInterval(() => {
	temperatureTick();
	drawWorld();
}, 100);

setInterval(() => {
	draw();
}, 1000/30);

btnReset.addEventListener("click", reset);
window.addEventListener("resize", updateCanvasSize);
window.addEventListener("keydown", (evt) => { if(evt.key === " ") startDragging() });
window.addEventListener("keyup", (evt) => { if(evt.key === " ") stopDragging() });