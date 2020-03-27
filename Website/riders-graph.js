SimpleGraph = function(elemid){

  var self = this;
  this.chart = document.getElementById(elemid);
  this.cx = 1150; //amplada en pixels de l'interior (amb padding inclos)
  this.cy = 900; //altura en pixels de l'interior (amb padding inclos)
    //paddings dels costats
  this.padding = {
     "top":    30,
     "right":  10,
     "bottom": 10,
     "left":   0
  };

  //es la mida de amplada i altura de la gràfica (ampladaTotal - paddingEs - paddingDret)
  //el mateix per l'altura
  this.size = {
    "width":  this.cx - this.padding.left - this.padding.right,
    "height": this.cy - this.padding.top  - this.padding.bottom
  };

  //en el selector "chart" afegeix "SVG", amb amplada i altura
  this.vis = d3.select(this.chart).append("svg")
      .attr("width",  this.cx)
      .attr("height", this.cy)
      .append("g") //afegeix tota la gràfica, amb els valors de "x" i "y" inclos
        .attr("transform", "translate(" + this.padding.left + "," + this.padding.top + ")");

  //afegeix rectangle, amb la seva amplada i altura
  this.plot = this.vis.append("rect")
      .attr("width", this.size.width)
      .attr("height", this.size.height)

  this.vis.append("svg")
    .attr("top", 0)
    .attr("left", 0)
    .attr("width", this.size.width)
    .attr("height", this.size.height)
    .attr("viewBox", "0 0 "+this.size.width+" "+this.size.height)
    .attr("class", "line") //???? The <line> element is an SVG basic shape used to create a line connecting two points.
    .append("path") ////The line SVG Path we draw
        .attr("class", "line")
        //.attr("d", this.line(this.points));

  //this.plot.call(d3.behavior.zoom().x(this.x).y(this.y).on("zoom", this.redraw()));

  d3.select(this.chart)
      .on("mousemove.drag", self.mousemove())
      .on("mouseup.drag",   self.mouseup())


  // Extract the list of km we want to keep in the plot. Here I keep all except the column called Species
  d3.csv("./Stage18-data-full-csv.csv", function(data){

    	columnsKmCorrectName = d3.keys(data[0]).filter(isElapsed)
    	//columnsKmCorrectName = columnsKmCorrectName.reverse()
    	columnsKm = d3.keys(data[0]).filter(isnewKm)

    	for(var i = 0; i < columnsKm.length; i++){
    		columnsKm[i] = columnsKm[i].slice(0, columnsKm[i].indexOf("_")).replace("km",""); // elimina tot el text que no sigui "kmXX"
    	}

    	columnsKm = columnsKm.filter((a, b) => columnsKm.indexOf(a) === b) //elimina repetits
    	//console.log(columnsKm);

    	columnsElapsed = JSON.parse(JSON.stringify( data ));

    	columnsNotElapsed = d3.keys(data[0]).filter(isNotElapsed)


    	//for(i = 0; i < columnsElapsed.length; i++){

    	//	columnsNotElapsed.forEach(function(key) {
    	//		delete columnsElapsed[i][key];
  	//	});
    	//}
  	
  	columnsElapsedKeys = d3.keys(data[0]).filter(isElapsed)

  	for(i = 0; i < columnsElapsed.length; i++){

    		columnsElapsedKeys.forEach(function(key) {
    			//modificar value, transformar minuts segons a un valor
    			var elapse = columnsElapsed[i][key]

    			var min = elapse[1]
    			var seg = elapse.substr(3, 2)

    			if(elapse.includes("h")){

    				columnsElapsed[i][key] = 0
    			}
    			else{

    				columnsElapsed[i][key] = (parseInt(min) * 60) + parseInt(seg)
    			}

  		});
    }

    	// For each columnKm, I build a linear scale. I store all in a y object
  		var y = {}
  		for (i in columnsKmCorrectName) {
    		kmname = columnsKmCorrectName[i]
    		y[kmname] = d3.scaleLinear()
      			//.domain( d3.extent(columnsElapsed, function(d) { return +d[kmname]; }) )
      			.domain( d3.extent([0, 300]))
      			.range([0, self.size.height])
  		}

  		  // Build the X scale -> it find the best position for each Y axis
        //scalePoint creates scale functions that map from a discrete set of values to equally spaced points along the specified range:
  		x = d3.scalePoint()
    		.range([0, self.size.width])
    		.padding(1)
    		.domain(columnsKmCorrectName);


    	// The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  		function path(d, index) {
  			
  			//s'ha modificat la <y> para ver las diferencias entre uno y otro ciclista cuando tiene el mismo tiempo (sumar la position)
      		return d3.line()(columnsKmCorrectName.map(function(p) {

      			var positionKM = p.slice(0, p.indexOf("_"))+"_Position"

      		 return [x(p), y[p](d[p] + parseInt(columnsElapsed[index][positionKM]) - 1)];

      		  }));
  		}



    	// Draw the lines
    	self.vis
      	.selectAll("myPath")
      	.data(columnsElapsed)
      	.enter().append("path")
      	.attr("d",  path)
      	.style("fill", "none")
      	.style("stroke", "#69b3a2")
      	.style("opacity", 0.5)

    	// Draw the axis:
    	self.vis.selectAll("myAxis")
      	// For each dimension of the dataset I add a 'g' element:
      	.data(columnsKmCorrectName).enter()
      	.append("g")
      	// I translate this element to its right position on the x axis
      	.attr("transform", function(d) { return "translate(" + x(d) + ")"; })
      	// And I build the axis with the call function
      	.each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
      	// Add axis title
      	.append("text")
        		.style("text-anchor", "middle")
        		.attr("y", -9)
        		.text(function(d) { return d.substr(0, 5); })
        		.style("fill", "black")
    	
  });

}

SimpleGraph.prototype.update = function() {
  var self = this;
  var lines = this.vis.select("path").attr("d", this.line(this.points));
}

SimpleGraph.prototype.mousemove = function() {
  var self = this;
  return function() {

    // #d3.svg.mouse()
    //Returns the x and y coordinates of the current d3.event, 
    //relative to the specified container. 
    //The container may be an HTML or SVG container element

    //#d3.event.changedTouches ¡¡¡COMPTE AMB LA LLIBRERIA ESTA ES VIEEEJA!!!
    //Returns the x and y coordinates of each touch associated with the current d3.event,
    var p = d3.svg.mouse(self.vis[0][0]),
        t = d3.event.changedTouches;

  }
};

SimpleGraph.prototype.mouseup = function() {

  var self = this;
  return function() {
    document.onselectstart = function() { return true; };

  }
}


SimpleGraph.prototype.redraw = function() {
  var self = this;
  return function() {
    var tx = function(d) { 
      return "translate(" + self.x(d) + ",0)"; //It takes two options, tx refers translation along the x-axis and ty refers to the translation along the y-axis. 
    },
    ty = function(d) { 
      return "translate(0," + self.y(d) + ")"; //It takes two options, tx refers translation along the x-axis and ty refers to the translation along the y-axis.
    },
    stroke = function(d) { 
      return d ? "#ccc" : "#666"; //#ccc = color gris, altrament #666 = color gris
    },
    fx = self.x.tickFormat(10), //especifica el format decimal màxim
    fy = self.y.tickFormat(10); //especifica el format decimal màxim

    // Regenerate x-ticks… //actualitzar els valors de l'eix de les "x"
    var gx = self.vis.selectAll("g.x")
        .data(self.x.ticks(10), String)
        .attr("transform", tx);

    gx.select("text")
        .text(fx);

    //enter() In the Data joins section we show how to join an array of data to a D3 selection.
    // es possible que "data" sigui mes gran o mes petit que el DOM elements, enter() fa la magia

    //El elemento g es un contenedor usado para agrupar objetos.
    //Las transformaciones aplicadas al elemento g son realizadas sobre todos los elementos hijos del mismo
    var gxe = gx.enter().insert("g", "a")
        .attr("class", "x")
        .attr("transform", tx);

    gxe.append("line")
        .attr("stroke", stroke)
        .attr("y1", 0) //The y1 attribute defines the start of the line on the y-axis
        .attr("y2", self.size.height); //The y2 attribute defines the end of the line on the y-axis

    gxe.append("text")
        .attr("class", "axis")
        .attr("y", self.size.height)
        .attr("dy", "1em") //The dy attribute indicates a shift along the y-axis on the position of an element or its content.
        .attr("text-anchor", "middle") //The text-anchor attribute is used to align (start-, middle- or end-alignment)
        .text(fx)


    //.exit returns an exit selection which consists of the elements that need to be removed from the DOM.
    //It’s usually followed by .remove:
    gx.exit().remove();

    // Regenerate y-ticks… //actualitzar els valors de l'eix de les "y"
    var gy = self.vis.selectAll("g.y")
        .data(self.y.ticks(10), String)
        .attr("transform", ty);

    gy.select("text")
        .text(fy);

    var gye = gy.enter().insert("g", "a")
        .attr("class", "y")
        .attr("transform", ty)
        .attr("background-fill", "#FFEEB6");

    gye.append("line")
        .attr("stroke", stroke)
        .attr("x1", 0)
        .attr("x2", self.size.width);

    gye.append("text")
        .attr("class", "axis")
        .attr("x", -3)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(fy)


    gy.exit().remove();
    self.plot.call(d3.behavior.zoom().x(self.x).y(self.y).on("zoom", self.redraw()));
    self.update();    
  }  
}

function isnewKm(infoColumn){
  return infoColumn.includes("km");
}

function isNotElapsed(infoColumn){
  return !infoColumn.includes("Elapsed");
}

function isElapsed(infoColumn){
  return infoColumn.includes("Elapsed");
}