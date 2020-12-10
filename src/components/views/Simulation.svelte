<script lang="ts">
  import { states, blocks, districts, blockMap, districtMap, simulationBlocks, simulationDistricts } from '../../stores';
  import {scaleLinear, max} from 'd3';
  import Map from  '../Map.svelte';
  import {shuffledList, isCandidate} from './simulation.js';
  
  let map;
  let mapReady;

  let active = false;
  let optimization_state = "stop";
  const list_color = scaleLinear<string>().range(['rgb(255,255,255)', 'rgb(255,0,0)']);

  $: if (mapReady) {
    map.setPaintProperty('blocks', 'fill-color', ['get', 'color']);
    map.setPaintProperty('blocks', 'fill-opacity', [
      'case',
      ['>', ['get', 'districtPopulation'], 2500],
      0.7,
      0.2
    ]);
    

   setupSimulation()
  }

  const setupSimulation = () => {
    $states = [];
    $simulationBlocks = JSON.parse(JSON.stringify($blocks));
    $simulationDistricts = JSON.parse(JSON.stringify($districts));
    list_color.domain([2500, max($simulationDistricts, (d) => d.population)])
  };

  const start = () => {
    if (!active) {
      optimization_state = "running";
      optimization();
    } else {
      optimization_state = "pause";
    }
    active = !active;
  };

  const reset = () => {
    optimization_state = "stop";
    active = false;
    $states = [];
    $simulationBlocks = JSON.parse(JSON.stringify($blocks));
    $simulationDistricts = JSON.parse(JSON.stringify($districts));
    map.getSource('blocks').setData($simulationBlocks);
  };

  const update = () => {
    $simulationBlocks.features.forEach((feature, i) => {
      feature.properties.districtPopulation = $simulationDistricts[$districtMap[feature.properties.UWB]].population;
    });
    map.getSource('blocks').setData($simulationBlocks);
  };

  // TODO: These are problematic districts which are excluded for now
  const problems = ["07608", "07609", "07614", "07613"];

  const optimization = () => {
    let changes = 0;
    $simulationDistricts.forEach((district) => {
      if (district.population > 2500 && !problems.includes(district.id)) {
        let selected = false;
        let ids = shuffledList(district.blocks.length);
        for (let i = 0; i < ids.length && !selected; i += 1) {
          if (isCandidate(
              $simulationBlocks, 
              $blockMap,
              $simulationDistricts,
              $districtMap,
              district.blocks[ids[i]], 
              district.id
            )
          ) {
            selected = true;

            const block_id = district.blocks[ids[i]];

            // get neighbor districts
            const population = $simulationBlocks.features[$blockMap[block_id]].properties["Insgesamt"];
            const neighbor_districts = [
              ...new Set(
                $simulationBlocks.features[$blockMap[block_id]].properties.neighbor_blocks.filter((d) => {
                  return $simulationBlocks.features[$blockMap[d]].properties["UWB"] != district.id
                })
                .map((d) => $simulationBlocks.features[$blockMap[d]].properties["UWB"])
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
              const damage = $simulationDistricts[$districtMap[neighbor]].population + population - 2500;
              if (damage < smallest_damage) {
                smallest_damage = damage;
                smallest_damage_id = $districtMap[neighbor];
              }
            });

            // move block to neighbor district
            $simulationDistricts[smallest_damage_id].blocks.push(block_id);
            $simulationDistricts[smallest_damage_id].population += population;

            // update block
            $simulationBlocks.features[$blockMap[block_id]].properties["UWB"] = $simulationDistricts[smallest_damage_id].id;
            $simulationBlocks.features[$blockMap[block_id]].properties.color = $simulationDistricts[smallest_damage_id].color;
            $simulationBlocks.features[$blockMap[block_id]].properties.districtPopulation = $simulationDistricts[smallest_damage_id].population;

            changes += 1;
          }
        }
      }
    });

    update();
    $states = $states.concat([JSON.parse(JSON.stringify($simulationDistricts))]);

    if (optimization_state === "pause") {
      optimization_state = "stop";
    } else {
      setTimeout(optimization, 300);
    }
  };

  const setBackground = (district) => {
    if ((district.num_blocks === 1 && district.population > 2500) || problems.includes(district.id)) {
      return 'rgb(150,150,150)';
    } else if (district.population > 2500) {
      return list_color(district.population);
    } else {
      return 'white';
    }
  };

  let graphHeight;
  let graphWidth;
  const margin = { left: 50, top:5, right:5, bottom:5};

  $: sX = scaleLinear().range([0, graphWidth - margin.left - margin.right]).domain([0, $states.length - 1]);
  $: bY = scaleLinear().range([graphHeight - margin.top - margin.bottom, margin.top]).domain([2500, max($simulationDistricts, (d) => d.population)]);
  $: yTicks = bY.ticks(10);

  $: stateX = (i, state) => {
    return sX(i);
  };

  $: blockY = (block) => {
    return bY(block.population);
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
      <button id="startButton" class:hidden={!mapReady} class:active="{active}" on:click={start}>
        <span class="icon start">▸</span><span class="icon stop">▪</span>&nbsp;<span class="start">starten</span><span class="stop">stop</span>
      </button><br />
      <button class="start" class:active="{active}" class:hidden={!mapReady} on:click={reset}><span class="icon">↺</span>&nbsp;zurücksetzen</button>
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
    <h3>Simulationsübersicht <span>(Iteration {$states.length})</span></h3>
    <div id="graph" bind:clientWidth={graphWidth} bind:clientHeight={graphHeight}>
      <svg>
        <g class="axis y-axis" transform="translate({margin.left}, {margin.top})">
          {#each yTicks as tick}
            <g class="tick" transform="translate(0, {bY(tick) - margin.bottom})">
              <line x2="100%"></line>
              <text text-anchor="end" x="-8" y="5">{tick}</text>
            </g>
          {/each}
        </g>
        <g transform="translate({margin.left}, 0)">
          {#each $states as state, i}
          <g transform="translate({stateX(i, state)} 0)">
            {#each state as block}
            {#if block.population > 2500}
            <circle 
              cx="0"
              cy="{blockY(block)}"
              r="2"
              style="fill:{setBackground(block)}; stroke:rgba(0,0,0,0.5); stroke-width:1px;" />
            {/if}
            {/each}
          </g>
          {/each}
        </g>
      </svg>
    </div>
  </div>
</div>