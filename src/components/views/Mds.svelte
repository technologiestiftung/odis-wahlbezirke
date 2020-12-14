<script lang="ts">
  import {stats, weights} from '../../stores';
  import MdsGraph from './MdsGraph.svelte';
  import {csv, min, max, scaleLinear, extent, scaleSqrt, interpolateViridis, scaleSequentialSqrt} from 'd3';
  import {transpose} from 'numeric';
  import {mds} from './mds';
  import { onMount } from 'svelte';

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
      radius.range([1,8]).domain(extent($stats, (d) => d[radiusKey]))
    }
  };

  let distMatrix = [];
  let distMax = 0;
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

  // share updateMds with children to run when change occurs
  const updateMds = () => {
    /*----- Calculate distance matrix -----*/
    distMatrix = [];
    $stats.forEach((d, di) => {
      const row = [];
      $stats.forEach((dd, ddi) => {
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

    distMax = max<[number, number], number>(distMatrix, (d) => max(d));

    /*----- Dimensionality reduction -----*/
    twoDimensions = transpose(mds(distMatrix, 2));
  };

  $: x = scaleLinear().range([0, graphWidth - 2 * margin]).domain(<[number, number]>extent(twoDimensions[0]));
  $: y = scaleLinear().range([0, graphHeight - 2 * margin - miniGraphHeight]).domain(<[number, number]>extent(twoDimensions[1]));

  if ($stats.length === 0) {
    csv('/assets/data/selected_sim_stats.csv')
      .then((data) => {
        const newData: { [key: string] : (number | string)}[] = data;

        /*----- Normalize columns -----*/
        weightKeys.forEach((key) => {
          if (!$weights[key].ignore) {
            newData.forEach((d, i) => {
              d[key] = parseFloat(d[key].toString());
            });
            $weights[key].min = min(newData, (d) => parseFloat(d[key].toString()));
            $weights[key].max = max(newData, (d) => parseFloat(d[key].toString()));
            newData.forEach((d) => {
              d[key + "_n"] =
                (parseFloat(d[key].toString()) - $weights[key].min) / ($weights[key].max - $weights[key].min);
            });
          }
        });
        $stats = newData;
        updateMds();
      });
  } else {
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

</script>

<div id="viewContainer" class="mds">
  <div id="sidebar">
    <h3>Legende</h3>
    <p>
      Aus den vielen Varianten die über die Simulation generiert wurden haben wir die ein paar der besten Varianten ausgewählt. Was wirklich die Beste ist, hängt stark von den eigenen Präferenzen aus. Sollen möglichst wenig Wahlbezirke zu groß sein, sollen möglichst wenig Wahlbezirke verändert werden oder eine möglichst gleichmäßige Verteilung erreicht werden. In diesem Dashboard lässt sich über Regler einstellen, welche Optionen einem wichtig sind. Im Scatterplot (mitte) werden die verschiedenen Bewertungen auf zwei Dimensionen heruntergebrochen.<br /><br />
      <img src="/assets/images/pointer.png" alt="Pointer" class="pointer" />
      Verändern Sie die Gewichtung, um ein anderes Ranking zu erreichen. Fahren Sie mit der Maus über die Histogramme (rechts) um die Werte im Scatterplot (mitte) zu sehen. Oder fahren Sie mit der Maus über einzelne Punkte um die zugehörigen Werte in den Histogrammen abzulesen (roter Punkt) und die tatsächlichen Distanzen zu diesem Punkt im Scatterplot farblich abzulesen.
    </p>
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
          {#each $stats as stat, i}
          <circle
            fill={(showPointId) ? scatterColor(distMatrix[showPointId][i]) : 'black'}
            on:mouseenter={() => setPoint(stat, i)}
            on:mouseleave={hidePoint}
            r="{radius((radiusKey) ? stat[radiusKey] : 1)}"
            cx="{x(twoDimensions[0][i])}"
            cy="{y(twoDimensions[1][i])}" />
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
