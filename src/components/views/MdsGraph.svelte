<script lang="ts">
  // const updateDimensions = () => {
  //   dimensionLabels.html((d) => `${weights[d].label} (${weights[d].weight})`);
  // };
  
  // dimensions
  //   .append("input")
  //   .attr("type", "range")
  //   .attr("min", 0)
  //   .attr("max", 10)
  //   .attr("value", (d) => weights[d].weight)
  //   .on("change", (d, i, nodes) => {
  //     const val = d3.select(nodes[i]).property("value");
  //     weights[d].weight = val;
  //     updateDimensions();
  
  //     updateData();
  //   });
  
  // dimensions.append("br");
  
  // const mWidth = 300;
  // const mHeight = 75;
  // const mPadding = 25;
  // const miniGraphs = dimensions
  //   .append("svg")
  //   .attr("width", mWidth)
  //   .attr("height", mHeight);
  
  // updateDimensions();
  // updateTooltips();
  
  // d3.select("#map").append("br");
  // const legendSvg = d3
  //   .select("#map")
  //   .append("svg")
  //   .style("opacity", 0)
  //   .attr("width", width)
  //   .attr("height", 50);
  
  // const legendCount = 50;
  // const legendScale = d3.scaleSequentialSqrt(
  //   [0, legendCount],
  //   d3.interpolateViridis
  // );
  // legendSvg
  //   .append("g")
  //   .attr("transform", `translate(${padding}, 0)`)
  //   .selectAll("rect")
  //   .data(d3.range(legendCount))
  //   .enter()
  //   .append("rect")
  //   .attr("width", (width - 2 * padding) / legendCount)
  //   .attr("height", 25)
  //   .attr("x", (i) => ((width - 2 * padding) / legendCount) * i)
  //   .style("fill", (i) => legendScale(i));
</script>