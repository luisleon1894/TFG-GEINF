if(rang_visio>10*showNAxisChar){ //he tret un +1.. si no funciona bé torna-hi a posar el +1..
//el codi que ja tens amb el 10 com a variable
}
else{ // miro quants km hi ha guardats que estan en aquest rang
var inici;
for(var i=0; i<columnsKm.length; i++){ //busquem el primer km vist(ho tens)
if(km_maxim_vist >= parseFloat(columnsKm[i])){ inici = i; break;}
}

var final=columnsKm.length-1;
for(var i=inici+1; i<columnsKm.length; i++){ //busquem el darrer km vist
if(km_minim_vist <= parseFloat(columnsKm[i])){ final = i; break; }
}
if(final-inici<=showNAxisChar){ //si no n'hi ha masses, els guardo tots
//el for que tens acabant a <=final -> carregues tots els km que hi ha per mostrar-los
}
else{ //n'hi ha masses, miro quins hauria de mostrar i els busco
var kms =[];
for(var i=0;i<=showNAxisChar;i++){
kms.push_back(km_min+i*inc_amplicat);
}
var j=0;
for(var i=inici;i<final-1 and j<showNAxisChar;i++){
if(columnsKm[i]>=kms[j] and columnsKm[i+1]<kms[j]){
// si el j que volem mostrar està entre l'[i] i l'[i+1] que existeixen mostrem l'[i]. Per anar bé suposo que alguna vegada hauria caldria moatrar l'[i+1]. Potser caldria mostrar el més proper a kms[j], no ho sé... Si fos així hauria de ser if(columsKm[i]-kms[j]<=columsKm[i+1]-kms[j]) -> mostrar [i] else [i+1] arrKmMostrar.push(columnsKm[i]); j++;
}
}
}
}