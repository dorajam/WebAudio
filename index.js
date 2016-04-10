let drawVisual = null;

const HEIGHT = window.innerHeight;
const WIDTH = window.innerWidth;

let canvas = document.getElementById("canvas")
let canvasCtx = canvas.getContext("2d");

canvas.height = HEIGHT;
canvas.width = WIDTH;
// navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

navigator.mediaDevices.getUserMedia( {audio: true})
    .then((stream) => {
        let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        var source = audioCtx.createMediaStreamSource(stream);

        let analyser = audioCtx.createAnalyser();
        source.connect(analyser);

        analyser.fftSize = 2048;

        let bufferLength = analyser.frequencyBinCount;
        let dataArray = new Uint8Array(bufferLength);
        const fftBinWidth = audioCtx.sampleRate / analyser.fftSize;

        // console.log(fftBinWidth);  // 21

        // mel scaling
        function hzToMel(f) {
            return 1127 * Math.log(1 + f/700)
        }
        function melToHz(f) {
            return 700 * (Math.exp(f / 1127)-1)
        }

        function fromFFTRect(input) {
            const numBins = 26;
            const output = new Uint8Array(numBins);

            const melWidth = hzToMel(audioCtx.sampleRate / 2) / numBins;

            for (let i=0; i < output.length; i++){
                let minHz = melToHz(i * melWidth);
                let maxHz = melToHz((i + 1) * melWidth);

                let minInputIndex = Math.floor(minHz / fftBinWidth);
                let maxInputIndex = Math.floor(maxHz / fftBinWidth);

                for (let j = minInputIndex; j < maxInputIndex; j++) {
                    output[i] += input[j];
                }
            }
            return output;
        }

        const numBins = 26;
        const numPoints = numBins + 2;
        const numSections = numPoints - 1;
        let melDataArray = new Uint8Array(numBins);

        const melWidth = hzToMel(8000) / numSections;
        let multipliers = []
        function fromFFTtriangle(input) {

            for (let i=0; i < melDataArray.length; i++){
                let minHz = melToHz(i * melWidth);
                let centerHz = melToHz((i + 1) * melWidth);
                let maxHz = melToHz((i + 2) * melWidth);

                let slopeAscending = 1/(centerHz - minHz);
                let slopeDescending = 1/(centerHz - maxHz);    // this needs to be negative!!!!

                let minInputIndex = Math.floor(minHz / fftBinWidth);
                let maxInputIndex = Math.floor(maxHz / fftBinWidth);
                melDataArray[i] = 0;

                for (let j = minInputIndex; j < maxInputIndex; j++) {
                    // input[j] * 1 is for rectangle
                    // input[j] * weight constructs triangle
                    let mult;
                    let hzVal = j * fftBinWidth;
                    if (hzVal < centerHz) {
                        mult = (hzVal - minHz) * slopeAscending;
                    } else {
                        mult = 1 + (hzVal - centerHz) * slopeDescending;
                    }
                    multipliers.push(mult);
                    melDataArray[i] += mult * input[j];
                }
                melDataArray[i] = Math.log(melDataArray[i]); 
            }
            // console.log(multipliers);
        }
        
        canvasCtx.clearRect(0,0, WIDTH, HEIGHT);
        
        const draw = () => {
            drawVisual = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            fromFFTtriangle(dataArray);
            
            canvasCtx.fillStyle = 'rgb(166,85,95)';
            canvasCtx.fillStyle = "rgba(255,255,255, 0.15)";
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            let barWidth = (WIDTH/ melDataArray.length);
            // let r =  255;
            // let g = Math.sin(new Date() / 5000);
            // let b = Math.sin(new Date() / 4000);
            // if(g < 0 || b < 0) {
            //     g = Math.abs(g);
            //     b = Math.abs(b);
            // }
            // if(g < 0.5 || b < 0.5) {
            //     g = g + 0.3;
            //     b = b + 0.3;
            // }
            // if(g > 0.8 || b > 0.8) {
            //     g = g - 0.2;
            //     b = b - 0.2;
            // }
            // let R = r;
            // let G = Math.floor(g * 255);
            // let B = Math.floor(g * 255);

           // let alphA = 0.8;
            canvasCtx.fillStyle = 'rgba(0,0,0,1)';
            for(let i =0; i <melDataArray.length; i++) {
                let barHeight = melDataArray[i] * 100;
                // if(i < bufferLength/2) {
                    // R -= 1;
                // }
                // let barColor = 'rgba(' + R + ',' + G + ','+ B + ','+ (alphA) + ')';
                canvasCtx.fillRect((barWidth + 1)*i
                                , Math.floor(HEIGHT-barHeight/2)
                                , Math.floor(barWidth) + 2
                                , Math.floor(barHeight));
            }};
        draw();
    })
    .catch((err) => {console.log(err);});


