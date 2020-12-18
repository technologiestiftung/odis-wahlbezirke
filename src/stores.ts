import {writable, Writable} from 'svelte/store';

export const extent = writable([]);
export const blocks = writable({ type: "FeatureCollection", features: [] });
export const blockMap = writable({});
export const simulationBlocks = writable({ type: "FeatureCollection", features: [] });
export const editorBlocks = writable({ type: "FeatureCollection", features: [] });
export const districts = writable([]);
export const districtMap = writable({});
export const simulationDistricts = writable([]);
export const editorDistricts = writable([]);
export const neighbors = writable({ features: [] });
export const neighborMap = writable([]);
export const variations = writable([]);
export const variationDefinitions = writable({});
export const currentVariation = writable(null);
export const currentVariationLoaded = writable(false);
export const stats: Writable<{
  ID: string;
  X: string;
}[] & {
  [key: string]: number;
}[]> = writable([]);
export const joinedStats: Writable<{
  ID: string;
  X: string;
}[] & {
  [key: string]: number;
}[]> = writable([]);
export const states: Writable<{ 
  population: number ,
  id: string,
  num_blocks: number,
  blocks: string[],
  points: number[][],
  color: string
}[][]> = writable([]);
export const weights = writable({
  ID: {
    ignore: true,
  },
  X: {
    ignore: true,
  },
  Number_of_Modified_Blocks: {
    ignore: false,
    weight: 5,
    label: "Anzahl verschobener Blöcke",
  },
  Number_of_Affected_Districts: {
    ignore: false,
    weight: 5,
    label: "Anzahl betroffener Wahlbezirke",
  },
  Average_Area_Perimeter_Score: {
    ignore: true,
  },
  Median_Area_Perimeter_Score: {
    ignore: true,
  },
  Minimum_Area_Perimeter_Score: {
    ignore: true,
  },
  Average_Convex_Hull_Score: {
    ignore: false,
    weight: 5,
    label: "Ø Kompaktheitsindex<br />(0 = wenig kompakt, 1 = sehr kompakt)",
  },
  Median_Convex_Hull_Score: {
    ignore: false,
    weight: 5,
    label: "Median Kompaktheitsindex<br />(0 = wenig kompakt, 1 = sehr kompakt)",
  },
  Minimum_Convex_Hull_Score: {
    ignore: true,
  },
  Number_of_Overpopulated_Districts: {
    ignore: false,
    weight: 5,
    label: "Anzahl Wahlbezirke über 2500 Ew.",
  },
  Average_Population_Size: {
    ignore: false,
    weight: 5,
    label: "Ø Bevölkerung in Wahlbezirken",
  },
  Median_Population_Size: {
    ignore: false,
    weight: 5,
    label: "Median Bevölkerung in Wahlbezirken",
  },
  Standard_Deviation_Population_Size: {
    ignore: false,
    weight: 5,
    label: "Standardabweichung Bevölkerung",
  },
});