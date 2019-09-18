function temperatureColor(temperature: number): Color {
	const L = 2;
	const K = 0.002;
	let factor = temperature > 0 ? (L/(1+(Math.E**(-K*(temperature)))))-L/2 : 0;
	let lerped = lerpColor(color(0x33224d), color(0xfabb3e), factor);
	return lerped;
}

function lerpColor(a: Color, b: Color, amount: number): Color {
    const 
          rr = a.R + amount * (b.R - a.R),
          rg = a.G + amount * (b.G - a.G),
          rb = a.B + amount * (b.B - a.B);

    return {R: rr, G: rg, B: rb};
}

class Tile {

	public temperature: number;
	public def: TileDef;
	public justChanged = false;
	
	constructor(tileDef: TileDef) {
		this.resetDef(tileDef);
	}

	public resetDef(def: TileDef) {
		this.def = def;
		this.temperature = this.def.baseTemperature;
	}

	public getThermalColor(): Color {
		return temperatureColor(this.temperature);
	}

	public clone(): Tile {
		return new Tile(this.def);
	}

	public canReplace(other: Tile): boolean {
		return (other && true) && (!other.def.static) && (!this.def.static) && (this.def.density > other.def.density);
	}
	
}