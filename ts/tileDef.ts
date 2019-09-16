interface TileDef {
	name: string,
	id: string,
	color: string,
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
		{name: "Air", id:"air", color: "cfcfcf", density: 1, baseTemperature: 293, conductivity: 0.3, viscosity: 0},
		{name: "Wall", id:"wall", color: "5c5955", density: Infinity, baseTemperature: 293, conductivity: 0, static: true}
	];

	constructor() {
		this.defs = TileDefManager.defaultDefs;
	}

	public loadJSON(json: string) {
		this.defs = JSON.parse(json) as TileDef[];
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