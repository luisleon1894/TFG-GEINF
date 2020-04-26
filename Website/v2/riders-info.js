var riders = [];

$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "./csv/Riders.csv",
        dataType: "text",
        success: function(data) {
            processDataNames(data);

                var folder = "./imgs/";
                $.ajax({
                url : folder,
                    success: function (data) {

                        processDataImages(data, folder);
                        // $(data).find("a").attr("href", function (i, val) {
                        //     if( val.match(/\.(jpe?g|png|gif)$/) && $.isNumeric(val.slice(0, 4))) { //si es imatge i es una de les imatges dels ciclistes

                        //         //S'afegeixen les imatges dels ciclistes
                        //         var imageList = $("ul.myULImagesRiders");
                        //         var div = $('<div/>')
                        //             .addClass('myDivImages')
                        //             .appendTo(imageList);
                        //         var img = $('<img>')
                        //             .addClass('imgRider')
                        //             .attr("src", folder + val)
                        //             .appendTo(div);

                        //         var rider = getRiderbypng(riders, val);
                        //         var boxtext = $('<section>')
                        //             .addClass('boxTextImg')
                        //             .appendTo(div);

                        //         var textName = $('<a>')
                        //             .addClass('aTextImg')
                        //             .text(rider[1].Name)
                        //             .appendTo(boxtext);
                        //     } 
                        // });

                    }
                });
        }
     });

});


// $(document).ready(function() {

//     var folder = "./imgs/";

//     $.ajax({
//     url : folder,
//         success: function (data) {
//             $(data).find("a").attr("href", function (i, val) {
//                 if( val.match(/\.(jpe?g|png|gif)$/) && $.isNumeric(val.slice(0, 4))) { //si es imatge i es una de les imatges dels ciclistes

//                     //S'afegeixen les imatges dels ciclistes
//                     var imageList = $("ul.myULImagesRiders");
//                     var div = $('<div/>')
//                         .addClass('myDivImages')
//                         .appendTo(imageList);
//                     var img = $('<img>')
//                         .addClass('imgRider')
//                         .attr("src", folder + val)
//                         .appendTo(div);

//                     var rider = getRiderbypng(riders, val);
//                     var boxtext = $('<section>')
//                         .addClass('boxTextImg')
//                         .appendTo(div);

//                     var textName = $('<a>')
//                         .addClass('aTextImg')
//                         .text(rider[1].Name)
//                         .appendTo(boxtext);
//                 } 
//             });

//         }
//     });
// });


function processDataImages(allImages, folder){
    $(allImages).find("a").attr("href", function (i, val) {
        if( val.match(/\.(jpe?g|png|gif)$/) && $.isNumeric(val.slice(0, 4))) { //si es imatge i es una de les imatges dels ciclistes

            //S'afegeixen les imatges dels ciclistes
            var imageList = $("ul.myULImagesRiders");
            var div = $('<div/>')
                .addClass('myDivImages')
                .appendTo(imageList);
            var img = $('<img>')
                .addClass('imgRider')
                .attr("src", folder + val)
                .appendTo(div);

            var rider = getRiderbypng(riders, val);
            var boxtext = $('<section>')
                .addClass('boxTextImg')
                .appendTo(div);

            var textName = $('<a>')
                .addClass('aTextImg')
                .text(rider[1].Name)
                .appendTo(boxtext);
        } 
    });
}

function processDataNames(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(';');
    var names = [];

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
            riders.push(tarr);

        }
    }
    appendNames(riders)
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

}
var svg = $("#stage_id")
console.log(svg);
  svg.selectAll('.line')
    .on('click', function(d) {
      mostrarRider2(d[0].id, riders);
      // transition the clicked element
      // to have a radius of 20

    });

function mostrarRider2(id_rider, riders){

  var rider = riders.find(r => r.id === id_rider);
  console.log("id:um");
}