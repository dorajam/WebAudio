const HEIGHT = window.innerHeight;
const WIDTH = window.innerWidth;

let canvas = document.getElementById("canvas")
let canvasCtx = canvas.getContext("2d");

canvas.height = HEIGHT;
canvas.width = WIDTH; 

const start = () => {

};


var real = new Float32Array(4);
var imag = new Float32Array(4);

let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let oscillator = audioCtx.createOscillator();
let gainNode = audioCtx.createGain();

// Real[0] = 0;
//  imag[0] = 0;
//    real[1] = 1;
//   imag[1] = 0;
//   real[2] = 0;
//    imag[2] = 1;

//var wave = audioCtx.createPeriodicWave(real,imag);
//oscillator.setPeriodicWave(wave);
//oscillator.connect(audioCtx.destination);
//oscillator.start();
// oscillator.stop(1); // hold tone for 4 seconds

//console.log(wave);

oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);
oscillator.type = 'sine';
oscillator.frequency.value = 1000; // hertz value
oscillator.start();
