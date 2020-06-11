var svg;
var height;
var elapsedDataRider = [];
var labelsDataRider = []; //informacio de les etiquetes
var arrKmMostrar = [];
var riders = [];

var varEtiquetesTemps = 80;

var xScaleLabel;
var yScaleLabel;


var showNAxisChart = 4;
var separacioEntreKm;
if(currentStage === 11) separacioEntreKm = 5;
else separacioEntreKm = 10;
// Extract the list of km we want to keep in the plot.
d3.text("./csv/Stage" + currentStage + "-data-full-csv.csv", function(original_data){

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

    var punts = [];

    for(var j = 0; j < columnsNameElapsedKm.length; j++){

      var positionKM = columnsNameElapsedKm[j].slice(0, columnsNameElapsedKm[j].indexOf("_"))+"_Position"
      
      punts.push({id: parseInt(rider),
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
    elapsedDataRider.push(punts);
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
  this.cx = 1650; //amplada en pixels de l'interior (amb padding inclos)
  this.cy = 750; //altura en pixels de l'interior (amb padding inclos)

  var margin = {top: 0, right: 40, bottom: 20, left: 40},
      width = this.cx - margin.left - margin.right;

  height = this.cy - margin.top - margin.bottom;

  var xScale = d3.scaleLinear()
      //.domain([0, elapsedDataRider[0].length - 1])
      .domain([parseFloat(columnsKm[0]) , 0])
      .range([0, width])

  xScaleLabel = xScale;

  var yScale = d3.scaleLinear()
      .domain([0, valorElapsedMax(elapsedDataRider)])
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
      .scaleExtent([1,20])
      .translateExtent([[0, 0], [width, height]]) 
      .extent([[0, 0], [width, height]])
      .duration([750])
      .on("zoom", zoomed);
    
  //************************************************************
  // Generate our SVG object
  //************************************************************  


  svg = d3.select("#stage_id")
     //.append("div")
     // Container class to make it responsive.
     //.classed("svg-container", true) 
     //.append("svg")
     //.call(zoom)
     // Responsive SVG needs these 2 attributes and no width and height attr.
     //.attr("preserveAspectRatio", "xMinYMin meet")
     //.attr("viewBox", "0 0 1650 750")
      // .attr("width",  width)
      // .attr("height", height)
     // Class to make it responsive.
     //.classed("svg-content-responsive", true)
     //.append("g")
     //.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
     //.style("border-style", "solid")
     .append("svg")
     .attr("viewBox", "-40 20 1650 750")
     // .attr("width",  "10%" )
     // .attr("height", "100%")
     .style("overflow", "visible")
     // .style("display", "inline-block")
     // .style("position", "relative")
     .call(zoom)

 var arr_kmMostrar = updateAxisXKm(xScale.domain(), columnsKm);


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
      .attr("fill", "#e6550d")
      .attr("fill-opacity", 0.3)

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
    .attr("d", line)
    .attr("id", function(d){
      return "r"+d[0].id;
    });

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
                return xScale(d.x) + 10;
           })
    .attr("y", function(d) {
                return yScale(d.y);
           })
    .text(d=>d.timeDiff)
    .style("visibility", function(d, i) {
        return d.timeSeconds > valorElapsedMax(elapsedDataRider) * varEtiquetesTemps / height && arrKmMostrar.includes(d.x) ? "visible" : "hidden";
    });


  //************************************************************************************
  //Mostrar guanyadors i titol
  //************************************************************************************

  var imgStart = $("div.imgStart");
  var imgtitle = $('<img>')
      .attr("src", "./imgs/start.png")
      .addClass('imgStart')
      .appendTo(imgStart);

  $('.origenalignleft').append(stages[currentStage - 1].origen);

  $('.pstageData').append("Stage " + currentStage + " (" + stages[currentStage - 1].km + ")");

  var imgFinal = $("div.imgFinal");
  var imgtitle = $('<img>')
      .attr("src", "./imgs/final.png")
      .addClass('imgFinal')
      .appendTo(imgFinal);

  $('.destialignright').append(stages[currentStage - 1].desti);

  var primer = document.createElement("pWinner");  
  var textprimer = document.createTextNode(winnerEtapa(1, riders, grupsCiclistesEtapa[grupsCiclistesEtapa.length - 1])); 
  primer.appendChild(textprimer);
  document.getElementById('FirstWinner').appendChild(primer)

  var segon = document.createElement("pWinner");  
  var textsegon = document.createTextNode(winnerEtapa(2, riders, grupsCiclistesEtapa[grupsCiclistesEtapa.length - 1])); 
  segon.appendChild(textsegon);
  document.getElementById('SecondWinner').appendChild(segon)

  var tercer = document.createElement("pWinner");  
  var texttercer = document.createTextNode(winnerEtapa(3, riders, grupsCiclistesEtapa[grupsCiclistesEtapa.length - 1])); 
  tercer.appendChild(texttercer);
  document.getElementById('ThirdWinner').appendChild(tercer)

  var leaderRider = riders.find(function(r) { return r.lider === "GC"; })

  var groc = document.createElement("pWinner"); 
  var textgroc = document.createTextNode(leaderRider.nom); 
  groc.appendChild(textgroc);
  document.getElementById('StageWinner').appendChild(groc)
  //document.getElementById('containerWinners_id').getElementsByClassName('yellow')[0].innerHTML = leaderRider.nom;

  var imgProfileStage = $("div.classProfileStage");

  var div = $('<div/>')
            .addClass('myDivImageProfile')
            .appendTo(imgProfileStage)

  var img = $('<img>')
      .attr("src", "./imgs/profiles_stages/" + "tour-de-france-2018-stage-" + currentStage + "-profile.png")
      .addClass('imgProfile')
       .attr("height", "180px")
       .attr("width", "1500px")
      .appendTo(div);

   // Make an SVG Container
   var svgContainer = d3.select("div.myDivImageProfile").append("svg")
                                      // .attr("viewBox", "0 0 200 26")
                                        .attr("width", "100%")
                                        .attr("height", "100%");
   
   //Draw the Rectangle
   var rectangle = svgContainer.append("rect")
                               .attr("id", "brush")
                               .attr("x", "2.5%")
                               .attr("y", 0)
                               .attr("color", "#A9A9A9")
                               .attr("fill-opacity", 0.2)
                               .attr("width", "97.5%")
                               .attr("height", "100%");

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
        return new_xScale(d.x) + 10;
      })
      .attr("y",  function(d) {
        return new_yScale(d.y);
      })
      .style("visibility", function(d, i) {
        return (d.timeSeconds * zoomScale) > valorElapsedMax(elapsedDataRider) * varEtiquetesTemps / height && arrKmMostrar.includes(d.x) ? "visible" : "hidden";
    });   

    //re-draw dots
    svg.selectAll("circle")
      .attr("cx",  function(d) {
        return new_xScale(d.x);
      })
      .attr("cy",  function(d) {
        return new_yScale(d.y);
      })


    //Stage Profile
    var percentatgeIni = 97.5
    var distanciaCursa = columnsKm[0]
    var newAttrX = (Math.abs(percentatgeIni - (new_xScale.domain()[0] * 100) / distanciaCursa)).toString() + "%";
    var newWidth = 100 - Math.abs(percentatgeIni - (new_xScale.domain()[0] * 100) / distanciaCursa);

    var newAttrwidht = (Math.abs(newWidth - (new_xScale.domain()[1] * 100) / distanciaCursa)).toString() + "%";

    $("#brush").attr("x", newAttrX) 
    $("#brush").attr("width", newAttrwidht) 

  }
});

function updateAxisXKm(arryDomain, columnsKm){

    var km_maxim_vist = arryDomain[0];
    var km_minim_vist = arryDomain[1];
    var rang_visio = km_maxim_vist - km_minim_vist;

    var inc = rang_visio /(showNAxisChart + 1);

    var inc_ampliat = Math.ceil(inc/separacioEntreKm) * separacioEntreKm;

    var rang_ampliat = inc_ampliat * (showNAxisChart + 1);

    var inc_rang = rang_ampliat - rang_visio;

    var km_min = km_minim_vist - inc_rang / 2;
    arrKmMostrar = [];

    if(rang_visio > (separacioEntreKm * (showNAxisChart + 1))){

      for (var i = 1; i <= showNAxisChart ; i++){
        var km = Math.round((km_min + i * inc_ampliat) / separacioEntreKm) * separacioEntreKm;
        arrKmMostrar.push(km);
      }
    }
    else{

      var inici;
      for(var i = 0; i < columnsKm.length; i++){ //busquem el primer km vist
        if(km_maxim_vist >= parseFloat(columnsKm[i])){ 
          inici = i; 
          break;
        }
      }
      var final = columnsKm.length - 1;
      for(var i = inici + 1; i < columnsKm.length; i++){ //busquem el darrer km vist

        if(km_minim_vist <= parseFloat(columnsKm[i])){
         final = i;
        }
      }

      if(final - inici < showNAxisChart){ //si no n'hi ha masses, els guardo tots
      
        for(var j = inici; j < columnsKm.length; j++){
          arrKmMostrar.push(parseFloat(columnsKm[j]))
        }
      }
      else{ //n'hi ha masses, miro quins hauria de mostrar i els busco
        var kms =[];

        for(var i = 0; i < showNAxisChart; i++){
          kms.unshift(km_min + i * inc_ampliat)
        }

        var j=0;
        for(var i = inici; i < final-1 && j < showNAxisChart; i++){

          if(columnsKm[i] >= kms[j] && columnsKm[i+1] < kms[j]){
            arrKmMostrar.push(parseFloat(columnsKm[i]))
            j++;

          }
        }
      }      
    }
    arrKmMostrar = arrKmMostrar.filter(function(element){
      return element <= arryDomain[0] && element >= arryDomain[1];
    });

    return arrKmMostrar;
}

function getPolygonsGroups(columnsNameElapsedKm,grupsCiclistesEtapa, elapsedDataRider){

  var polygonsGrups = [];

    for(var i = 0; i < columnsNameElapsedKm.length - 1; i++){ //per cada km (d'esquerra a dreta)

      var grupsCiclistaKM = grupsCiclistesEtapa[i];

      for(var j = 0; j < grupsCiclistaKM.length; j++){ //per cada grup de ciclistes de cada km

        var grupCiclista = grupsCiclistaKM[j];
        var puntTractades = [];

        for(var k = 0; k < grupCiclista.length; k++){ //per cada ciclista del grup de ciclistes de cada km, busca el grup que anira en km+1

          //inicializem les punt del poligon
          var puntPrimerCiclista = elapsedDataRider[grupCiclista[k].id][i];
          var puntUltimCiclista = elapsedDataRider[grupCiclista[k].id][i];
          var puntPrimerCiclistaSegGrup = elapsedDataRider[grupCiclista[k].id][i + 1];
          var puntUltimCiclistaSegGrup = elapsedDataRider[grupCiclista[k].id][i + 1];

          if(!puntTractades.includes(elapsedDataRider[grupCiclista[k].id][i])){

              var seguentpuntCiclista = elapsedDataRider[grupCiclista[k].id][i + 1];
              var grupSeguent = trobarGrup(seguentpuntCiclista, grupsCiclistesEtapa[i + 1]);

              if(grupSeguent !== -1){ //no hi ha info del ciclista

                for(var l = k; l < grupCiclista.length; l++){

                  var puntSubGrup = elapsedDataRider[grupCiclista[l].id][i]
                  var puntSubGrupSeg = elapsedDataRider[grupCiclista[l].id][i + 1]
                  var grupSeguentCandidat = trobarGrup(puntSubGrupSeg, grupsCiclistesEtapa[i + 1]);

                  if((grupSeguentCandidat !== -1) && (sonGrupsIguals(grupSeguent, grupSeguentCandidat))){
                    puntTractades.push(puntSubGrup)

                    //Actualitza ultim ciclista del costa esq.
                    puntUltimCiclista = puntSubGrup;

                    //Actualitza punt costat dret
                    if(puntSubGrupSeg.y > puntUltimCiclistaSegGrup.y){
                     puntUltimCiclistaSegGrup = puntSubGrupSeg;
                    }
                    else if(puntSubGrupSeg.y < puntPrimerCiclistaSegGrup.y){
                      puntPrimerCiclistaSegGrup = puntSubGrupSeg;
                    }
                  }
                }

                //Si es un ciclista que va sol
                if(puntPrimerCiclistaSegGrup === puntUltimCiclistaSegGrup){

                  puntPrimerCiclista = {id: puntPrimerCiclista.id, x: puntPrimerCiclista.x, y: puntPrimerCiclista.y - 0.5};
                  puntPrimerCiclistaSegGrup = {id: puntPrimerCiclistaSegGrup.id, x: puntPrimerCiclistaSegGrup.x, y: puntPrimerCiclistaSegGrup.y - 0.5};
                  puntUltimCiclista = {id: puntUltimCiclista.id, x: puntUltimCiclista.x, y: puntUltimCiclista.y + 0.5};
                  puntUltimCiclistaSegGrup = {id: puntUltimCiclistaSegGrup.id, x: puntUltimCiclistaSegGrup.x, y: puntUltimCiclistaSegGrup.y + 0.5};
                }
                polygonsGrups.push({points: [puntPrimerCiclista, puntPrimerCiclistaSegGrup, puntUltimCiclistaSegGrup, puntUltimCiclista]});    
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
      var posicionsCiclista = [];
      for(var j = 0; j < elapsedDataRider.length; j++){

        if(!isNaN(elapsedDataRider[j][i].y)){ //comprova que sigui una punt vàlid
          posicionsCiclista.push(elapsedDataRider[j][i])
        }
      }

      posicionsCiclista.sort(function(a,b) { //ordena les posicions dels ciclistes
          if( a.x == b.x) return a.y-b.y;
            return a.x-b.x;
      });

      for(var k = 0; k < posicionsCiclista.length; k++){

        var grupN = []

        if(esPotFerGrupCiclista(k, posicionsCiclista)){

            var puntIni = k;
            grupN.push(posicionsCiclista[k]);

            while(posicionsCiclista[k].y === (posicionsCiclista[k+1].y -1)){

              k++;
              grupN.push(posicionsCiclista[k]);

              if(k  === posicionsCiclista.length - 1){
                break;
              }

            }            
            grupsCiclistesKM.push(grupN);
        }
        else{ // es un ciclista que va sol i no te grup
          grupN.push(posicionsCiclista[k]);
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
      var time = (grupSeg[0].y - grupAnt[grupAnt.length - 1].y) - 1;

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


function sonGrupsIguals(g1, g2){

  for(var i = 0; i < g1.length; i++){
    if(g2.indexOf(g1[i]) === -1) return false;
  }

  for(var j = 0; j < g2.length; j++){
    if(g1.indexOf(g2[j]) === -1) return false;
  }

  return true;
}

function trobarGrup(punt, grups){

  var grup = -1;

  for(var i = 0; i < grups.length; i++){

    grup = grups[i];

    if(grup.indexOf(punt) !== -1) return grup;
    
  }

  return -1;
}


function valorElapsedMax(dataElapsed){

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
