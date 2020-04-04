var vis = d3.select("body").append("svg")
         .attr("width", 1000)
         .attr("height", 667),

scaleX = d3.scaleLinear()
        .domain([-30,30])
        .range([0,600]),

scaleY = d3.scaleLinear()
        .domain([0,50])
        .range([500,0]),

color = d3.scaleOrdinal(d3.schemeCategory10);

vis.selectAll("polygon")
    .data(arrayOfPolygons)
  .enter().append("polygon")
    .attr("points",function(d) { 
        return d.points.map(function(d) { return [scaleX(d.x),scaleY(d.y)].join(","); }).join(" ");})
.attr("fill", function(d){return color("green")})
.attr("fill-opacity", 0.5)



