// SVG container
let margin = { top: 40, right: 10, bottom: 60, left: 60 };

let width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

let svg = d3
  .select("#chart-area")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Scales
let x = d3
  .scaleBand()
  .rangeRound([0, width])
  .paddingInner(0.1);

let y = d3
  .scaleLinear()
  .range([height, 0]);

// Initialize axes here
let xAxis = d3.axisBottom();
let yAxis = d3.axisLeft();

// Initialize SVG axes groups here
svg
  .append("g")
  .attr("class", "axis x-axis")
  .attr("transform", "translate(" + 0 + ", " + height + ")");

svg
  .append("g")
  .attr("class", "axis y-axis")
  .attr("transform", "translate(" + 0 + ", 0 )");

let yLabel = d3
  .select("g")
  .append("text")
  .text("Stores")
  .attr("class", "axis-label")
  .attr("x",-20)
  .attr("y", -13)
  .style("font","14px times")
  .style("font-family","sans-serif")
  

// Initialize data
let data = null; // global variable

// Load CSV file
d3.csv("coffee-house-chains.csv", d => {
  return {
    ...d,
    revenue: +d.revenue,
    stores: +d.stores
  };
}).then(allSales => {
  data = allSales;
  updateVisualization();
});

// Add Event Listener (ranking type)
document
  .querySelector("#ranking-type")
  .addEventListener("change", () => updateVisualization());

// Add Event listener (reverse sort order)
let sortReverse = true;
d3.select("#change-sorting").on("click", () => {
  sortReverse = !sortReverse;
  updateVisualization();
});

// Render visualization
const updateVisualization = function() {
  console.log("updateVisualization", data);

  // Get the selected ranking option
  let ranking = document.querySelector("#ranking-type").value;

  // Sort data
  data.sort((a, b) =>
    ranking == "stores"
      ? sortReverse
        ? d3.descending(a.stores, b.stores)
        : d3.ascending(a.stores, b.stores)
      : sortReverse
      ? d3.descending(a.revenue, b.revenue)
      : d3.ascending(a.revenue, b.revenue)
  );

  // Update scale domains
  if (ranking == "stores") {
    let storesMin = d3.min(data, d => d.stores);
    let storesMax = d3.max(data, d => d.stores);
    y = d3
      .scaleLinear()
      .domain([0, storesMax])
      .range([height, 0]);
  } else {
    let revenueMin = d3.min(data, d => d.revenue);
    let revenueMax = d3.max(data, d => d.revenue);
    y = d3
      .scaleLinear()
      .domain([0, revenueMax])
      .range([height, 0]);
  }
  x.domain(data.map(d => d.company));

  // Data join
  var bars = svg.selectAll("rect").data(data, d => {
    return d.company;
  });
  // Enter
  bars
    .enter()
    .append("rect")
    .attr("class", "bar")

    // Update
    .merge(bars)
    .transition()
    .duration(700)
    .style("opacity", 0.5)
    .transition()
    .duration(700)
    .attr("x", d => x(d.company))
    .transition()
    .duration(700)
    .style("opacity", 1)
    .attr("y", d => y(ranking == "stores" ? d.stores : d.revenue))
    .attr("width", x.bandwidth())
    .attr(
      "height",
      d => height - y(ranking == "stores" ? d.stores : d.revenue)
    );

  // Exit
  bars.exit().remove();
  svg.exit().remove();

  // Draw Axes
  drawAxes(ranking);
}

function drawAxes(ranking) {
  
  if (ranking == "stores") {
    svg.select(".axis-label")
      .text("Stores")
  } else{
    svg.select(".axis-label")
      .text("Billion USD")
  }

  xAxis.scale(x);
  yAxis.scale(y);

  svg
    .select(".x-axis")
    .transition()
    .duration(700)
    .call(xAxis);
  svg
    .select(".y-axis")
    .transition()
    .duration(700)
    .style("opacity", 0)
    .transition()
    .duration(700)
    .style("opacity", 1)
    .call(yAxis);

}