let drawvisual = null;
navigator.mediaDevices.getUserMedia( {audio: true})
    .then((stream) => {
        let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var source = audioCtx.createMediaStreamSource(stream);

        // source.connect(audioCtx.destination);

        let analyser = audioCtx.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 128;
        let bufferLength = analyser.frequencyBinCount;
        console.log(bufferLength);
        var dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            drawvisual = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            var width = 960,
                height = 500;

            // bufferlength is half of fftSize
            var nodes = d3.range(bufferLength).map(function() { return {radius: 10}; }),
                root = nodes[0],
                color = d3.scale.category20c();

            root.radius = 0;
            root.fixed = true;

            var force = d3.layout.force()
                    .gravity(0.03)
            // seems like 'else' in charge is the radius of your mouse -> the radiuse by which the other nodes are repelled by
                    .charge(function(d, i) { return i ? 0 : -900; })   // return i ? means if i exists (aka True) return 0, else -2000
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
                .style("fill", function(d, i) { return color(i % 3); });

            force.on("tick", function(e) {
                var q = d3.geom.quadtree(nodes),
                    i = 0,
                    n = nodes.length;

                while (++i < n) q.visit(collide(nodes[i]));

                svg.selectAll("circle")
                    .attr("cx", function(d) { return d.x; })        // cx, cy is the position of each node -> set their coordinates to the newly defined coordinates from collide()
                    .attr("cy", function(d) { return d.y; });
            });

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

            // const draw = () => {
            //     drawVisual = requestAnimationFrame(draw)
            //     analyser.getByteFrequencyData(dataArray);

            // };
            //     draw();
        };
        draw();
     })
    .catch((err) => {console.log(err);});

