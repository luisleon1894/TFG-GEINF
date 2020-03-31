

SimpleGraph = function(elemid, options) {
  var self = this;
  this.chart = document.getElementById(elemid);
  this.cx = this.chart.clientWidth; //amplada en pixels de l'interior (amb padding inclos)
  this.cy = this.chart.clientHeight; //altura en pixels de l'interior (amb padding inclos)
  this.options = options || {};
  this.options.xmax = options.xmax || 30; //eix "x" max o 30
  this.options.xmin = options.xmin || 0;  //eix "x" min o 0
  this.options.ymax = options.ymax || 10; //eix "y" max o 10
  this.options.ymin = options.ymin || 0;  //eix "y" min o 0

  //paddings dels costats
  this.padding = {
     "top":    this.options.title  ? 40 : 20,
     "right":                 30, //padding de la dreta "groc"
     "bottom": this.options.xlabel ? 60 : 10,
     "left":   this.options.ylabel ? 70 : 45
  };

  //es la mida de amplada i altura de la gràfica (ampladaTotal - paddingEs - paddingDret)
  //el mateix per l'altura
  this.size = {
    "width":  this.cx - this.padding.left - this.padding.right,
    "height": this.cy - this.padding.top  - this.padding.bottom
  };

  //¡¡¡COMPTE AMB LA VERSIÓ DE LA LLIBRERIA D3, LA NUMENCLATURA DE "scale.linear(), pot canviar!!!"
  // x-scale
  //Typical uses are to transform data values into positions and lengths
  this.x = d3.scale.linear()
      .domain([this.options.xmin, this.options.xmax]) //dominio [0, 60]
      .range([0, this.size.width]);                   //range [mida amplada en pixels]

  // drag x-axis logic
  //this.downx = Math.NaN;

  // y-scale (inverted domain)
  //Typical uses are to transform data values into positions and lengths
  this.y = d3.scale.linear()
      .domain([this.options.ymax, this.options.ymin]) //dominio [0, 40]
      .nice() //.nice() on the scales in this section which will round the domain to ‘nice’ round values
      .range([0, this.size.height]) //range [mida altura en pixels]
      .nice(); //.nice() on the scales in this section which will round the domain to ‘nice’ round values

  // drag y-axis logic
  //this.downy = Math.NaN;

  //this.dragged = this.selected = null;

  //¡¡¡COMPTE AMB LA VERSIO DE LLIBRERIA PER d3.svg.line()!!!

//This Path Data Generator Function will take our data and generate the necessary SVG Path commands.
//In order to convert our data to the SVG Path Commands, we need to tell the line Path Data Generator how to access the x and y coordinates from our data.
//We do this by providing an accessor function to return the x,y coordinates from our data.
//For each x and y combination, we need to provide an accessor function to return the x,y coordinates from our data.
  this.line = d3.svg.line()
      .x(function(d, i) { return this.x(this.points[i].x); })
      .y(function(d, i) { return this.y(this.points[i].y); });


//Declara tots els punts de manera aleat oria
  var xrange =  (this.options.xmax - this.options.xmin),
      yrange2 = (this.options.ymax - this.options.ymin) / 2,
      yrange4 = yrange2 / 2,
      datacount = this.size.width/30;

//Declara tots els punts de manera aleatoria
  this.points = d3.range(datacount).map(function(i) { 
    return { x: i * xrange / datacount, y: this.options.ymin + yrange4 + Math.random() * yrange2 }; 
  }, self);


//en el selector "chart" afegeix "SVG", amb amplada i altura
  this.vis = d3.select(this.chart).append("svg")
      .attr("width",  this.cx)
      .attr("height", this.cy)
      .append("g") //afegeix tota la gràfica, amb els valors de "x" i "y" inclos
        .attr("transform", "translate(" + this.padding.left + "," + this.padding.top + ")");

//afegeix rectangle, amb la seva amplada i altura
  this.plot = this.vis.append("rect")
      .attr("width", this.size.width)
      .attr("height", this.size.height)
  
  //el "call" crida el mètode de dintre per els elements de la secció "plot"
  //beahavior = compartimientos
  //Behaviors encapsulate a complex set of low-level DOM interactions (i.e. user gestures that vary between input methods) into a higher-level set of custom events
  //behavior.zoom — emits zoom and pan events in response to common input idioms

  // # zoom.x([x]) # zoom.y([y]) 
  //Specifies an x-scale whose domain should be automatically adjusted when zooming.
  //If not specified, returns the current x-scale, which defaults to null. 
  //If the scale's domain or range is modified programmatically, this function should be called again. 
  //Setting the x-scale also resets the scale to 1 and the translate to [0, 0].

  //# zoom.on(type, listener)
  //Registers the specified listener to receive events of the specified type from the zoom behavior. The following types are supported:
  //zoomstart - at the start of a zoom gesture (e.g., touchstart).
  //zoom - when the view changes (e.g., touchmove).
  //zoomend - at the end of the current zoom gesture (e.g., touchend).
  this.plot.call(d3.behavior.zoom().x(this.x).y(this.y).on("zoom", this.redraw()));

  //afegeix la gràfica, amb els seus atributs

  //#The viewBox attribute defines the position and dimension, in user space, of an SVG viewport. 
  //The value of the viewBox attribute is a list of four numbers min-x, min-y, width and height, 
  //separated by whitespace and/or a comma, which specify a rectangle in user space which 
  //is mapped to the bounds of the viewport established for the associated SVG element 
  this.vis.append("svg")
      .attr("top", 0)
      .attr("left", 0)
      .attr("width", this.size.width)
      .attr("height", this.size.height)
      .attr("viewBox", "0 0 "+this.size.width+" "+this.size.height)
      .attr("class", "line") //???? The <line> element is an SVG basic shape used to create a line connecting two points.
      .append("path") ////The line SVG Path we draw
          .attr("class", "line")
          .attr("d", this.line(this.points));



  d3.select(this.chart)
      .on("mousemove.drag", self.mousemove())
      //.on("touchmove.drag", self.mousemove())  //touch screen
      .on("mouseup.drag",   self.mouseup())
      //.on("touchend.drag",  self.mouseup()); //touch screen

  this.redraw()();
};
  
//
// SimpleGraph methods
//



SimpleGraph.prototype.update = function() {
  var self = this;
  var lines = this.vis.select("path").attr("d", this.line(this.points));


  //if (d3.event && d3.event.keyCode) {
    //console.log("asdf");
    //d3.event.preventDefault();
    //d3.event.stopPropagation();
  //}
}


SimpleGraph.prototype.mousemove = function() {
  var self = this;
  return function() {
    // #d3.svg.mouse()
    //Returns the x and y coordinates of the current d3.event, 
    //relative to the specified container. 
    //The container may be an HTML or SVG container element

    //#d3.event.changedTouches ¡¡¡COMPTE AMB LA LLIBRERIA ESTA ES VIEEEJA!!!
    //Returns the x and y coordinates of each touch associated with the current d3.event,
    var p = d3.svg.mouse(self.vis[0][0]),
        t = d3.event.changedTouches;
    
    //if (self.dragged) {
      //self.dragged.y = self.y.invert(Math.max(0, Math.min(self.size.height, p[1])));
      //self.update();
    //};
    /*if (!isNaN(self.downx)) {
      d3.select('body').style("cursor", "ew-resize");
      var rupx = self.x.invert(p[0]),
          xaxis1 = self.x.domain()[0],
          xaxis2 = self.x.domain()[1],
          xextent = xaxis2 - xaxis1;
      if (rupx != 0) {
        var changex, new_domain;
        changex = self.downx / rupx;
        new_domain = [xaxis1, xaxis1 + (xextent * changex)];
        self.x.domain(new_domain);
        self.redraw()();
      }
      d3.event.preventDefault();
      d3.event.stopPropagation();
    };
    if (!isNaN(self.downy)) {
      d3.select('body').style("cursor", "ns-resize");
      var rupy = self.y.invert(p[1]),
          yaxis1 = self.y.domain()[1],
          yaxis2 = self.y.domain()[0],
          yextent = yaxis2 - yaxis1;
      if (rupy != 0) {
        var changey, new_domain;
        changey = self.downy / rupy;
        new_domain = [yaxis1 + (yextent * changey), yaxis1];
        self.y.domain(new_domain);
        self.redraw()();
      }
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }*/
  }
};

SimpleGraph.prototype.mouseup = function() {
  var self = this;
  return function() {
    document.onselectstart = function() { return true; };
    //d3.select('body').style("cursor", "auto");
    //d3.select('body').style("cursor", "auto");
    /*if (!isNaN(self.downx)) {
      self.redraw()();
      self.downx = Math.NaN;
      d3.event.preventDefault();
      d3.event.stopPropagation();
    };
    if (!isNaN(self.downy)) {
      self.redraw()();
      self.downy = Math.NaN;
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }*/
    //if (self.dragged) { 
      //self.dragged = null 
    //}
  }
}



SimpleGraph.prototype.redraw = function() {
  var self = this;
  return function() {
    var tx = function(d) { 
      return "translate(" + self.x(d) + ",0)"; //It takes two options, tx refers translation along the x-axis and ty refers to the translation along the y-axis. 
    },
    ty = function(d) { 
      return "translate(0," + self.y(d) + ")"; //It takes two options, tx refers translation along the x-axis and ty refers to the translation along the y-axis.
    },
    stroke = function(d) { 
      return d ? "#ccc" : "#666"; //#ccc = color gris, altrament #666 = color gris
    },
    fx = self.x.tickFormat(10), //especifica el format decimal màxim
    fy = self.y.tickFormat(10); //especifica el format decimal màxim

    // Regenerate x-ticks… //actualitzar els valors de l'eix de les "x"
    var gx = self.vis.selectAll("g.x")
        .data(self.x.ticks(10), String)
        .attr("transform", tx);

    gx.select("text")
        .text(fx);

    //enter() In the Data joins section we show how to join an array of data to a D3 selection.
    // es possible que "data" sigui mes gran o mes petit que el DOM elements, enter() fa la magia

    //El elemento g es un contenedor usado para agrupar objetos.
    //Las transformaciones aplicadas al elemento g son realizadas sobre todos los elementos hijos del mismo
    var gxe = gx.enter().insert("g", "a")
        .attr("class", "x")
        .attr("transform", tx);

    gxe.append("line")
        .attr("stroke", stroke)
        .attr("y1", 0) //The y1 attribute defines the start of the line on the y-axis
        .attr("y2", self.size.height); //The y2 attribute defines the end of the line on the y-axis

    gxe.append("text")
        .attr("class", "axis")
        .attr("y", self.size.height)
        .attr("dy", "1em") //The dy attribute indicates a shift along the y-axis on the position of an element or its content.
        .attr("text-anchor", "middle") //The text-anchor attribute is used to align (start-, middle- or end-alignment)
        .text(fx)
        //.style("cursor", "ew-resize") //resize l'eix de las x
        //.on("mouseover", function(d) { d3.select(this).style("font-weight", "bold");})
        //.on("mouseout",  function(d) { d3.select(this).style("font-weight", "normal");})
        //.on("mousedown.drag",  self.xaxis_drag())
        //.on("touchstart.drag", self.xaxis_drag());

    //.exit returns an exit selection which consists of the elements that need to be removed from the DOM.
    //It’s usually followed by .remove:
    gx.exit().remove();

    // Regenerate y-ticks… //actualitzar els valors de l'eix de les "y"
    var gy = self.vis.selectAll("g.y")
        .data(self.y.ticks(10), String)
        .attr("transform", ty);

    gy.select("text")
        .text(fy);

    var gye = gy.enter().insert("g", "a")
        .attr("class", "y")
        .attr("transform", ty)
        .attr("background-fill", "#FFEEB6");

    gye.append("line")
        .attr("stroke", stroke)
        .attr("x1", 0)
        .attr("x2", self.size.width);

    gye.append("text")
        .attr("class", "axis")
        .attr("x", -3)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(fy)
        //.style("cursor", "ns-resize")
        //.on("mouseover", function(d) { d3.select(this).style("font-weight", "bold");})
        //.on("mouseout",  function(d) { d3.select(this).style("font-weight", "normal");})
        //.on("mousedown.drag",  self.yaxis_drag())
        //.on("touchstart.drag", self.yaxis_drag());

    gy.exit().remove();
    self.plot.call(d3.behavior.zoom().x(self.x).y(self.y).on("zoom", self.redraw()));
    self.update();    
  }  
}
/*
SimpleGraph.prototype.xaxis_drag = function() {
  var self = this;
  return function(d) {
    document.onselectstart = function() { return false; };
    var p = d3.svg.mouse(self.vis[0][0]);
    self.downx = self.x.invert(p[0]);
  }
};

SimpleGraph.prototype.yaxis_drag = function(d) {
  var self = this;
  return function(d) {
    document.onselectstart = function() { return false; };
    var p = d3.svg.mouse(self.vis[0][0]);
    self.downy = self.y.invert(p[1]);
  }
};*/