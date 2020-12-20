<script lang="ts">

  import { extent, blocks, districts, districtMap, blockMap, neighbors, neighborMap } from "../stores"

  import {parseData} from "../libs/data";

  import { onMount } from "svelte";
  import mapbox from "mapbox-gl";
  import {scaleOrdinal, schemeCategory10} from 'd3';
  import {centroid, bbox} from '@turf/turf';

  export let map;
  let container;

  export let mapReady = false;

  const district_colors = scaleOrdinal(schemeCategory10);

  mapbox.accessToken = __global.env.MAPBOXKEY;

  const setupMap = () => {
    map = new mapbox.Map({
      container,
      style: "mapbox://styles/mapbox/light-v10",
      center: [13.373722095390642, 52.44048953691126],
      zoom: 11,
      scrollZoom: false,
    });

    map.addControl(new mapbox.NavigationControl(), 'bottom-left');

    map.on("load", () => {

      if($blocks.features.length > 0){
        setupGeoJson();
      } else {
        fetch('/assets/data/blocks.geojson')
          .then((response) => response.json())
          .then((json) => {
            const parseResults = parseData(json, district_colors);

            $neighbors = parseResults.tempNeighbors;
            $neighborMap = parseResults.tempNeighborMap;
            $blocks = parseResults.json;
            $extent = bbox(parseResults.json);
            $blockMap = parseResults.tempBlockMap;
            $districts = parseResults.tempDistricts;
            $districtMap = parseResults.tempDistrictMap;

            setupGeoJson();
          });
      }
    });
  };

  const setupGeoJson = () => {
    map.addSource('blocks', {
      'type': 'geojson',
      'data': $blocks,
    });

    map.addLayer({
      'id': 'blocks',
      'type': 'fill',
      'source': 'blocks',
      'layout': {},
      'paint': {
        'fill-color': '#088',
        'fill-opacity': 0.8
      }
    });

    map.addLayer({
      'id': 'block-outline',
      'type': 'line',
      'source': 'blocks',
      'layout': {},
      'paint': {
        'line-color': 'rgba(0,0,0,0)'
      }
    });

    // map.fitBounds($extent, {
    //   padding: 20
    // });

    mapReady = true;
  };

  export const addPopUp = () => {
    const popup = new mapbox.Popup({
      closeButton: false,
      closeOnClick: false
    });
 
    map.on('mousemove', 'blocks', (e) => {
      if (e.features.length > 0) {
        map.getCanvas().style.cursor = 'pointer';
        
        const description = `<div id="mapbox-popup">
          <p class="headline">ID: ${e.features[0].properties[__global.env.KEY_ID]}</p>
          <p>Bevölkerung:</p>
          <table>
            <thead>
              <tr>
                <th>Block</th>
                <th>Wahlbezirk</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${e.features[0].properties[__global.env.KEY_POPULATION]}</td>
                <td>${e.features[0].properties.districtPopulation}</td>
              </tr>
            </tbody>
          </table>
        </div>`;
        
        popup.setLngLat(e.lngLat).setHTML(description).addTo(map);
      }
    });
    
    map.on('mouseleave', 'blocks', () => {
      map.getCanvas().style.cursor = '';
      popup.remove();
    });
  };

  onMount(() => {
    const stylesheetID = "mapbox-stylesheet";
    if (document.querySelectorAll("#" + stylesheetID).length === 0) {
      const link = document.createElement("link");
      link.id = stylesheetID;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/mapbox-gl/dist/mapbox-gl.css";
      link.onload = () => {
        setupMap();
      };
      document.head.appendChild(link);
    } else {
      setupMap();
    }
    
    return () => {
      if (map) {
        map.remove();
      }
    };
  });
</script>

<div id="map" bind:this={container}>
  {#if map}
    <slot />
  {/if}
</div>