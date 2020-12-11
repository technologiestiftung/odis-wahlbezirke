<script lang="ts">
    import { states, blocks, districts, blockMap, districtMap, editorBlocks, editorDistricts, simulationBlocks, simulationDistricts } from '../../stores';
    import {scaleLinear, max} from 'd3';
    import Map from  '../Map.svelte';

    let map;
    let mapReady;

    let active = false;
    const list_color = scaleLinear<string>().range(['rgb(255,255,255)', 'rgb(255,0,0)']);

    $: if (mapReady) {
        map.setPaintProperty('blocks', 'fill-color', ['get', 'color']);
        map.setPaintProperty('blocks', 'fill-opacity', [
        'case',
        ['>', ['get', 'districtPopulation'], 2500],
        0.7,
        0.2
        ]);
    }

    // TODO: See simulation
    const problems = ["07608", "07609", "07614", "07613"];

    $editorBlocks = JSON.parse(JSON.stringify($blocks));
    $editorDistricts = JSON.parse(JSON.stringify($districts));

    // TODO: editorBlocks > store
    // TODO: load solution... > update editorBlocks / editorDistricts
    // TODO: Modify update
    // TODO: Download geojson/csv
    // 

    const setBackground = (district) => {
        if ((district.num_blocks === 1 && district.population > 2500) || problems.includes(district.id)) {
            return 'rgb(150,150,150)';
        } else if (district.population > 2500) {
            return list_color(district.population);
        } else {
            return 'white';
        }
    };

</script>

<div id="viewContainer" class="simulation">
    <div id="sidebar">
        <h3>Legende</h3>
        <p>
            Diese Simulation zeigt beispielhaft wie der Editor automatisiert Block-Kombinationen für die Wahlbezirke erstellt.<br /><br />
            Um die besten Varianten zu finden, werden tausende solcher Kombinationen binnen weniger Minuten generiert und anschließend miteinander verglichen.<br /><br />
            <img src="/assets/images/pointer.png" alt="Pointer" class="pointer" />
            Nutzen Sie die Buttons um eine Simulation zu starten, zur Veranschaulichung ist diese um ein vielfaches verlangsamt.<br /><br />
            LOADER FOR OTHER VERSIONS
        </p>
    </div>
    <Map bind:map bind:mapReady />
    <div id="simulation">
        <!-- TODO: hover highlight between list and map -->
        <h3>Wahlbezirke die Kriterium erfüllen</h3>
        <ul class="list ok">
            {#each $simulationDistricts as district, i}
            {#if district.population <= 2500}
            <li style="background-color:{setBackground(district)};" title="{district.uwb}: {district.population}"></li>
            {/if}
            {/each}
        </ul>
        <h3>Noch zu optimierende Wahlbezirke</h3>
        <ul class="list over">
            {#each $simulationDistricts as district, i}
            {#if district.population > 2500}
            <li style="background-color:{setBackground(district)};" title="{district.uwb}: {district.population}">{district.uwb}: {district.population}</li>
            {/if}
            {/each}
        </ul>
        <div>Statistics</div>
        <div>Details</div>
    </div>
</div>