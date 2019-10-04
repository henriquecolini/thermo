interface Variant {
	xOffset: number,
	yOffset: number
	tiles: (TileDef|undefined)[][]
}

interface Structure {
	id: string
	variants: Variant[],
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
			struct.variants = [];
			for (let i = 0; i < jsonStruct.variants.length; i++) {
				const jsonVariant = jsonStruct.variants[i];
				const variant: Variant = {
					xOffset: jsonVariant.xOffset ? jsonVariant.xOffset : 0,
					yOffset: jsonVariant.yOffset ? jsonVariant.yOffset : 0,
					tiles: []
				};		
				for (let y = 0; y < jsonVariant.tiles.length; y++) {
					for (let x = 0; x < jsonVariant.tiles[y].length; x++) {
						if (!variant.tiles[x]) variant.tiles[x] = [];
						variant.tiles[x][y] = tileDefs.getById(jsonVariant.tiles[y][x]);
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