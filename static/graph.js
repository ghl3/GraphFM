
// Based on:
// http://bl.ocks.org/4062045
// and 
// http://stackoverflow.com/questions/9539294/adding-new-nodes-to-force-directed-layout

function myGraph(svg, initial_nodes, initial_links) {

    // 
    // Private Implementation
    //

    this.svg = svg;

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

    this.force = d3.layout.force()
        .gravity(.05)
        .distance(100)
        .charge(-100)
        .size([w, h]);


    this.nodes = this.force.nodes();
    this.links = this.force.links();


    var makename = function() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	
	for( var i=0; i < 5; i++ )
	    text += possible.charAt(Math.floor(Math.random() * possible.length));
	
	return text;
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
	    self.nodes.push(initial_nodes[i]);
	}
	for(var i=0; i < initial_links.length; ++i) {
	    self.links.push(initial_links[i]);
	}

	self.update();
    }

/*
    var update = function () {

	// vis
        var link = svg.selectAll("line.link")
            .data(self.links, function(d) { return d.source.name + "-" + d.target.name; });

        link.enter().insert("line")
            .attr("class", "link")
	    .style("stroke-width", function(d) { return Math.sqrt(d.value); });

        link.exit().remove();

	// vis
        var node = svg.selectAll("g.node")
            .data(self.nodes, function(d) { return d.name;});

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
	    self.on_click(d);
	});
	
	nodeEnter.on("mouseover", function(d) {
	    self.on_mouseover(d);
	});

	nodeEnter.on("mouseout", function(d){
	    self.on_mouseout(d);
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
    }.bind(self);
*/
    // Make it all go
    begin();
}

//
// Private implementation
//

myGraph.prototype.update = function () {

    self = this;

    // vis
    var link = this.svg.selectAll("line.link")
        .data(self.links, function(d) { return d.source.name + "-" + d.target.name; });

    link.enter().insert("line")
        .attr("class", "link")
	.style("stroke-width", function(d) { return Math.sqrt(d.value); });

    link.exit().remove();

    // vis
    var node = this.svg.selectAll("g.node")
        .data(self.nodes, function(d) { return d.name;});

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
	self.on_click(d);
    });
    
    nodeEnter.on("mouseover", function(d) {
	self.on_mouseover(d);
    });

    nodeEnter.on("mouseout", function(d){
	self.on_mouseout(d);
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



//
// Public API
//

// Add and remove elements on the graph object
myGraph.prototype.addNode = function(node) {
    console.log("addNode");
    console.log(this.nodes);
    this.nodes.push(node);
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

    self = this;

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

