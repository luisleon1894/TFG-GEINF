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

      // Pan and zoom
      var zoom = d3.zoom()
          .scaleExtent([.5, 20])
          .extent([[0, 0], [this.size.width, this.size.height]])
          .on("zoom", zoomed);

  //afegeix rectangle, amb la seva amplada i altura
  this.plot = this.vis.append("rect")
      .attr("width", this.size.width)
      .attr("height", this.size.height)
      .style("pointer-events", "all")
      .call(zoom);



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

  //d3.select(this.chart)
    //  .on("mousemove.drag", self.mousemove())
      //.on("mouseup.drag",   self.mouseup())


  // Extract the list of km we want to keep in the plot. Here I keep all except the column called Species
  d3.csv("./Stage18-data-full-csv.csv", function(data){

      //Array[Names Km]
    	columnsKmName = d3.keys(data[0]).filter(isElapsed)


      //Array[Km]
    	columnsKm = d3.keys(data[0]).filter(isnewKm) //guarda les claus que continguin "km"
    	for(var i = 0; i < columnsKm.length; i++){
    		columnsKm[i] = columnsKm[i].slice(0, columnsKm[i].indexOf("_")).replace("km",""); // en cada valor acosta l'string i subst. "km" per ""
    	}
    	columnsKm = columnsKm.filter((a, b) => columnsKm.indexOf(a) === b); //elimina repetits



      //es modifica el valor de "Elapsed time" de data per un valor enter, representa els segons
  	 for(i = 0; i < data.length; i++){

    		columnsKmName.forEach(function(key) {
  			   //modificar value, transformar minuts segons a un valor enter
  			   var elapse = data[i][key]

  			   var min = elapse[1]
  			   var seg = elapse.substr(3, 2)

  			   if(elapse.includes("h")){ //si hi ha "h" és el primer i l'elapsed es = 0
  				    data[i][key] = 0
  			   }
  			   else{ // altrament es transforma valor a un enter
  				    data[i][key] = (parseInt(min) * 60) + parseInt(seg)
  			   }
  		  });
      }

       yScale = d3.scaleLinear()
        .domain([450, 0])
        .range([self.size.height, 0]);


       yAxis = d3.axisLeft(yScale)
        .ticks(20, "s");


       gY = self.vis.append('g')
        .attr('transform', 'translate(' + (self.padding.left+140) + ',' + 0 + ')')
        .call(yAxis);


       xAxis = []



      LIN_INFO_KM = 21
    	// For each columnKm, I build a linear scale. I store all in a y object
  		y = {}
  		for (i in resize(columnsKmName, LIN_INFO_KM)) {
    		kmname = resize(columnsKmName, LIN_INFO_KM)[i]
    		y[kmname] = d3.scaleLinear()
      			//.domain( d3.extent(columnsElapsed, function(d) { return +d[kmname]; }) )
      			.domain( d3.extent([0, 450])) //domini de l'elapsed de 0 a X segons de diferència
      			.range([0, self.size.height])

  		}

  		  // Build the X scale -> it find the best position for each Y axis
        //scalePoint creates scale functions that map from a discrete set of values to equally spaced points along the specified range:
  		x = d3.scalePoint()
    		.range([0, self.size.width])
    		.padding(1)
    		.domain(resize(columnsKmName, LIN_INFO_KM));


    	// The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  		function path(d, index) {
  			
  			//s'ha modificat la <y> para ver las diferencias entre uno y otro ciclista cuando tiene el mismo tiempo (sumar la position)
      		return d3.line()(resize(columnsKmName, LIN_INFO_KM).map(function(p) {

      			var positionKM = p.slice(0, p.indexOf("_"))+"_Position"

      		 return [x(p), y[p](d[p] + parseInt(data[index][positionKM]) - 1)];

      		  }));
  		}



    	// Draw the lines
    	gXLines = self.vis
                	.selectAll("myPath")
                	.data(data)
                	.enter().append("path")
                	.attr("d",  path)
                  .call(xAxis[0])
                	.style("fill", "none")
                	.style("stroke", "#69b3a2")
                	.style("opacity", 0.5)

    	// Draw the axis:
    	self.vis.selectAll("myAxis")
      	// For each dimension of the dataset I add a 'g' element:
      	.data(resize(columnsKmName, LIN_INFO_KM)).enter()
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
function zoomed() {

// create new scale ojects based on event
    var new_yScale = d3.event.transform.rescaleY(self.yScale);

    var new_xScaleLines = [];

    for (i in resize(columnsKmName, self.LIN_INFO_KM)) {

        kmname = resize(columnsKmName, LIN_INFO_KM)[i]
        new_xScaleLines.push(y[kmname])
    }

    //var new_yScale = d3.event.transform.rescaleY(self.y);
// update axes
    //gX.call(xAxis.scale(new_xScale));

    for (i in new_xScaleLines) {
      gXLines.call(xAxis[0].scale(new_xScaleLines[i]))
    }
    gY.call(yAxis.scale(new_yScale));
    //points.data(data)
     //.attr(self.cx, function(d) {return new_xScale(d.x)})
     //.attr(self.cy, function(d) {return new_yScale(d.y)});
}

function resize(array, size) {
  
  if(size < array.length / 2){
    var arr_new = [];
    var step = Math.trunc(array.length / size - 1 );
    var j = step;

    arr_new.push(array[0]);
    for (i = 0; i < size - 2; i++) { 
      arr_new.push(array[j]);
      j += step;
    }
    arr_new.push(array[array.length - 1]);

    return arr_new;
  }
  else return array;
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

/*
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
}*/
