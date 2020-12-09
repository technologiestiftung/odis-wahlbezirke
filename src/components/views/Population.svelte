<script lang="ts">
  import Map from  '../Map.svelte';
  
  let map;
  let mapReady;

  $: if (mapReady) {
    console.log(map.getCenter());
    // TODO: Do the custom styling here
  }
</script>


<Map bind:map bind:mapReady />