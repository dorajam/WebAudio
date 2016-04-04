const HEIGHT = window.innerHeight;
const WIDTH = window.innerWidth;


let canvas = document.getElementById("canvas")
let canvasCtx = canvas.getContext("2d");

canvas.height = HEIGHT;
canvas.width = WIDTH;

let drawVisual = null;
let count = 0;


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
            let r =  Math.sin(new Date() / 3000) * 0.5 * 0.5;
            let g = Math.sin(new Date() / 1000) * 0.5 * 0.5;
            let b = Math.sin(new Date() / 2000) * 0.5 * 0.5;
            let alphA = 0.8;
            
            let barColor = 'rgba(' + Math.floor(r * 255) + ',' + Math.floor(g * 255) + ','+ Math.floor(b * 255)+ ','+ (alphA) + ')';
            for(let i =0; i <bufferLength; i++) {
                count += 1;
                let barHeight = Math.exp(dataArray[i] / 30);
                canvasCtx.fillStyle = barColor; 
                canvasCtx.fillRect((barWidth + 1)*i, HEIGHT-barHeight/2, Math.floor(barWidth + 3 +  Math.sin(i)), barHeight);
            }
        };

        draw();

        
    })
    .catch((err) => {console.log(err);});



