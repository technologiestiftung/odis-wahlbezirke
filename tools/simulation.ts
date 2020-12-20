import type {Feature, Polygon} from '@turf/turf';

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

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import {parseData} from '../src/libs/data';
import {optimization} from '../src/libs/simulation';
import {rank} from '../src/libs/ranking';
import {max} from 'd3';

dotenv.config();

global['__global'] = { env: {}};

Object.keys(process.env).forEach((envvar) => {
    global['__global'].env[envvar] = process.env[envvar];
});

if (process.argv.length < 3){
    throw 'Missing destination-folder param';
}
const folder = process.argv[2];

if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
}

const count = (process.argv.length > 3) ? parseInt(process.argv[3]) : 1000;
const iterations = (process.argv.length > 4) ? parseInt(process.argv[4]) : 100;
const bestof = (process.argv.length > 5) ? parseInt(process.argv[5]) : 10;

let cCount = 0;
let cIteration = 0;

const statistics = [];

const geojson = JSON.parse(fs.readFileSync('./public/assets/data/blocks.geojson', 'utf8'));

const parseResults = parseData(geojson, false);

const blocks = parseResults.json;
const blockMap = parseResults.tempBlockMap;
const districts = parseResults.tempDistricts;
const districtMap = parseResults.tempDistrictMap;

const problems = __global.env.IGNORE_DISTRICTS;

let simulationBlocks;
let simulationDistricts;

const start = () => {
    simulationBlocks = JSON.parse(JSON.stringify(blocks));
    simulationDistricts = JSON.parse(JSON.stringify(districts));
};

start();

const sort = (a,b) => {
    return a[0]-b[0];
};

const optimize = () => {
    console.log(cCount, cIteration);
    const optResults = optimization(simulationDistricts, simulationBlocks, blockMap, districtMap, problems);

    simulationDistricts = optResults.simulationDistricts;
    simulationBlocks = optResults.simulationBlocks;

    fs.writeFileSync(`${folder}/simulation_${cCount}_${cIteration}.geojson`, JSON.stringify(simulationDistricts), 'utf8');
    statistics.push(rank(statistics.length.toString(), `simulation_${cCount}_${cIteration}.geojson`, blocks, simulationBlocks, districts));
    
    cIteration += 1;

    if (cIteration >= iterations) {
        start();
        cIteration = 0;
        cCount += 1;
        if (cCount > count) {
            fs.writeFileSync(`${folder}/statistics.json`, JSON.stringify(statistics));

            const offsetWeights = ['Median_Population_Size', 'Average_Population_Size'];
            const maxValues = {};
            const normalized = [];
            const weights = [];
            const best = {};
            let bestOverall = [];
            Object.keys(statistics[0]).forEach((key) => {
                if (key !== 'X' && key !== 'ID') {
                    weights.push(key);
                    best[key] = [];
                }
            });
            weights.forEach((key) => {
                maxValues[key] = max(statistics, (d) => (offsetWeights.includes(key)) ? Math.abs(d[key] - parseInt(__global.env.LIMIT)) : d[key]);
            });
            statistics.forEach((stat, i) => {
                let statSum = 0;
                const tStat = JSON.parse(JSON.stringify(stat));
                weights.forEach((key) => {
                    tStat[key] =  (offsetWeights.includes(key)) ? Math.abs(tStat[key] - parseInt(__global.env.LIMIT)) / maxValues[key] : tStat[key] / maxValues[key];
                    if (best[key].length < bestof) {
                        best[key].push([tStat[key], i]);
                        best[key] = best[key].sort(sort);
                    } else if (tStat[key] < max(best[key], (d) => d[0])) {
                        best[key][bestof - 1] = [tStat[key], i];
                        best[key] = best[key].sort(sort);
                    }
                    statSum += tStat[key];
                });
                normalized.push(tStat);
                if (bestOverall.length < bestof) {
                    bestOverall.push([statSum, i]);
                    bestOverall = bestOverall.sort(sort);
                } else if (statSum < max(bestOverall, (d) => d[0])) {
                    bestOverall[bestof - 1] = [statSum, i];
                    bestOverall = bestOverall.sort(sort);
                }
            });

            const bestSolutions = bestOverall.map((d) => d[1]);
            weights.forEach((key) => {
                best[key].forEach((id) => {
                    if (!bestSolutions.includes(id[1])){
                        bestSolutions.push(id[1]);
                    }
                });
            });

            const csvKeys = Object.keys(statistics[0]);
            let csv = csvKeys.join(',');
            const rows = [];
            bestSolutions.map((id) => {
                const cols = [];
                csvKeys.forEach((key) => {
                    cols.push(statistics[id][key]);
                });
                rows.push(cols.join(','));
            });
            csv += rows.join('\n');

            fs.writeFileSync(`${folder}/best.csv`, csv, 'utf8');

            console.log('simulation complete')
        } else {
            setTimeout(optimize, 1);
        }
    } else {
        setTimeout(optimize, 1);
    }
};

optimize();