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
  if (block.properties.neighbor_blocks.length > 0) {
    // check if this node has other neighboring districts
    const neighbors = block.properties.neighbor_blocks;
    let has_other_neighbors = false;
    neighbors.forEach((neighbor) => {
      if (data.features[node_map[neighbor]].properties["UWB"] !== district_id) {
        has_other_neighbors = true;
      }
    });
    if (has_other_neighbors) {
      // check if there are blocks within this district that depend only on this block
      let is_independent = true;
      neighbors.forEach((neighbor) => {
        if (data.features[node_map[neighbor]].properties["UWB"] === district_id) {
          let same_neighbors = 0;
          const next_neighbors = data.features[node_map[neighbor]].properties.neighbor_blocks;
          next_neighbors.forEach((next_neighbor) => {
            if (next_neighbor != block_id && data.features[node_map[neighbor]].properties["UWB"] === district_id) {
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

const clusterDistrict = (data, node_map, remove_id, district_id, cluster) => {
  let cluster_size = 0;

  while (cluster_size < cluster.length) {
    cluster_size = cluster.length;
    cluster.forEach((block_id) => {
      data.features[node_map[block_id]].properties.neighbor_blocks.forEach((neighbor) => {
        if (!cluster.includes(neighbor) && remove_id !== neighbor && data.features[node_map[neighbor]].properties["UWB"] === district_id) {
          cluster.push(neighbor);
        }
      });
    });
  }

  return cluster;
};