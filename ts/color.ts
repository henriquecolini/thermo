type Color = {R: number, G: number, B: number};

function decomposeIntColor(integer: number): Color {
	return {R: integer >> 16, G: integer >> 8 & 0xff, B: integer & 0xff};
}

function parseHexColor(hexColor: string): Color {	
	let colorStr = hexColor.replace('#','');
	let colorInt = parseInt(colorStr, 16);
	return decomposeIntColor(colorInt);
}

function color(color: number|string): Color {
	if (typeof color === "number") return decomposeIntColor(color);
	else if (typeof color === "string") return parseHexColor(color);
}