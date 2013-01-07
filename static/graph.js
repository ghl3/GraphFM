
// Based on:
// http://bl.ocks.org/4062045
// and 
// http://stackoverflow.com/questions/9539294/adding-new-nodes-to-force-directed-layout

/*
  This class implements a svg graph, which consists
  of nodes and links and is held together using a
  d3 'force.'

  The nodes can be any objects, but they must contain
  an attribute called 'name'.  Links are defined by
  containing attributes 'source' and 'target' which
  refer to the 'name' attributes of nodes that they
  are connecting.

*/

function myGraph(svg, initial_nodes, initial_links) {

    // 
    // Private Implementation
    //

    var self = this;

    this.svg = svg;

    this.color = d3.scale.category20();

    var w = 960; //svg[0][0].getAttribute("width");
    var h = 700; //svg[0][0].getAttribute("height");
    this.force = d3.layout.force()
        .gravity(.05)
        .distance(100)
        .charge(-100)
        .size([w, h]);

    this.nodes = this.force.nodes();
    this.links = this.force.links();

    var begin = function() {
	
	for(var i=0; i < initial_nodes.length; ++i) {
	    self.nodes.push(initial_nodes[i]);
	}
	for(var i=0; i < initial_links.length; ++i) {
	    self.links.push(initial_links[i]);
	}

	self.update();
    }

    begin();

}

//
// Methods
//


myGraph.prototype.findNode = function(name) {
    for (var i in this.nodes) {
	if(this.nodes[i]["name"] === name) return this.nodes[i];
    }
    return null;
}


myGraph.prototype.findNodeIndex = function(name) {
    for (var i in this.nodes) {
	if(this.nodes[i]["name"] === name) return i;
    }
    return null;
}


myGraph.prototype.update = function () {

    var self = this;

    var link = this.svg.selectAll("line.link")
        .data(self.links, function(d) { return d.source.name + "-" + d.target.name; });

    link.enter().insert("line")
        .attr("class", "link")
	.style("stroke-width", function(d) { return Math.sqrt(d.value); });

    link.exit().remove();

    var node = this.svg.selectAll("g.node")
        .data(self.nodes, function(d) { return d.name;});

    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .call(this.force.drag);

    nodeEnter.append("circle")
        .attr("class", "circle")
        .attr("r", 10)
        .style("fill", function(d) { return self.color(d.group); })
	.append("svg:title")
	.text(function(d) { return d.name; });

    // Make the ability to add new nodes by clicking
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

    this.force.on("tick", function() {
	link.attr("x1", function(d) { return d.source.x; })
	    .attr("y1", function(d) { return d.source.y; })
	    .attr("x2", function(d) { return d.target.x; })
	    .attr("y2", function(d) { return d.target.y; });

	node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });

    // Restart the force layout.
    this.force.start();
}


myGraph.prototype.addNode = function(node) {
    if( this.findNode(node.name) == null ) {
	this.nodes.push(node);
    }
    this.update();
}


myGraph.prototype.removeNode = function(name) {
    var i = 0;
    var n = findNode(name);
    while (i < links.length) {
	if ((links[i]['source'] == n)||(links[i]['target'] == n)) links.splice(i,1);
	else i++;
    }
    nodes.splice(findNodeIndex(name),1);
    this.update();
}


myGraph.prototype.addLink = function(source, target, value) {
    if( value==null ) value = 1.0;
    this.links.push({"source" : this.findNode(source), 
		     "target" : this.findNode(target),
		     "value" : value});
    this.update();
}


myGraph.prototype.addNeighbor = function(node, neighbor, value) {
    // Add the node if it doesn't exist
    // Otherwise, only add the link
    if( this.findNode(neighbor.name) == null ) {
	this.addNode(neighbor);
    }
    this.addLink(neighbor.name, node.name, value);
}


myGraph.prototype.reset = function() {
    // LOL, is this really how javascript
    // makes me clear an array? wft
    this.nodes.length = 0;
    this.links.length = 0;
    this.update();
}


//
// These methods should be implemented by the user
// Consider them 'virtual'
//


myGraph.prototype.on_click = function() { 
    return;
}
    
myGraph.prototype.on_mouseover = function() { 
    return;
}

myGraph.prototype.on_mouseout = function() { 
    return;
}

