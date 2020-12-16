const fs = require('fs')
const json = JSON.parse(fs.readFileSync('./blocks_improved.geojson'));
json.features.forEach((feature) => {
    feature.properties = {
        population: feature.properties.Insgesamt,
        district: feature.properties.UWB,
        id: feature.properties.blknr_copy,
        neighbors: feature.properties.neighbors,
        neighbor_blocks: feature.properties.neighbor_blocks
    };
});
fs.writeFileSync('blocks_cleaned.geojson', JSON.stringify(json), 'utf8');
