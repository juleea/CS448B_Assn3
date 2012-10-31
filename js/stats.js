// TOOLTIP
var tooltip = d3.select("body")
  .append("div")
  .attr("id", "tooltip")
  .text("a simple tooltip");

var data; // loaded asynchronously

var path = d3.geo.path();

var svg = d3.select("#chart")
    .append("svg:svg")    .call(d3.behavior.zoom().on("zoom", redraw))
    .append("svg:g")
    .append("svg:g")
    .attr("transform", "translate(0,0)")
    .attr("id", "map");
;

var counties = svg.append("svg:g")
    .attr("id", "counties");

var states = svg.append("svg:g")
    .attr("id", "states");

d3.json("js/us-counties.json", function(json) {
  counties.selectAll("path")
      .data(json.features)
    .enter().append("svg:path")
      .attr("class", data ? quantize : null) // color counties
      .attr("d", path)
      .on("mouseover", function(d){
        $('#county_state').html(data[d.id]["county"] + " County, " + data[d.id]["state"]);
        $('#pop').html("Population: " + data[d.id]["population"]);
        $('#info_name').html(data[d.id]["county"]);
        $('#info_state').html(data[d.id]["state"]);
        $('#info_population').html("<b>" + data[d.id]["population"] + "</b>");
        $('#info_female_headed').html("<b>" + data[d.id]["female_headed"] + "%</b>");
        $('#info_poverty_children').html("<b>" + data[d.id]["poverty_children"] + "%</b>");        
        $('#info_no_hs').html("<b>" + data[d.id]["no_hs"] + "%</b>");        
        d3.select(this).style("opacity", ".5");
        return tooltip.style("visibility", "visible");
      })
      .on("mousemove", function(d){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+15)+"px").text(data[d.id]["name"]);})
      .on("mouseout", function(){

        $('#county_state').html("Hover over county for more info");
        $('#pop').html("&nbsp");
        $('#info_name').html("&nbsp");
        $('#info_state').html("&nbsp");
        $('#info_population').html("&nbsp");
        $('#info_female_headed').html("&nbsp");
        $('#info_poverty_children').html("&nbsp");  
        $('#info_no_hs').html("&nbsp");  
        d3.select(this).style("opacity", "1");
        return tooltip.style("visibility", "hidden");
      });
});

d3.json("js/us-states.json", function(json) {
  states.selectAll("path")
      .data(json.features)
      .enter().append("svg:path")
      .attr("d", path);
});

d3.json("js/data.json", function(json) {
  data = json;
  counties.selectAll("path").attr("class", quantize);
})

params = {
female_headed: {color:"Bluesq",min:0,max:45,set_max:45},
poverty_children: {color:"q",min:0,max:62,set_max:62},
poverty: {color:"Redsq",min:0,max:51,set_max:51},
unemployment: {color:"Greensq",min:0,max:30,set_max:30},
no_hs: {color:"RdPuq",min:0,max:55,set_max:55}
};


function quantize(d) {
  county_data = data[d.id]
  var stats = [];

  if (typeof county_data === "undefined") return "ignore"
    if ($('#female_headed_checkbox').is(':checked')) {
      if (county_data["female_headed"] >= params["female_headed"]["min"] && county_data["female_headed"] <= params["female_headed"]["max"]) {
        stats.push("female_headed");
      }
  }
  if ($('#poverty_children_checkbox').is(':checked')) {
      if (county_data["poverty_children"] >= params["poverty_children"]["min"] && county_data["poverty_children"] <= params["poverty_children"]["max"]) {
        stats.push("poverty_children");
      }
  }
    if ($('#no_hs_checkbox').is(':checked')) {
      if (county_data["no_hs"] >= params["no_hs"]["min"] && county_data["no_hs"] <= params["no_hs"]["max"]) {
        stats.push("no_hs");
      }
  }
    if ($('#poverty_checkbox').is(':checked')) {
      if (county_data["poverty"] >= params["poverty"]["min"] && county_data["poverty"] <= params["poverty"]["max"]) {
        stats.push("poverty");
      }
  }
    if ($('#unemployment_checkbox').is(':checked')) {
      if (county_data["unemployment"] >= params["unemployment"]["min"] && county_data["unemployment"] <= params["unemployment"]["max"]) {
        stats.push("unemployment");
      }
  }

  if (stats.length == 0) {
      return "ignore";
  } else if (stats.length == 2) {
      return "overlap";
  } else {
      var stat = stats[0];
      return params[stat]["color"] + Math.min(8, ~~(county_data[stat] * 9 / params[stat]["set_max"])) + "-9";
      //return params[stat]["color"] + Math.min(8, ~~(county_data[stat] * 9 / params[stat]["max"]- params[stat]["min"]*9/params[stat]["max"])) + "-9";
  }
}

$(function() {
    $('#county_state').html("Hover over county for more info");
    $('#pop').html("&nbsp;");
    $(".checkbox").hide("fast");
    $("#sliders").hover(
        function() {
            $(".checkbox").fadeIn();
        },
        function() {
            $(".checkbox").hide();
        }
    );
});

/**
$(function() {
    $("#chart").hover(
      function() {
          $('#info_female_headed').html("<b>--</b>");
          $('#info_poverty_children').html("<b>--</b>");        
          $('#info_poverty').html("<b>" + data[d.id]["poverty"] + "%</b>");        
          $('#info_unemployment').html("<b>--</b>");        
          $('#info_no_hs').html("<b>--</b>");        
    })
  });
*/

function redraw() {
  svg.attr("transform",
      "translate(" + d3.event.translate + ")"
      + "scale(" + d3.event.scale + ")");
}

function adjust_range(stat, min, max) {
    params[stat]["min"]= min;
    params[stat]["max"] = max;
    counties.selectAll("path")
      .attr("class", quantize); // recolor
}

// Create female_headed slider
$(function(){
  // Slider
  $('#female_headed_slider').dragslider({
    animate: true,
    range: true,
    rangeDrag: true,
    min:0,
    max:45,
    values: [30, 45],
    slide: function( event, ui ) {
      $( "#female_headed_amount" ).html( ui.values[0] + "% - " + ui.values[1] + "%" );
      adjust_range("female_headed",ui.values[0], ui.values[1]);
        }
  });
});

// Create poverty_children slider
$(function(){
  // Slider
  $('#poverty_children_slider').dragslider({
    animate: true,
    range: true,
    rangeDrag: true,
    min:0,
    max:62,
    values: [45, 62],
    slide: function( event, ui ) {
      $( "#poverty_children_amount" ).html( ui.values[0] + "% - " + ui.values[1] + "%");
      adjust_range("poverty_children",ui.values[0], ui.values[1]);
        }
  });
$('#poverty_children_label').fadeTo('slow', 0.5, null);
    $('#poverty_children_amount').fadeTo('slow', 0.5, null);
    $('#poverty_children_slider').fadeTo('slow', 0.5, null);
    $('#poverty_children_slider').dragslider("option", "disabled", true);
});

// Create female_headed slider
$(function(){
  // Slider
  $('#poverty_slider').dragslider({
    animate: true,
    range: true,
    rangeDrag: true,
    min:0,
    max:51,
    values: [40, 51],
    slide: function( event, ui ) {
        console.log(ui.values[0]);
      $( "#poverty_amount" ).html( ui.values[0] + "% - " + ui.values[1] + "%" );
      adjust_range("poverty", ui.values[0], ui.values[1]);
        }
  });
});


// Create female_headed slider
$(function(){
  // Slider
  $('#unemployment_slider').dragslider({
    animate: true,
    range: true,
    rangeDrag: true,
    min:0,
    max:30,
    values: [25, 35],
    slide: function( event, ui ) {
        console.log(ui.values[0]);
      $( "#unemployment_amount" ).html( ui.values[0] + "% - " + ui.values[1] + "%" );
      adjust_range("unemployment", ui.values[0], ui.values[1]);
        }
  });
});


// Create female_headed slider
$(function(){
  // Slider
  $('#no_hs_slider').dragslider({
    animate: true,
    range: true,
    rangeDrag: true,
    min:0,
    max:55,
    values: [40, 55],
    slide: function( event, ui ) {
        console.log(ui.values[0]);
      $( "#no_hs_amount" ).html( ui.values[0] + "% - " + ui.values[1] + "%" );
      adjust_range("no_hs", ui.values[0], ui.values[1]);
        }
  });
    $('#no_hs_label').fadeTo('slow', 0.5, null);
    $('#no_hs_amount').fadeTo('slow', 0.5, null);
    $('#no_hs_slider').fadeTo('slow', 0.5, null);
    $('#no_hs_slider').dragslider("option", "disabled", true);
});


// Code for checkboxes
$(document).ready(function() {

$('#poverty_children_checkbox').change(function() {
  if ($('#poverty_children_checkbox').is(':checked')) {
    $('#poverty_children_slider').dragslider("option", "disabled", false);
    $('#poverty_children_label').fadeTo('slow', 1, null);
    $('#poverty_children_amount').fadeTo('slow', 1, null);
    $('#poverty_children_slider').fadeTo('slow', 1, null);
    counties.selectAll("path")
      .attr("class", quantize); // recolor
  } else {
    $('#poverty_children_label').fadeTo('slow', 0.5, null);
    $('#poverty_children_amount').fadeTo('slow', 0.5, null);
    $('#poverty_children_slider').fadeTo('slow', 0.5, null);
    $('#poverty_children_slider').dragslider("option", "disabled", true);
    counties.selectAll("path")
      .attr("class", quantize); // recolor
  }
});

$('#female_headed_checkbox').change(function() {
  if ($('#female_headed_checkbox').is(':checked')) {
    $('#female_headed_slider').dragslider("option", "disabled", false);
    $('#female_headed_label').fadeTo('slow', 1, null);
    $('#female_headed_amount').fadeTo('slow', 1, null);
    $('#female_headed_slider').fadeTo('slow', 1, null);
    counties.selectAll("path")
      .attr("class", quantize); // recolor
  } else {
    $('#female_headed_label').fadeTo('slow', 0.5, null);
    $('#female_headed_amount').fadeTo('slow', 0.5, null);
    $('#female_headed_slider').fadeTo('slow', 0.5, null);
    $('#female_headed_slider').dragslider("option", "disabled", true);
    counties.selectAll("path")
      .attr("class", quantize); // recolor
  }
});


$('#poverty_checkbox').change(function() {
  if ($('#poverty_checkbox').is(':checked')) {
    $('#poverty_slider').dragslider("option", "disabled", false);
    $('#poverty_label').fadeTo('slow', 1, null);
    $('#poverty_amount').fadeTo('slow', 1, null);
    $('#poverty_slider').fadeTo('slow', 1, null);
    counties.selectAll("path")
      .attr("class", quantize); // recolor
  } else {
    $('#poverty_label').fadeTo('slow', 0.5, null);
    $('#poverty_amount').fadeTo('slow', 0.5, null);
    $('#poverty_slider').fadeTo('slow', 0.5, null);
    $('#poverty_slider').dragslider("option", "disabled", true);
    counties.selectAll("path")
      .attr("class", quantize); // recolor
  }
});


$('#unemployment_checkbox').change(function() {
  if ($('#unemployment_checkbox').is(':checked')) {
    $('#unemployment_slider').dragslider("option", "disabled", false);
    $('#unemployment_label').fadeTo('slow', 1, null);
    $('#unemployment_amount').fadeTo('slow', 1, null);
    $('#unemployment_slider').fadeTo('slow', 1, null);
    counties.selectAll("path")
      .attr("class", quantize); // recolor
  } else {
    $('#unemployment_label').fadeTo('slow', 0.5, null);
    $('#unemployment_amount').fadeTo('slow', 0.5, null);
    $('#unemployment_slider').fadeTo('slow', 0.5, null);
    $('#unemployment_slider').dragslider("option", "disabled", true);
    counties.selectAll("path")
      .attr("class", quantize); // recolor
  }
});



$('#no_hs_checkbox').change(function() {
  if ($('#no_hs_checkbox').is(':checked')) {
    $('#no_hs_slider').dragslider("option", "disabled", false);
    $('#no_hs_label').fadeTo('slow', 1, null);
    $('#no_hs_amount').fadeTo('slow', 1, null);
    $('#no_hs_slider').fadeTo('slow', 1, null);
    counties.selectAll("path")
      .attr("class", quantize); // recolor
  } else {
    $('#no_hs_label').fadeTo('slow', 0.5, null);
    $('#no_hs_amount').fadeTo('slow', 0.5, null);
    $('#no_hs_slider').fadeTo('slow', 0.5, null);
    $('#no_hs_slider').dragslider("option", "disabled", true);
    counties.selectAll("path")
      .attr("class", quantize); // recolor
  }
});

});

