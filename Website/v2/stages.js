var folder = "./imgs/"; //es necessita la variable per busca les imatges en metodes posteriors
var folderStages = "profiles_stages/"

var currentStage = 13;

var stages = [{ numStage: 1, origen: "Noirmoutier-en-l'Île", desti: "Fontenay-le-Comte", km: "201k" }, { numStage: 2, origen: " Mouilleron-Saint-Germain", desti: "La Roche-sur-Yon", km: "182.5k" }, { numStage: 3, origen: "Cholet", desti: "Cholet", km: "35.5k" },
              { numStage: 4, origen: "La Baule", desti: "Sarzeau", km: "195k" }, { numStage: 5, origen: "Lorient" , desti: "Quimper", km: "204.k" }, { numStage: 6, origen: "Brest" , desti: "Mûr de Bretagne Guerlédan", km: "181k"  },
              { numStage: 7, origen: "Fougères", desti: "Chartres", km: "231k"  }, { numStage: 8, origen: "Dreux", desti: "Amiens Métropole", km: "181k"  }, { numStage: 9, origen: "Arras Citadelle", desti: "Roubaix" , km: "156.5k"  }, 
              { numStage: 10, origen: "Annecy" , desti: "Le Grand-Bornand", km: "158.5k" }, { numStage: 11, origen: "Albertville" , desti: "La Rosière Espace San Bernardo" , km: "108.5k"  }, { numStage: 12, origen: "Bourg-Saint-Maurice Les Arcs", desti: "Alpe d'Huez", km: "175.5k" }, 
              { numStage: 13, origen: "Bourg d'Oisans" , desti: "Valence", km: "169.5k" }, { numStage: 14, origen: "Saint-Paul-Trois-Châteaux", desti: "Mende" , km: "188k" }, { numStage: 15, origen: "Millau", desti: "Carcassonne", km: "181k" },
              { numStage: 16, origen: "Carcassonne", desti: "Bagnères-de-Luchon" , km: "218k"  }, { numStage: 17, origen: "Bagnères-de-Luchon" , desti: "Saint-Lary-Soulan" , km: "65k" }, { numStage: 18, origen: "Trie-sur-Baïse", desti: "Pau", km: "171k" }, 
              { numStage: 19, origen: "Lourdes", desti: "Laruns", km: "200.5k" }, { numStage: 20, origen: "Saint-Pée-sur-Nivelle", desti: "Espelette", km: "31k" }, { numStage: 21, origen: "Houilles" , desti: "Paris Champs-Élysées", km: "116k" }]

$(document).ready(function() {
    for(var i = 0; i < 21; i++){

    var imageList = $("ul.myULImagesStages");

    var div = $('<div/>')
        .addClass('myDivImagesStages')
        .css("background", function(){
            if(i === 13 - 1) return "#DEA78D"
            else return "transparent" 
        })
        .appendTo(imageList)

    var boxtext = $('<section>')
                .addClass('boxTextStage')
                .appendTo(div);

    var textName = $('<a>')
        .addClass('aTextName')
        .text("Stage " + stages[i].numStage)
        .appendTo(boxtext);

    var textName = $('<a>')
        .addClass('aTextName')
        .text(stages[i].origen + " > " + stages[i].desti)
        .appendTo(boxtext).before("<br />");

    var textName = $('<a>')
        .addClass('aTextName')
        .text(stages[i].km)
        .appendTo(boxtext).before("<br />");

    var img = $('<img>')
        .addClass('imgStage')
        .attr("src", folder + folderStages + "tour-de-france-2018-stage-"+ stages[i].numStage +"-profile.png")
        .attr("id", "s"+i)
        .appendTo(div);
    }
});