<script lang="ts">
  import {joinedStats} from '../../stores';
  import {bin, scaleLinear, extent} from 'd3';
  import {onMount, createEventDispatcher} from 'svelte';

  export let dimension;
  export let key;

  let mounted = false;
  onMount(() => {
		mounted = true;
	});

  let graphWidth;
  let graphHeight;

  const margin = {top: 0, right: 8, bottom: 24, left: 30};

  $: graphDWidth = graphWidth - margin.left - margin.right;
  $: graphDHeight = graphHeight - margin.top - margin.bottom;

  $: histogram = bin().value((d) => d[key]).thresholds(15)($joinedStats);

  $: x = scaleLinear()
          .range([0, graphDWidth])
          .domain([histogram[0].x0, histogram[histogram.length - 1].x1]);
  
  $: y = scaleLinear()
          .range([graphDHeight, 0])
          .domain(extent(histogram, (d) => d.length));

  let yTicks = [];
  let xTicks = [];

  $: {
    const tTicks = histogram.map((d) => d.x0).concat([histogram[histogram.length - 1].x1]);
    xTicks = tTicks;
    if (graphDWidth / xTicks.length < 40) {
      xTicks = [];
      for (let i = 0; i < tTicks.length; i += 2) {
        xTicks.push(tTicks[i]);
      }
    }
  }

  const dispatch = createEventDispatcher();
  const setKey = (key: string | null) => {
    dispatch('setKey', {
      key
    });
  };

  const setWeight = () => {
    dispatch('updateMds');
  };

  export let showPoint = false;

</script>

<div class="mdsGraph" on:mouseenter={() => setKey(key)} on:mouseleave={() => setKey(null)}>
  <span class="label">{@html dimension.label}</span>
  <div class="weight"><div class="container">
    <span class="weight-label">Gewichtung:&nbsp;{dimension.weight}</span>
    <input on:change={setWeight} type="range" min="0" max="10" bind:value={dimension.weight}>
  </div></div>
  <div class="svg-container" bind:clientWidth={graphWidth} bind:clientHeight={graphHeight}>
    <svg>
      {#if mounted && $joinedStats.length > 0}
      <g class="bars" transform="translate({margin.left}, {margin.top})">
        {#each histogram as bar}
        {#if bar.length > 0}
        <rect x="{x(bar.x0)}" y="{y(bar.length)}" height="{graphDHeight - y(bar.length)}" width="{x(bar.x1)-x(bar.x0)}" ></rect>
        {/if}
        {/each}
      </g>
      <g class="axis x-axis">
        <line transform="translate({margin.left} {margin.top + graphDHeight})" y1="0" y2="0" x1="0" x2="{graphDWidth}" />
        {#each xTicks as tick}
        <line transform="translate({x(tick) + margin.left} 0)" y1="{graphDHeight + margin.top}" y2="{graphDHeight + margin.top + 4}" />
        <text transform="translate({x(tick) + margin.left} {graphDHeight + margin.top + 16})" text-anchor="middle">{tick}</text>
        {/each}
      </g>
      <g class="axis y-axis">
        <line y1="{margin.top}" y2="{graphDHeight}" x1="{margin.left}" x2="{margin.left}" />
        {#each yTicks as tick}
          ticker
        {/each}
      </g>
      {#if showPoint}
      <circle r="5" cx="{margin.left + x(dimension.current_value)}" cy="{graphDHeight + margin.top}" />
      {/if}
      {/if}
    </svg>
  </div>
</div>