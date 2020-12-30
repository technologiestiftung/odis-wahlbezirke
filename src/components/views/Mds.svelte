<script lang="ts">
  import {blocks, districts, simulationBlocks, simulationDistricts, stats, weights, joinedStats} from '../../stores';
  import MdsGraph from './MdsGraph.svelte';
  import {csv, min, max, scaleLinear, extent, scaleSqrt, interpolateViridis, scaleSequentialSqrt} from 'd3';
  import {transpose} from 'numeric';
  import {mds} from './mds';
  import { onMount } from 'svelte';
  import { rank } from '../../libs/ranking';

  const weightKeys = Object.keys($weights);

  /*----- Backup default weights -----*/
  weightKeys.forEach((key) => {
    if ("weight" in $weights[key] && !("weight_backup" in $weights[key])) {
      $weights[key]["weight_backup"] = $weights[key].weight;
    }
    $weights[key]["current_value"] = 0;
  });

  let graphWidth;
  let graphHeight;

  const margin = 20;
  const miniGraphHeight = 45;

  // background lines for scatterplot
  $: numXLines = Math.floor((graphWidth - margin * 2) / 20) || 10;
  $: numYLines = Math.floor((graphHeight - margin * 2 - miniGraphHeight) / 20) || 10;

  const radius = scaleLinear().range([5,5]).domain([1,1]);
  let radiusKey = null;

  export const setKey = (event: {detail: { key: (string | null) }}) => {
    radiusKey = event.detail.key;
    if (radiusKey === null) {
      radius.range([5,5]).domain([1,1]);
    } else {
      radius.range([1,8]).domain(extent($joinedStats, (d) => d[radiusKey]))
    }
  };

  let distMatrix = [];
  let twoDimensions: number[][] = [[0,1],[0,1]];

  const gradientCount = 50;
  const gradientHeight = 30;
  const gradientScale = scaleSequentialSqrt(
    [0, gradientCount],
    interpolateViridis
  );

  let mounted = false;
  onMount(() => {
		mounted = true;
  });
  
  const updateMds = () => {
    /*----- Calculate distance matrix -----*/
    distMatrix = [];
    $joinedStats.forEach((d, di) => {
      const row = [];
      $joinedStats.forEach((dd, ddi) => {
        let distanceSum = 0;
        if (ddi !== di) {
          weightKeys.forEach((key) => {
            if (!$weights[key].ignore) {
              distanceSum +=
                Math.abs(d[key + "_n"] - dd[key + "_n"]) * $weights[key].weight;
            }
          });
        }
        row.push(distanceSum);
      });
      distMatrix.push(row);
    });

    /*----- Dimensionality reduction -----*/
    twoDimensions = transpose(mds(distMatrix, 2));
  };

  $: x = scaleLinear().range([0, graphWidth - 2 * margin]).domain(<[number, number]>extent(twoDimensions[0]));
  $: y = scaleLinear().range([0, graphHeight - 2 * margin - miniGraphHeight]).domain(<[number, number]>extent(twoDimensions[1]));

  const normalizeRank = (ranks) => {
    weightKeys.forEach((key) => {
      if (!$weights[key].ignore) {
        ranks[key + "_n"] =
          (ranks[key] - $weights[key].min) / ($weights[key].max - $weights[key].min);
      }
    });
    return ranks;
  };

  if ($stats.length === 0) {
    csv('/assets/data/best.csv')
      .then((data) => {
        const newData: { [key: string] : number}[] = new Array(data.length);

        /*----- Normalize columns -----*/
        weightKeys.forEach((key) => {
          if (!$weights[key].ignore) {
            data.forEach((d, i) => {
              if (!newData[i]) { newData[i] = {}; }
              newData[i][key] = parseFloat(d[key].toString());
            });
            $weights[key].min = min(newData, (d) => d[key]);
            $weights[key].max = max(newData, (d) => d[key]);
            newData.forEach((d, i) => {
              newData[i][key + "_n"] =
                (d[key] - $weights[key].min) / ($weights[key].max - $weights[key].min);
            });
          }
        });
        $stats = newData;
        $joinedStats = [
          ...$stats, 
          ...($blocks.features.length > 0) ? [normalizeRank(rank('0', 'Aktuelle Situation', $blocks, $blocks, $districts))] : [],
          ...($simulationBlocks.features.length > 0) ? [normalizeRank(rank('1', 'Simulation', $simulationBlocks, $blocks, $simulationDistricts))] : []
        ];
        updateMds();
      });
  } else {
    $joinedStats = [
      ...$stats, 
      ...($blocks.features.length > 0) ? [normalizeRank(rank('0', 'Aktuelle Situation', $blocks, $blocks, $districts))] : [],
      ...($simulationBlocks.features.length > 0) ? [normalizeRank(rank('1', 'Simulation', $simulationBlocks, $blocks, $simulationDistricts))] : []
    ];
    updateMds();
  }

  let scatterColor;
  let gradientTicks = [];

  let showPoint = false;
  let showPointId = null;
  let gradientTickX;
  const hidePoint = () => { 
    showPoint = false;
    showPointId = null;
  };

  const setPoint = (values, i) => {
    weightKeys.forEach((key) => {
      $weights[key].current_value = values[key];
    });
    showPoint = true;

    scatterColor = scaleSequentialSqrt(
      [0, max(<number[]>distMatrix[i])],
      interpolateViridis
    );

    gradientTickX = scaleSqrt(
      [0, max(<number[]>distMatrix[i])],
      [0, graphWidth - 2 * margin]
    );

    gradientTicks = gradientTickX.ticks(10);

    showPointId = i;
  };

  export let navigateToTab;
  const showNetwork = __global.env.SHOW_NETWORK.toLocaleLowerCase();

</script>

<div id="viewContainer" class="mds">
  <div id="sidebar">
    <h3>Legende</h3>
    <p>
      Aus den vielen Varianten die über die Simulation generiert wurden haben wir die ein paar der besten Varianten ausgewählt. Was wirklich die Beste ist, hängt stark von den eigenen Präferenzen aus. Sollen möglichst wenig Wahlbezirke zu groß sein, sollen möglichst wenig Wahlbezirke verändert werden oder eine möglichst gleichmäßige Verteilung erreicht werden. In diesem Dashboard lässt sich über Regler einstellen, welche Optionen einem wichtig sind. Im Scatterplot (mitte) werden die verschiedenen Bewertungen auf zwei Dimensionen heruntergebrochen.<br /><br />
      <img src="/assets/images/pointer.png" alt="Pointer" class="pointer" />
      Verändern Sie die Gewichtung, um ein anderes Ranking zu erreichen. Fahren Sie mit der Maus über die Histogramme (rechts) um die Werte im Scatterplot (mitte) zu sehen. Oder fahren Sie mit der Maus über einzelne Punkte um die zugehörigen Werte in den Histogrammen abzulesen (roter Punkt) und die tatsächlichen Distanzen zu diesem Punkt im Scatterplot farblich abzulesen.
    </p>
    <button on:click={() => navigateToTab((showNetwork === 'false') ? 3 : 4)} class="continue">Weiter &raquo;</button>
  </div>
  <div id="scatterplot" bind:clientWidth={graphWidth} bind:clientHeight={graphHeight}>
    <svg>
      {#if mounted}
      <g transform="translate({margin}, {margin})">
        <g id="background-lines">
          {#each Array(numYLines + 1) as _, i}
          <line 
            x1="0" 
            x2="{graphWidth - 2 * margin}" 
            y1="{(graphHeight - 2 * margin - miniGraphHeight) / numYLines * i}"
            y2="{(graphHeight - 2 * margin - miniGraphHeight) / numYLines * i}"
            />
          {/each}
          {#each Array(numXLines + 1) as _, i}
          <line 
            x1="{(graphWidth - 2 * margin) / numXLines * i}" 
            x2="{(graphWidth - 2 * margin) / numXLines * i}" 
            y1="0"
            y2="{graphHeight - 2 * margin - miniGraphHeight}"
            />
          {/each}
        </g>
        <g>
          {#each $joinedStats as stat, i}
          <g
            on:mouseenter={() => setPoint(stat, i)}
            on:mouseleave={hidePoint}
            style="fill:{(showPointId) ? scatterColor(distMatrix[showPointId][i]) : 'black'};"
            transform="translate({x(twoDimensions[0][i])} {y(twoDimensions[1][i])})">
            {#if 'ID' in stat && stat.ID === '0'}
              <rect
                x="{radius((radiusKey) ? stat[radiusKey] : 1)*-1}"
                y="{radius((radiusKey) ? stat[radiusKey] : 1)*-1}"
                width="{radius((radiusKey) ? stat[radiusKey] : 1)*2}"
                height="{radius((radiusKey) ? stat[radiusKey] : 1)*2}" />
            {:else if 'ID' in stat && stat.ID === '1'}
              <path d="M0 {radius((radiusKey) ? stat[radiusKey] : 1)*-1}
                L{radius((radiusKey) ? stat[radiusKey] : 1)*1} 0
                L0 {radius((radiusKey) ? stat[radiusKey] : 1)*1}
                L{radius((radiusKey) ? stat[radiusKey] : 1)*-1} 0
                L0 {radius((radiusKey) ? stat[radiusKey] : 1)*-1}Z" />
            {:else}
              <circle r="{radius((radiusKey) ? stat[radiusKey] : 1)}" />
            {/if}
          </g>
          {/each}
        </g>
        {#if showPoint}
        <g id="miniGraph" transform="translate(0 {graphHeight - miniGraphHeight - 2 * margin + 10})">
          {#each Array(gradientCount) as _, i}
          <rect 
            x={(graphWidth - 2 * margin) / gradientCount * i}
            y="0" 
            width={(graphWidth - 2 * margin) / gradientCount + 1}
            height={gradientHeight}
            fill={gradientScale(i)}
            />
          {/each}
          <line x1="0" x2={graphWidth - 2 * margin} y1={gradientHeight} y2={gradientHeight} />
          {#each gradientTicks as tick}
          <line x1={gradientTickX(tick) + 1} x2={gradientTickX(tick) + 1} y1={gradientHeight} y2={gradientHeight+5} />
          <text text-anchor="middle" x={gradientTickX(tick)} y={gradientHeight+15}>{tick}</text>
          {/each}
        </g>
        {/if}
      </g>
      {/if}
    </svg>
  </div>
  <div id="graphs">
    <ul id="dimensions">
      {#each weightKeys as key}
      {#if !$weights[key].ignore}
      <li>
      <MdsGraph on:setKey={setKey} on:updateMds={updateMds} bind:showPoint={showPoint} bind:key={key} bind:dimension={$weights[key]} />
      </li>
      {/if}
      {/each}
    </ul>
  </div>
</div>
