var colors = ["#e41a1c", "#377eb8", "#4daf4a", "#7570b3"]
var indexColor = 0;

var ridersSelect = [];
var corredorsMAX = 2;

$(document).on('click', 'path.line', function(event, i){

    var id = parseInt((this.id).slice(1, (this.id).length));

    if (event.altKey && indexColor < corredorsMAX) {
       $( ".card" ).remove();  

       var e = $.Event("keyup");
       $("#myInput").val("").trigger(e);

       mostrarRiderLinea(id, riders, this);
       indexColor++;
    }
    else if(event.altKey && indexColor == corredorsMAX){
        indexColor = 0;
        refresh();
        $('#myULImagesRiders_id .ui-selected').removeClass('ui-selected')
        mostrarRiderLinea(id, riders, this);
        indexColor++;
    }
    else{
        indexColor = 0;
        refresh();
        $('#myULImagesRiders_id .ui-selected').removeClass('ui-selected')
        mostrarRider(id, riders, this);
        indexColor++;
    }

});

$(document).on('click', "#containerAll_id" , function(event, i){
    
    if(event.target.id === ""){
        refresh();
        indexColor = 0;
        var e = $.Event("keyup");
        $("#myInput").val("").trigger(e);
        $('#myULImagesRiders_id .ui-selected').removeClass('ui-selected')
    }
});


$( "#myULImagesRiders_id" ).selectable({
       selected: function(e) {

            if((e.metaKey || e.ctrlKey) && indexColor < corredorsMAX){
                indexColor = 0;
                $( ".ui-selected", this ).each(function(index, divelement) {

                     ridersSelect[index] = divelement;

                     var indexDivBox = $( "#myULImagesRiders_id div.myDivImagesRiders" ).index( this );
                     var riderSelect = $( "#myULImagesRiders_id div.myDivImagesRiders" )[indexDivBox];

                     var name = riderSelect.getElementsByClassName("aTextName")[0].innerText
                     var ridernumStr = riderSelect.getElementsByClassName("aTextRiderNum")[0].innerText
                     var ridernum = ridernumStr.slice(ridernumStr.indexOf(":") + 2, ridernumStr.length)

                     var riderStage = riders.filter(r => r.ridernum === ridernum);
                    if(riderStage.length > 0){

                        var clicked = d3.select("#r"+riderStage[0].id);
                        clicked.style("stroke", colors[index])
                               .style("stroke-width", "2.5px");
                        
                        riderSelect.style.background = colors[index]
                        indexColor++;
                        showLabelInformation(riderStage);
                    }
                    else{
                        alert(name + " is not at this stage, sorry");
                    }

                });
            } 
            else if((e.metaKey || e.ctrlKey) && indexColor == corredorsMAX){   

                indexColor = 0; 
                refresh();

                 ridersSelect[0].classList.remove('ui-selected');
                 ridersSelect[1].classList.remove('ui-selected');


                var index;
                $( ".ui-selected", this ).each(function() {

                     index = $( "#myULImagesRiders_id div.myDivImagesRiders" ).index( this );
                });
                var riderSelect = $( "#myULImagesRiders_id div.myDivImagesRiders" )[index]

                ridersSelect[0] = riderSelect;

                var name = riderSelect.getElementsByClassName("aTextName")[0].innerText
                var ridernumStr = riderSelect.getElementsByClassName("aTextRiderNum")[0].innerText
                var ridernum = ridernumStr.slice(ridernumStr.indexOf(":") + 2, ridernumStr.length)
                
                var riderStage = riders.filter(r => r.ridernum === ridernum);
                if(riderStage.length > 0){

                    var clicked = d3.select("#r"+riderStage[0].id);
                    clicked.style("stroke", colors[indexColor])
                           .style("stroke-width", "2.5px");
                    
                    riderSelect.style.background = colors[indexColor]
                    indexColor++;
                    showLabelInformation(riderStage);
                }
                else{
                    alert(name + " is not at this stage, sorry");
                }
            }
            else if (!e.metaKey || !e.ctrlKey){

                indexColor = 0; 
                refresh();                  
                var index;
                $( ".ui-selected", this ).each(function() {

                     index = $( "#myULImagesRiders_id div.myDivImagesRiders" ).index( this );
                });
                var riderSelect = $( "#myULImagesRiders_id div.myDivImagesRiders" )[index]

                var name = riderSelect.getElementsByClassName("aTextName")[0].innerText
                var ridernumStr = riderSelect.getElementsByClassName("aTextRiderNum")[0].innerText
                var ridernum = ridernumStr.slice(ridernumStr.indexOf(":") + 2, ridernumStr.length)
                
                var riderStage = riders.filter(r => r.ridernum === ridernum);
                if(riderStage.length > 0){

                    var e = $.Event("keyup");
                    $("#myInput").val(name).trigger(e);

                    var clicked = d3.select("#r"+riderStage[0].id);
                    clicked.style("stroke", colors[indexColor])
                               .style("stroke-width", "2.5px");
                    
                    riderSelect.style.background = colors[indexColor]
                    indexColor++;
                    showLabelInformation(riderStage);

                    var rider = ridersInfo.find(r => r.Rider_Num === riderStage[0].ridernum);
                    var team = teamsInfo.find(team => team.Team_Num === rider.Team_Num) 
                    mostrarRiderInfo(riderStage, riderSelect, team)
                }
                else{
                    alert(name + " is not at this stage, sorry");
                }
                
            }
        },
        unselected: function(event, riderUnselected){

            var element = riderUnselected.unselected;
            element.style.background = ""

            var name = element.getElementsByClassName("aTextName")[0].innerText
            var ridernumStr = element.getElementsByClassName("aTextRiderNum")[0].innerText
            var ridernum = ridernumStr.slice(ridernumStr.indexOf(":") + 2, ridernumStr.length)

            var riderStage = riders.filter(r => r.ridernum === ridernum);
            if(riderStage.length > 0){

                var clicked = d3.select("#r"+riderStage[0].id);
                clicked.style("stroke", "")
                clicked.style("stroke-width", "1px");

                var rider = ridersInfo.find(r => r.Rider_Num === riderStage[0].ridernum);
                hideLabelInformation(riderStage);
            }
        }
});


$("li.myLiNamesRider").click(function(){
    refresh(); 
    var name = this.innerText + " ";  //s'afegeix un espai perque en el fitxer hi ha un espai despres del nom del ciclista
    var rider = ridersInfo.find(r => r.Name === name);
    var ridernum = rider.Rider_Num

    var e = $.Event("keyup");
    $("#myInput").val(name).trigger(e);

    d3.selectAll(".line").classed("active", false);//selectAll instead of select
    
    var riderStage = riders.filter(r => r.ridernum === ridernum);

    if(riderStage.length > 0){

        var clicked = d3.select("#r"+riderStage[0].id);
        clicked.style("stroke", colors[indexColor])
           .style("stroke-width", "2.5px");                    

        var rider = ridersInfo.find(r => r.Rider_Num === riderStage[0].ridernum);
        var team = teamsInfo.find(team => team.Team_Num === rider.Team_Num)
        mostrarRiderInfo(riderStage, rider.Photo, team)
        showLabelInformation(riderStage);

        colorBackgroundImg(riderStage[0].id, riders);
    }
    else{
        alert(name + " is not at this stage, sorry");
    }
})

$("div.myDivImagesTeams").click(function(){
    refresh();
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

    mostrarTeamInfo(teamSeleccionat, teamStage);
    showLabelInformation(teamStage);
})

$("li.myLiNamesTeam").click(function(){
    refresh();
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

    mostrarTeamInfo(teamSeleccionat, teamStage);
    showLabelInformation(teamStage);
})


var $btns = $('.btn').click(function() {

  $('#myULImagesRiders_id .ui-selected').removeClass('ui-selected')

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
    let labelRidersSelect = [];

    riders.map((rider) => {
        labelRidersSelect = labelRidersSelect.concat(labelsDataRider.filter(label => label.id === rider.id));
    });

    var div = d3.select("body").append("div") 
        .attr("class", "tooltip")       
        .style("opacity", 0);

    var divRider = d3.select("body").append("div") 
        .attr("class", "tooltipRider")       
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

            if(riders.length > 1){ //es vol mostrar un equip

                divRider.transition()    
                    .duration(200)    
                    .style("opacity", .9);    

                var rider = riders.find(r => r.id === d.id)
                divRider.html(rider.nom + "<br/>" + "n. " + rider.ridernum + "<br/>" + rider.team)
                   .style("left", (d3.event.pageX - 195) + "px")   
                   .style("top", (d3.event.pageY - 30) + "px"); 
            }
            
            div.transition()    
               .duration(200)    
               .style("opacity", .9);    

            div.html("Elapsed time: " + d.elapsedTime + "<br/>"  + "GC Provisional Delay: " + d.provDelay + "<br/>"  + "GC Provisional Position: " + d.provPos)  
               .style("left", (d3.event.pageX + 5) + "px")   
               .style("top", (d3.event.pageY - 30) + "px"); 
            
        })          
        .on("mouseout", function(d) {   
            div.transition()    
               .duration(500)    
               .style("opacity", 0); 

            divRider.transition()    
               .duration(500)    
               .style("opacity", 0);
        });
}

function hideLabelInformation(riders){
    var labelRidersUnselect = [];
    riders.map((rider) => {
        labelRidersUnselect = labelRidersUnselect.concat(labelsDataRider.filter(label => label.id === rider.id));
    });

    svg.selectAll('circle').each(function(d,i) { 

        if(d.id === labelRidersUnselect[0].id)
        this.remove();
    });
}

function colorBackgroundImg(id_rider, riders){
    var riderStage = riders.filter(r => r.id === id_rider);

    var rider = ridersInfo.find(r => r.Rider_Num === riderStage[0].ridernum);

    //search per riders
    var ulRidersImg, divRiders;

    ulRidersImg = document.getElementById("myULImagesRiders_id");
    divRiders = ulRidersImg.getElementsByTagName("div")

    var divSelect; 

    for (var i = 0; i < divRiders.length; i++) {

        var riderInnerText= divRiders[i].getElementsByTagName("section")[0].innerText;
        var ridernumber = riderInnerText.slice(riderInnerText.indexOf(": ") + 2, riderInnerText.length)

        if(ridernumber === rider.Rider_Num) {
            divSelect = divRiders[i];
            break;
        }
    }

    $(divSelect).addClass("ui-selected")

    divSelect.style.background = colors[indexColor]
}

function mostrarRider(id_rider, riders, elem){

  colorBackgroundImg(id_rider, riders);

  document.getElementById("riderShow_id").click();

  var riderStage = riders.filter(r => r.id === id_rider);

  var rider = ridersInfo.find(r => r.Rider_Num === riderStage[0].ridernum);

  var e = $.Event("keyup");
  $("#myInput").val(rider.Name).trigger(e);
  
  var clicked = d3.select(elem);

  clicked.style("stroke", colors[indexColor])
    .style("stroke-width", "2.5px");

  showLabelInformation(riderStage);

  var team = teamsInfo.find(team => team.Team_Num === rider.Team_Num) 

  mostrarRiderInfo(riderStage, rider.Photo, team);
}

function mostrarRiderLinea(id_rider, riders, elem){
    
    var riderStage = riders.filter(r => r.id === id_rider);
    colorBackgroundImg(id_rider, riders);
    var clicked = d3.select(elem);

    clicked.style("stroke", colors[indexColor])
       .style("stroke-width", "2.5px");

    showLabelInformation(riderStage);

}

//image === DOMelement or path img
function mostrarRiderInfo(rider, image, teamObject){

    var imgsrc;
    if(image.tagName === "DIV"){
        var myimg = image.getElementsByTagName('img')[0];
        var pathsrc = myimg.src;
        imgsrc = pathsrc.slice(-7);
    }
    else imgsrc = image;

    var shortName = rider[0].nom;
    var riderNum = rider[0].ridernum;
    var team = rider[0].team;
    var lider = rider[0].lider; //no, Youth, Teams, Climbs, Points

    var miniMaillot = getMaillot(rider[0], teamObject.Icon_Shirt)

    var imageList = $("ul.myULImagesRiders");
    var div = $('<div/>')
                .addClass('card')
                .appendTo(imageList)

    var img = $('<img>')
        .attr("src", folder + imgsrc)
        .attr("width", "100%")
        .appendTo(div);

    var nameText = $('<p>')
        .addClass("pTextProfile")
        .text(shortName).appendTo(div);

    var numText = $('<p>')
        .addClass("pTextProfile")
        .text("RIDER NUM: " + riderNum).appendTo(div);

    var teamText = $('<p>')
        .addClass("pTextProfile")
        .text("TEAM: " + team).appendTo(div);

    var img = $('<img>')
        .attr("src", folder + miniMaillot)
        .attr("width", "20%")
        .appendTo(div);


    //hide other images riders
    var ulRidersImg = document.getElementById("myULImagesRiders_id");
    var divRiders = ulRidersImg.getElementsByClassName("myDivImagesRiders")

    var ulRidersName = document.getElementById("myULNamesRiders_id");
    var liRiders = ulRidersName.getElementsByClassName("myLiNamesRider")

    for(var i = 0; i < divRiders.length; i++){
        divRiders[i].style.display = "none"
    }
    for(var i = 0; i < liRiders.length; i++){
        liRiders[i].style.display = "none"
    }

}

//image === DOMelement or path img
function mostrarTeamInfo(team, riders){

    var teamText = team.Team_Name;

    var imageList = $("ul.myULImagesTeams");

    var div = $('<div/>')
                .addClass('card')
                .appendTo(imageList)

    var img = $('<img>')
        .attr("src", folder + team.Logo)
        .attr("width", "100%")
        .appendTo(div);

    var nameText = $('<h3>')
        .addClass("pTextProfileTeam")
        .text(teamText).appendTo(div);

    riders.map((rider) => {
        var riderText = $('<p>')
            .addClass("pTextProfile")
            .text((rider.nom).slice(2,rider.nom.length) + " (" + rider.ridernum + ")").appendTo(div);
    })

    //hide other images riders
    var ulTeamsImg = document.getElementById("myULImagesTeams_id");
    var divTeams = ulTeamsImg.getElementsByClassName("myDivImagesTeams")

    var ulTeamName = document.getElementById("myULNamesTeams_id");
    var liTeams = ulTeamName.getElementsByClassName("myLiNamesTeam")

    for(var i = 0; i < divTeams.length; i++){
        divTeams[i].style.display = "none"
    }
    for(var i = 0; i < liTeams.length; i++){
        liTeams[i].style.display = "none"
    }

}

function getMaillot(rider, miniMaillot){

    if(rider.lider === "Youth"){
        return youth_mini;
    }
    else if(rider.lider === "Teams"){
        return teams_mini;
    }
    else if(rider.lider === "Climbs"){
        return climber_mini;
    }
    else if(rider.lider === "Points"){
        return points_mini;
    }
    else{ //is no
        return miniMaillot;
    }
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
}
 
$("div.myDivImagesStages").click(function(){

    var thisStage = this;
    var myimg = thisStage.getElementsByTagName('img')[0];
    var idStage = myimg.id;
    id = idStage.slice(1, idStage.length);

    $.ajax({
        url:"./csv/Stage" + (parseInt(id) + 1).toString() + "-data-full-csv.csv",
        type:'HEAD',
        error: function()
        {
            alert("There are no data from this stage")
        },
        success: function()
        {
            $("div.myDivImagesStages").css("background", "transparent")
            $(thisStage).css("background", "#DEA78D");



            d3.select("svg").remove();
            $("div.svg-container").remove()

            $("div.myDivImageProfile").remove()
            $("#stageProfile").append("<img src='./imgs/profiles_stages/tour-de-france-2018-stage-"+ id +" />")
            $("div.imgStart").children().remove()
            document.getElementsByClassName('origenalignleft')[0].innerHTML = "";
            document.getElementsByClassName('destialignright')[0].innerHTML = "";
            document.getElementsByClassName('pstageData')[0].innerHTML = "";
            $("div.imgFinal").children().remove()

            $("pWinner").remove()

            currentStage = parseInt(id) + 1;

            elapsedDataRider = [];
            labelsDataRider = []; //informacio de les etiquetes
            arrKmMostrar = [];
            labelRidersSelect = [];

            $.getScript('riders-graph.js');
        }
    });
})


//refresh all on delete keyboard event
function refresh(){

    $( "#myULImagesRiders_id div.myDivImagesRiders" ).each(function(){
        this.style.background = ""
    })

    d3.selectAll(".line").classed("active", false)
                         .style("stroke", "")
                         .style("stroke-width", "1px");

    d3.selectAll("circle").remove();
    $( ".card" ).remove();     
}

$(document).keydown(function(e) {
    if(e.key === "Backspace"){    
        $( ".card" ).remove();  
    }
});  


document.getElementById("riderShow_id").click();
