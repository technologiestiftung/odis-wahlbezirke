import {writable} from 'svelte/store';

export const extent = writable([]);
export const blocks = writable({ features: [] });
export const blockMap = writable({});
export const districts = writable([]);
export const districtMap = writable({});
export const neighbors = writable({ features: [] });
export const neighborMap = writable([]);