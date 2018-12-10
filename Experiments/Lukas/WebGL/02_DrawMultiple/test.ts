// import * as webgl2 from "webgl2";
// import * as webglutils from "webgl-utils.js";

///<reference path="library.js">

// declare function createProgramFromSources(gl: WebGL2RenderingContext, shaders: string[]): WebGLProgram;

import * as webglutils from "../XX_Boilerplate/webgl-utils";

window.addEventListener("load", init);

var canvas: HTMLCanvasElement;

var vertexShaderSource = `#version 300 es
     
        // an attribute is an input (in) to a vertex shader.
        // It will receive data from a buffer
        in vec2 a_position;
        
        // Used to pass in the resolution of the canvas
        uniform vec2 u_resolution;
        
        // all shaders have a main function
        void main() {
        
            // convert the position from pixels to 0.0 to 1.0
            vec2 zeroToOne = a_position / u_resolution;
            
            // convert from 0->1 to 0->2
            vec2 zeroToTwo = zeroToOne * 2.0;
            
            // convert from 0->2 to -1->+1 (clipspace)
            vec2 clipSpace = zeroToTwo - 1.0;
            
            gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        }
        `;

var fragmentShaderSource = `#version 300 es
         
        // fragment shaders don't have a default precision so we need
        // to pick one. mediump is a good default. It means "medium precision"
        precision mediump float;

        //uniform vec4 u_color;
         
        // we need to declare an output for the fragment shader
        out vec4 outColor;
         
        void main() {          
          // Makes the color settable
          outColor = vec4(1, 0, 0.5, 1);
        }
        `;

function init() {
    canvas = <HTMLCanvasElement>document.getElementById("c");
    let gl: WebGL2RenderingContext = canvas.getContext("webgl2");
    if (!gl) {
        console.log("NO WEBGL2 found!");
        return;
    }

    let program = webglutils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);

}

function setRectangle(gl: WebGL2RenderingContext, x: number, y: number, width: number, height: number) {
    let x1 = x;
    let x2 = x + width;
    let y1 = y;
    let y2 = y + height;

    // NOTE: gl.bufferData(gl.ARRAY_BUFFER, ...) will affect
    // whatever buffer is bound to the `ARRAY_BUFFER` bind point
    // but so far we only have one buffer. If we had more than one
    // buffer we'd want to bind that buffer to `ARRAY_BUFFER` first.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2]), gl.STATIC_DRAW);
}