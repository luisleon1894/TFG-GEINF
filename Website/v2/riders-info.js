var ridersInfo = [];
var teamsInfo = [];
var riders = [];

var imatges;

$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "./csv/Riders.csv",
        dataType: "text",
        success: function(data) {
            processDataNames(data);

            var folder = "./imgs/"; //es necessita la variable per busca les imatges en metodes posteriors
            $.ajax({
                type: "GET",
                url : "./imgs/",
                dataType: "text",
                success: function (data) {

                    imatges = data;
                    processDataImages(data, folder);
                    

                    $.ajax({
                        type: "GET",
                        url: "./csv/Teams.csv",
                        dataType: "text",
                        success: function(data){
                            processDataTeams(data);

                            processDataImagesTeams(imatges, folder);

                            interaction();
                        }
                    });
                }
            });
        }
    });
});


function processDataTeams(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(';');


    for (var i=1; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(';');
        if (data.length == headers.length) {

            var tarr = [];
            var obj = {};

            for (var j=0; j<headers.length; j++) {
                
                var key = headers[j];
                obj[key] = data[j];
            }
            teamsInfo.push(obj);

        }
    }
    teamsInfo.sort(function (a,b){
        if(a.Team_Name < b.Team_Name) {return -1; }
        if(a.Team_Name > b.Team_Name) {return 1; }
        return 0;
    })
    appendNamesTeams(teamsInfo)
    document.getElementById('myInput').value = '';
}

function interaction(){

    $("div.myDivImagesRiders").click(function(){
        
        var name = this.getElementsByClassName("aTextName")[0].innerText
        var ridernumStr = this.getElementsByClassName("aTextRiderNum")[0].innerText
        var ridernum = ridernumStr.slice(ridernumStr.indexOf(":") + 2, ridernumStr.length)

        var e = $.Event("keyup");
        $("#myInput").val(name).trigger(e);

        d3.selectAll(".line").classed("active", false);//selectAll instead of select
        
        var riderStage = riders.find(r => r.ridernum === ridernum);
        var clicked = d3.select("#r"+riderStage.id);
        clicked.classed("active", true);//set class of clicked link
    })

    $("li.myLiNamesRider").click(function(){
        var name = this.innerText + " ";  //s'afegeix un espai perque en el fitxer hi ha un espai despres del nom del ciclista
        var rider = ridersInfo.find(r => r.Name === name);
        var ridernum = rider.Rider_Num

        var e = $.Event("keyup");
        $("#myInput").val(name).trigger(e);

        d3.selectAll(".line").classed("active", false);//selectAll instead of select
        
        var riderStage = riders.find(r => r.ridernum === ridernum);
        var clicked = d3.select("#r"+riderStage.id);
        clicked.classed("active", true);//set class of clicked link
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

    document.getElementById("riderShow_id").click();
}

function processDataImagesTeams(allImages, folder){
    $(allImages).find("a").attr("href", function (i, val) {
        if( val.match(/\.(jpe?g|png|gif)$/) && (val.slice(-9) === "shirt.png")) { //si es imatge i es una de les imatges dels equips


            //S'afegeixen les imatges dels ciclistes
            var imageList = $("ul.myULImagesTeams");
            var div = $('<div/>')
                .addClass('myDivImagesTeams')
                .appendTo(imageList)

            var img = $('<img>')
                .addClass('imgTeam')
                .attr("src", folder + val)
                .appendTo(div);

            var team = getTeambypng(teamsInfo, val);
            var boxtext = $('<section>')
                .addClass('boxTextImg')
                .appendTo(div);

            var textName = $('<a>')
                .addClass('aTextName')
                .text(team.Team_Name)
                .appendTo(boxtext);

            var textTeamNum = $('<a>')
                .addClass('aTextTeamNum')
                .text("TeamNum: " + team.Team_Num)
                .appendTo(boxtext).before("<br />");
        } 
    });
}

function processDataImages(allImages, folder){
    $(allImages).find("a").attr("href", function (i, val) {
        if( val.match(/\.(jpe?g|png|gif)$/) && $.isNumeric(val.slice(0, 4))) { //si es imatge i es una de les imatges dels ciclistes

            //S'afegeixen les imatges dels ciclistes
            var imageList = $("ul.myULImagesRiders");
            var div = $('<div/>')
                .addClass('myDivImagesRiders')
                .appendTo(imageList)

            var img = $('<img>')
                .addClass('imgRider')
                .attr("src", folder + val)
                .appendTo(div);

            var rider = getRiderbypng(ridersInfo, val);
            var boxtext = $('<section>')
                .addClass('boxTextImg')
                .appendTo(div);

            var textName = $('<a>')
                .addClass('aTextName')
                .text(rider.Name)
                .appendTo(boxtext);

            var textRiderNum = $('<a>')
                .addClass('aTextRiderNum')
                .text("RiderNum: " +rider.Rider_Num)
                .appendTo(boxtext).before("<br />");
        } 
    });
}



function processDataNames(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(';');

    for (var i=1; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(';');
        if (data.length == headers.length) {

            var tarr = [];
            var obj = {};

            for (var j=0; j<headers.length; j++) {
                
                var key = headers[j];
                obj[key] = data[j];
            }
            ridersInfo.push(obj)

        }
    }
    appendNames(ridersInfo)
    document.getElementById('myInput').value = '';
}

function getTeambypng(teams, png_name){

    for(var i = 0; i < teams.length; i++){
        var team = teams[i];
        if(team.Shirt === png_name){
            return team;
        }
    }

}


function getRiderbypng(riders, png_name){

    for(var i = 0; i < riders.length; i++){
        var rider = riders[i];
        if(rider.Photo === png_name){
            return rider;
        }
    }

}

function appendNamesTeams(teams){

    var cList = $('ul.myULNamesTeams')
    $.each(teams, function(i)
    {   
        var team = teams[i];

        var li = $('<li/>')
            .addClass('myLiNamesTeam')
            .appendTo(cList);
        var a = $('<a/>')
            .addClass('myANames')
            .text(team.Team_Name)
            .appendTo(li);

    });
}

function appendNames(riders){

    var cList = $('ul.myULNamesRiders')
    $.each(riders, function(i)
    {   
        var rider = riders[i];

        var li = $('<li/>')
            .addClass('myLiNamesRider')
            .appendTo(cList);
        var a = $('<a/>')
            .addClass('myANames')
            .text(rider.Name)
            .appendTo(li);

    });
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
    }
}

function filterRider(elem){
    console.log(elem);
}
