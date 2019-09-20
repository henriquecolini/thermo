interface TileDef {
	name: string,
	id: string,
	color: Color,
	density: number,
	baseTemperature: number,
	heatTransmission: number,
	heatAbsorption: number,
	freezesAt?: number,
	freezesTo?: string,
	freezeSpeed?: number,
	boilsAt?: number,
	boilsTo?: string,
	boilSpeed?: number,
	decaySpeed?: number,
	decaysTo?: string,
	forceTemperatureChange?: boolean,
	slipperiness?: number,
	viscosity?: number,
	solubility?: number,
	static?: boolean,
	defaultSelected?: boolean,
	hidden?: boolean,
	reactions?: {[index: string]:{
		makes: string,
		speed: number,
		byproduct?: string
	}}
};

class TileDefManager {

	public defs: TileDef[];
	public defaultSelected: TileDef;
	private cache: {[index: string]: TileDef};
	private static defaultDefs: TileDef[] = [
		{name: "Wall", id:"wall", color: color(0x6e6563), density: Infinity, baseTemperature: 293, heatTransmission: 0, heatAbsorption: 0, static: true, defaultSelected: true},
		{name: "Air", id:"air", color: color(0xcfcfcf), density: 1, baseTemperature: 293, heatTransmission: 0.8, heatAbsorption: 0.2, viscosity: 0, solubility: 0.125}
	];

	constructor() {
		this.defs = TileDefManager.defaultDefs;
		this.resetCache();
	}

	public loadJSON(json: string) {
		let jsonDefs = JSON.parse(json) as any[];
		this.defs = [];
		for (let i = 0; i < jsonDefs.length; i++) {
			const jdef = jsonDefs[i];
			jdef.color = color(jdef.color);
			let def = jdef as TileDef;
			this.defs.push(def);
			if (def.defaultSelected) this.defaultSelected = def;
		}
		for (let i = 0; i < TileDefManager.defaultDefs.length; i++) {
			const def = TileDefManager.defaultDefs[i];
			if (!this.getById(def.id, true)) {
				this.defs.unshift(def);
			}
		}
		this.resetCache();
	}

	public getById(id: string, ignoreCache: boolean = false): TileDef {
		if (!ignoreCache) {
			return this.cache[id];
		}
		else {
			for (let i = 0; i < this.defs.length; i++) {
				const def = this.defs[i];
				if (def.id === id) return def;
			}
		}
		return undefined;
	}

	private resetCache() {
		this.cache = {};
		for (let i = 0; i < this.defs.length; i++) {
			const def = this.defs[i];
			this.cache[def.id] = def;
		}
	}

}