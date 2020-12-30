<script lang="ts">
  import { states, blocks, districts, blockMap, districtMap, simulationBlocks, simulationDistricts } from '../../stores';
  import {scaleLinear, max, select} from 'd3';
  import Map from  '../Map.svelte';
  import {optimization} from '../../libs/simulation';
  
  let map;
  let mapReady;

  let active = false;
  let endReached = false;
  let optimization_state = "stop";
  const list_color = scaleLinear<string>().range(['rgb(255,255,255)', 'rgb(255,0,0)']);

  $: if (mapReady) {
    map.setPaintProperty('blocks', 'fill-color', ['get', 'color']);
    map.setPaintProperty('blocks', 'fill-opacity', [
      'case',
      ['>', ['get', 'districtPopulation'], parseInt(__global.env.LIMIT)],
      0.7,
      0.2
    ]);

    map.setPaintProperty('block-outline', 'line-color', [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        'rgba(46, 145, 210, 1)',
        'rgba(0,0,0,0)'
    ]);
    
    setupSimulation()
  }

  const setupSimulation = () => {
    $states = [];
    $simulationBlocks = JSON.parse(JSON.stringify($blocks));
    $simulationDistricts = JSON.parse(JSON.stringify($districts));
    list_color.domain([parseInt(__global.env.LIMIT), max($simulationDistricts, (d) => d.population)])
  };

  const start = () => {
    if (!active) {
      optimization_state = "running";
      optimize();
    } else {
      optimization_state = "pause";
    }
    active = !active;
  };

  const reset = () => {
    optimization_state = "stop";
    active = false;
    endReached = false;
    $states = [];
    $simulationBlocks = JSON.parse(JSON.stringify($blocks));
    $simulationDistricts = JSON.parse(JSON.stringify($districts));
    map.getSource('blocks').setData($simulationBlocks);
  };

  const update = () => {
    $simulationBlocks.features.forEach((feature, i) => {
      feature.properties.districtPopulation = $simulationDistricts[$districtMap[feature.properties[__global.env.KEY_DISTRICT]]].population;
    });
    map.getSource('blocks').setData($simulationBlocks);
  };

  const problems = __global.env.IGNORE_DISTRICTS.split(",");

  const optimize = () => {
    const optResults = optimization($simulationDistricts, $simulationBlocks, $blockMap, $districtMap, problems);

    $simulationDistricts = optResults.simulationDistricts;
    $simulationBlocks = optResults.simulationBlocks;

    update();
    $states = $states.concat([JSON.parse(JSON.stringify($simulationDistricts))]);

    if (optimization_state === "pause") {
      optimization_state = "stop";
      active = false;
    } else if ($states.length >= 100 || optResults.changes === 0) {
      optimization_state = "stop";
      active = false;
      endReached = true;
    } else {
      setTimeout(optimize, 300);
    }
  };

  const setBackground = (district) => {
    if ((district.num_blocks === 1 && district.population > parseInt(__global.env.LIMIT)) || problems.includes(district.id)) {
      return 'rgb(150,150,150)';
    } else if (district.population > parseInt(__global.env.LIMIT)) {
      return list_color(district.population);
    } else {
      return 'white';
    }
  };

  const hoverDistrict = (id) => {
      $simulationDistricts[$districtMap[id]].blocks.forEach((block) => {
          map.setFeatureState(
              { source: 'blocks', id: $simulationBlocks.features[$blockMap[block]].id },
              { hover: true }
          );
      });
  };

  const resetHover = () => {
      $simulationBlocks.features.forEach((feature) => {
          map.setFeatureState(
              { source: 'blocks', id: feature.id },
              { hover: false }
          );
      });
  };

  let graphHeight;
  let graphWidth;
  const margin = { left: 40, top:30, right:5, bottom:5};

  $: sX = scaleLinear().range([0, graphWidth - margin.left - margin.right]).domain([0, $states.length - 1]);
  $: bY = scaleLinear().range([graphHeight - margin.top - margin.bottom, margin.top]).domain([__global.env.LIMIT, max($simulationDistricts, (d) => d.population)]);
  $: yTicks = bY.ticks(10);

  $: {
    const svgBuffer = 5;
    select('#graph svg')
      .attr('width', svgBuffer - 5)
      .attr('height', svgBuffer - 5)
      .style('width', (svgBuffer - 5) + 'px')
      .style('height', (svgBuffer - 5) + 'px');
  }

  $: stateX = (i, state) => {
    return sX(i);
  };

  $: blockY = (block) => {
    return bY(block.population);
  };

  const limit = parseInt(__global.env.LIMIT);
  const showNetwork = __global.env.SHOW_NETWORK.toLocaleLowerCase();

  export let navigateToTab;
</script>

<div id="viewContainer" class="simulation">
  <div id="sidebar">
    <h3>Legende</h3>
    <p>
      Diese Simulation zeigt beispielhaft wie der Editor automatisiert Block-Kombinationen für die Wahlbezirke erstellt.<br /><br />
      Um die besten Varianten zu finden, werden tausende solcher Kombinationen binnen weniger Minuten generiert und anschließend miteinander verglichen.<br /><br />
      <img src="/assets/images/pointer.png" alt="Pointer" class="pointer" />
      Nutzen Sie die Buttons um eine Simulation zu starten, zur Veranschaulichung ist diese um ein vielfaches verlangsamt.<br /><br />
      <button id="startButton" class:hidden={!mapReady || endReached} class:active="{active}" on:click={start}>
        <span class="icon start">▸</span><span class="icon stop">▪</span>&nbsp;<span class="start">starten</span><span class="stop">stop</span>
      </button><br />
      <button class="start" class:active="{active}" class:hidden={!mapReady} on:click={reset}><span class="icon">↺</span>&nbsp;zurücksetzen</button>
      <button on:click={() => navigateToTab((showNetwork === 'false') ? 2 : 3)} class="continue">Weiter &raquo;</button>
    </p>
  </div>
  <Map bind:map bind:mapReady />
  <div id="simulation">
    <h3>Wahlbezirke die Kriterium erfüllen</h3>
    <ul class="list ok">
      {#each $simulationDistricts as district, i}
      {#if district.population <= limit}
      <li style="background-color:{setBackground(district)};" title="{district.id}: {district.population}"></li>
      {/if}
      {/each}
    </ul>
    <h3>Noch zu optimierende Wahlbezirke</h3>
    <ul class="list over">
      {#each $simulationDistricts as district, i}
      {#if district.population > limit}
      <li on:mouseenter={() => hoverDistrict(district.id)} on:mouseleave={() => resetHover()} style="background-color:{setBackground(district)};" title="{district.id}: {district.population}">{district.id}: {district.population}</li>
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
        <g transform="translate(0, 10)">
          <text class="legend-text">Einwohner*innen je Wahlbezirk</text>
        </g>
        <g transform="translate({margin.left}, 0)">
          {#each $states as state, i}
          <g transform="translate({stateX(i, state)} 0)">
            {#each state as block}
            {#if block.population > limit}
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
        {#if graphWidth}
        <g id="graph-note" transform="translate({graphWidth - 290}, 45)">
          <rect width="290" height="100" />
          <text x="0" y="7" dy="0" font-size="12">
            <tspan x="0" dy=".6em">Jeder <tspan class="largecircle" dy="0.1em">∘</tspan><tspan dx="2" dy="-0.2em"> repräsentiert einen Wahlbezirk. Ziel ist,</tspan></tspan>
            <tspan x="0" dy="1.2em">dass sich die Kreise nach unten, zum Grenzwert</tspan>
            <tspan x="0" dy="1.2em">von 2.500 Einwohner*innen, bewegen.</tspan>
          </text>
        </g>
        {/if}
      </svg>
    </div>
  </div>
</div>