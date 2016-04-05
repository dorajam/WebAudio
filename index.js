const HEIGHT = window.innerHeight;
const WIDTH = window.innerWidth;

let canvas = document.getElementById("canvas")
let canvasCtx = canvas.getContext("2d");

canvas.height = HEIGHT;
canvas.width = WIDTH;
let drawVisual = null;

// navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
navigator.mediaDevices.getUserMedia( {audio: true})
    .then((stream) => {
        let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        

        var source = audioCtx.createMediaStreamSource(stream);
        
        // source.connect(audioCtx.destination);

        console.log(source);

        console.log(audioCtx);

        let analyser = audioCtx.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 2048;
        let bufferLength = analyser.frequencyBinCount;
        console.log(bufferLength);
        let dataArray = new Uint8Array(bufferLength);
        canvasCtx.clearRect(0,0, WIDTH, HEIGHT);

        const draw = () => {
            drawVisual = requestAnimationFrame(draw)
            canvasCtx.fillStyle = "rgba(255,255,255, 0.15)";
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
            analyser.getByteFrequencyData(dataArray);

            canvasCtx.fillStyle = 'rgb(166,85,95)';

            let barWidth = (WIDTH/ bufferLength) * 2;
            let r =  255;
            let g = Math.sin(new Date() / 5000);
            let b = Math.sin(new Date() / 4000);
            if(g < 0 || b < 0) {
                g = Math.abs(g);
                b = Math.abs(b);
            }
            if(g < 0.5 || b < 0.5) {
                g = g + 0.3;
                b = b + 0.3;
            }
            if(g > 0.8 || b > 0.8) {
                g = g - 0.2;
                b = b - 0.2;
            }
            let R = r;
            let G = Math.floor(g * 255);
            let B = Math.floor(g * 255);

           let alphA = 0.8;
            for(let i =0; i <bufferLength; i++) {
                let barHeight = Math.exp(dataArray[i] / 30);
                if(i < bufferLength/2) {
                    R -= 1;
              
                }
                let barColor = 'rgba(' + R + ',' + G + ','+ B + ','+ (alphA) + ')';
                canvasCtx.fillStyle = barColor;
                canvasCtx.fillRect((barWidth + 1)*i, HEIGHT-barHeight/2, Math.floor(barWidth + 3), barHeight);
            }
        };
        draw();
    })
    .catch((err) => {console.log(err);});



