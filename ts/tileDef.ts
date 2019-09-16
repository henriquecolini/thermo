interface TileDef {
	name: string,
	id: string,
	color: Color,
	density: number,
	baseTemperature: number,
	conductivity: number,
	boilsAt?: number,
	meltsAt?: number,
	boilsTo?: string,
	meltsTo?: string,
	slipperiness?: number,
	viscosity?: number,
	static?: boolean,
	reactions?: {
		with: string,
		makes: string,
		likelihood: number
	}[],
};

class TileDefManager {

	public defs: TileDef[];
	private static defaultDefs: TileDef[] = [
		{name: "Air", id:"air", color: color(0xcfcfcf), density: 1, baseTemperature: 293, conductivity: 0.1, viscosity: 0},
		{name: "Wall", id:"wall", color: color(0x5c5955), density: Infinity, baseTemperature: 293, conductivity: 0, static: true}
	];

	constructor() {
		this.defs = TileDefManager.defaultDefs;
	}

	public loadJSON(json: string) {
		let jsonDefs = JSON.parse(json) as any[];
		this.defs = [];
		for (let i = 0; i < jsonDefs.length; i++) {
			const jdef = jsonDefs[i];
			jdef.color = color(jdef.color);
			this.defs.push(jdef);
		}
		for (let i = 0; i < TileDefManager.defaultDefs.length; i++) {
			const def = TileDefManager.defaultDefs[i];
			if (!this.getById(def.id)) {
				this.defs.push(def);
			}
		}
	}

	public getById(id: string): TileDef {
		for (let i = 0; i < this.defs.length; i++) {
			const def = this.defs[i];
			if (def.id === id) return def;
		}
		return undefined;
	}

}