
var width = 960;
var height = 500;

var color = d3.scale.category20();

// Create the 'force' properties
// that controls the motion of the nodes
var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([width, height]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var graph = null;

function begin() {

    // 'Use the Force'
    // Bind it to the nodes and
    // their connecting lines
    force
        .nodes(d3.values(graph.nodes))
        .links(d3.values(graph.links))
        .start();
}

function update() {

    force.stop();

    // To ensure that the 'force' is concurrent,
    // we reference the nodes and links from the force
    var nodes = force.nodes();
    var links = force.links();

    /*
    // Some helper functions
    var findNode = function(name) {
	for (var i in nodes) {if (nodes[i]["name"] === name) return nodes[i]};
    }
    */

    var link = svg.selectAll("line.link")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return Math.sqrt(d.value); });

    var node = svg.selectAll("circle.node")
        .data(nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 10)
	//.attr("x", "-8px")
        //.attr("y", "-8px")
        .style("fill", function(d) { return color(d.group); })
        .call(force.drag);

    node
	.append("title")
        .text(function(d) { return d.name; });

    // Make the nodes 'clickable'
    var findNodeIndex = function(name) {
	for (var i in nodes) {
	    if(nodes[i]["name"] === name) return i;
	}
    }

    // Set the force to listen for dragging
    // and to respond by moving the lines
    // and the nodes
    force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
	
	node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        //node.attr("cx", function(d) { return d.x; })
        //    .attr("cy", function(d) { return d.y; });
    });

    // Make the ability to add new nodes
    // by clicking
    node.on("click", function(d) {
	console.log(d.name)
	var new_name = d.name + "_Bob";
	nodes.push({"name":new_name, "group": d.group});
	links.push({"source":findNodeIndex(d.name), 
		    "target":findNodeIndex(new_name), "value": 1 });
	console.log( "Source: " + findNodeIndex(d.name));
	console.log( "Target: " + findNodeIndex(new_name));
	update();
    });

    // node.exit().remove();

    // Restart the force layout.
    force.start(); //xstart();
}

// Get the JSON
d3.json('/static/miserables.json', function(error, json) {
    graph = json;
    begin();
    update();
});

