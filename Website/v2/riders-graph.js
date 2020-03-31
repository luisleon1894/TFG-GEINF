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
      .style("pointer-events", "all")



  this.vis.append("svg")
    .attr("top", 0)
    .attr("left", 0)
    .attr("width", this.size.width)
    .attr("height", this.size.height)
    .attr("viewBox", "0 0 "+this.size.width+" "+this.size.height)
    .attr("class", "line") //???? The <line> element is an SVG basic shape used to create a line connecting two points.
    .append("path") ////The line SVG Path we draw
        .attr("class", "line")


  // Extract the list of km we want to keep in the plot. Here I keep all except the column called Species
  d3.csv("./csv/Stage18-data-full-csv.csv", function(data){

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



      LIN_INFO_KM = 5
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
