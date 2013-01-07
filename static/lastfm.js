

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
    else if( click_action == "top_artists" ) {
	show_top_artists(node);
    }
    else {
	console.log("Error: Unexpected click action: " + click_action);
	return;
    }

}

myGraph.prototype.add_lastfm_neighbor = function(node) {

    var self = this;

    var neigh_url = lastfm.user_getneighbours({"user" : node.name});
    d3.json(neigh_url, function(json) {

	// Pick a random neighbor to add
	// To ADD: If user already exists,
	// pick again
	var neighbours = json.neighbours.user;
	neighbours.sort(function(a,b) { return a.match - b.match;}); //neighbor

	var neighbour = null;
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

	//var len = neighbours.user.length;
	//var idx = Math.floor(Math.random()*len);
	//var neighbour = neighbours[idx];

	var link_length = Math.max(Math.ceil((neighbour.match-.99)*1000), 1.0);
	var neighbour_url = lastfm.user_getinfo({"user" : neighbour.name});
	
	d3.json(neighbour_url, function(error, json) {
	    if( json.error != null ) {
		console.log("No User Found with name: " + neighbour.name);
		return;
	    }
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
    graph.reset();
}

var add_user_node = function() {
    var user_name = $("#user_name").val();
    var group = Math.floor(Math.random()*10);
    console.log("Creating new user node for user: " + user_name);

    var user_url = lastfm.user_getinfo({"user" : user_name});
    d3.json(user_url, function(error, json) {
	if( json.error != null ) {
	    console.log("No User Found with name: " + user_name);
	    return;
	}
	var neighbour_user = json.user;
	graph.addNode(json.user);
    })
}


var show_top_artists = function(node) {
    // Display the top artists of the
    // user associated with the given node
    
    var top_url = lastfm.user_gettopartists({"user" : node.name, "limit" : 5});
    d3.json(top_url, function(json) {
	console.log(json);
	var artist_array = json.topartists.artist;
	console.log(artist_array);

	// Create a table in the dom, 
	// add the artist list,
	// and then show the table
	$('#top_artists').empty();
	var table = $('<table style="text-align: center;"></table>').addClass('control_panel');
	table.append("<tr><td class='label'>Top Artists</td></tr>");
	for(var i=0; i<5; i++){
	    var row = $('<tr></tr>').addClass('bar').text(artist_array[i].name);
	    table.append(row);
	}
	$('#top_artists').append(table);

	//for(var idx=0; idx < artist_array.length; ++idx) {
	//    console.log(artist_array[idx].name);
	//}
	
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
	graph = new myGraph(svg, new Array(user), new Array());
	console.log("Successfully made graph");
    })

});
