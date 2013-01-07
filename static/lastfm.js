

// Global Variables
var graph = null;

// Implement how clicks create new nodes and links
myGraph.prototype.on_click = function(node) {
    
    var self = this;

    console.log(node);
    
    var neigh_url = "http://ws.audioscrobbler.com/2.0/?method=user.getneighbours";
    neigh_url += "&user=" + node.name;
    neigh_url += "&api_key=4ea86273090fac63525518c0a77465a4&format=json";
    
    d3.json(neigh_url, function(json) {
	console.log(json);

	// Pick a random neighbor to add
	var neighbours = json.neighbours;
	var len = neighbours.user.length;
	var idx = Math.floor(Math.random()*len);
	var neighbor = neighbours.user[idx];
	var link_length = Math.max(Math.ceil((neighbor.match-.99)*1000), 1.0);
	console.log("Match: " + neighbor.match);
	self.addNeighbor(node, neighbor, link_length);
	
    });
}

myGraph.prototype.on_mouseover = function(node) {
    $("#selected_user_name").text(node.name);
}

myGraph.prototype.on_mouseout = function(node) {
    $("#selected_user_name").text('');
}


var reset = function() {
    console.log("reset");
    graph.reset();
}


$(document).ready(function() {

    var neighbours=null;
    var neigh_url = "http://ws.audioscrobbler.com/2.0/?method=user.getneighbours&user=rj&api_key=4ea86273090fac63525518c0a77465a4&format=json";

    d3.json(neigh_url, function(json) {
	console.log(json);
	neighbours=json.neighbours;
	
	len = neighbours.user.length;
	var idx = Math.floor(Math.random()*len);
	console.log( neighbours.user[idx]);

    });

    var user_url = "http://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=rj&api_key=4ea86273090fac63525518c0a77465a4&format=json";

    var svg = d3.select("#graph").append("svg:svg")
	.attr("width", 960)
	.attr("height", 700);


    //var graph = null;
    d3.json(user_url, function(error, json) {
	console.log(json);
	graph = new myGraph(svg, new Array(json.user), new Array());
	console.log("Successfully made graph");
    })

});
