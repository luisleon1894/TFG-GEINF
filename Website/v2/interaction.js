svg.selectAll('.line')
    .on('click', function(d) {
      mostrarRider(d[0].id, riders, this);
});

$("div.myDivImagesRiders").click(function(){

    var name = this.getElementsByClassName("aTextName")[0].innerText
    var ridernumStr = this.getElementsByClassName("aTextRiderNum")[0].innerText
    var ridernum = ridernumStr.slice(ridernumStr.indexOf(":") + 2, ridernumStr.length)

    var e = $.Event("keyup");
    $("#myInput").val(name).trigger(e);

    d3.selectAll(".line").classed("active", false);//selectAll instead of select
    
    var riderStage = riders.filter(r => r.ridernum === ridernum);

    if(riderStage.length > 0){

        var clicked = d3.select("#r"+riderStage[0].id);
        clicked.classed("active", true);//set class of clicked link

        showLabelInformation(riderStage);
    }
    else{
        alert(name + " is not at this stage, sorry");
    }
})

$("li.myLiNamesRider").click(function(){
    var name = this.innerText + " ";  //s'afegeix un espai perque en el fitxer hi ha un espai despres del nom del ciclista
    var rider = ridersInfo.find(r => r.Name === name);
    var ridernum = rider.Rider_Num

    var e = $.Event("keyup");
    $("#myInput").val(name).trigger(e);

    d3.selectAll(".line").classed("active", false);//selectAll instead of select
    
    var riderStage = riders.filter(r => r.ridernum === ridernum);
    var clicked = d3.select("#r"+riderStage[0].id);
    clicked.classed("active", true);//set class of clicked link

    showLabelInformation(riderStage);
})

$("div.myDivImagesTeams").click(function(){
    
    var name = this.getElementsByClassName("aTextName")[0].innerText
    var teamnumStr = this.getElementsByClassName("aTextTeamNum")[0].innerText
    var teamnum = teamnumStr.slice(teamnumStr.indexOf(":") + 2, teamnumStr.length)

    var e = $.Event("keyup");
    $("#myInput").val(name).trigger(e);

    d3.selectAll(".line").classed("active", false);//selectAll instead of select
    
    var teamSeleccionat = teamsInfo.find(t => t.Team_Num === teamnum);
    var teamStage = riders.filter(r => r.team === teamSeleccionat.Team_id);

    teamStage.map((rider) => {
        var clicked = d3.select("#r"+rider.id);
        clicked.classed("active", true);//set class of clicked link
    })

    showLabelInformation(teamStage);
})

$("li.myLiNamesTeam").click(function(){
    console.log(teamsInfo);
    var name = this.innerText + " "; //s'afegeix un espai perque en el fitxer hi ha un espai despres del nom del ciclista
    var team = teamsInfo.find(t => t.Team_Name === name);
    var teamnum = team.Team_Num

    var e = $.Event("keyup");
    $("#myInput").val(name).trigger(e);

    d3.selectAll(".line").classed("active", false);//selectAll instead of select
    
    var teamSeleccionat = teamsInfo.find(t => t.Team_Num === teamnum);
    var teamStage = riders.filter(r => r.team === teamSeleccionat.Team_id);

    teamStage.map((rider) => {
        var clicked = d3.select("#r"+rider.id);
        clicked.classed("active", true);//set class of clicked link
    })

    showLabelInformation(teamStage);
})


var $btns = $('.btn').click(function() {

    //primer mirem lista de noms
  if (this.id === 'riderShow_id') {
    $('#namesInfoRider_id > ul').show();
    $('#imagesInfoRider_id > ul').show();

    $('#namesInfoTeam_id > ul').hide();
    $('#imagesInfoTeam_id > ul').hide();       

  } else if(this.id === 'teamShow_id') {

    $('#namesInfoRider_id > ul').hide();
    $('#imagesInfoRider_id > ul').hide();

    $('#namesInfoTeam_id > ul').show();
    $('#imagesInfoTeam_id > ul').show();
  }
  $btns.removeClass('active');
  $(this).addClass('active');
})

function showLabelInformation(riders){
//*** Show label information of rider select ***//
    
    var labelRidersSelect = [];//labelsDataRider.filter(label => label.id === id_rider);
    riders.map((rider) => {
        labelRidersSelect = labelRidersSelect.concat(labelsDataRider.filter(label => label.id === rider.id));
    });

    var div = d3.select("body").append("div") 
        .attr("class", "tooltip")       
        .style("opacity", 0);

    svg.selectAll("dot")  
        .data(labelRidersSelect)     
        .enter()
        .append("circle")
        .attr("clip-path", "url(#clip)")               
        .attr("r", 5)   
        .attr("cx", function(d) { return xScaleLabel(d.x); })     
        .attr("cy", function(d) { if(isNaN(yScaleLabel(d.y))){
                                 return height; 
                                } 
                                else return yScaleLabel(d.y); })   
        .on("mouseover", function(d) {    
            div.transition()    
               .duration(200)    
               .style("opacity", .9);    

            div.html("Elapsed time: " + d.elapsedTime + "<br/>"  + "Provisional Delay: " + d.provDelay + "<br/>"  + "Provisional Position: " + d.provPos)  
               .style("left", (d3.event.pageX) + "px")   
               .style("top", (d3.event.pageY - 28) + "px");  
            })          
        .on("mouseout", function(d) {   
            div.transition()    
               .duration(500)    
               .style("opacity", 0); 
        });
}

function mostrarRider(id_rider, riders, elem){
  
  document.getElementById("riderShow_id").click();

  var riderStage = riders.filter(r => r.id === id_rider);
  console.log(riderStage);
  var rider = ridersInfo.find(r => r.Rider_Num === riderStage[0].ridernum);

  var e = $.Event("keyup");
  $("#myInput").val(rider.Name).trigger(e);

  d3.selectAll(".line").classed("active", false);//selectAll instead of select
  
  var clicked = d3.select(elem);
  clicked.classed("active", true);//set class of clicked link


  d3.selectAll("circle").remove();
  showLabelInformation(riderStage);
}

function search() {


    var input, filter, a, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();


    //search per riders
    var ulRiders, liRiders;
    var ulRidersImg, divRiders;

    ulRiders = document.getElementById("myULNamesRiders_id");
    liRiders = ulRiders.getElementsByTagName("li");

    ulRidersImg = document.getElementById("myULImagesRiders_id");
    divRiders = ulRidersImg.getElementsByTagName("div")

    for (var i = 0; i < liRiders.length; i++) {

        a = liRiders[i].getElementsByTagName("a")[0];
        aImg = divRiders[i].getElementsByTagName("a")[0];

        txtValue = a.textContent || a.innerText;

        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            liRiders[i].style.display = "";

            divRiders[i].style.display = "";

        } else {
            liRiders[i].style.display = "none";

            divRiders[i].style.display = "none"
        }
    }

    //search per teams
    var ulTeams, liTeams;
    var ulTeamsImg, divTeams;

    ulTeams = document.getElementById("myULNamesTeams_id");
    liTeams = ulTeams.getElementsByTagName("li");

    ulTeamsImg = document.getElementById("myULImagesTeams_id");
    divTeams = ulTeamsImg.getElementsByTagName("div")

    for (var i = 0; i < liTeams.length; i++) {

        a = liTeams[i].getElementsByTagName("a")[0];
        aImg = divTeams[i].getElementsByTagName("a")[0];

        txtValue = a.textContent || a.innerText;

        txtValueImg = aImg.textContent || aImg.innerText;

        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            liTeams[i].style.display = "";
        } else {
            liTeams[i].style.display = "none";
        }

        if (txtValueImg.toUpperCase().indexOf(filter) > -1) {
            divTeams[i].style.display = "";
        } else {
            divTeams[i].style.display = "none"
        }
    }

    //refresh all
    if(input.value === ""){
        d3.selectAll(".line").classed("active", false);
        d3.selectAll("circle").remove();
    }
}