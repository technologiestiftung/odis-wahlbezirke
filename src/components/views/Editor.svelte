<script lang="ts">
    import { currentVariation, currentVariationLoaded, variations, variationDefinitions, states, blocks, districts, blockMap, districtMap, editorBlocks, editorDistricts, simulationBlocks, simulationDistricts } from '../../stores';
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
        setupEditor();
    }

    // TODO: See simulation
    const problems = ["07608", "07609", "07614", "07613"];

    const setupEditor = () => {
        if (!$currentVariationLoaded) {
            $currentVariationLoaded = true;
            $editorBlocks = JSON.parse(JSON.stringify($blocks));
            $editorDistricts = JSON.parse(JSON.stringify($districts));
            if ($currentVariation !== null && $currentVariation !== 'null') {
                fetch(__global.env.SERVER + '/data/' + $currentVariation)
                    .then((result) => result.json())
                    .then((data) => {

                        $editorDistricts.forEach((district) => {
                            district.population = 0;
                            district.num_blocks = 0;
                            district.blocks = [];
                            district.points = [];
                        });

                        $editorBlocks.features.forEach((feature) => {
                            feature.properties.UWB = data[feature.properties.blknr_copy];
                            const uwb = feature.properties.UWB;

                            $editorDistricts[$districtMap[uwb]].population += feature.properties["Insgesamt"];
                            $editorDistricts[$districtMap[uwb]].num_blocks += 1;
                            $editorDistricts[$districtMap[uwb]].blocks.push(feature.properties.blknr_copy);
                            $editorDistricts[$districtMap[uwb]].points = $editorDistricts[$districtMap[uwb]].points.concat(feature.geometry.coordinates[0]);
                        });

                        $editorBlocks.features.forEach((feature) => {
                            const uwb = feature.properties.UWB;
                            feature.properties.districtPopulation = $editorDistricts[$districtMap[uwb]].population;
                            feature.properties.color = $editorDistricts[$districtMap[uwb]].color;
                        });

                        updateEditor();
                    });
            } else {
                updateEditor();
            }
        }
    }

    const updateEditor = () => {
        list_color.domain([2500, max($editorDistricts, (d) => d.population)]);
        map.getSource('blocks').setData($editorBlocks);
    };

    if ($variations.length === 0) {
        fetch(__global.env.SERVER + '/index.php?action=list')
        .then((result) => result.json())
        .then((data) => {
            $variations = data;
        });
    }

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

    let selectedVariation = $currentVariation;
    if (selectedVariation === null) {
        selectedVariation = 'null';
    }

    const loadVariation = () => {
        if (selectedVariation !== $currentVariation) {
            $currentVariation = selectedVariation;
            $currentVariationLoaded = false;
            setupEditor();
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
            <strong>Wählen Sie eine andere Variante:</strong>
            <select bind:value={selectedVariation}>
                <!-- TODO: connect to simulation -->
                <option value="null">Aktuelle Simulation</option>
                {#each $variations as variation}
                <option value={variation.filename}>{variation.name}</option>
                {/each}
            </select>
            <button on:click={loadVariation}>Variante laden</button>
            <!-- TODO: only show after edit... -->
            <strong>Eigene Variante abspeichern:</strong>
            <input type="text" placeholder="Name für Variante" />
            <button>Speichern</button>
        </p>
    </div>
    <Map bind:map bind:mapReady />
    <div id="simulation">
        <h3>Noch zu optimierende Wahlbezirke</h3>
        <ul class="list over">
            {#each $editorDistricts as district, i}
            {#if district.population > 2500}
            <li style="background-color:{setBackground(district)};" title="{district.uwb}: {district.population}">{district.uwb}: {district.population}</li>
            {/if}
            {/each}
        </ul>
        <div>Statistics</div>
        <div>Details</div>
    </div>
</div>