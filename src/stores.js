import {writable} from 'svelte/store';

export const extent = writable([]);
export const blocks = writable({ features: [] });
export const blockMap = writable({});
export const simulationBlocks = writable({ features: [] });
export const districts = writable([]);
export const districtMap = writable({});
export const simulationDistricts = writable([]);
export const neighbors = writable({ features: [] });
export const neighborMap = writable([]);