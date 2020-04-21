SimpleGraph = function(elemid){

  // Extract the list of km we want to keep in the plot. Here I keep all except the column called Species
  d3.csv("./csv/Stage13-data-full-csv.csv", function(data){

      //Array[Names Km]
    	columnsKmName = d3.keys(data[0]).filter(isElapsed)

      //Array[Km]
    	columnsKm = d3.keys(data[0]).filter(isnewKm) //guarda les claus que continguin "km"
    	for(var i = 0; i < columnsKm.length; i++){
    		columnsKm[i] = columnsKm[i].slice(0, columnsKm[i].indexOf("_")).replace("km",""); // en cada valor acosta l'string i subst. "km" per ""
    	}
    	columnsKm = columnsKm.filter((a, b) => columnsKm.indexOf(a) === b); //elimina repetits

      //es modifica el valor de "Elapsed time" de data per un valor enter, representa els segons
  	 for(var i = 0; i < data.length; i++){

    		columnsKmName.forEach(function(key) {
  			   //modificar value, transformar minuts segons a un valor enter
  			   var elapse = data[i][key]

           var min = elapse.slice(1, elapse.indexOf("'"));
           var seg = elapse.substr(elapse.indexOf("'") + 1, 2);

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
      var riders = [];

      for(rider in data){

        var coordinates = [];

        for(var j = 0; j < columnsKmName.length; j++){

          var positionKM = columnsKmName[j].slice(0, columnsKmName[j].indexOf("_"))+"_Position"
          
          coordinates.push({id: parseInt(rider), x: parseFloat(columnsKm[j]), y: data[rider][columnsKmName[j]] + parseInt(data[rider][positionKM])})
        }
        riders.push({id: parseInt(rider), nom: data[rider]["Rider_name"], team: data[rider]["Team"], ridernum: data[rider]["Rider_number"], lider: data[rider]["Leader"]})
        elapsedDataRider.push(coordinates);
      }
      elapsedDataRider.pop();
      console.log(riders);
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
      this.cx = 1800; //amplada en pixels de l'interior (amb padding inclos)
      this.cy = 800; //altura en pixels de l'interior (amb padding inclos)

      var margin = {top: 20, right: 30, bottom: 30, left: 50},
          width = this.cx - margin.left - margin.right,
          height = this.cy - margin.top - margin.bottom;
      
      var xScale = d3.scaleLinear()
          //.domain([0, elapsedDataRider[0].length - 1])
          .domain([parseFloat(columnsKm[0]) , 0])
          .range([0, width]);
       
      var yScale = d3.scaleLinear()
          .domain([0, corredorMaxElapsed(elapsedDataRider)])
          .range([0, height])
        
      var xAxis = d3.axisBottom(xScale)
        .tickSize(-height)
        .tickPadding(10)  


      var yAxis = d3.axisLeft(yScale)
        .tickPadding(10)
        .tickSize(-width)
      
      var zoom = d3.zoom()
          .scaleExtent([1,80])
          .translateExtent([[0, 0], [width, height]]) 
          .extent([[0, 0], [width, height]])
          .on("zoom", zoomed);
        

      //************************************************************
      // Generate our SVG object
      //************************************************************  
      var svg = d3.select(this.chart).append("svg")
        .call(zoom)
        .attr("width", this.cx + margin.left + margin.right )
        .attr("height", this.cy + margin.top + margin.bottom)
        //.attr("width", "100%")
        //.attr("height", "100%")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
       
     var gX = svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);
       
      var gY = svg.append("g")
                  .attr("class", "y axis")
                  .call(yAxis);

      // svg.append("g")
      //   .attr("class", "y axis")
      //   .append("text")
      //   .attr("class", "axis-label")
      //   .attr("transform", "rotate(-90)")
      //   .attr("y", (-margin.left) + 10)
      //   .attr("x", -height/2)
      //   .text('Axis Label');  
      

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
      

      // svg.selectAll('.line')
      //   .data(elapsedDataRider)
      //   .enter()
      //   .append("path")
      //   .attr("class", "line")
      //   .attr("clip-path", "url(#clip)")
      //   .style('stroke', '#1E90FF')
      //    .attr("d", line);   
        
        
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



        //re-draw labels
        svg.selectAll("text.timeGroup")
          .attr("x",  function(d) {
            return new_xScale(d.x);
          })
          .attr("y",  function(d) {
            return new_yScale(d.y);
          })     
      }

      //************************************************************
      //Trobar els grups de ciclistes que hi ha en els kms
      //************************************************************
      var grupsCiclistesEtapa = [];

      for(var i = 0; i < columnsKmName.length; i++){

        var grupsCiclistesKM = [];

        ////ordenar els ciclistes per km "i"
        var posicioCiclista = [];
        for(var j = 0; j < elapsedDataRider.length; j++){

          if(!isNaN(elapsedDataRider[j][i].y)){ //comprova que sigui una coordenada válida
            posicioCiclista.push(elapsedDataRider[j][i])
          }
        }

        posicioCiclista.sort(function(a,b) { //ordena les posicions dels ciclistes
            if( a.x == b.x) return a.y-b.y;
              return a.x-b.x;
        });

        for(var k = 0; k < posicioCiclista.length - 1; k++){

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

      for(var i = 0; i < columnsKmName.length - 1; i++){ //per cada km (d'esquerra a dreta)
      //for(i = 3; i < 7; i++){
        var grupsCiclistaKM = grupsCiclistesEtapa[i];

        for(var j = 0; j < grupsCiclistaKM.length; j++){ //per cada grup de ciclistes de cada km

          var grupCiclista = grupsCiclistaKM[j];

          for(var k = 0; k < grupCiclista.length; k++){ //per cada ciclista del grup de ciclistes de cada km, busca el grup que anira en km+1

            var coordPrimerCiclista;
            var coordUltimCiclista;

            // var coordPrimerCiclista = grupCiclista[0];
            // var coordUltimCiclista = grupCiclista[grupCiclista.length - 1]

            var seguentCoordCiclista = elapsedDataRider[grupCiclista[k].id][i + 1];

            //if(uneixGrupMesGran(grupCiclista.length, elapsedDataRider[grupCiclista[k].id][i + 1], grupsCiclistesEtapa[i + 1])){
            // if(canviaDeGrup(elapsedDataRider[grupCiclista[k].id][i], elapsedDataRider[grupCiclista[k].id][i + 1], grupsCiclistesEtapa[i], grupsCiclistesEtapa[i + 1])){
            //     coordPrimerCiclista = grupCiclista[0];
            //     coordUltimCiclista = grupCiclista[grupCiclista.length - 1]
            // }
            // else{
                coordPrimerCiclista = trobarPrimerCiclista(elapsedDataRider[grupCiclista[k].id][i], seguentCoordCiclista, grupsCiclistesEtapa[i], grupsCiclistesEtapa[i + 1], i, elapsedDataRider);
                coordUltimCiclista = trobarUltimCiclista(elapsedDataRider[grupCiclista[k].id][i], seguentCoordCiclista, grupsCiclistesEtapa[i], grupsCiclistesEtapa[i + 1], i, elapsedDataRider);
            //}

            // var coordPrimerCiclistaSegGrup = trobarPrimerCiclistaSeg(seguentCoordCiclista, grupsCiclistesEtapa[i + 1]);
            // var coordUltimCiclistaSegGrup = trobarUltimCiclistaSeg(seguentCoordCiclista, grupsCiclistesEtapa[i + 1]);

            var coordPrimerCiclistaSegGrup = trobarPrimerCiclistaSeg(elapsedDataRider[grupCiclista[k].id][i], seguentCoordCiclista, grupsCiclistesEtapa[i], grupsCiclistesEtapa[i + 1], i, elapsedDataRider);
            var coordUltimCiclistaSegGrup = trobarUltimCiclistaSeg(elapsedDataRider[grupCiclista[k].id][i], seguentCoordCiclista, grupsCiclistesEtapa[i], grupsCiclistesEtapa[i + 1], i, elapsedDataRider);

            // var coordPrimerCiclista = trobarPrimerCiclista(seguentCoordCiclista, grupsCiclistesEtapa[i], grupsCiclistesEtapa[i + 1], i, elapsedDataRider);
            // var coordUltimCiclista = trobarUltimCiclista(seguentCoordCiclista, grupsCiclistesEtapa[i], grupsCiclistesEtapa[i + 1], i, elapsedDataRider);

            if(coordPrimerCiclista !== -1 && coordUltimCiclista !== -1 && coordPrimerCiclistaSegGrup !== -1 && coordUltimCiclistaSegGrup !== -1){ //forma part d'algun grup en el km + 1

              //afegir polygons
              polygonGrups.push({points: [coordPrimerCiclista, coordPrimerCiclistaSegGrup, coordUltimCiclistaSegGrup, coordUltimCiclista]})
            }
          }
        }
      }

      //console.log(polygonGrups.length);

      //***********************
      //Pintar polygonsGrups
      //***********************
      //console.log(grupsCiclistesEtapa);
      var poligons = function(d){
        return d.points.map(function(d) { return [xScale(d.x),yScale(d.y)].join(","); }).join(" ");
      }

      svg.selectAll("polygon")
          .data(polygonGrups)
          .enter()
          .append("polygon")
          .attr("points",poligons)
          .attr("clip-path", "url(#clip)")
          .attr("fill", "#A0522D")
          .attr("fill-opacity", 1)

      svg.selectAll('.line')
        .data(elapsedDataRider)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("clip-path", "url(#clip)")
        .style('stroke', '#A9A9A9')
        .attr("d", line)
        .on('click', function(d) {
          mostrarRider(d[0].id, riders);
          // transition the clicked element
          // to have a radius of 20

        });
        // .on('mouseover', function(d, i) {
        //   console.log("mouseover on", this);
        //   // transition the mouseover'd element
        //   // to having a red fill
        //   d3.select(this)
        //     .transition()
        //     .style('stroke', '#00008B')
        //     .style('stroke-width', '3px')
        // })
        // .on('mouseout', function(d, i) {
        //   console.log("mouseout", this);
        //   // return the mouseover'd element
        //   // to being smaller and black
        //   d3.select(this)
        //     .transition()
        //     .style('stroke', '#A9A9A9')
        //     .style('stroke-width', '1px')
        // });

      //************************************************************************************
      //Busca diferencia de temps entre grups
      //************************************************************************************

      var diferenciaTempsGrups = buscaDifernciaTempsGrups(grupsCiclistesEtapa, columnsKm);

        //var diferenciaTempsGrups = []

      svg.selectAll("text.timeGroup")
        .data(diferenciaTempsGrups)
        .enter()
        .append("text")
        .attr("class", "timeGroup")
        .attr("x", function(d) {
                    return xScale(d.x);
               })
        .attr("y", function(d) {
                    return yScale(d.y);
               })
        .text(d=>d.timeDiff)

      // var rects = svg.selectAll("rect")
      //   .data(diferenciaTempsGrups)
      //   .enter()
      //   .append("rect")
      //   .attr("x", d=> d.x1)
      //   .attr("y", d=> d.y1)
      //   .attr("width", d=> d.x2 - d.x1)
      //   .attr("height", d=> d.y2 - d.y1)
      //   .attr("fill", "teal");

      // var differenceGroup = svg.selectAll("text.timeGroup")
      //   .data(DATA)
      //   .enter()
      //   .append("text")
      //   .attr("class", "timeGroup")
      //   .attr("x", d=> d.x)
      //   .attr("y", d=> d.y)
      //   .text("hola")
        //.text(function(d) { return d['name']; })
  });
}

function mostrarRider(id_rider, riders){

  var rider = riders.find(r => r.id === id_rider);
  console.log(rider.nom);
}

function buscaDifernciaTempsGrups(grupsEtapa, columnsKm){

  var res = []

  for(var i = 0; i < grupsEtapa.length; i++){

    var grupsKM = grupsEtapa[i];

    for(var j = 0; j < grupsKM.length - 1; j++){

      var x = parseInt(columnsKm[i]);

      var grupAnt = grupsKM[j];
      var grupSeg = grupsKM[j + 1];
      var positiontime = grupAnt[grupAnt.length - 1].y +((grupSeg[0].y - grupAnt[grupAnt.length - 1].y) / 2);
      var time = (grupSeg[0].y - grupAnt[grupAnt.length - 1].y);

      if(time > 0) res.push({x: x, y: positiontime, timeDiff: time});
    }
  }

  return res;
}

function canviaDeGrup(coordAnt, coordSeg, grupsAnt, grupsSeg){

  var grupActual = trobarGrup(coordAnt, grupsAnt);
  var grupSeguent = trobarGrup(coordSeg, grupsSeg);

  if(sonGrupsIguals(grupActual, grupSeguent)) return false;
  else return true;
}

function sonGrupsIguals(g1, g2){

  for(var i = 0; i < g1.length; i++){
    if(g2.indexOf(g1[i]) === -1) return false;
  }

  for(var j = 0; j < g2.length; j++){
    if(g1.indexOf(g2[j]) === -1) return false;
  }

  return true;
}

function trobarGrup(coord, grups){

  var grup = -1;

  for(var i = 0; i < grups.length; i++){

    grup = grups[i];

    if(grup.indexOf(coord) !== -1) return grup;
    
  }

  return -1;
}

function noExisteixPolygon(polygons, p1, p2, p3, p4){

  var p = [p1, p2, p3, p4]
  var o = {points: p};
  for(var i = 0; i < polygons.length; i++){

    if(JSON.stringify(polygons[i]) === JSON.stringify(o)){
      return false;
    }
  }

  return true;
}

function uneixGrupMesGran(numeroCiclistes, coordSeg, grupsSeg){


  for(var i = 0; i < grupsSeg.length; i++){

    var grup = grupsSeg[i];
    if((grup.indexOf(coordSeg) !== 1) && grup.length > numeroCiclistes) return true;
    
  }

  return false;
}

function trobarUltimCiclista(coordAnt, coordSeg, grupsAnt, grupsSeg, kmActual, elapsedDataRider){



  var grupActual = trobarGrup(coordAnt, grupsAnt);
  var grupSeguent = trobarGrup(coordSeg, grupsSeg);

  if(grupActual !== -1 && grupSeguent !== -1){
    if(coordAnt.y < grupSeguent[0].y){
      return coordAnt;
    }
    else return grupActual[grupActual.length -1];
  }

  return -1;
}

function trobarPrimerCiclista(coordAnt, coordSeg, grupsAnt, grupsSeg, kmActual, elapsedDataRider){

  var grupActual = trobarGrup(coordAnt, grupsAnt);
  var grupSeguent = trobarGrup(coordSeg, grupsSeg);

  if(grupActual !== -1 && grupSeguent !== -1){
    if(coordAnt.y > grupSeguent[0].y){
      return coordAnt;
    }
    else return grupActual[0];
  }

  return -1;
}

function existeixEnElGrupAnterior(grupAnt, coordAnt, coordProposada){

  for(var i = 0; i < grupAnt.length; i++){

    var grup = grupAnt[i];

    if(grup.indexOf(coordAnt) !== -1 &&  grup.indexOf(coordProposada) !== -1) return true
      
    
  }
  return false;
}

function existeixEnAlgunGrup(grups, coord){

  for(var i = 0; i < grups.length; i++){

    var grup = grups[i];

    if(grup.indexOf(coord) !== -1){
      return true;
    }
  }

  return false;
}

function trobarPrimerCiclistaSeg(coordAnt, coordSeg, grupsAnt, grupsSeg, kmActual, elapsedDataRider){

  var grupActual = trobarGrup(coordAnt, grupsAnt);
  var grupSeguent = trobarGrup(coordSeg, grupsSeg);

  if(grupActual !== -1 && grupSeguent !== -1){

    if(coordSeg.y > grupActual[0].y){
      return coordSeg;
    }
    else return grupSeguent[0];
  }

  return -1;
}

function trobarUltimCiclistaSeg(coordAnt, coordSeg, grupsAnt, grupsSeg, kmActual, elapsedDataRider){

  var grupActual = trobarGrup(coordAnt, grupsAnt);
  var grupSeguent = trobarGrup(coordSeg, grupsSeg);

  if(grupActual !== -1 && grupSeguent !== -1){
    if(coordSeg.y < grupActual[0].y){
      return coordSeg;
    }
    else return grupSeguent[grupSeguent.length - 1];
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

function corredorMaxElapsed(dataElapsed){

  var res = 0;

  for(var i = 0; i < dataElapsed.length; i++){

    var riders = dataElapsed[i];

    for(var j = 0; j < riders.length; j++){

      if(riders[j].y > res) res = riders[j].y
    }

  }
  
  return res;
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
