var ridersInfo = [];
var teamsInfo = [];

var imatges;

var individual_mini = "Individual_mini.png";
var points_mini = "Points_mini.png";
var climber_mini = "Climber_mini.png";
var youth_mini = "Youth_mini.png";
var teams_mini = "Teams.png";

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

                            $(function () {
                                $.getScript('interaction.js');
                            });
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

            document.getElementById("riderShow_id").click();

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

