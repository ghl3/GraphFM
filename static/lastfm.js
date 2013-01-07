

// Last FM Simple api
function lastfm_api() {
    this.base_url = "http://ws.audioscrobbler.com/2.0/";
    this.api_key = "4ea86273090fac63525518c0a77465a4";
    this.format = "json";
}

lastfm_api.prototype.user_getneighbours = function(params) {
    var url = this.base_url + '?';
    url += "method=user.getneighbours";
    url += "&" + $.param(params);
    url += "&api_key=" + this.api_key;
    url += "&format=" + this.format;
    return url;
}

lastfm_api.prototype.user_getinfo = function(params) {
    var url = this.base_url + '?';
    url += "method=user.getinfo";
    url += "&" + $.param(params);
    url += "&api_key=" + this.api_key;
    url += "&format=" + this.format;
    return url;
}

// Global Variables
var lastfm = new lastfm_api();
var graph = null;

// Implement how clicks create new nodes and links
myGraph.prototype.on_click = function(node) {
    
    var self = this;

    console.log(node);

    var neigh_url = lastfm.user_getneighbours({"user" : node.name});
    d3.json(neigh_url, function(json) {
	console.log(json);

	// Pick a random neighbor to add
	var neighbours = json.neighbours;
	var len = neighbours.user.length;
	var idx = Math.floor(Math.random()*len);
	var neighbor = neighbours.user[idx];
	var link_length = Math.max(Math.ceil((neighbor.match-.99)*1000), 1.0);
	console.log("Match: " + neighbor.match);

	var neighbor_url = lastfm.user_getinfo({"user" : neighbor.name});
	d3.json(neighbor_url, function(error, json) {
	    var neighbour_user = json.user;
	    neighbour_user['group'] = node.group;
	    self.addNeighbor(node, neighbour_user, link_length);
	})
	
	//self.addNeighbor(node, neighbor, link_length);
	
    });
}

myGraph.prototype.on_mouseover = function(node) {
    $("#selected_user_name").text(node.name);
    $("#selected_real_name").text(node.realname);
    $("#selected_age").text(node.age);
    $("#selected_gender").text(node.gender);
}

myGraph.prototype.on_mouseout = function(node) {
    $("#selected_user_name").text('');
    $("#selected_real_name").text('');
    $("#selected_age").text('');
    $("#selected_gender").text('');
}


var reset = function() {
    console.log("reset");
    graph.reset();
}

var add_user_node = function() {
    var user_name = $("#user_name").val();
    var group = Math.floor(Math.random()*10);
    console.log("Creating new user node for user: " + user_name);

    var user_url = lastfm.user_getinfo({"user" : user_name});
    d3.json(user_url, function(error, json) {
	graph.addNode(json.user);
    })
}


$(document).ready(function() {

    var svg = d3.select("#graph").append("svg:svg")
	.attr("width", 960)
	.attr("height", 700);

    // Initialize the graph with the selected user
    var user_url = lastfm.user_getinfo({"user" : "rj"});
    d3.json(user_url, function(error, json) {
	var user = json.user;
	var group = Math.floor(Math.random()*10);
	user["group"] = group;
	console.log(user);
	graph = new myGraph(svg, new Array(user), new Array());
	console.log("Successfully made graph");
    })

});
