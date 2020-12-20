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
}

import { buffer, intersect} from '@turf/turf';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

global['__global'] = { env: {}};

Object.keys(process.env).forEach((envvar) => {
    global['__global'].env[envvar] = process.env[envvar];
});

if (process.argv.length < 3){
    throw 'Missing destination param';
}

const bufferSize = (process.argv.length > 3) ? parseFloat(process.argv[3]) : 0.05;

const geojson = JSON.parse(fs.readFileSync('./public/assets/data/blocks.geojson', 'utf8'));

// Create Buffers
const buffers = [];
geojson.features.forEach((feature, f) => {
    buffers.push(buffer(feature, bufferSize));
});

geojson.features.forEach((feature, f) => {
    console.log(`${geojson.features.length} / ${f}`);
    feature.properties[__global.env.KEY_NEIGHBORS] = [];
    feature.properties[__global.env.KEY_NEIGHBOR_BLOCKS] = [];
    const source = buffers[f];
    geojson.features.forEach((ffeature, ff) => {
        if (f != ff && !feature.properties[__global.env.KEY_NEIGHBOR_BLOCKS].includes(ffeature.properties[__global.env.KEY_ID])){
            const target = buffers[ff];
            try {
                if (intersect(source, target)) {
                    feature.properties[__global.env.KEY_NEIGHBOR_BLOCKS].push(ffeature.properties[__global.env.KEY_ID]);
                    ffeature.properties[__global.env.KEY_NEIGHBOR_BLOCKS].push(feature.properties[__global.env.KEY_ID]);

                    if (
                        feature.properties[__global.env.KEY_DISTRICT] !== ffeature.properties[__global.env.KEY_DISTRICT] &&
                        !feature.properties[__global.env.KEY_NEIGHBORS].includes(ffeature.properties[__global.env.KEY_DISTRICT])
                    ) {
                        feature.properties[__global.env.KEY_NEIGHBORS].push(ffeature.properties[__global.env.KEY_DISTRICT]);
                    }

                    if (
                        feature.properties[__global.env.KEY_DISTRICT] !== ffeature.properties[__global.env.KEY_DISTRICT] &&
                        !ffeature.properties[__global.env.KEY_NEIGHBORS].includes(feature.properties[__global.env.KEY_DISTRICT])
                    ) {
                        ffeature.properties[__global.env.KEY_NEIGHBORS].push(feature.properties[__global.env.KEY_DISTRICT]);
                    }
                }
            } catch (e) {
                console.log(`Problem intersecting ${f}:${feature.properties[__global.env.KEY_ID]} and ${ff}:${ffeature.properties[__global.env.KEY_ID]}`);
            }
        }
    });
});

fs.writeFileSync(process.argv[2], JSON.stringify(geojson), 'utf8');

console.log('Network completed');