
// Based on:
// http://stackoverflow.com/questions/9539294/adding-new-nodes-to-force-directed-layout

function myGraph(svg) {

    var self = this;

    var color = d3.scale.category20();

    //var w = svg.width;
    //var h = svg.height;

    // Add and remove elements on the graph object
    this.addNode = function(name, group) {
	nodes.push({"name":name, "group":group});
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

    this.addLink = function (source, target) {
	links.push({"source":findNode(source),"target":findNode(target)});
	update();
    }

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
	console.log("Begin");

	// Get the JSON
	d3.json('/static/miserables.json', function(error, json) {

	    for(var i=0; i < json.nodes.length; ++i) {
		nodes.push(json.nodes[i]);
	    }
	    for(var i=0; i < json.links.length; ++i) {
		links.push(json.links[i]);
	    }

	    // Now, update
	    update();
	});

    }

    var update = function () {
	console.log("Update");

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
            //.attr("xlink:href", "https://d3nwyuy0nl342s.cloudfront.net/images/icons/public.png")
            .attr("r", 10)
            .style("fill", function(d) { return color(d.group); })
	    .append("svg:title")
	    .text(function(d) { return d.name; });
//            .style("fill", function(d) { return color(Math.floor(Math.random()*21)); })

	
	/*
        nodeEnter.append("text")
            .attr("class", "nodetext")
            .attr("dx", 12)
            .attr("dy", ".35em")
            .text(function(d) {return d.name});
	*/
	
	// Make the ability to add new nodes
	// by clicking
	nodeEnter.on("click", function(d) {
	    var name = makename();
	    var group = d.group;
	    self.addNode(name, group);
	    self.addLink(d.name, name);
	    /*
	    console.log(d.name)
	    var new_name = d.name + "_Bob";
	    nodes.push({"name":new_name, "group": d.group});
	    links.push({"source":findNodeIndex(d.name), 
			"target":findNodeIndex(new_name), "value": 1 });
	    console.log( "Source: " + findNodeIndex(d.name));
	    console.log( "Target: " + findNodeIndex(new_name));
	    update();
	    */
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
    //update();
}


// set up the D3 visualisation in the specified element
var w = 960; //$(el).innerWidth(),
var h = 700; //$(el).innerHeight();

var svg = d3.select("body").append("svg:svg")
    .attr("width", w)
    .attr("height", h);


graph = new myGraph(svg);
//graph = new myGraph("body");
// graph.begin();

// You can do this from the console as much as you like...
/*
graph.addNode("Cause");
graph.addNode("Effect");
graph.addLink("Cause", "Effect");
graph.addNode("A");
graph.addNode("B");
graph.addLink("A", "B");
*/
