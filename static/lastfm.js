

// Last FM Simple api
function lastfm_api() {
    this.base_url = "http://ws.audioscrobbler.com/2.0/";
    this.api_key = "4ea86273090fac63525518c0a77465a4";
    this.format = "json";
}

lastfm_api.prototype.compose_url = function(url_target, params) {
    // Get a url for a given lastfm api target
    var url = this.base_url + '?';
    url += "method=" + url_target;
    url += "&" + $.param(params);
    url += "&api_key=" + this.api_key;
    url += "&format=" + this.format;
    return url;
}

lastfm_api.prototype.user_getneighbours = function(params) {
    return this.compose_url("user.getneighbours", params);
}

lastfm_api.prototype.user_gettopartists = function(params) {
    return this.compose_url("user.gettopartists", params);
}

lastfm_api.prototype.user_getinfo = function(params) {
    return this.compose_url("user.getinfo", params);
}


// Global Variables
var lastfm = new lastfm_api();
var graph = null;
var user_cache = new Array(); // name : info
var top_tracks_cache = new Array(); // name : tracks

// Implement how clicks create new nodes and links
myGraph.prototype.on_click = function(node) {
    
    var click_action = $('input[name=click_action]:checked').val();

    if(click_action==null) return;
    else if( click_action == "neighbor" ) {
	this.add_lastfm_neighbor(node);
    }
    else if( click_action == "select_node" ) {
	select_node(node);
    }
    else {
	console.log("Error: Unexpected click action: " + click_action);
	return;
    }

}

myGraph.prototype.add_lastfm_neighbor = function(node) {

    var self = this;

    var neigh_url = lastfm.user_getneighbours({"user" : node.name});
    $.getJSON(neigh_url, function(json) {

	// Add the nearest neighbor that hasn't
	// already been added
	var neighbour = null;
	var neighbours = json.neighbours.user;
	if( ! $.isArray(neighbours) || neighbours.length == 0 ) {
	    console.log("No new neighbours found");
	    return;
	}
	console.log("neighbours:");
	console.log(neighbours);
	neighbours.sort(function(a,b) { return a.match - b.match;}); //neighbor
	for(var idx=0; idx < neighbours.length; ++idx) {
	    if(self.findNode(neighbours[idx].name) == null){
		neighbour = neighbours[idx];
	    }
	}
	if( neighbour == null ) {
	    console.log("No new neighbours found");
	    return;
	}
	console.log("Adding Neighbor: ");
	console.log(neighbour);

	// Now that we have the neighbor to add,
	// determine the link length and get
	// more info about that neighbor
	var link_length = Math.max(Math.ceil((neighbour.match-.99)*1000), 1.0);
	var neighbour_url = lastfm.user_getinfo({"user" : neighbour.name});
	$.getJSON(neighbour_url, function(json) {
	    if( json.error != null ) {
		console.log("No User Found with name: " + neighbour.name);
		return;
	    }
	    var neighbour_user = json.user;
	    neighbour_user['group'] = node.group;
	    self.addNeighbor(node, neighbour_user, link_length);
	    select_node(neighbour_user);
	}).error(function() { console.log("Failed to get: " + neighbour_url); })
    }).error(function() { console.log("Failed to get: " + neigh_url); })
}

myGraph.prototype.on_mouseover = function(node) {
}

myGraph.prototype.on_mouseout = function(node) {
}


var reset = function() {
    graph.reset();
    deselect_node();
}

var add_user_node = function() {
    var user_name = $("#user_name").val();
    var group = Math.floor(Math.random()*10);
    console.log("Creating new user node for user: " + user_name);

    var user_url = lastfm.user_getinfo({"user" : user_name});
    $.getJSON(user_url, function(json) {
	if( json.error != null ) {
	    console.log("No User Found with name: " + user_name);
	    return;
	}
	console.log(json);
	var neighbour_user = json.user;
	neighbour_user["group"] = group;
	graph.addNode(json.user);
	select_node(json.user);
    }).error(function() { console.log("Failed to get: " + user_url); })
}

var select_node = function(node) {

    // Display the user's info
    $("#selected_user_name").text(node.name);
    $("#selected_real_name").text(node.realname);
    $("#selected_age").text(node.age);
    $("#selected_gender").text(node.gender);

    // Display the top artists of the
    // user associated with the given node
    var top_url = lastfm.user_gettopartists({"user" : node.name, "limit" : 5});
    $.getJSON(top_url, function(json) {
	var artist_array = json.topartists.artist;
	if( artist_array.length != 0 ) {
	    $('#top_artists').empty();
	    var table = $('<table style="text-align: center;"></table>').addClass('control_panel');
	    table.append('<tr><td class="label" style="text-align: center;">Top Artists</td></tr>');
	    for(var i=0; i<artist_array.length; i++){
		var row = $('<tr></tr>').addClass('bar').text(artist_array[i].name);
		table.append(row);
	    }
	    $('#top_artists').append(table);
	}
    }).error(function() { console.log("Failed to get: " + top_url); })
} 

var deselect_node = function() {
    $("#selected_user_name").text('');
    $("#selected_real_name").text('');
    $("#selected_age").text('');
    $("#selected_gender").text('');
    $('#top_artists').empty();
}

$(document).ready(function() {

    var svg = d3.select("#graph").append("svg:svg")
	.attr("width", 960)
	.attr("height", 700);

    graph = new myGraph(svg, new Array(), new Array());

});
