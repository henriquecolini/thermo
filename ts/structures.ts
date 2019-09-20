interface Structure {
	id: string
	variants: (TileDef|undefined)[][][],
	xOffset?: number,
	yOffset?: number
}

class StructureManager {
	
	public structures: Structure[];
	private cache: {[index: string]: Structure};

	constructor() {
		this.structures = [];
		this.resetCache();
	}
	
	public loadJSON(json: string) {
		let jsonStructs = JSON.parse(json) as any[];
		this.structures = [];
		for (let i = 0; i < jsonStructs.length; i++) {
			const jsonStruct = jsonStructs[i];
			const struct = {} as Structure;
			struct.id = jsonStruct.id;
			struct.xOffset = jsonStruct.xOffset;
			struct.yOffset = jsonStruct.yOffset;
			struct.variants = [];
			for (let i = 0; i < jsonStruct.variants.length; i++) {
				const jsonVariant = jsonStruct.variants[i];
				const variant = [] as (TileDef|undefined)[][];
				for (let y = 0; y < jsonVariant.length; y++) {
					for (let x = 0; x < jsonVariant[y].length; x++) {
						if (!variant[x]) variant[x] = [];
						variant[x][y] = tileDefs.getById(jsonVariant[y][x]);
					}
				}
				struct.variants.push(variant);
			}
			this.structures.push(struct);
		}
		this.resetCache();
	}

	public getById(id: string, ignoreCache: boolean = false): Structure {
		if (!ignoreCache) {
			return this.cache[id];
		}
		else {
			for (let i = 0; i < this.structures.length; i++) {
				const def = this.structures[i];
				if (def.id === id) return def;
			}
		}
		return undefined;
	}

	private resetCache() {
		this.cache = {};
		for (let i = 0; i < this.structures.length; i++) {
			const def = this.structures[i];
			this.cache[def.id] = def;
		}
	}

}