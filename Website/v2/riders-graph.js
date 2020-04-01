SimpleGraph = function(elemid){

  


  // Extract the list of km we want to keep in the plot. Here I keep all except the column called Species
  d3.csv("./csv/StageProva.csv", function(data){

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


      //************************************************************
      // Data elapsed riders
      //************************************************************

      var elapsedDataRider = [];

      for(rider in data){

        var coordinates = [];

        for(j = 0; j < columnsKmName.length; j++){

          var positionKM = columnsKmName[j].slice(0, columnsKmName[j].indexOf("_"))+"_Position"
          
          coordinates.push({x: j, y: data[rider][columnsKmName[j]] + parseInt(data[rider][positionKM])})
        }

        elapsedDataRider.push(coordinates);
      }
   	  
      var colors = [
        'steelblue',
        'green',
        'red',
        'purple'
      ]

      //************************************************************
      // Create Margins and Axis and hook our zoom function
      //************************************************************
      var self = this;
      this.chart = document.getElementById(elemid);
      this.cx = 1150; //amplada en pixels de l'interior (amb padding inclos)
      this.cy = 900; //altura en pixels de l'interior (amb padding inclos)

      var margin = {top: 20, right: 30, bottom: 30, left: 50},
          width = this.cx - margin.left - margin.right,
          height = this.cy - margin.top - margin.bottom;
      
      var xScale = d3.scaleLinear()
          .domain([0, elapsedDataRider[0].length])
          .range([0, width]);
       
      var yScale = d3.scaleLinear()
          .domain([0, 450])
          .range([0, height]);
        
      var xAxis = d3.axisBottom(xScale)
        .tickSize(-height)
        .tickPadding(10)  
        //.tickSubdivide(true)  
          //.orient("bottom");  
        
      var yAxis = d3.axisLeft(yScale)
        .tickPadding(10)
        .tickSize(-width)
        //.tickSubdivide(true)  
          //.orient("left");
      
      var zoom = d3.zoom()
          .scaleExtent([.5, 20])
          //.translateExtent([[0, 0], [width, height]])  ?? mirar translateExtent??
          .extent([[0, 0], [width, height]])
          .on("zoom", zoomed);
        

      //************************************************************
      // Generate our SVG object
      //************************************************************  
      var svg = d3.select(this.chart).append("svg")
        .call(zoom)
        .attr("width", this.cx + margin.left + margin.right )
        .attr("height", this.cy + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
       
       var gX = svg.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0," + height + ")")
                  .call(xAxis);
       
      var gY = svg.append("g")
                  .attr("class", "y axis")
                  .call(yAxis);
       
      svg.append("g")
        .attr("class", "y axis")
        .append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", (-margin.left) + 10)
        .attr("x", -height/2)
        .text('Axis Label');  
      

      svg.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

      //************************************************************
      // Create D3 line object and draw data on our SVG object
      //************************************************************
      var line = d3.line()
          .x(function(d) { return xScale(d.x); })
          .y(function(d) { return yScale(d.y); });   
      

      svg.selectAll('.line')
        .data(elapsedDataRider)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("clip-path", "url(#clip)")
      //   //.attr('stroke', function(d,i){      
      //     //return colors[i%colors.length];
      //   //})
         .attr("d", line);   
        
        

      //************************************************************
      // Zoom specific updates
      //************************************************************
      function zoomed() {

        // create new scale ojects based on event
        var new_xScale = d3.event.transform.rescaleX(xScale);
        var new_yScale = d3.event.transform.rescaleY(yScale);

        // update axes
        gX.call(xAxis.scale(new_xScale));
        gY.call(yAxis.scale(new_yScale));


      }

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
