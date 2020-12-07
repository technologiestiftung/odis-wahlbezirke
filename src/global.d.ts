export {}

declare global {
  const __global: {
    env: {
      isProd: boolean;
      MAPBOXKEY: string;
    }
  };
}