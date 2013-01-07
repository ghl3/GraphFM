
// Based on:
// http://stackoverflow.com/questions/9539294/adding-new-nodes-to-force-directed-layout

function myGraph(svg, initial_nodes, initial_links) {

    //
    // Public API
    //

    // Add and remove elements on the graph object
    this.addNode = function(node) {
	nodes.push(node);
	update();
    }

    this.removeNode = function(name) {
	var i = 0;
	var n = findNode(name);
	while (i < links.length) {
	    if ((links[i]['source'] == n)||(links[i]['target'] == n)) links.splice(i,1);
	    else i++;
	}
	nodes.splice(findNodeIndex(name),1);
	update();
    }

    this.addLink = function(source, target) {
	links.push({"source":findNode(source),"target":findNode(target)});
	update();
    }

    
    this.addNeighbor = function(node, neighbor) {
	// Create a new node called 'node'
	// and add it as a neighbor to 'neighbor'
	self.addNode(node);
	self.addLink(neighbor, node.name);
    }

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
            .attr("class", "link");

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
	    var name = makename();
	    var group = d.group;
	    var node = {"name":name, "group":group}
	    self.addNeighbor(node, d.name);
	    //self.addNode(node);
	    //self.addLink(d.name, name);
	});
	
	//nodeEnter.on("mouseover", addLabel);
	//nodeEnter.on("mouseout", clearLabel);

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
