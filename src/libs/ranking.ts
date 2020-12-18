import { sum, median, mean, max, quantile, deviation } from "d3";
import { area, length, union, polygonToLine, Position } from "@turf/turf";


export const rank = (id: string, name: string, originalGeoJson: votingGeoJson, simulationGeoJson: votingGeoJson, districts: votingDistrict): {
  ID: string;
  X: string;
  Number_of_Overpopulated_Districts: number;
  Number_of_Modified_Blocks: number;
  Number_of_Affected_Districts: number;
  Median_Population_Size: number;
  Average_Population_Size: number;
  Standard_Deviation_Population_Size: number;
  Average_Convex_Hull_Score: number;
  Median_Convex_Hull_Score: number;
} => {

  // how many blocks have been moved around compared to the original
  // and how many corresponding districts were changed
  let blockChanges = 0;
  let changedDistricts = [];
  // A perfect compactness is a circle which is Math.PI*2*r / Math.PI*r*r
  // We take the perimeter of the district, act like its a cirlce and calculate the ideal area
  // The compactness score is the actual area divided by the ideal circle area.
  // The perfect compactness score is therefore 1 (likely never to be reached)
  const districtPolygons = {};
  const ratio = (perimeter, area) => {
    const radius = perimeter / Math.PI / 2;
    const circularArea = Math.PI * Math.pow(radius, 2);
    return area / circularArea;
  };
  const compactness = [];

  originalGeoJson.features.forEach((feature, fi) => {
    const tempDistricts = [
      feature.properties[__global.env.KEY_DISTRICT].toString(),
      simulationGeoJson.features[fi].properties[__global.env.KEY_DISTRICT].toString()
    ];
    if (tempDistricts[0] !== tempDistricts[1]) {
      blockChanges += 1;
      
      tempDistricts.forEach((district) => {
        if (!changedDistricts.includes(district)) {
          changedDistricts.push(district);
        }
      });
    }
    if (!(tempDistricts[1] in districtPolygons)) {
      districtPolygons[tempDistricts[1]] = feature;
    } else {
      districtPolygons[tempDistricts[1]] = union(districtPolygons[tempDistricts[1]], feature);
    }
  });
  const districtChanges = changedDistricts.length;

  Object.keys(districtPolygons).forEach((district) => {
    compactness.push(ratio(
      length(polygonToLine(districtPolygons[district])),
      area(districtPolygons[district])
    ));
  });

  const compactness_mean = mean(compactness);
  const compactness_median = median(compactness);

  // In this script we calculate more criterias than we return
  // We explored correlations across tons of simulations and ended
  // up using only a subset for ranking the simulation results
  let bad = 0;
  let errors = [];
  let good = 0;

  districts.forEach((district) => {
    if (district.population > parseInt(__global.env.LIMIT) && !__global.env.IGNORE_DISTRICTS.split(',').includes(district.id)) {
      bad += 1;
      errors.push(district.population - parseInt(__global.env.LIMIT));
    } else {
      good += 1;
    }
  });

  const error_sum = sum(errors);
  const error_median = median(errors);
  const error_mean = mean(errors);
  const error_max = max(errors);
  const quantiles = [
    quantile(errors, 0),
    quantile(errors, 0.25),
    quantile(errors, 0.5),
    quantile(errors, 0.75),
    quantile(errors, 1)
  ];

  let population_mean = mean(districts, (d) => d.population);
  let population_median = median(districts, (d) => d.population);
  let population_stddev = deviation(districts, (d) => d.population);

  return {
    ID: id,
    X: name,
    Number_of_Overpopulated_Districts: bad,
    Number_of_Modified_Blocks: blockChanges,
    Number_of_Affected_Districts: districtChanges,
    Median_Population_Size: population_median,
    Average_Population_Size: population_mean,
    Standard_Deviation_Population_Size: population_stddev,
    Average_Convex_Hull_Score: compactness_mean,
    Median_Convex_Hull_Score: compactness_median
  };
};