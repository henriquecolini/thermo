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