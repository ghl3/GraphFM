
// Based on:
// http://stackoverflow.com/questions/9539294/adding-new-nodes-to-force-directed-layout

var color = d3.scale.category20();

function myGraph(el) {

    var self = this;

    // Add and remove elements on the graph object
    this.addNode = function (id) {
	nodes.push({"id":id});
	update();
    }

    this.removeNode = function (id) {
	var i = 0;
	var n = findNode(id);
	while (i < links.length) {
	    if ((links[i]['source'] == n)||(links[i]['target'] == n)) links.splice(i,1);
	    else i++;
	}
	nodes.splice(findNodeIndex(id),1);
	update();
    }

    this.addLink = function (source, target) {
	links.push({"source":findNode(source),"target":findNode(target)});
	update();
    }

    var findNode = function(id) {
	for (var i in nodes) {if (nodes[i]["id"] === id) return nodes[i]};
    }
    
    var findNodeIndex = function(id) {
        for (var i in nodes) {if (nodes[i]["id"] === id) return i};
    }

    // set up the D3 visualisation in the specified element
    var w = 960; //$(el).innerWidth(),
    var h = 500; //$(el).innerHeight();

    var vis = this.vis = d3.select(el).append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    var force = d3.layout.force()
        .gravity(.05)
        .distance(100)
        .charge(-100)
        .size([w, h]);

    var nodes = force.nodes(),
    links = force.links();


    var makeid = function() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	
	for( var i=0; i < 5; i++ )
	    text += possible.charAt(Math.floor(Math.random() * possible.length));
	
	return text;
    }


    var update = function () {

        var link = vis.selectAll("line.link")
            .data(links, function(d) { return d.source.id + "-" + d.target.id; });

        link.enter().insert("line")
            .attr("class", "link");

        link.exit().remove();

        var node = vis.selectAll("g.node")
            .data(nodes, function(d) { return d.id;});

        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .call(force.drag);

        nodeEnter.append("circle")
            .attr("class", "circle")
            //.attr("xlink:href", "https://d3nwyuy0nl342s.cloudfront.net/images/icons/public.png")
            .attr("r", 10)
            .style("fill", function(d) { return color(Math.floor(Math.random()*21)); })

        nodeEnter.append("text")
            .attr("class", "nodetext")
            .attr("dx", 12)
            .attr("dy", ".35em")
            .text(function(d) {return d.id});

	// Make the ability to add new nodes
	// by clicking
	nodeEnter.on("click", function(d) {
	    var id = makeid();
	    self.addNode(id);
	    self.addLink(d.id, id);
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
    update();
}

graph = new myGraph("body");

// You can do this from the console as much as you like...
graph.addNode("Cause");
graph.addNode("Effect");
graph.addLink("Cause", "Effect");
graph.addNode("A");
graph.addNode("B");
graph.addLink("A", "B");
