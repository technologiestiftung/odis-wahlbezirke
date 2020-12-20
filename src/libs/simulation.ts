// http://stackoverflow.com/questions/962802#962890
export const shuffledList = (count: number): number[] => {
  const array = [];
  for (let i = 0; i<count; i+=1) {
    array.push(i);
  }

  let tmp, current, top = array.length;
  if(top) while(--top) {
    current = Math.floor(Math.random() * (top + 1));
    tmp = array[current];
    array[current] = array[top];
    array[top] = tmp;
  }
  return array;
}

export const isCandidate = (data, node_map, districts, district_map, block_id, district_id) => {
  const block = data.features[node_map[block_id]];
  if (block.properties[__global.env.KEY_NEIGHBOR_BLOCKS].length > 0) {
    // check if this node has other neighboring districts
    const neighbors = block.properties[__global.env.KEY_NEIGHBOR_BLOCKS];
    let has_other_neighbors = false;
    neighbors.forEach((neighbor) => {
      if (data.features[node_map[neighbor]].properties[__global.env.KEY_DISTRICT] !== district_id) {
        has_other_neighbors = true;
      }
    });
    if (has_other_neighbors) {
      // check if there are blocks within this district that depend only on this block
      let is_independent = true;
      neighbors.forEach((neighbor) => {
        if (data.features[node_map[neighbor]].properties[__global.env.KEY_DISTRICT] === district_id) {
          let same_neighbors = 0;
          const next_neighbors = data.features[node_map[neighbor]].properties[__global.env.KEY_NEIGHBOR_BLOCKS];
          next_neighbors.forEach((next_neighbor) => {
            if (next_neighbor != block_id && data.features[node_map[neighbor]].properties[__global.env.KEY_DISTRICT] === district_id) {
              same_neighbors += 1;
            }
          });
          if (same_neighbors === 0) {
            is_independent = false;
          }
        }
      });

      // check if the district is being split apart when this block is removed
      const cluster_start = districts[district_map[district_id]].blocks.filter((d) => d != block_id)[0];
      const cluster = clusterDistrict(data, node_map, block_id, district_id, [cluster_start]);
      if (cluster.length !== districts[district_map[district_id]].blocks.length - 1) {
        is_independent = false;
      }

      if (is_independent) {
        return true;
      }
    }
  }

  return false;
};

export const clusterDistrict = (data, node_map, remove_id, district_id, cluster) => {
  let cluster_size = 0;

  while (cluster_size < cluster.length) {
    cluster_size = cluster.length;
    cluster.forEach((block_id) => {
      data.features[node_map[block_id]].properties[__global.env.KEY_NEIGHBOR_BLOCKS].forEach((neighbor) => {
        if (!cluster.includes(neighbor) && remove_id !== neighbor && data.features[node_map[neighbor]].properties[__global.env.KEY_DISTRICT] === district_id) {
          cluster.push(neighbor);
        }
      });
    });
  }

  return cluster;
};

export const optimization = (simulationDistricts, simulationBlocks, blockMap, districtMap, problems) => {
  let changes = 0;
  simulationDistricts.forEach((district) => {
    if (district.population > parseInt(__global.env.LIMIT) && !problems.includes(district.id)) {
      let selected = false;
      let ids = shuffledList(district.blocks.length);
      for (let i = 0; i < ids.length && !selected; i += 1) {
        if (isCandidate(
            simulationBlocks, 
            blockMap,
            simulationDistricts,
            districtMap,
            district.blocks[ids[i]], 
            district.id
          )
        ) {
          selected = true;

          const block_id = district.blocks[ids[i]];

          // get neighbor districts
          const population = simulationBlocks.features[blockMap[block_id]].properties[__global.env.KEY_POPULATION];
          const neighbor_districts = [
            ...new Set(
              simulationBlocks.features[blockMap[block_id]].properties[__global.env.KEY_NEIGHBOR_BLOCKS].filter((d) => {
                return simulationBlocks.features[blockMap[d]].properties[__global.env.KEY_DISTRICT] != district.id
              })
              .map((d) => simulationBlocks.features[blockMap[d]].properties[__global.env.KEY_DISTRICT])
            )
          ];
          
          // remove from current district
          const bindex = district.blocks.indexOf(block_id);
          district.blocks.splice(bindex, 1);
          district.population -= population;

          // calculate the smallest damage
          let smallest_damage = Number.MAX_VALUE;
          let smallest_damage_id = null;
          neighbor_districts.forEach((neighbor: number) => {
            const damage = simulationDistricts[districtMap[neighbor]].population + population - parseInt(__global.env.LIMIT);
            if (damage < smallest_damage) {
              smallest_damage = damage;
              smallest_damage_id = districtMap[neighbor];
            }
          });

          // move block to neighbor district
          simulationDistricts[smallest_damage_id].blocks.push(block_id);
          simulationDistricts[smallest_damage_id].population += population;

          // update block
          simulationBlocks.features[blockMap[block_id]].properties[__global.env.KEY_DISTRICT] = simulationDistricts[smallest_damage_id].id;
          simulationBlocks.features[blockMap[block_id]].properties.color = simulationDistricts[smallest_damage_id].color;
          simulationBlocks.features[blockMap[block_id]].properties.districtPopulation = simulationDistricts[smallest_damage_id].population;

          changes += 1;
        }
      }
    }
  });
  return {
    simulationBlocks,
    simulationDistricts,
    changes
  };
}
