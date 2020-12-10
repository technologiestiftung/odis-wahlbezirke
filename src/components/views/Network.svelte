<script lang="ts">
  import Map from  '../Map.svelte';
  import {neighbors, neighborMap, blocks, blockMap} from '../../stores';
  
  let map;
  let mapReady;

  $: if (mapReady) {
    map.setPaintProperty('blocks', 'fill-color', [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      'rgba(46, 145, 210, 1)',
      'rgba(46, 145, 210, 0)'
    ]);
    map.setPaintProperty('blocks', 'fill-outline-color', [
      'case',
      ['boolean', ['feature-state', 'selected'], false],
      '#E60032',
      'black'
    ]);

    let hoveredBlockId = null;

    // Block Hover State
    map.on('mousemove', 'blocks', (e) => {
      if (e.features.length > 0) {
        if (hoveredBlockId) {
          map.setFeatureState(
            { source: 'blocks', id: hoveredBlockId },
            { hover: false }
          );
        }
        hoveredBlockId = e.features[0].id;
        map.setFeatureState(
          { source: 'blocks', id: hoveredBlockId },
          { hover: true }
        );
      }
    });
 
    map.on('mouseleave', 'blocks', () => {
      if (hoveredBlockId) {
        map.setFeatureState(
          { source: 'blocks', id: hoveredBlockId },
          { hover: false }
        );
      }
      hoveredBlockId = null;
    });

    // Network
    map.addSource('network', {
      'type': 'geojson',
      'data': $neighbors,
    });

    map.addLayer({
      'id': 'network',
      'type': 'line',
      'source': 'network',
      'layout': {
        'line-cap': 'round'
      },
      'paint': {
        'line-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          '#E60032',
          'rgba(0,0,0,0.3)'
        ],
        'line-width': 3
      }
    });

    let hoveredNetworkId = null;

    // Network Hover State
    map.on('mousemove', 'network', (e) => {
      if (e.features.length > 0) {
        if (hoveredNetworkId) {
          map.setFeatureState(
            { source: 'network', id: hoveredNetworkId },
            { hover: false }
          );
        }
        hoveredNetworkId = e.features[0].id;
        map.setFeatureState(
          { source: 'network', id: hoveredNetworkId },
          { hover: true }
        );
      }
    });
 
    map.on('mouseleave', 'network', () => {
      if (hoveredNetworkId) {
        map.setFeatureState(
          { source: 'network', id: hoveredNetworkId },
          { hover: false }
        );
      }
      hoveredNetworkId = null;
    });

    map.on('click', 'network', (e) => {
      e.originalEvent.cancelBubble = true;
      let deleteId = null;
      const ids = JSON.parse(e.features[0].properties.ids);
      $neighbors.features.forEach((feature, fi) => {
        if (feature.properties.ids.join('-') === ids.join('-')) {
          deleteId = fi;
        }
      });
      if (deleteId) {
        $neighbors.features.splice(deleteId, 1);
      }
      map.getSource('network').setData($neighbors);
      $neighborMap.splice($neighborMap.indexOf(ids.sort().join('-')), 1);
      updateBlocksFromNeighbors();
    });

    let lastBlock = null;

    map.on('click', 'blocks', (e) => {
      if(e.originalEvent.cancelBubble){
        return;
      }
      if (!lastBlock) {
        lastBlock = e.features[0];
        map.setFeatureState(
          { source: 'blocks', id: lastBlock.id },
          { selected: true }
        );
      } else if (e.features[0].id !== lastBlock.id) {
        if (!($neighborMap.includes([e.features[0].properties.blknr_copy, lastBlock.properties.blknr_copy].sort().join('-')))) {
          $neighbors.features.push({
            type: 'Feature',
            id: $neighbors.features.length,
            properties: {
              ids: [e.features[0].properties.blknr_copy, lastBlock.properties.blknr_copy].sort()
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                JSON.parse(lastBlock.properties.centroid),
                JSON.parse(e.features[0].properties.centroid)
              ]
            }
          });
          $neighborMap.push([e.features[0].properties.blknr_copy, lastBlock.properties.blknr_copy].sort().join('-'))
          map.getSource('network').setData($neighbors);
          updateBlocksFromNeighbors();
        }
        map.setFeatureState(
          { source: 'blocks', id: lastBlock.id },
          { selected: false }
        );
        lastBlock = null;
      }
    });

  }

  const updateBlocksFromNeighbors = () => {
    $blocks.features.forEach((feature) => {
      feature.properties.neighbor_blocks = [];
      feature.properties.neighbors = [];
    });

    $neighbors.features.forEach((feature) => {
      feature.properties.ids.forEach((id, i) => {
        const otherId = (i === 0) ? feature.properties.ids[1] : feature.properties.ids[0];
        $blocks.features[$blockMap[id]].properties.neighbor_blocks.push(otherId);

        const uwb = $blocks.features[$blockMap[otherId]].properties.UWB;
        if (!($blocks.features[$blockMap[id]].properties.neighbors.includes(uwb))) {
          $blocks.features[$blockMap[id]].properties.neighbors.push(uwb);
        }
      });
    });
  };

  const downloadGeoJson = () => {
    const dlAnchorElem = document.createElement('a');
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify($blocks));
    dlAnchorElem.setAttribute("href",dataStr);
    dlAnchorElem.setAttribute("download", "blocks.geojson");
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    dlAnchorElem.remove();
  };
</script>

<div id="viewContainer" class="network">
  <div id="sidebar">
    <h3>Legende</h3>
    <p>
      Für die Optimierung der Wahlbezirke muss festgelegt werden, welche Blöcke benachbart sind. Dies lässt sich leider nicht komplett automatisch durchführen. Die Linien zeigen auf welche Bezirke benachbart sind.<br /><br />
      <img src="/assets/images/pointer.png" alt="Pointer" class="pointer" />
      Um eine Verbindung zu löschen, einfach auf die Linie klicken. Um eine neue Verbindung zu erstellen, zwei Blöcke nacheinander anklicken. Anschließend kann das aktualisierte GeoJSON heruntergeladen werden.<br /><br />
      <button on:click={downloadGeoJson}>Save GeoJSON</button>
    </p>
  </div>
  <Map bind:map bind:mapReady />
</div>