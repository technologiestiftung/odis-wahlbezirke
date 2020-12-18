export {}

declare global {
  const __global: {
    env: {
      isProd: boolean;
      MAPBOXKEY: string;
      SERVER: string;
      KEY_POPULATION: string;
      KEY_DISTRICT: string;
      KEY_ID: string;
      KEY_NEIGHBORS: string;
      KEY_NEIGHBOR_BLOCKS: string;
      SHOW_NETWORK: string;
      IGNORE_DISTRICTS: string;
      LIMIT: string;
    }
  };

  type votingGeoJson = {
    type: string;
    features: Feature<Polygon, { [name: string]: any; }>[];
  };

  type votingDistrict = {
    id: string;
    population: number;
    points: number[][];
  }[];
}