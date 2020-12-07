<script lang="ts">

  import { blocks } from "../stores.js"

  import { onMount } from "svelte";
  import mapbox from "mapbox-gl";
  
  let map;
  let container;

  mapbox.accessToken = __global.env.MAPBOXKEY;

  const setupMap = () => {
    map = new mapbox.Map({
      container,
      style: "mapbox://styles/mapbox/light-v10",
      center: [13.373722095390642, 52.44048953691126],
      zoom: 11,
      scrollZoom: false,
    });

    map.on("load", () => {

      if("type" in $blocks){
        setupGeoJson();
      } else {
        fetch('/assets/data/blocks.geojson')
          .then((response) => response.json())
          .then((json) => {
            $blocks = json;
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

<style>
  div {
    width: 100%;
    height: 100vh;
  }
</style>

<div bind:this={container}>
  {#if map}
    <slot />
  {/if}
</div>