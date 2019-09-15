// DOM Constants

const txtWidth = document.getElementById("txtWidth") as HTMLInputElement;
const txtHeight = document.getElementById("txtHeight") as HTMLInputElement;
const btnReset = document.getElementById("btnReset") as HTMLButtonElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

// World

const world = new World();

// Canvas

const ctx = canvas.getContext("2d");
const preCanvas = document.createElement("canvas");
const preCtx = preCanvas.getContext("2d");
let imageData = preCtx.createImageData(1, 1);

// Base tile size

const tileWidth = 12;
const tileHeight = 12;

// Camera

let canPan = false;
let isPanning = false;
let lastPos = {x: undefined as number, y: undefined as number};
let camera = {x: 0, y: 0, zoom: 1};

// Renders world to off-screen canvas

function drawWorld() {
	for (let x=0; x<world.getWidth(); x++) {
		for (let y=0; y<world.getHeight();y++){
			let c = world.getTile(x,y).getColor();
			let pI = ((y*world.getWidth())+x) * 4;
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
	ctx.shadowColor = "rgba(0,0,0,0.1)";
	ctx.shadowBlur = 10;
	ctx.drawImage(
		preCanvas,
		camera.x-(tileWidth*camera.zoom*(world.getWidth()/2)),
		camera.y-(tileHeight*camera.zoom*(world.getHeight()/2)),
		tileWidth*world.getWidth()*camera.zoom,
		tileHeight*world.getHeight()*camera.zoom
	);

}

// Resets the world

function resetWorld() {

	let width = Number(txtWidth.value.trim());
	let height = Number(txtHeight.value.trim());

	preCanvas.height = height; 
	preCanvas.width = width; 

	imageData = preCtx.createImageData(width, height);

	world.generate(width, height);
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
	canvas.classList.add("canDrag");
	canPan = true;
}

// When you release space

function disallowPanning() {
	canvas.classList.remove("canDrag");
	canPan = false;
}

// When you are holding space and then hold mouse button

function startPanning() {
	isPanning = canPan;
	if (isPanning) canvas.classList.add("dragging");
}

// When you release mouse button

function stopPanning() {
	canvas.classList.remove("dragging");
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

let scrollHandler: number;

function handleScroll(evt: WheelEvent) {

	evt.preventDefault();

	let sign = evt.deltaY > 0 ? -1 : evt.deltaY == 0 ? 0 : 1;
	let times = 5;
	let i = 0;

	clearInterval(scrollHandler);

	scrollHandler = setInterval(()=>{
		if (i >= times) clearInterval(scrollHandler);
		else {			
			camera.zoom *= sign > 0 ? 1.01 : 1/1.01;
			draw();
			i++;
		}
	}, 1);
}

// =======================================================================================

// Starts

updateCanvasSize();
camera.x = canvas.width/2;
camera.y = canvas.height/2;
resetWorld();

setInterval(() => {
	world.tick();
	drawWorld();
	draw();
}, 100);

btnReset.addEventListener("click", resetWorld);
txtHeight.addEventListener("keydown", (evt) => { if(evt.key === "Enter") resetWorld() });
txtWidth.addEventListener("keydown", (evt) => { if(evt.key === "Enter") resetWorld() });
window.addEventListener("resize", updateCanvasSize);
window.addEventListener("keydown", (evt) => { if(evt.key === " ") allowPanning() });
window.addEventListener("keyup", (evt) => { if(evt.key === " ") disallowPanning() });
canvas.addEventListener("mousedown", handleMouseDown );
canvas.addEventListener("mouseup", handleMouseUp );
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("wheel", handleScroll);