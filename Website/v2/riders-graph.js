SimpleGraph = function(elemid){

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


      //************************************************************
      // Data elapsed riders
      //************************************************************

      var elapsedDataRider = [];

      for(rider in data){

        var coordinates = [];

        for(j = 0; j < columnsKmName.length; j++){

          var positionKM = columnsKmName[j].slice(0, columnsKmName[j].indexOf("_"))+"_Position"
          
          coordinates.push({id: parseInt(rider), x: j, y: data[rider][columnsKmName[j]] + parseInt(data[rider][positionKM])})
        }

        elapsedDataRider.push(coordinates);
      }
      elapsedDataRider.pop();

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
          .domain([0, 750])
          .range([0, height]);
        
      var xAxis = d3.axisBottom(xScale)
        .tickSize(-height)
        .tickPadding(10)  

      var yAxis = d3.axisLeft(yScale)
        .tickPadding(10)
        .tickSize(-width)
      
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
        .style('stroke', '#1E90FF')
         //.attr('stroke', function(d,i){      
           //return colors[i%colors.length];
         //})
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

        // re-scale axes
        svg.select(".y.axis")
            .call(yAxis.scale(new_yScale));

        svg.select(".x.axis")
            .call(xAxis.scale(new_xScale));

        // re-draw line
        plotLine = d3.line()
            .x(function (d) {
                return new_xScale(d.x);
            })
            .y(function (d) {
                return new_yScale(d.y);
            });

        svg.selectAll('path.line').attr("d", plotLine);

      //re-draw polygons
      polygonsScale = function(d){
            return d.points.map(function(d) { return [new_xScale(d.x),new_yScale(d.y)].join(","); }).join(" ");
            }

        svg.selectAll("polygon").attr("points", polygonsScale)
      }




      //************************************************************
      //Trobar els grups de ciclistes que hi ha en els kms
      //************************************************************
      var grupsCiclistesEtapa = [];

      for(i = 0; i < columnsKmName.length; i++){

        var grupsCiclistesKM = [];

        ////ordenar els ciclistes per km "i"
        var posicioCiclista = [];
        for(j = 0; j < elapsedDataRider.length; j++){

          if(!isNaN(elapsedDataRider[j][i].y)){ //comprova que sigui una coordenada válida
            posicioCiclista.push(elapsedDataRider[j][i])
          }
        }

        posicioCiclista.sort(function(a,b) { //ordena les posicions dels ciclistes
            if( a.x == b.x) return a.y-b.y;
              return a.x-b.x;
        });

        for(k = 0; k < posicioCiclista.length - 1; k++){

          var grupN = []
          if(posicioCiclista[k].y === (posicioCiclista[k+1].y - 1)){

            var coordIni = k;
            grupN.push(posicioCiclista[k]);

            while(posicioCiclista[k].y === (posicioCiclista[k+1].y -1)){

              k++;
              grupN.push(posicioCiclista[k]);

              if(k  === posicioCiclista.length - 1){
                break;
              }

            }
            
            grupsCiclistesKM.push(grupN);
          }
        }

        grupsCiclistesEtapa.push(grupsCiclistesKM);
      }
      //console.log(grupsCiclistesEtapa);

      //************************************************************************************
      //Mirar en les etapes cada un del ciclistes a quin grup forma part i guardar els grups(polygons)
      //************************************************************************************
      var polygonGrups = [];

      for(i = 0; i < columnsKmName.length - 1; i++){ //per cada km (d'esquerra a dreta)

        var grupsCiclistaKM = grupsCiclistesEtapa[i];

        for(j = 0; j < grupsCiclistaKM.length; j++){ //per cada grup de ciclistes de cada km


          var grupCiclista = grupsCiclistaKM[j];

          for(k = 0; k < grupCiclista.length; k++){ //per cada ciclista del grup de ciclistes de cada km, busca el grup que anira en km+1

            var coordPrimerCiclista = grupCiclista[0];
            var coordUltimCiclista = grupCiclista[grupCiclista.length - 1]
            
            var seguentCoordCiclista = elapsedDataRider[grupCiclista[k].id][i + 1];
            
            var coordPrimerCiclistaSegGrup = trobarPrimerCiclistaSeg(seguentCoordCiclista, grupsCiclistesEtapa[i + 1]);
            var coordUltimCiclistaSegGrup = trobarUltimCiclistaSeg(seguentCoordCiclista, grupsCiclistesEtapa[i + 1]);

            if(coordPrimerCiclistaSegGrup !== -1 && noExisteixPolygon(polygonGrups,coordPrimerCiclista, coordPrimerCiclistaSegGrup, coordUltimCiclistaSegGrup, coordUltimCiclista)){ //forma part d'algun grup en el km + 1

              //afegir polygon

              polygonGrups.push({points: [coordPrimerCiclista, coordPrimerCiclistaSegGrup, coordUltimCiclistaSegGrup, coordUltimCiclista]})
            }
          }
        }
      }

      //console.log(polygonGrups);

      //***********************
      //Pintar polygonsGrups
      //***********************

      var poligons = function(d){
        return d.points.map(function(d) { return [xScale(d.x),yScale(d.y)].join(","); }).join(" ");
      }
      svg.selectAll("polygon")
          .data(polygonGrups)
          .enter().append("polygon")
          .attr("points",poligons)
          .attr("clip-path", "url(#clip)")
          .attr("fill", "#A0522D")
          .attr("fill-opacity", 0.6)

  });
}

function noExisteixPolygon(polygons, p1, p2, p3, p4){

  var p = [p1, p2, p3, p4]
  var o = {points: p};
  for(i = 0; i < polygons.length; i++){
    //console.log(polygons[i]);
    if(JSON.stringify(polygons[i]) === JSON.stringify(o)){
      return false;
    }
  }

  //if(polygons.indexOf(o) === -1) return true
  //else return false

  return true;
}

function trobarPrimerCiclistaSeg(coord, grups){


  for(i = 0; i < grups.length; i++){

    var grup = grups[i];

    if(grup.indexOf(coord) !== -1){
      return grup[0];
    }
  }
  return -1;
}

function trobarUltimCiclistaSeg(coord, grups){

  for(i = 0; i < grups.length; i++){

    var grup = grups[i];

    if(grup.indexOf(coord) !== -1){
      return grup[grup.length - 1];
    }
  }
  return -1;
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
