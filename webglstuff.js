// global WebGl context
var gl;

// width and height of HTML canvas element
const HEIGHT = window.innerHeight;
const WIDTH = window.innerWidth;
let canvas = document.getElementById("glcanvas")

canvas.height = HEIGHT;
canvas.width = WIDTH;

const start = () => {
    // initialize the WebGL context
    gl = initWebGL(canvas);
    gl.viewport(0,0, canvas.width, canvas.height); 
    
    // only continue if WebGL is available-> gl is not empty

    if (gl) {
        gl.clearColor(45.0, 0.0, 0.0,1.0);
        // enable depth testing ?
        gl.enable(gl.DEPTH_TEST);
        // obscure far things
        gl.depthFunc(gl.LEQUAL);
        // clear the color and depth buffer
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    }

    // setup GLSL program
    let program = createProgramFromScripts(gl, ["2d-vertex-shader" ,"2d-fragment-shader"]);
    gl.useProgram(program);

    // look up where the vertex data needs to go
    // -> a_position is a 4D float tpoint which sets the final position of the vertex point
    // this actually projects from 3D space into 2D space on your screen - messy
    let positionLocation = gl.getAttribLocation(progrm, "a_position");

    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
        gl.ARRAY_BUFFER, new Float32Array([
            -1.0, -1.0,
            -1.0, -1.0,
            -1.0, -1.0,
            -1.0, -1.0,
            -1.0, -1.0,
            -1.0, -1.0]),
        gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0,0);
    // 9 is the num of vertices to be drawn
    gl.drawArrays(gl.TRIANGLES, 0, 9);
}

const initWebGL = (canvas) => {
    gl = null;

    try {
        // try grabbing the standrad context if fails, fallback to experimental
        gl = canvas.getContext("webgl") || canvas.getContext("exprimental-webgl");
    }
    catch(e) {}

    // if no GL context, quit
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        gl = null;
    }
    return gl;
}
