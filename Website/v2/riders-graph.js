var svg;
var height;
var elapsedDataRider = [];
var labelsDataRider = []; //informacio de les etiquetes

var xScaleLabel;
var yScaleLabel;


var showNAxisChart = 4;
// Extract the list of km we want to keep in the plot.
d3.text("./csv/Stage13-data-full-csv.csv", function(original_data){

  //************************************************************
  // S'adapta: el fitxer origianl_data, titol, 
  // ElapsedTime, kmX_GC_prov_position, kmX_GC_prov_delay
  //************************************************************

  var infoStageTitle = original_data.split('\n')[0];

  // break the textblock into an array of lines
  var linesData = original_data.split('\n');
  // remove one line, starting at the first position
  linesData.splice(0,1);
  
  // join the array back into a single string
  var new_csv = linesData.join('\n');
  
  var data = d3.csvParse(new_csv);

  //Array[Names Elapsed Km]
	columnsNameElapsedKm = d3.keys(data[0]).filter(infoColumn => infoColumn.includes("Elapsed"))

  //Array[Name GC Prov Position]
  columnsNameGCProvPosition = d3.keys(data[0]).filter(infoColumn => infoColumn.includes("GC_prov_position"));

  //Array[Name GC Prov Delay]
  columnsNameGCProvDelay = d3.keys(data[0]).filter(infoColumn => infoColumn.includes("GC_prov_delay"));

  //Array[Km]
	columnsKm = d3.keys(data[0]).filter(isnewKm) //guarda les claus que continguin "km"
	for(var i = 0; i < columnsKm.length; i++){
		columnsKm[i] = columnsKm[i].slice(0, columnsKm[i].indexOf("_")).replace("km",""); // en cada valor acosta l'string i subst. "km" per ""
	}
	columnsKm = columnsKm.filter((a, b) => columnsKm.indexOf(a) === b); //elimina repetits

//es modifica el valor de "Elapsed time" de data per un valor enter, representa els segons
 for(var i = 0; i < data.length; i++){

		columnsNameElapsedKm.forEach(function(key) {
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

  var columns = data.columns;
  var dataRiders = data.slice(0, data.length);

  
  

  for(rider in dataRiders){

    var coordinates = [];

    for(var j = 0; j < columnsNameElapsedKm.length; j++){

      var positionKM = columnsNameElapsedKm[j].slice(0, columnsNameElapsedKm[j].indexOf("_"))+"_Position"
      
      coordinates.push({id: parseInt(rider),
                        x: parseFloat(columnsKm[j]),
                        y: data[rider][columnsNameElapsedKm[j]] + parseInt(data[rider][positionKM]), 
                      });

      labelsDataRider.push({id: parseInt(rider),
                            x: parseFloat(columnsKm[j]),
                            y: data[rider][columnsNameElapsedKm[j]] + parseInt(data[rider][positionKM]),
                            elapsedTime: myTime(data[rider][columnsNameElapsedKm[j]]),
                            provPos: data[rider][columnsNameGCProvPosition[j]],
                            provDelay: data[rider][columnsNameGCProvDelay[j]]
                          })
    }
    riders.push({id: parseInt(rider), nom: data[rider]["Rider_name"], team: data[rider]["Team"], ridernum: data[rider]["Rider_number"], lider: data[rider]["Leader"]})
    elapsedDataRider.push(coordinates);
  }

  //************************************************************
  // Trobar els grups de ciclistes que hi ha en els kms
  //************************************************************
  var grupsCiclistesEtapa = getGroupRidersStage(elapsedDataRider);

  //************************************************************************************
  // Mirar en les etapes cada un del ciclistes a quin grup forma part i guardar els grups(polygons)
  //************************************************************************************
  var polygonGrups = getPolygonsGroups(columnsNameElapsedKm, grupsCiclistesEtapa, elapsedDataRider);

  //************************************************************************************
  // Busca diferencia de temps entre grups
  //************************************************************************************
  var diferenciaTempsGrups = buscaDiferenciaTempsGrups(grupsCiclistesEtapa, columnsKm);

  //************************************************************
  // Create Margins and Axis and hook our zoom function
  //************************************************************

  var self = this;
  this.cx = 1850; //amplada en pixels de l'interior (amb padding inclos)
  this.cy = 1000; //altura en pixels de l'interior (amb padding inclos)

  var margin = {top: 20, right: 30, bottom: 30, left: 50},
      width = this.cx - margin.left - margin.right;

  height = this.cy - margin.top - margin.bottom;

  var xScale = d3.scaleLinear()
      //.domain([0, elapsedDataRider[0].length - 1])
      .domain([parseFloat(columnsKm[0]) , 0])
      .range([0, width])

  xScaleLabel = xScale;

  var yScale = d3.scaleLinear()
      .domain([0, corredorMaxElapsed(elapsedDataRider)])
      .range([0, height])

  yScaleLabel = yScale;
    
  var xAxis = d3.axisBottom(xScale)
    .tickValues(columnsKm)
    .tickFormat(d3.format('.1f'))
    .tickPadding(10)
    .tickSize(-height)
    // .ticks(6)

  var yAxis = d3.axisLeft(yScale)
    .tickPadding(10)
    .tickSize(-width)
    .ticks(5)
  
  var zoom = d3.zoom()
      .scaleExtent([1,80])
      .translateExtent([[0, 0], [width, height]]) 
      .extent([[0, 0], [width, height]])
      .on("zoom", zoomed);
    
  //************************************************************
  // Generate our SVG object
  //************************************************************  


  svg = d3.select("#stage_id")
     .append("div")
     // Container class to make it responsive.
     .classed("svg-container", true) 
     .append("svg")
     .call(zoom)
     // Responsive SVG needs these 2 attributes and no width and height attr.
     .attr("preserveAspectRatio", "xMinYMin meet")
     .attr("viewBox", "0 0 1850 1000")
     // Class to make it responsive.
     .classed("svg-content-responsive", true)
     .append("g")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");       

 var arr_kmMostrar = updateAxisXKm(xScale.domain(), columnsKm);

 //xAxis.tickValues(arr_kmMostrar); //-----> linea nova

 var gX = svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll(".tick")
            .style("display", function(){
              if(arr_kmMostrar.includes(parseFloat(this.textContent))) return "";
              else return "none";
            });
   
  var gY = svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
              .selectAll(".tick")
              .style("display", "none");

  svg.append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

  //************************************************************
  // Pintar polygonsGrups
  //************************************************************
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
      .attr("fill-opacity", 0.4)

  //************************************************************
  // Create D3 line object + Pintar les lineas (ciclistes)
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
    .style('stroke', '#A9A9A9')
    .attr("d", line)
    .attr("id", function(d){
      return "r"+d[0].id;
    });
    // .on('click', function(d) {
    //   mostrarRider(d[0].id, riders, this);
    //   // transition the clicked element
    //   // to have a radius of 20

    // });

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

  //************************************************************
  // Pintar la diferència de temps entre grups
  //************************************************************
  svg.selectAll("text.timeGroup")
    .data(diferenciaTempsGrups)
    .enter()
    .append("text")
    .attr("class", "timeGroup")
    .style('fill', 'blue')
    .attr("clip-path", "url(#clip)")
    .attr("x", function(d) {
                return xScale(d.x);
           })
    .attr("y", function(d) {
                return yScale(d.y);
           })
    .text(d=>d.timeDiff)
    .style("visibility", function(d, i) {
        return d.timeSeconds > 80 ? "visible" : "hidden";
    });

  // Define the div for the tooltip
  // var div = d3.select("body").append("div") 
  //   .attr("class", "tooltip")       
  //   .style("opacity", 0);

  // svg.selectAll("dot")  
  //   .data(labelsDataRider)     
  //   .enter().append("circle")               
  //       .attr("r", 5)   
  //       .attr("cx", function(d) { return xScale(d.x); })     
  //       .attr("cy", function(d) { if(isNaN(yScale(d.y))){
  //                                                    return height; 
  //                                                  } 
  //                                                  else return yScale(d.y); })   
  //       .on("mouseover", function(d) {    
  //           div.transition()    
  //              .duration(200)    
  //              .style("opacity", .9);    

  //           div.html("Elapsed time: " + d.elapsedTime + "<br/>"  + "Provisional Delay: " + d.provDelay + "<br/>"  + "Provisional Position: " + d.provPos)  
  //              .style("left", (d3.event.pageX) + "px")   
  //              .style("top", (d3.event.pageY - 28) + "px");  
  //           })          
  //       .on("mouseout", function(d) {   
  //           div.transition()    
  //              .duration(500)    
  //              .style("opacity", 0); 
  //       });

  //************************************************************************************
  //Mostrar guanyadors i titol
  //************************************************************************************

  var titleString = infoStageTitle.split(",");
  document.getElementById('continerTitleStage_id').getElementsByClassName('blockTitleStage')[0].innerHTML = "Stage: " + titleString[0] + ". " + titleString[1] + " > " + titleString[2];

  document.getElementById('containerWinners_id').getElementsByClassName('blockWinners')[0].innerHTML = "1st. " + winnerEtapa(1, riders, grupsCiclistesEtapa[grupsCiclistesEtapa.length - 1]);
  document.getElementById('containerWinners_id').getElementsByClassName('blockWinners')[1].innerHTML = "2nd. " + winnerEtapa(2, riders, grupsCiclistesEtapa[grupsCiclistesEtapa.length - 1]);
  document.getElementById('containerWinners_id').getElementsByClassName('blockWinners')[2].innerHTML = "3rd. " + winnerEtapa(3, riders, grupsCiclistesEtapa[grupsCiclistesEtapa.length - 1]);

  var leaderRider = riders.find(function(r) { return r.lider === "GC"; })
  document.getElementById('containerWinners_id').getElementsByClassName('blockYellowWinner')[0].innerHTML = leaderRider.nom;

  //************************************************************
  // Zoom specific updates
  //************************************************************
  function zoomed() {

    // create new scale ojects based on event
    var new_xScale = d3.event.transform.rescaleX(xScale);
    var new_yScale = d3.event.transform.rescaleY(yScale);

    // guarda scale dels labels per si es fa selectRider despres de zoom
    xScaleLabel = new_xScale; 
    yScaleLabel = new_yScale;

    //busca l'escala actual, per despres mostrar o no els temps de elapsed, entre grups
    var zoomTransformString = d3.event.transform.toString();
    var splitZoomString = zoomTransformString.split(" ");
    var zoomScale = parseFloat(splitZoomString[1].slice(splitZoomString[1].indexOf("(") + 1, splitZoomString[1].indexOf(")")))

    var arr_kmMostrar = updateAxisXKm(new_xScale.domain(), columnsKm);

     //xAxis.tickValues(arr_kmMostrar); //-----> linea nova
    // re-scale axes
    svg.select(".y.axis")
        .call(yAxis.scale(new_yScale))
        .selectAll(".tick")
        .style("display", "none");;

    svg.select(".x.axis")
        .call(xAxis.scale(new_xScale))
        .selectAll(".tick")
        .style("display", function(){
          if(arr_kmMostrar.includes(parseFloat(this.textContent))) return "";
          else return "none";
        });


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
      .style("visibility", function(d, i) {
        return (d.timeSeconds * zoomScale) > 80 ? "visible" : "hidden";
    });   

    //re-draw dots
    svg.selectAll("circle")
      .attr("cx",  function(d) {
        return new_xScale(d.x);
      })
      .attr("cy",  function(d) {
        return new_yScale(d.y);
      })   
  }
});

function updateAxisXKm(arryDomain, columnsKm){

    var km_maxim_vist = arryDomain[0];
    var km_minim_vist = arryDomain[1];
    var rang_visio = km_maxim_vist - km_minim_vist;

    // var arrKmMostrar = [];
    // if(rang_visio > (10 * (showNAxisChart + 1))){

    //   for(var k = 1; k <= showNAxisChart; k++){

    //     // var km = (Math.round((km_minim_vist + (k * rang_visio / (showNAxisChart + 1))) / 10 )) * 10;
    //   var km = km_minim_vist + (k * rang_visio / (showNAxisChart + 1)) ;

    //     arrKmMostrar.push(km);
    //   }
    // }
    // else{
    //   var inici;
    //   for(var i = 0; i < columnsKm.length; i++){
    //     if(km_maxim_vist >= parseFloat(columnsKm[i])){
    //       inici = i;
    //       break;
    //     }
    //   }

    //   for(var j = inici; j < columnsKm.length; j++){
    //     arrKmMostrar.push(parseFloat(columnsKm[j]))
    //   }
    // }

    var inc = rang_visio /(showNAxisChart + 1);

    var inc_ampliat = Math.ceil(inc/10) * 10;

    var rang_ampliat = inc_ampliat * (showNAxisChart + 1);

    var inc_rang = rang_ampliat - rang_visio;

    var km_min = km_minim_vist - inc_rang / 2;

    var arrKmMostrar = [];

    if(rang_visio > (10 * (showNAxisChart + 1))){

      for (var i = 1; i <= showNAxisChart ; i++){
        var km = Math.round((km_min + i * inc_ampliat) / 10) * 10;
        arrKmMostrar.push(km);
      }
    }
    else{
      var inici;
      for(var i = 0; i < columnsKm.length; i++){
        if(km_maxim_vist >= parseFloat(columnsKm[i])){
          inici = i;
          break;
        }
      }

      for(var j = inici; j < columnsKm.length; j++){
        arrKmMostrar.push(parseFloat(columnsKm[j]))
      }
    }

    console.log("domini: " +arryDomain);
    console.log("a mostrar: "+ arrKmMostrar);
    console.log("----");
    return arrKmMostrar;
}

function getPolygonsGroups(columnsNameElapsedKm,grupsCiclistesEtapa, elapsedDataRider){

  var polygonsGrups = [];

    for(var i = 0; i < columnsNameElapsedKm.length - 1; i++){ //per cada km (d'esquerra a dreta)

      var grupsCiclistaKM = grupsCiclistesEtapa[i];

      for(var j = 0; j < grupsCiclistaKM.length; j++){ //per cada grup de ciclistes de cada km

        var grupCiclista = grupsCiclistaKM[j];
        var coordTractades = [];

        for(var k = 0; k < grupCiclista.length; k++){ //per cada ciclista del grup de ciclistes de cada km, busca el grup que anira en km+1

          //inicializem les coord del poligon
          var coordPrimerCiclista = elapsedDataRider[grupCiclista[k].id][i];
          var coordUltimCiclista = elapsedDataRider[grupCiclista[k].id][i];
          var coordPrimerCiclistaSegGrup = elapsedDataRider[grupCiclista[k].id][i + 1];
          var coordUltimCiclistaSegGrup = elapsedDataRider[grupCiclista[k].id][i + 1];

          if(!coordTractades.includes(elapsedDataRider[grupCiclista[k].id][i])){

              var seguentCoordCiclista = elapsedDataRider[grupCiclista[k].id][i + 1];
              var grupSeguent = trobarGrup(seguentCoordCiclista, grupsCiclistesEtapa[i + 1]);

              if(grupSeguent !== -1){ //no hi ha info del ciclista

                for(var l = k; l < grupCiclista.length; l++){

                  var coordSubGrup = elapsedDataRider[grupCiclista[l].id][i]
                  var coordSubGrupSeg = elapsedDataRider[grupCiclista[l].id][i + 1]
                  var grupSeguentCandidat = trobarGrup(coordSubGrupSeg, grupsCiclistesEtapa[i + 1]);

                  if((grupSeguentCandidat !== -1) && (sonGrupsIguals(grupSeguent, grupSeguentCandidat))){
                    coordTractades.push(coordSubGrup)

                    //Actualitza ultim ciclista del costa esq.
                    coordUltimCiclista = coordSubGrup;

                    //Actualitza coord costat dret
                    if(coordSubGrupSeg.y > coordUltimCiclistaSegGrup.y){
                     coordUltimCiclistaSegGrup = coordSubGrupSeg;
                    }
                    else if(coordSubGrupSeg.y < coordPrimerCiclistaSegGrup.y){
                      coordPrimerCiclistaSegGrup = coordSubGrupSeg;
                    }
                  }
                }

                //Si es un ciclista que va sol
                if(coordPrimerCiclistaSegGrup === coordUltimCiclistaSegGrup){

                  coordPrimerCiclista = {id: coordPrimerCiclista.id, x: coordPrimerCiclista.x, y: coordPrimerCiclista.y - 0.5};
                  coordPrimerCiclistaSegGrup = {id: coordPrimerCiclistaSegGrup.id, x: coordPrimerCiclistaSegGrup.x, y: coordPrimerCiclistaSegGrup.y - 0.5};
                  coordUltimCiclista = {id: coordUltimCiclista.id, x: coordUltimCiclista.x, y: coordUltimCiclista.y + 0.5};
                  coordUltimCiclistaSegGrup = {id: coordUltimCiclistaSegGrup.id, x: coordUltimCiclistaSegGrup.x, y: coordUltimCiclistaSegGrup.y + 0.5};
                }
                polygonsGrups.push({points: [coordPrimerCiclista, coordPrimerCiclistaSegGrup, coordUltimCiclistaSegGrup, coordUltimCiclista]});    
              }
          }
        }
      }
    }

  return polygonsGrups;
}

function getGroupRidersStage(elapsedDataRider){

    var grupsCiclistesEtapa = [];

    for(var i = 0; i < columnsNameElapsedKm.length; i++){

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

      for(var k = 0; k < posicioCiclista.length; k++){

        var grupN = []

        if(esPotFerGrupCiclista(k, posicioCiclista)){


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
        else{ // es un ciclista que va sol i no te grup
          grupN.push(posicioCiclista[k]);
          grupsCiclistesKM.push(grupN);
        }
      }

      grupsCiclistesEtapa.push(grupsCiclistesKM);
    }

    return grupsCiclistesEtapa;
}

//comprova que no sigui l'ultim ciclista i que es pugui fer grup
function esPotFerGrupCiclista(index, posicionsCiclistes){

  return (index + 1 < posicionsCiclistes.length) && (posicionsCiclistes[index].y === (posicionsCiclistes[index + 1].y - 1))
}

function winnerEtapa(position, riders, grupsFinal){

  var count = 0;

  for(var i = 0; i < grupsFinal.length ; i++){

    var grup = grupsFinal[i];

    for(var j = 0; j < grup.length; j++){
      
      count++;
      if(count === position){

        var rider = riders.find(r => r.id === grup[j].id);
        return rider.nom;
      } 
    }

  }

}

function buscaDiferenciaTempsGrups(grupsEtapa, columnsKm){

  var res = []

  for(var i = 0; i < grupsEtapa.length; i++){

    var grupsKM = grupsEtapa[i];

    for(var j = 0; j < grupsKM.length - 1; j++){

      var x = parseInt(columnsKm[i]);

      var grupAnt = grupsKM[j];
      var grupSeg = grupsKM[j + 1];
      var positiontime = grupAnt[grupAnt.length - 1].y +((grupSeg[0].y - grupAnt[grupAnt.length - 1].y) / 2);
      var time = (grupSeg[0].y - grupAnt[grupAnt.length - 1].y);

      var timeConvert = myTime(time);

      if(time > 0) res.push({x: x, y: positiontime, timeDiff: timeConvert, timeSeconds: time});
    }
  }

  return res;
}

function myTime(time) {
  var hr = ~~(time / 3600);
  var min = ~~((time % 3600) / 60);
  var sec = time % 60;
  var sec_min = "";
  if (hr > 0) {
     sec_min += "" + hrs + ":" + (min < 10 ? "0" : "");
  }
  if(isNaN(sec)) return "-";
  sec_min += "" + min + "' " + (sec < 10 ? "0" : "");
  sec_min += "" + sec + "\"";
  return sec_min;
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

function isProvPosition(infoColumn){
  return infoColumn.includes("");
}

function isProvDelay(infoColumn){
  return infoColumn.includes
}
