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

var numChecked = 2;

d3.json("js/us-counties.json", function(json) {
  var getInfo = function(id, type) {
    var val = data[id][type];
    console.log(val);
    if (val == undefined || val == "") {
      val = "--";
    }
    return val;
  };

  counties.selectAll("path")
      .data(json.features)
    .enter().append("svg:path")
      .attr("class", data ? quantize : null) // color counties
      .attr("d", path)
      .on("mouseover", function(d){
        $('#county_state').html(data[d.id]["county"] + ", " + data[d.id]["state"]);
        $('#pop').html(data[d.id]["population"]);
        $('#info_name').html(data[d.id]["county"]);
        $('#info_state').html(data[d.id]["state"]);
        $('#info_population').html("<b>" + getInfo(d.id, "population") + "</b>");
        $('#info_female_headed').html("<b>" + getInfo(d.id, "female_headed") + "%</b>");
        $('#info_poverty_children').html("<b>" + getInfo(d.id, "poverty_children") + "%</b>");        
        $('#info_no_hs').html("<b>" + getInfo(d.id, "no_hs") + "%</b>");        
        d3.select(this).style("opacity", ".5");
        return tooltip.style("visibility", "visible");
      })
      .on("mousemove", function(d){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+15)+"px").text(data[d.id]["name"]);})
      .on("mouseout", function(){
        $('#county_state').html("&nbsp");
        $('#pop').html("&nbsp");
        $('#info_name').html("&nbsp");
        $('#info_state').html("&nbsp");
        $('#info_population').html("&nbsp");
        $('#info_female_headed').html("&nbsp");
        $('#info_poverty_children').html("&nbsp");  
        $('#info_no_hs').html("&nbsp");  
        $('#info_income').html("&nbsp");  
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
female_headed: {color:"Bluesq",set_min:0,min:20,max:45,set_max:45},
poverty_children: {color:"q",set_min:0,min:35,max:62,set_max:62},
//unemployment: {color:"Greensq",set_min:0,max:30,set_max:30},
no_hs: {color:"RdPuq",set_min:0,min:25,max:55,set_max:55},
income: {color:"Greensq",set_min:18800,min:18800,max:35000,set_max:120000}
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
    /*if ($('#poverty_checkbox').is(':checked')) {
      if (county_data["poverty"] >= params["poverty"]["min"] && county_data["poverty"] <= params["poverty"]["max"]) {
        stats.push("poverty");
      }
  }
  */
    if ($('#unemployment_checkbox').is(':checked')) {
      if (county_data["unemployment"] >= params["unemployment"]["min"] && county_data["unemployment"] <= params["unemployment"]["max"]) {
        stats.push("unemployment");
      }
  }
  if ($('#income_checkbox').is(':checked')) {
      if (county_data["income"] >= params["income"]["min"] && county_data["income"] <= params["income"]["max"]) {
        stats.push("income");
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
  console.log("special checkboxes");
  $("#female_headed_checkbox").button()
  $('#female_headed_slider_container .slider_checkbox_stats label').attr('id', 'female_headed_button');
  $("#poverty_children_checkbox").button()
  $('#poverty_children_slider_container .slider_checkbox_stats label').attr('id', 'poverty_children_button');
  $("#no_hs_checkbox").button();
  $('#no_hs_slider_container .slider_checkbox_stats label').attr('id', 'no_hs_button');
});

$(function() {
    $('#pop').html("&nbsp;");
    $(".checkbox_label").hide("fast");
    $("#sliders").hover(
        function() {
            $(".checkbox_label").show();
        },
        function() {
            $(".checkbox_label").hide("fast");
        }
    );
});

function redraw() {
  svg.attr("transform",
      "translate(" + d3.event.translate + ")" +
      "scale(" + d3.event.scale + ")");
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
    values: [20, 45],
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
    values: [35, 62],
    slide: function( event, ui ) {
      $( "#poverty_children_amount" ).html( ui.values[0] + "% - " + ui.values[1] + "%");
      adjust_range("poverty_children",ui.values[0], ui.values[1]);
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
    values: [25, 55],
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

// Create female_headed slider
$(function(){
  // Slider
  $('#income_slider').dragslider({
    animate: true,
    range: true,
    rangeDrag: true,
    min:18800,
    max:120000,
    values: [18800, 35000],
    slide: function( event, ui ) {
      $( "#income_amount" ).html( "$" + ui.values[0] + " - $" + ui.values[1] );
      adjust_range("income", ui.values[0], ui.values[1]);
        }
  });
    $('#income_label').fadeTo('slow', 0.5, null);
    $('#income_amount').fadeTo('slow', 0.5, null);
    $('#income_slider').fadeTo('slow', 0.5, null);
    $('#income_slider').dragslider("option", "disabled", true);

});



// Code for checkboxes
$(document).ready(function() {
        console.log(numChecked);

$('#poverty_children_checkbox').change(function() {
        console.log(numChecked);
  if (numChecked < 2 && $('#poverty_children_checkbox').is(':checked')) {
    numChecked++;
    $('#poverty_children_slider').dragslider("option", "disabled", false);
    $('#poverty_children_label').fadeTo('slow', 1, null);
    $('#poverty_children_amount').fadeTo('slow', 1, null);
    $('#poverty_children_slider').fadeTo('slow', 1, null);
    counties.selectAll("path")
      .attr("class", quantize); // recolor
  } else {
    numChecked--;
    $('#poverty_children_label').fadeTo('slow', 0.5, null);
    $('#poverty_children_amount').fadeTo('slow', 0.5, null);
    $('#poverty_children_slider').fadeTo('slow', 0.5, null);
    $('#poverty_children_slider').dragslider("option", "disabled", true);
    counties.selectAll("path")
      .attr("class", quantize); // recolor
      $('.checkbox').attr("disabled", false);
  }
});

$('#income_checkbox').change(function() {
        console.log(numChecked);
  if ( numChecked < 2 && $('#income_checkbox').is(':checked')) {
    numChecked++;
    $('#income_slider').dragslider("option", "disabled", false);
    $('#income_label').fadeTo('slow', 1, null);
    $('#income_amount').fadeTo('slow', 1, null);
    $('#income_slider').fadeTo('slow', 1, null);
    counties.selectAll("path")
      .attr("class", quantize); // recolor
  } else {
    numChecked--;
    $('#income_label').fadeTo('slow', 0.5, null);
    $('#income_amount').fadeTo('slow', 0.5, null);
    $('#income_slider').fadeTo('slow', 0.5, null);
    $('#income_slider').dragslider("option", "disabled", true);
    counties.selectAll("path")
      .attr("class", quantize); // recolor
      $('.checkbox').attr("disabled", false);
  }
});

$('#female_headed_checkbox').change(function() {
  if (numChecked < 2 && $('#female_headed_checkbox').is(':checked')) {
    numChecked++;
    $('#female_headed_slider').dragslider("option", "disabled", false);
    $('#female_headed_label').fadeTo('slow', 1, null);
    $('#female_headed_amount').fadeTo('slow', 1, null);
    $('#female_headed_slider').fadeTo('slow', 1, null);
    counties.selectAll("path")
      .attr("class", quantize); // recolor
  } else {
    numChecked--;
    $('#female_headed_label').fadeTo('slow', 0.5, null);
    $('#female_headed_amount').fadeTo('slow', 0.5, null);
    $('#female_headed_slider').fadeTo('slow', 0.5, null);
    $('#female_headed_slider').dragslider("option", "disabled", true);
    counties.selectAll("path")
      .attr("class", quantize); // recolor
      $('.checkbox').attr("disabled", false);
  }
});

$('#no_hs_checkbox').change(function() {
  if (numChecked<2 && $('#no_hs_checkbox').is(':checked')) {
    numChecked++;
    $('#no_hs_slider').dragslider("option", "disabled", false);
    $('#no_hs_label').fadeTo('slow', 1, null);
    $('#no_hs_amount').fadeTo('slow', 1, null);
    $('#no_hs_slider').fadeTo('slow', 1, null);
    counties.selectAll("path")
      .attr("class", quantize); // recolor
    $('#no_hs_checxbox').attr('disabled', true);
  } else if ($('#no_hs_slider').css('opacity') != 0.5) {
    numChecked--;
    $('#no_hs_label').fadeTo('slow', 0.5, null);
    $('#no_hs_amount').fadeTo('slow', 0.5, null);
    $('#no_hs_slider').fadeTo('slow', 0.5, null);
    $('#no_hs_slider').dragslider("option", "disabled", true);
    counties.selectAll("path")
      .attr("class", quantize); // recolor
      $('.checkbox').attr("disabled", false);
  }
});

});

