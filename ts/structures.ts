interface Structure {
	id: string
	tiles: (TileDef|undefined)[][],
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
			struct.tiles = [];
			for (let y = 0; y < jsonStruct.tiles.length; y++) {
				for (let x = 0; x < jsonStruct.tiles[y].length; x++) {
					if (!struct.tiles[x]) struct.tiles[x] = [];
					struct.tiles[x][y] = tileDefs.getById(jsonStruct.tiles[y][x]);
				}
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