// Dora Jambor
// April 2016
// D3lines.js -> music visualization

navigator.mediaDevices.getUserMedia( {audio: true})
    .then((stream) => {
        let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var source = audioCtx.createMediaStreamSource(stream);

        let analyser = audioCtx.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 512;

        let bufferLength = analyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);

        var width = 1024,
            height = 1500;

        // bufferlength is half of fftSize -> this initializes the radius to be 5
        var nodes = d3.range(bufferLength).map(function(j) {
            return {len: 6} }),
            root = nodes[0],
            color = d3.scale.linear()
                .domain([1, bufferLength])
                .range([d3.rgb("#007AFF"), d3.rgb("#FFF500")]);
        // color = d3.scale.category20c();

        root.len = 0;
        root.fixed = true;

        var force = d3.layout.force()
                .gravity(0.001)   // seems like 'else' in charge is the radius of your mouse -> the radiuse by which the other nodes are repelled by
                .charge(function(d, i) { return i ? 0 : -100; })   // return i ? means if i exists (aka True) return 0, else -2000
                .nodes(nodes)
                .size([width, height]);

        force.start();

        var svg = d3.select("#d3canvas").append("svg")     // select body element and create svg element inside
                .attr("width", width / 2)
                .attr("height", height / 2);

        svg.selectAll("line")
            .data(nodes.slice(1))
            .enter().append("line")
            .style("stroke", function(d,i) {return color(i);})
            .style("stroke-width", height / bufferLength)
            .style("stroke-linecap", "round")
            .attr("x1", width/2)
            .attr("y1", function(d, i) {
                return (height / bufferLength) * i;
            })
            .attr("x2", width / 2 - 6)
            .attr("y2", function(d,i) {
                return (height / bufferLength) * i;
            });

        var svg1 = d3.select("#d3canvas").append("svg")     // select body element and create svg element inside
                .attr("width", width / 2)
                .attr("height", height /2);

        svg1.selectAll("line")
            .data(nodes.slice(1))
            .enter().append("line")
            .style("stroke", function(d,i) {return color(i);})
            .style("stroke-width", height / bufferLength)
            .style("class", "linecap")
            .attr("x1", width)
            .attr("y1", function(d, i) {
                return (height / bufferLength) * i;
            })
            .attr("x2", width + 6)
            .attr("y2", function(d,i) {
                return (height / bufferLength) * i;
            });

        function draw() {
            var drawvisual = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            // frequency --> color
            // between 0 - 255
            function freqToColor(freq) {
              var bucket = Math.floor((freq) / 47); // 0 -3
                var colorArray = ["#fcc8c9", "#fbb6b7", "#faa4a5", "#f99293", "#f88081", "#f76e6e", "#f65c5d", "#f64a4b", "#dd4243", "#c43b3c", "#ac3334"];
              return colorArray[bucket];
            }

            // map radius to frequencies 
            for (var j=0; j < bufferLength; j++) {
                if(dataArray[j] < 5) {nodes[j].len = dataArray[j] + 3}
                else {
                    nodes[j].len = Math.pow(dataArray[j], 2) / Math.pow(255,2) * 500 + 3;
                }
            }

            svg.selectAll("line")
                // .style("stroke", function(d,i){
                //     return color(i%4)})
                .style("stroke", function(d,i) {return freqToColor(dataArray[i]);})
                .attr("x1", width/2)
                .attr("y1", function(d, i) {
                    return (height / bufferLength) * i;
                })
                .attr("x2", function(d,i) {
                    return (width/2 - d.len);
                })
                .attr("y2", function(d,i) {
                    return (height / bufferLength) * i;
                });

            svg1.selectAll("line")
                // .style("stroke", function(d,i){
                //     return color(i%4)})
                .style("stroke", function(d,i) {return freqToColor(dataArray[i]);})
                .attr("x1", 0)
                .attr("y1", function(d, i) {
                    return (height / bufferLength) * i;
                })
                .attr("x2", function(d,i) {
                    return (0 + d.len);
                })
                .attr("y2", function(d,i) {
                    return (height / bufferLength) * i;
                });
            // keep balls bouncing
            force.alpha(1);
        };
        draw();
     })
    .catch((err) => {console.log(err);});

