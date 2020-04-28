var ridersInfo = [];
var teamsInfo = [];
var riders = [];

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

                    processDataImages(data, folder);
                    interaction();

                    $.ajax({
                        type: "GET",
                        url: "./csv/Teams.csv",
                        dataType: "text",
                        success: function(data){
                            processDataTeams(data);
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

            for (var j=0; j<headers.length; j++) {
                
                var key = headers[j];
                var obj = {};
                obj[key] = data[j];
                tarr.push(obj);
            }
            teamsInfo.push(tarr);

        }
    }
    console.log(teamsInfo);
    // appendNames(teamsInfo)
    // document.getElementById('myInput').value = '';
}

function interaction(){

    $("div.myDivImages").click(function(){
        
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
}

function processDataImages(allImages, folder){
    $(allImages).find("a").attr("href", function (i, val) {
        if( val.match(/\.(jpe?g|png|gif)$/) && $.isNumeric(val.slice(0, 4))) { //si es imatge i es una de les imatges dels ciclistes

            //S'afegeixen les imatges dels ciclistes
            var imageList = $("ul.myULImagesRiders");
            var div = $('<div/>')
                .addClass('myDivImages')
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
                .text(rider[1].Name)
                .appendTo(boxtext);

            var textRiderNum = $('<a>')
                .addClass('aTextRiderNum')
                .text("RiderNum: " +rider[0].Rider_Num)
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

            for (var j=0; j<headers.length; j++) {
                
                var key = headers[j];
                var obj = {};
                obj[key] = data[j];
                tarr.push(obj);
            }
            ridersInfo.push(tarr);

        }
    }
    appendNames(ridersInfo)
    document.getElementById('myInput').value = '';
}

function getRiderbypng(riders, png_name){

    for(var i = 0; i < riders.length; i++){
        var rider = riders[i];
        if(rider[4].Photo === png_name){
            return rider;
        }
    }

}

function appendNames(riders){

    var cList = $('ul.myULNamesRiders')
    $.each(riders, function(i)
    {   
        var rider = riders[i];

        var li = $('<li/>')
            .addClass('myLiNames')
            .appendTo(cList);
        var a = $('<a/>')
            .addClass('myANames')
            .text(rider[1].Name)
            .appendTo(li);

    });

}


function searchRider() {

    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();

    var ul2, div;

    ul = document.getElementById("myULNamesRiders_id");
    li = ul.getElementsByTagName("li");

    ul2 = document.getElementById("myULImagesRiders_id");
    div = ul2.getElementsByTagName("div")


    for (i = 0; i < li.length; i++) {

        a = li[i].getElementsByTagName("a")[0];
        aImg = div[i].getElementsByTagName("a")[0];

        txtValue = a.textContent || a.innerText;

        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";

            div[i].style.display = "";

        } else {
            li[i].style.display = "none";

            div[i].style.display = "none"
        }
    }

    if(input.value === ""){
        d3.selectAll(".line").classed("active", false);
    }
}

function filterRider(elem){
    console.log(elem);
}
