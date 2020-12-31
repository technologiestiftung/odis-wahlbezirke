const fs = require('fs');

const files = [
'./public/assets/data/best/simulation_0_1.geojson',
'./public/assets/data/best/simulation_0_2.geojson',
'./public/assets/data/best/simulation_0_3.geojson',
'./public/assets/data/best/simulation_0_4.geojson',
'./public/assets/data/best/simulation_0_5.geojson',
'./public/assets/data/best/simulation_0_6.geojson',
'./public/assets/data/best/simulation_0_7.geojson',
'./public/assets/data/best/simulation_0_8.geojson',
'./public/assets/data/best/simulation_0_9.geojson',
'./public/assets/data/best/simulation_52_74.geojson',
'./public/assets/data/best/simulation_52_75.geojson',
'./public/assets/data/best/simulation_52_76.geojson',
'./public/assets/data/best/simulation_52_77.geojson',
'./public/assets/data/best/simulation_52_78.geojson',
'./public/assets/data/best/simulation_52_79.geojson',
'./public/assets/data/best/simulation_52_80.geojson',
'./public/assets/data/best/simulation_52_81.geojson',
'./public/assets/data/best/simulation_52_82.geojson',
'./public/assets/data/best/simulation_52_83.geojson',
'./public/assets/data/best/simulation_316_16.geojson',
'./public/assets/data/best/simulation_316_85.geojson',
'./public/assets/data/best/simulation_316_99.geojson',
'./public/assets/data/best/simulation_924_32.geojson',
'./public/assets/data/best/simulation_924_33.geojson',
'./public/assets/data/best/simulation_316_46.geojson',
'./public/assets/data/best/simulation_316_47.geojson',
'./public/assets/data/best/simulation_316_48.geojson',
'./public/assets/data/best/simulation_316_50.geojson',
'./public/assets/data/best/simulation_316_35.geojson',
'./public/assets/data/best/simulation_707_69.geojson',
'./public/assets/data/best/simulation_707_70.geojson',
'./public/assets/data/best/simulation_707_71.geojson',
'./public/assets/data/best/simulation_707_72.geojson',
'./public/assets/data/best/simulation_707_73.geojson',
'./public/assets/data/best/simulation_707_74.geojson',
'./public/assets/data/best/simulation_707_75.geojson',
'./public/assets/data/best/simulation_707_76.geojson',
'./public/assets/data/best/simulation_707_77.geojson',
'./public/assets/data/best/simulation_707_78.geojson',
'./public/assets/data/best/simulation_8_50.geojson',
'./public/assets/data/best/simulation_8_51.geojson',
'./public/assets/data/best/simulation_8_52.geojson',
'./public/assets/data/best/simulation_8_53.geojson',
'./public/assets/data/best/simulation_8_54.geojson',
'./public/assets/data/best/simulation_8_55.geojson',
'./public/assets/data/best/simulation_8_56.geojson',
'./public/assets/data/best/simulation_8_57.geojson',
'./public/assets/data/best/simulation_8_58.geojson',
'./public/assets/data/best/simulation_8_59.geojson',
'./public/assets/data/best/simulation_73_64.geojson',
'./public/assets/data/best/simulation_73_72.geojson',
'./public/assets/data/best/simulation_73_78.geojson',
'./public/assets/data/best/simulation_73_71.geojson',
'./public/assets/data/best/simulation_73_73.geojson',
'./public/assets/data/best/simulation_73_75.geojson',
'./public/assets/data/best/simulation_73_76.geojson',
'./public/assets/data/best/simulation_73_77.geojson',
'./public/assets/data/best/simulation_73_79.geojson',
'./public/assets/data/best/simulation_73_93.geojson'
];

for (let f = 0; f < files.length; f += 1) {
  const json = JSON.parse(fs.readFileSync(files[f]));
  const output = {};
  json.forEach((district) => {
    district.blocks.forEach((block) => {
      output[block] = district.id;
    });
  });
  fs.writeFileSync('./public/assets/data/best-min/' + files[f].split('best/')[1].split('.')[0] + '.json', JSON.stringify(output), 'utf8');
}