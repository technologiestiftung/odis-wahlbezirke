import {centroid} from '@turf/turf';

export const parseData = (json, district_colors) => {
    const tempDistrictMap = {};
    const tempDistricts = [];
    const tempBlockMap = {};

    const tempNeighbors = {
        type: 'FeatureCollection',
        features: [],
    };

    const tempNeighborMap = [];

    // Calculate overall population in voting districts based on block sum
    json.features.forEach((feature, fi) => {
        const district = feature.properties[__global.env.KEY_DISTRICT];
        feature.properties.centroid = centroid(feature).geometry.coordinates;
        
        tempBlockMap[feature.properties[__global.env.KEY_ID]] = fi;

        if (!(district in tempDistrictMap)) {
        tempDistrictMap[district] = tempDistricts.length;
        tempDistricts.push({
            id: district,
            population: 0,
            num_blocks: 0,
            blocks: [],
            points: [],
            color: (district_colors) ? district_colors(district) : null
        });
        }
        // TODO columns from env
        tempDistricts[tempDistrictMap[district]].population += feature.properties[__global.env.KEY_POPULATION];
        tempDistricts[tempDistrictMap[district]].num_blocks += 1;
        tempDistricts[tempDistrictMap[district]].blocks.push(feature.properties[__global.env.KEY_ID]);
        tempDistricts[tempDistrictMap[district]].points = tempDistricts[tempDistrictMap[district]].points.concat(feature.geometry.coordinates[0]);
    });

    // Assign population of voting district to individual blocks (for vis)
    json.features.forEach((feature, fi) => {
        const district = feature.properties[__global.env.KEY_DISTRICT];
        feature.properties.districtPopulation = tempDistricts[tempDistrictMap[district]].population;
        feature.properties.color = (district_colors) ? district_colors(district) : null;
        feature.id = fi;
        
        feature.properties[__global.env.KEY_NEIGHBOR_BLOCKS].forEach((neighbor) => {
        const key = [feature.properties[__global.env.KEY_ID], neighbor].sort().join('-');
        if (!tempNeighborMap.includes(key)) {
            tempNeighbors.features.push({
            type: 'Feature',
            id: tempNeighborMap.length,
            properties: {
                ids: [feature.properties[__global.env.KEY_ID], neighbor]
            },
            geometry: {
                type: 'LineString',
                coordinates: [
                feature.properties.centroid,
                json.features[tempBlockMap[neighbor]].properties.centroid
                ]
            }
            });
            tempNeighborMap.push(key);
        }
        });
    });

    return {
        json,
        tempNeighbors,
        tempNeighborMap,
        tempBlockMap,
        tempDistricts,
        tempDistrictMap
    };
};