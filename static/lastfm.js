

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

    // var neigh_url = "http://ws.audioscrobbler.com/2.0/?method=user.getneighbours&user=rj&api_key=4ea86273090fac63525518c0a77465a4&format=json";

    var user_url = "http://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=rj&api_key=4ea86273090fac63525518c0a77465a4&format=json";

    var svg = d3.select("#graph").append("svg:svg")
	.attr("width", 960)
	.attr("height", 700);

    // Implement myGraph

    // Get the length of lastfm links
    var link_length = function(match) {
	return Math.max(Math.ceil((match-.99)*1000), 1.0);
    }

    myGraph.prototype.on_click = function(node) {
	
	self = this;

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
	    console.log("Match: " + neighbor.match);
	    self.addNeighbor(node, neighbor, link_length(neighbor.match));
	    
	});
    }


    var graph = null;
    d3.json(user_url, function(error, json) {
	console.log(json);
	graph = new myGraph(svg, new Array(json.user), new Array());
	console.log("Successfully made graph");
    })

    
});
