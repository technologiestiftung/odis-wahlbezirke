import {writable, Writable} from 'svelte/store';

export const extent = writable([]);
export const blocks = writable({ features: [] });
export const blockMap = writable({});
export const simulationBlocks = writable({ features: [] });
export const districts = writable([]);
export const districtMap = writable({});
export const simulationDistricts = writable([]);
export const neighbors = writable({ features: [] });
export const neighborMap = writable([]);
export const states: Writable<{ 
  population: number ,
  uwb: string,
  id: string,
  num_blocks: number,
  blocks: string[],
  points: number[][],
  color: string
}[][]> = writable([]);