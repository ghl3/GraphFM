
// Based on:
// http://bl.ocks.org/4062045
// and 
// http://stackoverflow.com/questions/9539294/adding-new-nodes-to-force-directed-layout

function myGraph(svg, initial_nodes, initial_links) {

    // 
    // Private Implementation
    //

    var w = 960; //svg[0][0].getAttribute("width");
    var h = 700; //svg[0][0].getAttribute("height");

    var self = this;

    var color = d3.scale.category20();

    var findNode = function(name) {
	for (var i in nodes) {if (nodes[i]["name"] === name) return nodes[i]};
    }
    
    var findNodeIndex = function(name) {
        for (var i in nodes) {if (nodes[i]["name"] === name) return i};
    }

    var force = d3.layout.force()
        .gravity(.05)
        .distance(100)
        .charge(-100)
        .size([w, h]);

    var nodes = force.nodes(),
    links = force.links();

    var makename = function() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	
	for( var i=0; i < 5; i++ )
	    text += possible.charAt(Math.floor(Math.random() * possible.length));
	
	return text;
    }

    var link_length = function(match) {
	// Convert between lastfm match
	// length and link length
	return Math.max(Math.ceil((match-.99)*1000), 1.0);
    }

    var add_lastfm_neighbor = function(node) {

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

    var begin = function() {
	
	for(var i=0; i < initial_nodes.length; ++i) {
	    nodes.push(initial_nodes[i]);
	}
	for(var i=0; i < initial_links.length; ++i) {
	    links.push(initial_links[i]);
	}

	update();
    }

    var update = function () {

	// vis
        var link = svg.selectAll("line.link")
            .data(links, function(d) { return d.source.name + "-" + d.target.name; });

        link.enter().insert("line")
            .attr("class", "link")
	    .style("stroke-width", function(d) { return Math.sqrt(d.value); });

        link.exit().remove();

	// vis
        var node = svg.selectAll("g.node")
            .data(nodes, function(d) { return d.name;});

        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .call(force.drag);

        nodeEnter.append("circle")
            .attr("class", "circle")
            .attr("r", 10)
            .style("fill", function(d) { return color(d.group); })
	    .append("svg:title")
	    .text(function(d) { return d.name; });

	// Make the ability to add new nodes
	// by clicking
	nodeEnter.on("click", function(d) {
	    self.on_click();

	    /*
	    console.log("Clicked on: " + d.name);
	    add_lastfm_neighbor(d);
	    */

	    // Pick a neighbor at random
	    //match: "0.99598240852356"
	    
	    /*
	    var name = makename();
	    var group = d.group;
	    var node = {"name":name, "group":group}
	    self.addNeighbor(node, d.name, length);
	    */
	    //self.addNode(node);
	    //self.addLink(d.name, name);
	});
	
	nodeEnter.on("mouseover", function(d) {
	    self.on_mouseover();
	});

	nodeEnter.on("mouseout", function(d){
	    self.on_mouseout();
	});

        node.exit().remove();

        force.on("tick", function() {
	    link.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });

	    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	});

        // Restart the force layout.
        force.start();
    }

    // Make it all go
    begin();
}


//
// Public API
//

// Add and remove elements on the graph object
myGraph.prototype.addNode = function(node) {
    nodes.push(node);
    update();
}

myGraph.prototype.removeNode = function(name) {
    var i = 0;
    var n = findNode(name);
    while (i < links.length) {
	if ((links[i]['source'] == n)||(links[i]['target'] == n)) links.splice(i,1);
	else i++;
    }
    nodes.splice(findNodeIndex(name),1);
    update();
}

myGraph.prototype.addLink = function(source, target, value) {
    if( value==null ) value = 1.0;
    links.push({"source":findNode(source), 
		"target":findNode(target),
		"value":value});
    update();
}

myGraph.prototype.addNeighbor = function(node, neighbor, value) {
    // Add 'neighbor' as a neighbor to 'node'
    console.log("Adding neighbor: " + neighbor.name);
    console.log("To node: " + node.name);
    console.log("with value: " + value);
    self.addNode(neighbor);
    self.addLink(neighbor.name, node.name, value);
}


// These methods can be implemented

myGraph.prototype.on_click = function() { 
    console.log("Click");
}
    
myGraph.prototype.on_mouseover = function() { 
    console.log("Mouse Over");
}

myGraph.prototype.on_mouseout = function() { 
    console.log("Mouse Out");
}

