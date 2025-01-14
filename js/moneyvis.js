/*
  MONEYVIS.js

 	Hi! This make$ a $tyli$h dollar bill$ bar chart for income bracket $election
*/

MoneyVis = function(_parentElement, _data, _metaData, _metaData2, _eventHandler){

  // LIKE TOTALVIS, THIS ONLY USES THE METADATA

    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.metaData2 = _metaData2;
    this.eventHandler = _eventHandler;
    this.displayData = [];
    // global variable to store original data, to build bar chart of total
    this.origData = [];

    // TODO: define all constants here

    this.margin = {top: 20, right: 120, bottom: 250, left: 62},
    this.width = getInnerWidth(this.parentElement) - this.margin.left - this.margin.right,
    this.height = 500 - this.margin.top - this.margin.bottom;

    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
MoneyVis.prototype.initVis = function(){

    var that = this; // read about the this

     // constructs SVG layout
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom - 100)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // creates axis and scales
    this.y = d3.scale.linear()
      .range([this.height - 10, 0]);

    // yScale for total data
    this.origY = d3.scale.linear()
      .range([this.height -10, 0]);  

    this.x = d3.scale.ordinal()
      .rangeRoundBands([0, this.width], .1);

    this.color = d3.scale.category20();

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom");

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left");

  this.svg.append("g")
      .attr("class", "y axis")
       .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");


    // set origData to be the display data of the total dataset
    this.origData = this.displayData;

    // call the update method
    this.updateVis();
}


// /**
//  * Method to wrangle the data. In this case it takes an options object
//  * @param _filterFunction - a function that filters data or "null" if none
//  */

// NOTE: at the moment, this is not being called at all!
MoneyVis.prototype.wrangleData= function(_filterFunction){

    // displayData should hold the data which is visualized
    this.displayData = this.filterAndAggregate(_filterFunction);
}


// /**
//  * the drawing function - should use the D3 selection, enter, exit
//  */
MoneyVis.prototype.updateVis = function() {

  var that = this;

  if(this.metaData.length == 4)
    var xlabels = moneycats;
  else
    var xlabels = moneycats2;

    // updates scales
    this.y.domain(d3.extent(this.metaData, function(d) { return d; }));
    this.x.domain(this.metaData.map(function(d, i) { return i }));

    this.svg.select(".x.axis")
    	.call(this.xAxis)

    // updates graph

    // Data join
    var bar2 = this.svg.selectAll(".bar2")
      .data(this.metaData, function(d) { return d; });

    // Append new bar groups, if required
    var bar_enter = bar2.enter().append("g");

    // Append a rect and a text only for the Enter set (new g)
    bar_enter.append("rect");

    bar_enter.append("image")
      .attr("xlink:href", "http://cliparts.co/cliparts/6ir/ooq/6irooq65T.jpg")
      .attr("x", 0)
      .attr("y", 0)
      .attr("preserveAspectRatio", "none")

    //bar_enter.append("image");
    bar_enter.append("text");

    // Add attributes (position) to all bars
    bar2
      //.attr("class", "bar")
      .attr("class", "bar2")
      .attr("transform", function(d, i) {return "translate(" + that.x(i) + ", 0)"; })
      .attr("id", function(d,i) { return "moneybars" + i})
      .attr("opacity", 0.5)
       .on("click", function(d, i){
        d3.selectAll(".bar2").style("opacity", 0.5);
        d3.select("#moneybars"+i).style("opacity", 1);

      })



    // Remove the extra bars
    bar2.exit()
      .remove();


    // Update all inner rects and texts (both update and enter sets)

    bar2.select("rect")
      .attr("x", 0)
      .attr("y", function (d) { 
           	return that.y(d)
      })
      .attr("height", function (d) {
      	return that.height - that.y(d)})
      .transition()
      .attr("width", function(d, i) { 
          return that.x.rangeBand(i);})
      .attr("fill", "url(#image)");
      ;
    

    bar2.select("image")
      .attr("y", function(d){
        return that.y(d)
      })
      .attr("width", function(d, i){
        return that.x.rangeBand(i);})
      .attr("height", function(d){
        return that.height - that.y(d)})
      ; 

    bar2.select("image")
      .on("click", function(d, i){
        that.barclicked(i + 1);
      });

    bar2.select("text")
      .attr("y", 0)
      .attr("x", 0)
      .attr("text-anchor", "middle")
      .attr("transform", function(d,i) {return "translate (" + that.x.rangeBand(i)/2 + "," + (that.height + 10) + ")"; })
      .text(function(d, i) {return xlabels[i]; })
      .attr("class", "type-label")
      .attr("dy", ".35em")

          // Remove the extra bars
    bar2.exit()
      .remove();
}

// /**
//  * Gets called by event handler and should create new aggregated data
//  * aggregation is done by the function "aggregate(filter)". Filter has to
//  * be defined here.
//  * @param selection
//  */
MoneyVis.prototype.onSelectionChange= function (filteredData){

    // set data to be the filtered data
    this.data = filteredData;

    this.metaData = filteredData;

    //if(bracket_sys == 2)
      //this.metaData = this.metaData2;

    // update the bar chart
    this.updateVis();
}

MoneyVis.prototype.barclicked = function(i){
  $(this.eventHandler).trigger("barClicked", i);
}


// NOTE: at the moment, this is not being called at all!
MoneyVis.prototype.filterAndAggregate = function(_filter){


    // Set filter to a function that accepts all items
    // ONLY if the parameter _filter is NOT null use this parameter
    var filter = function(){return true;}
    if (_filter != null){
        filter = _filter;
    }

    var that = this;

    // create an array of values for priorities 1-16
    var res = d3.range(16).map(function () {
         return 0;
    });

    // accumulate all values that fulfill the filter criterion

    // TODO: implement the function that filters the data and sums the values
    this.data
        .filter(filter)
        .forEach(function (d) {
            d3.range(16).forEach(function (e){
               res[e] += d.prios[e]; 
            })
        })

    return res;
}


