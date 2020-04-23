$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "./csv/Riders.csv",
        dataType: "text",
        success: function(data) {processDataNames(data);}
     });

    var folder = "./imgs/";

    $.ajax({
    url : folder,
        success: function (data) {
            $(data).find("a").attr("href", function (i, val) {
                if( val.match(/\.(jpe?g|png|gif)$/) ) { 
                    // $("ul.myULImagesRiders").append( "<img src='"+ folder + val + " 'height=\'42\' width= \'42\'' >" );

                    var imageList = $("ul.myULImagesRiders");
                    var li = $('<li/>')
                        .addClass('myLiImages')
                        .appendTo(imageList);
                    var img = $('<img>')
                        .addClass('imgRider')
                        .attr("src", folder + val)
                        .appendTo(li);

                    var text = $('<div>')
                        .addClass('boxTextImg')
                        .text("potato")
                        .appendTo(li);
                } 
            });
        }
    });
});


function processDataNames(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(';');
    var riders = [];
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

            var name = tarr[1];
            names.push(name.Name);
        }
    }
    mainCode(riders, names)
}


function mainCode(riders, names){


    var cList = $('ul.myULNamesRiders')
    $.each(names, function(i)
    {
        var li = $('<li/>')
             .addClass('myLiNames')
             //.attr('role', 'menuitem')
            .appendTo(cList);
        var aaa = $('<a/>')
            .addClass('myANames')
            .text(names[i])
            .appendTo(li);
    });

}


function myFunction() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    ul = document.getElementById("myULNamesRiders_id");
    li = ul.getElementsByTagName("li");

    for (i = 0; i < li.length; i++) {

        a = li[i].getElementsByTagName("a")[0];
        txtValue = a.textContent || a.innerText;

        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

