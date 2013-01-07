

$(document).ready(function() {
    
    var svg = d3.select("#graph").append("svg:svg")
	.attr("width", 960)
	.attr("height", 700);
    
    d3.json('/static/miserables.json', function(error, json) {
	
	graph = new myGraph(svg, json.nodes, json.links);
    })
}

