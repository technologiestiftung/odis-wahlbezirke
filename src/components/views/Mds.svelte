<script lang="ts">
  import {stats} from '../../stores';
  import MdsGraph from './MdsGraph.svelte';
  import {csv, min, max, scaleLinear, extent} from 'd3';
  import {transpose} from 'numeric';
  import {mds} from './mds';
  import { onMount } from 'svelte';

  const weights = {
    ID: {
      ignore: true,
    },
    X: {
      ignore: true,
    },
    Number_of_Modified_Blocks: {
      ignore: false,
      weight: 5,
      label: "Anzahl der Blöcke, für die ein Wahlbezirk geändert wurde",
    },
    Number_of_Affected_Districts: {
      ignore: false,
      weight: 5,
      label: "Anzahl der betroffenen Wahlbezirke",
    },
    Average_Area_Perimeter_Score: {
      ignore: true,
    },
    Median_Area_Perimeter_Score: {
      ignore: true,
    },
    Minimum_Area_Perimeter_Score: {
      ignore: true,
    },
    Average_Convex_Hull_Score: {
      ignore: false,
      weight: 5,
      label: "Durchschnittlicher Konvexe Hülle Kompaktheitsindex (0 = weniger kompakt, 1 = mehr kompakt)",
    },
    Median_Convex_Hull_Score: {
      ignore: false,
      weight: 5,
      label: "Medialer konvexe Hülle Kompaktheitsindex (0 = weniger kompakt, 1 = mehr kompakt)",
    },
    Minimum_Convex_Hull_Score: {
      ignore: true,
    },
    Number_of_Overpopulated_Districts: {
      ignore: false,
      weight: 5,
      label: "Anzahl der Wahlbezirke mit mehr als 2500 Einwohnern",
    },
    Average_Population_Size: {
      ignore: false,
      weight: 5,
      label: "Durchschnittliche Bevölkerungszahl in den Wahlbezirken",
    },
    Median_Population_Size: {
      ignore: false,
      weight: 5,
      label: "Mediane Bevölkerungszahl in den Wahlbezirken",
    },
    Standard_Deviation_Population_Size: {
      ignore: false,
      weight: 5,
      label: "Standardabweichung der Bevölkerungszahl in den Wahlbezirken",
    },
  };

  const weightKeys = Object.keys(weights);

  /*----- Backup default weights -----*/
  weightKeys.forEach((key) => {
    if ("weight" in weights[key]) {
      weights[key]["weight_backup"] = weights[key].weight;
    }
  });

  let graphWidth;
  let graphHeight;

  const margin = 20;

  // background lines for scatterplot
  $: numXLines = Math.floor((graphWidth - margin * 2) / 20) || 10;
  $: numYLines = Math.floor((graphHeight - margin * 2) / 20) || 10;

// RADIUS FOR CIRCLES IN MDS SCATTERPLOT DEPEND ON HOVER...
//   .on("mouseover", (d) => {
//     const rScale = d3.scaleLinear().domain([0, 1]).range([3, 10]);
//     points.transition().attr("r", (pd) => rScale(pd[d + "_n"]));
//   })
//   .on("mouseout", (d) => {
//     points.transition().attr("r", 5);
//   });

  let distMatrix = [];
  let distMax = 0;
  let twoDimensions: number[][] = [[0,1],[0,1]];

  let mounted = false;
  onMount(() => {
		mounted = true;
	});

  const updateMds = () => {
    /*----- Calculate distance matrix -----*/
    distMatrix = [];
    $stats.forEach((d, di) => {
      const row = [];
      $stats.forEach((dd, ddi) => {
        let distanceSum = 0;
        if (ddi !== di) {
          weightKeys.forEach((key) => {
            if (!weights[key].ignore) {
              distanceSum +=
                Math.abs(d[key + "_n"] - dd[key + "_n"]) * weights[key].weight;
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
  $: y = scaleLinear().range([0, graphHeight - 2 * margin]).domain(<[number, number]>extent(twoDimensions[1]));

  if ($stats.length === 0) {
    csv('/assets/data/selected_sim_stats.csv')
      .then((data) => {
        const newData: { [key: string] : (number | string)}[] = data;

        /*----- Normalize columns -----*/
        weightKeys.forEach((key) => {
          if (!weights[key].ignore) {
            newData.forEach((d, i) => {
              d[key] = parseFloat(d[key].toString());
            });
            weights[key].min = min(newData, (d) => parseFloat(d[key].toString()));
            weights[key].max = max(newData, (d) => parseFloat(d[key].toString()));
            newData.forEach((d) => {
              d[key + "_n"] =
                (parseFloat(d[key].toString()) - weights[key].min) / (weights[key].max - weights[key].min);
            });
          }
        });
        $stats = newData;
        updateMds();
      });
  }



//     points = g
//       .selectAll("circle")
//       .data(data)
//       .enter()
//       .append("circle")
//       .attr("r", 5)
//       .style("cursor", "pointer")
//       .on("mouseover", (d, pId) => {
//         miniGraphs.each((key, i, nodes) => {
//           const histo = d3.select(nodes[i]);
//           const histoX = d3
//             .scaleLinear()
//             .domain(d3.extent(data, (d) => d[key]))
//             .range([0, mWidth]);
//           histo
//             .select("circle")
//             .style("fill", "#E60032")
//             .style("stroke", "#fff")
//             .attr("cx", histoX(d[key]) + mPadding);
//         });

//         const colorSeqScale = d3.scaleSequentialSqrt(
//           [0, d3.max(distMatrix[pId])],
//           d3.interpolateViridis
//         );
//         const colorSeqScaleLegend = d3.scaleSqrt(
//           [0, d3.max(distMatrix[pId])],
//           [0, width - 2 * padding]
//         );

//         legendSvg.select("#axis").remove();
//         legendSvg
//           .append("g")
//           .attr("transform", `translate(${padding}, 25)`)
//           .attr("id", "axis")
//           .call(d3.axisBottom(colorSeqScaleLegend));

//         legendSvg.style("opacity", 1);

//         points.style("fill", (d, i) => {
//           return colorSeqScale(distMatrix[pId][i]);
//         });
//       })
//       .on("mouseout", () => {
//         miniGraphs.each((key, i, nodes) => {
//           const histo = d3.select(nodes[i]);
//           histo
//             .select("circle")
//             .style("stroke", "transparent")
//             .style("fill", "transparent");
//         });
//         points.style("fill", "#000");
//         legendSvg.style("opacity", 0);
//       })
//       .on("click", (d) => {
//         window.location.href = "/app-editor/index.html?model=" + d["X"];
//       });

//     miniGraphs.each((key, i, nodes) => {
//       const histo = d3.select(nodes[i]);
//       const histoX = d3
//         .scaleLinear()
//         .domain(d3.extent(data, (d) => d[key]))
//         .range([0, mWidth]);

//       histo
//         .append("g")
//         .attr("transform", `translate(${mPadding},${mHeight - mPadding})`)
//         .call(d3.axisBottom(histoX));

//       const histogram = d3.histogram().domain(histoX.domain()).thresholds(20);

//       const histoData = [];
//       data.forEach((d) => {
//         histoData.push(d[key]);
//       });

//       const initBins = histogram(histoData);
//       const histoY = d3
//         .scaleLinear()
//         .domain([0, d3.max(initBins, (d) => d.length)])
//         .range([mHeight - mPadding, 0]);

//       histo
//         .append("g")
//         .attr("transform", `translate(${mPadding},0)`)
//         .call(d3.axisLeft(histoY).ticks(3));

//       histo
//         .append("g")
//         .attr("transform", `translate(${mPadding},${mHeight - mPadding})`)
//         .selectAll("rect")
//         .data(initBins)
//         .enter()
//         .append("rect")
//         .attr("x", 1)
//         .attr(
//           "transform",
//           (d) =>
//             `translate(${histoX(d.x0)},-${
//               mHeight - mPadding - histoY(d.length)
//             })`
//         )
//         .attr("width", (d) => histoX(d.x1) - histoX(d.x0) - 1)
//         .attr("height", (d) => mHeight - mPadding - histoY(d.length))
//         .style("fill", "#2e91d2");

//       histo
//         .append("circle")
//         .attr("cy", mHeight - mPadding)
//         .attr("r", 5)
//         .style("stroke-width", 1)
//         .style("stroke", "transparent")
//         .style("fill", "transparent");
//     });

//     updateData();
//   })
//   .catch((err) => {
//     throw err;
//   });


</script>

<div id="viewContainer" class="mds">
  <div id="sidebar">
    <h3>Legende</h3>
    <p>
      Hervorgehobene Wahlbezirke liegen über dem Zielwert von 2500 Einwohner*innen.<br /><br />
      In manchen Fällen liegen selbst einzelne Blöcke über diesem Zielwert, diese erhalten einen <span style="color:red;">roten</span> Rand. Diese Blöcke und Wahlbezirke werden bei den weiteren Berechnungen nicht mit einbezogen, da dieses Problem vom Editor nicht gelöst werden kann und statt dessen einer manuellen Überarbeitung bedarf (z.B. große Blöcke aufteilen).<br /><br />
      <img src="/assets/images/pointer.png" alt="Pointer" class="pointer" />
      Um mehr über die Wahlbezirke und Blöcke zu erfahren, einfach die Maus über die Karte bewegen.
    </p>
  </div>
  <div id="scatterplot" bind:clientWidth={graphWidth} bind:clientHeight={graphHeight}>
    <svg>
      <g transform="translate({margin}, {margin})">
        <g id="background-lines">
          {#if mounted}
          {#each Array(numYLines + 1) as _, i}
          <line 
            x1="0" 
            x2="{graphWidth - 2 * margin}" 
            y1="{(graphHeight - 2 * margin) / numYLines * i}"
            y2="{(graphHeight - 2 * margin) / numYLines * i}"
            />
          {/each}
          {#each Array(numXLines + 1) as _, i}
          <line 
            x1="{(graphWidth - 2 * margin) / numXLines * i}" 
            x2="{(graphWidth - 2 * margin) / numXLines * i}" 
            y1="0"
            y2="{graphHeight - 2 * margin}"
            />
          {/each}
          {/if}
        </g>
        <g>
          {#each $stats as stats, i}
          <circle
            r="5"
            cx="{x(twoDimensions[0][i])}"
            cy="{y(twoDimensions[1][i])}" />
          {/each}
        </g>
      </g>
    </svg>
  </div>
  <div id="graphs">
    <ul id="dimensions">
      {#each weightKeys as key}
      {#if !weights[key].ignore}
      <li>
        <MdsGraph />
      </li>
      {/if}
      {/each}
    </ul>
  </div>
</div>