let drawvisual = null;
navigator.mediaDevices.getUserMedia( {audio: true})
    .then((stream) => {
        let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var source = audioCtx.createMediaStreamSource(stream);

        // source.connect(audioCtx.destination);

        let analyser = audioCtx.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 256;
        let bufferLength = analyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);
        // console.log(bufferLength);

        // const draw = () => {
                      // console.log(dataArray);

        // }; 
        // draw();
        var width = 960,
            height = 700;

        // bufferlength is half of fftSize
        var nodes = d3.range(bufferLength).map(function(j) {
            return {radius: 5} }),
            root = nodes[0],
            color = d3.scale.category20c();

        function set_radius() {
            var num = dataArray[j] / 5 + 30 ;
            j++;
            return num;
        }
        root.radius = 0;
        root.fixed = true;

        var force = d3.layout.force()
                .gravity(0.03)
        // seems like 'else' in charge is the radius of your mouse -> the radiuse by which the other nodes are repelled by
                .charge(function(d, i) { return i ? 0 : -500; })   // return i ? means if i exists (aka True) return 0, else -2000
                .nodes(nodes)
                .size([width, height]);

        force.start();

        var svg = d3.select("body").append("svg")     // select body element and create svg element inside
                .attr("width", width)
                .attr("height", height);

        svg.selectAll("circle")
            .data(nodes.slice(1))
            .enter().append("circle")
            .attr("r", function(d) { return d.radius; })
            .style("fill", function(d, i) { return color(i % 4); });

        function draw() {
            drawvisual = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            //console.log(dataArray);
            for(var j=0; j < bufferLength; j++) {
                nodes[j].radius = dataArray[j] / 10 + 5 ;
                nodes[0].radius = 50;
               // console.log(nodes[i].radius); 
            }
            var q = d3.geom.quadtree(nodes),         // constructs quadtree from nodes array -> this speeds up the operations to de carried out on each node
                // quadtree returns the root node of a new quadtree
                i = 0,
                n = nodes.length;

            while (++i < n) q.visit(collide(nodes[i]));      // visit each node and take 5 arguments: quad, x1,y1,x2,y2

            svg.selectAll("circle")
                .attr("cx", function(d) { return d.x; })        // cx, cy is the position of each node -> set their coordinates to the newly defined coordinates from collide()
                .attr("cy", function(d) { return d.y; });

            svg.selectAll("circle")
                .attr("r", function(d) {return d.radius; });      // cx, cy is the position of each node -> set their coordinates to the newly defined coordinates from collide
        };
        draw();

        svg.on("mousemove", function() {
            var p1 = d3.mouse(this);    // p1 is the mouse position -> p1[0] = x, p1[1] is y cordinate
            root.px = p1[0];            // change root position to equal your mouse position -> root is an invisible root (radius=0) -> other nodes are relatively positited to this
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
