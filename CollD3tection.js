navigator.mediaDevices.getUserMedia( {audio: true})
    .then((stream) => {
        let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var source = audioCtx.createMediaStreamSource(stream);
        var osc = audioCtx.createOscillator();
        var gainNode = audioCtx.createGain();
        // osc.connect(gainNode);
        // gainNode.connect(audioCtx.destination);
        // osc.type = 'sine';
        // osc.frequency.value = 0;

        let analyser = audioCtx.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 256;

        let bufferLength = analyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);

        var width = 1024,
            height = 700;

        // bufferlength is half of fftSize -> this initializes the radius to be 5
        var nodes = d3.range(bufferLength).map(function(j) {
            return {radius: 5} }),
            root = nodes[0],
            color = d3.scale.linear()
                .domain([1, bufferLength])
                .range([d3.rgb("#007AFF"), d3.rgb("#FFF500")]);

        root.radius = 0;
        root.fixed = true;

        var force = d3.layout.force()
                .gravity(0.001)   // seems like 'else' in charge is the radius of your mouse -> the radiuse by which the other nodes are repelled by
                .charge(function(d, i) { return i ? 0 : -100; })   // return i ? means if i exists (aka True) return 0, else -2000
                .nodes(nodes)
                .size([width, height]);

        force.start();

        var svg = d3.select("#d3canvas").append("svg")     // select body element and create svg element inside
                .attr("width", width)
                .attr("height", height);

        svg.selectAll("circle")
            .data(nodes.slice(1))
            .enter().append("circle")
            .attr("r", function(d) { return d.radius; })
            .style("fill", function(d, i) { return color(i); });


        function draw() {
            var drawvisual = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            // frequency --> color
            // between 0 - 255
            function freqToColor(freq) {
              var bucket = Math.floor((freq) / 24); // 0 -3
                var colorArray = ["#fcc8c9", "#fbb6b7", "#faa4a5", "#f99293", "#f88081", "#f76e6e", "#f65c5d", "#f64a4b", "#dd4243", "#c43b3c", "#ac3334"];
              return colorArray[bucket];
            }

            // map radius to frequencies 
            for (var j=0; j < bufferLength; j++) {
                if(dataArray[j] < 5) {nodes[j].radius = dataArray[j] + 7}
               else {
                    nodes[j].radius = Math.pow(dataArray[j], 2) / Math.pow(255,2) * 30 + 7;
                    osc.frequency.value = nodes[j].radius / 30 * 1000;
                }
            }
            var q = d3.geom.quadtree(nodes),         // constructs quadtree from nodes array -> this speeds up the operations to de carried out on each node
                // quadtree returns the root node of a new quadtree
                i = 0,
                n = nodes.length;

            while (++i < n) q.visit(collide(nodes[i]));      // visit each node and take 5 arguments: quad, x1,y1,x2,y2

            svg.selectAll("circle")
                .attr("cx", function(d) { return d.x; }) // cx, cy is the position of each node -> set their coordinates to the newly defined coordinates from collide()
                .attr("cy", function(d) { return d.y; })
                .attr("r", function(d) {return d.radius; })      
                .style("fill", function(d, i) { 
                   var color = freqToColor(dataArray[i]);
                   return color;
                })
                .style("opacity", 0.9);
            // keep balls bouncing
            force.alpha(1);
        };
        draw();

        // osc.start();

        svg.on("mousemove", function() {
            var p1 = d3.mouse(this);    // p1 is the mouse position -> p1[0] = x, p1[1] is y cordinate
            root.px = p1[0];            // change root position to equal your mouse position -> root is an invisible root (radius=0) with + charge
            root.py = p1[1];
            force.resume();
        });

        // collide takes a node -> returns a function
        // the returned function takes
        function collide(node) {
            var r = node.radius + 16,
                nx1 = node.x - r,
                nx2 = node.x + r,
                ny1 = node.y - r,
                ny2 = node.y + r;
            return function(quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== node)) {
                    var x = node.x - quad.point.x,
                        y = node.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = node.radius + quad.point.radius;
                    if (l < r) {
                        l = (l - r) / l * .5;
                        node.x -= x *= l;
                        node.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            };
        };
     })
    .catch((err) => {console.log(err);});

