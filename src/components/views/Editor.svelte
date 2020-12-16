<script lang="ts">
    import { currentVariation, currentVariationLoaded, variations, variationDefinitions, states, blocks, districts, blockMap, districtMap, editorBlocks, editorDistricts, simulationBlocks, simulationDistricts, stats, neighbors } from '../../stores';
    import {scaleLinear, max, filter} from 'd3';
    import Map from  '../Map.svelte';
    import {onMount} from 'svelte';
import { feature } from '@turf/turf';

    let map;
    let mapReady;
    let mapSetup = false;

    const statsMargin = { left: 0, top: 10, right: 0, bottom: 10 };
    let statsWidth = 1;
    let statsHeight = 1;

    let selectedBlock = null;
    let selectedBlockObj = null;
    let switchBlock = null;
    let modified = false;

    let mounted = false;
    onMount(() => {
		mounted = true;
	});

    const list_color = scaleLinear<string>().range(['rgb(255,255,255)', 'rgb(255,0,0)']);

    $: if (mapReady) {
        // This gets called multiple times, is the map ready or what?
        if (!mapSetup) {
            map.setPaintProperty('blocks', 'fill-color', ['get', 'color']);
            
            map.setPaintProperty('blocks', 'fill-opacity', [
                'case',
                ['>', ['get', 'districtPopulation'], 2500],
                0.7,
                0.2
            ]);

            map.on('click', 'blocks', (e) => {
                e.originalEvent.cancelBubble = true;
                const id = e.features[0].properties[__global.env.KEY_ID];
                selectBlock(id, map);
            });

            map.setPaintProperty('block-outline', 'line-color', [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                'rgba(46, 145, 210, 1)',
                ['boolean', ['feature-state', 'selected'], false],
                '#E60032',
                'rgba(0,0,0,0)'
            ]);

            map.setPaintProperty('block-outline', 'line-width', [
                'case',
                ['boolean', ['feature-state', 'selectedDistrict'], false],
                1,
                ['boolean', ['feature-state', 'selectedBlock'], false],
                5,
                1
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

            mapSetup = true;
        }
        setupEditor();
    }

    const selectBlock = (id, source) => {
        if (id !== selectedBlock) {
            switchBlock = $editorBlocks.features[$blockMap[id]].properties[__global.env.KEY_DISTRICT];
            selectedBlockObj = $editorBlocks.features[$blockMap[id]];
            selectedBlock = id;
        } else if (source === 'map'){
            selectedBlock = null;
            selectedBlockObj = null;
            switchBlock = null;
        }

        // This is not super idea, caching ids of all altered features would speed this up
        $editorBlocks.features.forEach((feature) => {
            if (feature.id === selectedBlockObj.id) {
                map.setFeatureState(
                    { source: 'blocks', id: feature.id },
                    {
                        'selectedBlock': true,
                        'selectedDistrict': false,
                        'selected': true
                    }
                );
            } else if(selectedBlock && feature.properties[__global.env.KEY_DISTRICT] === selectedBlockObj.properties[__global.env.KEY_DISTRICT]) {
                map.setFeatureState(
                    { source: 'blocks', id: feature.id },
                    {
                        'selectedBlock': false,
                        'selectedDistrict': true,
                        'selected': true
                    }
                );
            } else {
                map.setFeatureState(
                    { source: 'blocks', id: feature.id },
                    {
                        'selectedBlock': false,
                        'selectedDistrict': false,
                        'selected': false
                    }
                );
            }
        });
    }

    const hoverDistrict = (id) => {
        $editorDistricts[$districtMap[id]].blocks.forEach((block) => {
            map.setFeatureState(
                { source: 'blocks', id: $editorBlocks.features[$blockMap[block]].id },
                { hover: true }
            );
        });
    };

    const hoverBlock = (id) => {
        map.setFeatureState(
            { source: 'blocks', id: $editorBlocks.features[$blockMap[id]].id },
            { hover: true }
        );
    };

    const resetHover = () => {
        $editorBlocks.features.forEach((feature) => {
            map.setFeatureState(
                { source: 'blocks', id: feature.id },
                { hover: false }
            );
        });
    };

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

                        $editorBlocks.features.forEach((feature) => {
                            feature.properties[__global.env.KEY_DISTRICT] = data[feature.properties[__global.env.KEY_ID]];
                        });

                        districtsFromBlocks();
                    });
            } else {
                districtsFromBlocks();
                updateEditor();
            }
        } else {
            districtsFromBlocks();
            updateEditor();
        }
    }

    const districtsFromBlocks = () => {
        $editorDistricts.forEach((district) => {
            district.population = 0;
            district.num_blocks = 0;
            district.blocks = [];
            district.points = [];
        });

        $editorBlocks.features.forEach((feature) => {
            const district = feature.properties[__global.env.KEY_DISTRICT];

            $editorDistricts[$districtMap[district]].population += feature.properties[__global.env.KEY_POPULATION];
            $editorDistricts[$districtMap[district]].num_blocks += 1;
            $editorDistricts[$districtMap[district]].blocks.push(feature.properties[__global.env.KEY_ID]);
            $editorDistricts[$districtMap[district]].points = $editorDistricts[$districtMap[district]].points.concat(feature.geometry.coordinates[0]);
        });

        $editorBlocks.features.forEach((feature) => {
            const district = feature.properties[__global.env.KEY_DISTRICT];
            feature.properties.districtPopulation = $editorDistricts[$districtMap[district]].population;
            feature.properties.color = $editorDistricts[$districtMap[district]].color;
        });

        updateEditor();
    };

    const updateEditor = () => {
        list_color.domain([2500, max($editorDistricts, (d) => d.population)]);
        map.getSource('blocks').setData($editorBlocks);
    };

    $: {
        if ($variations.length === 0) {
            fetch(__global.env.SERVER + '/index.php?action=list&time=' + new Date().getTime())
                .then((result) => result.json())
                .then((data) => {
                    $variations = data;
                });
        }
    }

    // TODO: Download geojson/csv

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
            modified = false;
            setupEditor();
        }
    };

    let variationName = '';
    const saveVariation = () => {
        if (modified && variationName != ''){

            const formData = new FormData();
            formData.append('name', variationName);

            const formBlocks = [];
            $editorBlocks.features.forEach((feature) => {
                formBlocks.push(`${feature.properties[__global.env.KEY_ID]}:${feature.properties[__global.env.KEY_DISTRICT]}`);
            });

            formData.append('blocks', formBlocks.join(';'));

            fetch(__global.env.SERVER + '/index.php?action=save&time=' + new Date().getTime(), {
                method: 'POST',
                body: formData,
            }).then(() => {
                alert('Variante wurde gespeichert.');
                $variations = [];
            });

            modified = false;
            variationName = '';

        } else if (variationName === '') {
            alert('Bitte einen Namen für diese neue Variante eingeben.');
        }
    };

    const changeBlock = () => {
        if (switchBlock !==  selectedBlockObj.properties[__global.env.KEY_DISTRICT]) {
            modified = true;
            $editorBlocks.features[$blockMap[selectedBlock]].properties[__global.env.KEY_DISTRICT] = switchBlock;

            // TODO: derive neighbors from neighbor_blocks

            selectedBlockObj = $editorBlocks.features[$blockMap[selectedBlock]];
            districtsFromBlocks();
        }
    };

    const downloadGeoJson = () => {
        const dlAnchorElem = document.createElement('a');
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify($editorBlocks));
        dlAnchorElem.setAttribute("href",dataStr);
        dlAnchorElem.setAttribute("download", "blocks.geojson");
        document.body.appendChild(dlAnchorElem);
        dlAnchorElem.click();
        dlAnchorElem.remove();
    };

    const blockId = __global.env.KEY_ID;
    const districtId = __global.env.KEY_DISTRICT;
    const populationId = __global.env.KEY_POPULATION;
    const neighborId = __global.env.KEY_NEIGHBORS;

</script>

<div id="viewContainer" class="editor">
    <div id="sidebar">
        <h3>Legende</h3>
        <p>
            In diesem letzten Schritt können die Wahlbezirke noch manuell angepasst werden oder verschiedene Varianten untersucht werden.<br /><br />
            <img src="/assets/images/pointer.png" alt="Pointer" class="pointer" />
            Nutzen Sie die Aktuelle Situation{#if $simulationDistricts.length > 0}, die von ihnen generierte Variante aus der Simulation {/if} oder laden Sie eine vorgenerierte Variante.<br /><br />
            Dann können Sie einzelne Blöcke zwischen Wahlbezirken hin- und herschieben. Klicken Sie hierfür auf einen Block innerhalb eines Wahlbezirks und nutzen Sie die Optionen auf der Rechten Seite, um den Block einem anderen Wahlbezirk zuzuordnen.<br /><br />
            Anschließend können Sie Ihre Variante für alle zugänglich abspeichern oder sich das Ergebnis als GeoJSON herunterladen.<br /><br />
            <strong style="clear:both; display:block;">Wählen Sie eine andere Variante:</strong>
            <select bind:value={selectedVariation}>
                <!-- TODO: connect to simulation -->
                <option value="null">Aktuelle Situation</option>
                <!--<option value="simulation">Ihre Simulation</option>-->
                {#each $variations as variation}
                <option value={variation.filename}>{variation.name}</option>
                {/each}
            </select>
            <button style="margin-bottom:20px;" on:click={loadVariation}>Variante laden</button>
            {#if modified}
            <strong>Eigene Variante abspeichern:</strong>
            <input bind:value={variationName} type="text" placeholder="Name für Variante" />
            <button on:click={saveVariation} style="margin-bottom:20px;">Speichern</button>
            {/if}
            <button on:click={downloadGeoJson}>GeoJSON herunterladen</button>
        </p>
    </div>
    <Map bind:map bind:mapReady />
    <div id="editor">
        {#if mounted && $editorDistricts.length > 0}
        <h3>Noch zu optimierende Wahlbezirke</h3>
        <ul class="list over">
            {#each $editorDistricts as district, i}
            {#if district.population > 2500}
            <li on:mouseenter={() => hoverDistrict(district.id)} on:mouseleave={() => resetHover()} style="background-color:{setBackground(district)};" title="{district.id}: {district.population}">{district.id}: {district.population}</li>
            {/if}
            {/each}
        </ul>
        <div id="editor-stats" bind:clientWidth={statsWidth} bind:clientHeight={statsHeight}>
            <svg>
                <g class="legend" transform="translate({statsMargin.left} {statsMargin.top})">
                    <rect style="fill:#2e91d2;" width="20" height="20" />
                    <text text-anchor="start" x="25" y="14">&lt;= 2500 ({$editorDistricts.filter((d) => d.population <= 2500).length})</text>
                </g>
                <g class="legend" transform="translate({statsWidth - statsMargin.right} {statsMargin.top})">
                    <text text-anchor="end" x="-25" y="14">&gt; 2500 ({$editorDistricts.filter((d) => d.population > 2500).length})</text>
                    <rect style="fill:#E60032;" width="20" height="20" x="-20" />
                </g>
                <g transform="translate({statsMargin.left} {statsMargin.top + 30})">
                    <rect style="fill:#2e91d2;" width="{(statsWidth - statsMargin.left - statsMargin.right) / $editorDistricts.length * $editorDistricts.filter((d) => d.population <= 2500).length}" height="{statsHeight - statsMargin.top - statsMargin.bottom - 30}" />
                    <rect x="{(statsWidth - statsMargin.left - statsMargin.right) / $editorDistricts.length * $editorDistricts.filter((d) => d.population <= 2500).length}" style="fill:#E60032;" width="{(statsWidth - statsMargin.left - statsMargin.right) / $editorDistricts.length * $editorDistricts.filter((d) => d.population > 2500).length}" height="{statsHeight - statsMargin.top - statsMargin.bottom - 30}" />
                </g>
            </svg>
        </div>
        {#if selectedBlock}
        <h3>Block-Informationen ({selectedBlockObj.properties[blockId]})</h3>
        <div id="block-details">
            <p>Zugehöriger Wahlbezirk: {selectedBlockObj.properties[districtId]}</p>
            <h4>Einwohner:</h4>
            <table>
                <thead>
                    <tr>
                        <th>Block</th>
                        <th>Wahlbezirk</th>
                        <th>nach Verschieben</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{selectedBlockObj.properties[populationId]}</td>
                        <td>{$editorDistricts[$districtMap[selectedBlockObj.properties[districtId]]].population}</td>
                        <td>{$editorDistricts[$districtMap[selectedBlockObj.properties[districtId]]].population - selectedBlockObj.properties[populationId]}</td>
                    </tr>
                </tbody>
            </table>
            <h4>Block in anderen Wahlbezirk verschieben:</h4>
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Wahlbezirk</th>
                        <th>Einwohner aktuell</th>
                        <th>nach Verschieben</th>
                    </tr>
                </thead>
                <tbody>
                    {#each selectedBlockObj.properties[neighborId] as neighbor}
                    <tr on:mouseenter={() => hoverDistrict(neighbor)} on:mouseleave={() => resetHover()}>
                        <!-- TODO: something about group binding does not work with initial value... -->
                        <td><input checked={(switchBlock === neighbor) ? true : false} bind:group={switchBlock} value="{neighbor.toString()}" type="radio"></td>
                        <td>{neighbor}</td>
                        <td>{$editorDistricts[$districtMap[neighbor.toString()]].population}</td>
                        <td>{(selectedBlockObj.properties[districtId] != neighbor) ? $editorDistricts[$districtMap[neighbor.toString()]].population + selectedBlockObj.properties[populationId] : ''}</td>
                    </tr>
                    {/each}
                </tbody>
            </table>
            <button class:inactive={(selectedBlockObj.properties[districtId] == switchBlock)} on:click={changeBlock}>Änderung anwenden</button>
            <h4>Weitere Blöcke im Wahlbezirk:</h4>
            <ul id="other-blocks">
                {#each $editorDistricts[$districtMap[selectedBlockObj.properties[districtId]]].blocks as block}
                <li on:mouseenter={() => hoverBlock(block)} on:mouseleave={() => resetHover()} on:click={() => selectBlock(block, 'list')}>{block} ({$editorBlocks.features[$blockMap[block.toString()]].properties[populationId]})</li>
                {/each}
            </ul>
        </div>
        {/if}
        {/if}
    </div>
</div>