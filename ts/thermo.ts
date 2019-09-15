// DOM Constants

const txtWidth = document.getElementById("txtWidth") as HTMLInputElement;
const txtHeight = document.getElementById("txtHeight") as HTMLInputElement;
const btnReset = document.getElementById("btnReset") as HTMLButtonElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

// Canvas

const ctx = canvas.getContext("2d");
const preCanvas = document.createElement("canvas");
const preCtx = preCanvas.getContext("2d");
let imageData = preCtx.createImageData(1, 1);

// Base tile size

const tileWidth = 12;
const tileHeight = 12;

// World

let width = 1;
let height = 1;
let world: Tile[][];

// Camera

let canPan = false;
let isPanning = false;
let lastPos = {x: undefined as number, y: undefined as number};
let camera = {x: 0, y: 0, zoom: 1};

// Generates a new world

function generate() {

	world = [];

	for (let x=0; x<width; x++) {
		world[x] = [];
		for (let y=0; y<height;y++){
			world[x][y] = new Tile(0.1,(Math.random() * 600), 0.02, x, y);
		}
	}

}

// Runs temperature simulaton once

function temperatureTick() {

	let arr: Tile[] = [];

	for (let x=0; x<width; x++) {
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
		if(x < width-1  && t.temperature > world[x+1][y].temperature) directions.push({tile: world[x+1][y], xOff: +1, yOff: 0});

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

// Renders world to off-screen canvas

function drawWorld() {
	for (let x=0; x<width; x++) {
		for (let y=0; y<height;y++){
			let c = world[x][y].getColor();
			let pI = ((y*width)+x) * 4;
			imageData.data[pI]   = c.R;
			imageData.data[pI+1] = c.G;
			imageData.data[pI+2] = c.B;
			imageData.data[pI+3] = 255;
		}
	}
	preCtx.putImageData(imageData, 0, 0);
}

// Renders everything

function draw() {
	
	ctx.imageSmoothingEnabled = false;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(preCanvas,camera.x-(tileWidth*camera.zoom*(width/2)),camera.y-(tileHeight*camera.zoom*(height/2)), tileWidth*width*camera.zoom, tileHeight*height*camera.zoom);

}

// Resets the world

function reset() {

	width = Number(txtWidth.value.trim());
	height = Number(txtHeight.value.trim());

	preCanvas.height = height; 
	preCanvas.width = width; 

	imageData = preCtx.createImageData(width, height);

	generate();
	drawWorld();
	draw();

}

// Sets main canvas to the size of the browser window

function updateCanvasSize() {
	canvas.height = document.documentElement.clientHeight;
	canvas.width = document.documentElement.clientWidth;
	draw();
}

// When you hold space

function allowPanning() {
	document.body.classList.add("canDrag");
	canPan = true;
}

// When you release space

function disallowPanning() {
	document.body.classList.remove("canDrag");
	canPan = false;
}

// When you are holding space and then hold mouse button

function startPanning() {
	isPanning = canPan;
	if (isPanning) document.body.classList.add("dragging");
}

// When you release mouse button

function stopPanning() {
	document.body.classList.remove("dragging");
	isPanning = false;
}

// Moves camera

function pan(deltaX: number, deltaY: number) {
	camera.x += deltaX;
	camera.y += deltaY;
	draw();
}

// Handles onMouseDown event

function handleMouseDown() {
	startPanning();
}

// Handles onMouseUp event

function handleMouseUp() {
	stopPanning();
}

// Handles onMouseMove event

function handleMouseMove(evt: MouseEvent) {
	if (lastPos.x === undefined || lastPos.y === undefined) {
		lastPos.x = evt.x;
		lastPos.y = evt.y;
	}

	if (isPanning) pan(evt.x - lastPos.x, evt.y - lastPos.y);

	lastPos.x = evt.x;
	lastPos.y = evt.y;
}

// =======================================================================================

// Starts

updateCanvasSize();
camera.x = canvas.width/2;
camera.y = canvas.height/2;
reset();

setInterval(() => {
	temperatureTick();
	drawWorld();
	draw();
}, 100);

btnReset.addEventListener("click", reset);
window.addEventListener("resize", updateCanvasSize);
window.addEventListener("keydown", (evt) => { if(evt.key === " ") allowPanning() });
window.addEventListener("keyup", (evt) => { if(evt.key === " ") disallowPanning() });
canvas.addEventListener("mousedown", handleMouseDown );
canvas.addEventListener("mouseup", handleMouseUp );
canvas.addEventListener("mousemove", handleMouseMove);