// DOM Constants

const txtWidth = document.getElementById("txtWidth") as HTMLInputElement;
const txtHeight = document.getElementById("txtHeight") as HTMLInputElement;
const btnReset = document.getElementById("btnReset") as HTMLButtonElement;
const toggleThermal = document.getElementById("toggleThermal") as HTMLButtonElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const elementsPanel = document.getElementById("elements");

// Engine

const tileDefs = new TileDefManager();
const structs = new StructureManager();
const world = new World();

// Canvas

const ctx = canvas.getContext("2d");
const preCanvas = document.createElement("canvas");
const preCtx = preCanvas.getContext("2d");
let imageData = preCtx.createImageData(1, 1);

// Base tile size

const tileWidth = 10;
const tileHeight = 10;

// Camera

let canPan = false;
let isPanning = false;
let lastPos = {x: undefined as number, y: undefined as number};
let camera = {x: 0, y: 0, zoom: 1};

// Controls

let isMouseDown = false;
let selectedDef = tileDefs.getById("wall");

// Rendering

let thermalView = false;

// Renders world to off-screen canvas

function drawWorld() {
	for (let x=0; x<world.getWidth(); x++) {
		for (let y=0; y<world.getHeight();y++){
			let c = thermalView ? world.getTile(x,y).getThermalColor() : world.getTile(x,y).def.color;
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

// Places a tile given its grid coordinates

function placeTile(x: number, y: number, redraw: boolean = true) {
	world.setTile(x,y,selectedDef);
	if (redraw) { 
		drawWorld();
		draw();
	}
}

// Places a tile given mouse coordinates

function placeTileAtMouse(mouseX: number, mouseY: number) {
	let coords = mouseToTileCoords(mouseX, mouseY);
	if (coords){		
		let {x,y} = coords;
		placeTile(x,y);
	}
}

function placeTileLine(mouseX0: number, mouseY0: number, mouseX1: number, mouseY1: number) {

	let c0 = mouseToTileCoords(mouseX0, mouseY0);
	let c1 = mouseToTileCoords(mouseX1, mouseY1);

	if (c0 && c1) {

		let x0 = c0.x;
		let y0 = c0.y;
		let x1 = c1.x;
		let y1 = c1.y;

		let dx = Math.abs(x1 - x0);
		let dy = Math.abs(y1 - y0);
		let sx = (x0 < x1) ? 1 : -1;
		let sy = (y0 < y1) ? 1 : -1;
		let err = dx - dy;

		while(true) {

			placeTile(x0, y0, false); // Do what you need to for this

			if ((x0 === x1) && (y0 === y1)) break;
			var e2 = 2*err;
			if (e2 > -dy) { err -= dy; x0  += sx; }
			if (e2 < dx) { err += dx; y0  += sy; }
		}
	}

	drawWorld();
	draw();

}

// Converts a mouse position in the canvas to tile coordinates

function mouseToTileCoords(mouseX: number, mouseY: number): {x: number, y: number} {
	let gridW = tileWidth*world.getWidth()*camera.zoom;
	let gridH = tileHeight*world.getHeight()*camera.zoom;

	let worldX = mouseX - camera.x;
	let worldY = mouseY - camera.y;

	if (worldX > -gridW/2 && worldX < gridW/2 &&
		worldY > -gridH/2 && worldY < gridH/2) {
		
		return {
			x: Math.floor(((worldX + gridW/2)/gridW)*world.getWidth()),
			y: Math.floor(((worldY + gridH/2)/gridH)*world.getHeight())
		};

	}

	return undefined;
}

// Handles onMouseDown event

function handleMouseDown(evt: MouseEvent) {
	isMouseDown = true;
	if (evt.button == 1) allowPanning();
	if (evt.button == 0 && isMouseDown && !isPanning && !canPan) placeTileAtMouse(evt.x, evt.y);
	startPanning();
}

// Handles onMouseUp event

function handleMouseUp(evt: MouseEvent) {
	isMouseDown = false;
	if (evt.button == 1) disallowPanning();
	stopPanning();
}

// Handles onMouseMove event

function handleMouseMove(evt: MouseEvent) {
	if (lastPos.x === undefined || lastPos.y === undefined) {
		lastPos.x = evt.x;
		lastPos.y = evt.y;
	}

	if (isPanning) pan(evt.x - lastPos.x, evt.y - lastPos.y);

	if (isMouseDown && !isPanning) {
		//placeTileAtMouse(evt.x, evt.y);
		placeTileLine(evt.x, evt.y, lastPos.x, lastPos.y);
	}
	
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

function loadDefs(callback: (success: boolean) => any) {

	const request = new XMLHttpRequest();
	const url = "elements.json";

	request.open("GET", url);
	request.send();

	request.onreadystatechange = (ev) => {
		if (request.readyState == 4) {

			let success = request.status == 200;

			if (success) {

				tileDefs.loadJSON(request.responseText);

				while (elementsPanel.lastChild) {
					elementsPanel.removeChild(elementsPanel.lastChild);
				}

				let lastSelected: HTMLElement;

				for (let i = 0; i < tileDefs.defs.length; i++) {
					
					const def = tileDefs.defs[i];

					if (!def.hidden) {

						let elementSpan = document.createElement("span"); 
						let textNode = document.createTextNode(def.name); 
						elementSpan.appendChild(textNode); 
						elementSpan.className = "element";
						elementSpan.style.background = colorToHex(def.color);

						if (((def.color.R + def.color.G +def.color.B)/3) < (0xff/2)) {
							elementSpan.classList.add("dark");
						}

						if (tileDefs.defaultSelected === def) {
							selectedDef = def;
							lastSelected = elementSpan;
							elementSpan.classList.add("selected");
						}

						elementSpan.addEventListener("click", () =>{
							selectedDef = def;
							if (lastSelected) {
								lastSelected.classList.remove("selected");
							}
							elementSpan.classList.add("selected");
							lastSelected = elementSpan;
						});

						elementsPanel.appendChild(elementSpan);
						
					}				
					
				}
			}
			
			callback(success);

		}
	};

}

function loadStructs(callback: (success: boolean) => any) {

	const request = new XMLHttpRequest();
	const url = "structures.json";

	request.open("GET", url);
	request.send();

	request.onreadystatechange = (ev) => {
		if (request.readyState == 4) {

			let success = request.status == 200;

			if (success) structs.loadJSON(request.responseText);
			
			callback(success);

		}
	};

}

// =======================================================================================

// Starts

updateCanvasSize();
camera.x = canvas.width/2;
camera.y = canvas.height/2;

let didDefsLoad = false;
let didStructsLoad = false;

function start() {
	resetWorld();
	setInterval(() => {
		if (isMouseDown && !isPanning) {
			placeTileAtMouse(lastPos.x, lastPos.y);
		}
		world.tick();
		drawWorld();
		draw();
	}, 100);
}

loadDefs((success) => {
	if (success) {
		didDefsLoad = true;
		if (didStructsLoad) start();
	}
	else {
		alert("Something went wrong, really wrong.\n\nError: Failed loading tile definitions! Try refreshing the page.");		
	}
});

loadStructs((success) => {
	if (success) {
		didStructsLoad = true;
		if (didDefsLoad) start();
	}
	else {
		alert("Something went wrong, really wrong.\n\nError: Failed loading structure! Try refreshing the page.");		
	}
});

btnReset.addEventListener("click", resetWorld);
txtHeight.addEventListener("keydown", (evt) => { if(evt.key === "Enter") resetWorld() });
txtWidth.addEventListener("keydown", (evt) => { if(evt.key === "Enter") resetWorld() });
toggleThermal.addEventListener("click", (evt) => { thermalView = !thermalView });
window.addEventListener("resize", updateCanvasSize);
window.addEventListener("keydown", (evt) => { if(evt.key === " ") allowPanning() });
window.addEventListener("keyup", (evt) => { if(evt.key === " ") disallowPanning() });
canvas.addEventListener("mousedown", handleMouseDown );
canvas.addEventListener("mouseup", handleMouseUp );
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("wheel", handleScroll);