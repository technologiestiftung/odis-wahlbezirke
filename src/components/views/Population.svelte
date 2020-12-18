<script lang="ts">
  import Map from  '../Map.svelte';
  
  let map;
  let mapReady;
  let addPopUp;

  $: if (mapReady) {
    map.setPaintProperty('blocks', 'fill-color', ['get', 'color']);
    map.setPaintProperty('blocks', 'fill-opacity', [
      'case',
      ['>', ['get', 'districtPopulation'], parseInt(__global.env.LIMIT)],
      0.7,
      0.2
    ]);
    map.setPaintProperty('blocks', 'fill-outline-color', [
      'case',
      ['>', ['get', __global.env.KEY_POPULATION], parseInt(__global.env.LIMIT)],
      'red',
      'transparent'
    ]);
    addPopUp();
  }

  const limit = parseInt(__global.env.LIMIT);
</script>

<div id="viewContainer" class="population">
  <div id="sidebar">
    <h3>Legende</h3>
    <p>
      Hervorgehobene Wahlbezirke liegen über dem Zielwert von {limit} Einwohner*innen.<br /><br />
      In manchen Fällen liegen selbst einzelne Blöcke über diesem Zielwert, diese erhalten einen <span style="color:red;">roten</span> Rand. Diese Blöcke und Wahlbezirke werden bei den weiteren Berechnungen nicht mit einbezogen, da dieses Problem vom Editor nicht gelöst werden kann und statt dessen einer manuellen Überarbeitung bedarf (z.B. große Blöcke aufteilen).<br /><br />
      <img src="/assets/images/pointer.png" alt="Pointer" class="pointer" />
      Um mehr über die Wahlbezirke und Blöcke zu erfahren, einfach die Maus über die Karte bewegen.
      <!-- TODO: Add continue button through parent function -->
    </p>
  </div>
  <Map bind:map bind:mapReady bind:addPopUp />
</div>