"use strict";
/**
 * Minimal example by Peter Strohm, adapted by Jirka
 */
let crc3;
let webGLProgram; // "GPU-Programm", das zur Berechnung der Grafik verwendet wird
window.addEventListener("load", init);
function init(_event) {
    let canvas;
    let srcVertex; // String des Vertex-Shader Quellcodes
    let shrVertex; // der Shader selbst
    let srcFragment; // String des Fragment-Shader Quellcodes
    let shrFragment; // der Shader selbst
    let iVertexPos; // Verknüpfung zwischen JavaScript und Vertex-Shader
    let vertices; // Array der Dreieckskoordinaten
    let buffer; // Der WebGL-Buffer, der die Dreieckskoordinaten aufnimmt
    canvas = window.document.getElementById("canvas");
    try {
        crc3 = canvas.getContext("experimental-webgl");
    }
    catch (e) {
        window.alert("Fehler: WebGL-Context nicht gefunden");
    }
    // create a new WebGL-Program
    webGLProgram = crc3.createProgram();
    // create amd attach most primitive shaders to it
    srcVertex = "   attribute vec4 vPosition; \
                    uniform float offset; \
                    void main() \
                    { \
                        gl_Position = vPosition + vec4(offset, offset, 0, 0); \
                    }";
    shrVertex = crc3.createShader(crc3.VERTEX_SHADER);
    crc3.shaderSource(shrVertex, srcVertex);
    crc3.compileShader(shrVertex);
    crc3.attachShader(webGLProgram, shrVertex);
    srcFragment = " precision mediump float; \
                    void main() \
                    { \
                        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); \
                    }";
    shrFragment = crc3.createShader(crc3.FRAGMENT_SHADER);
    crc3.shaderSource(shrFragment, srcFragment);
    crc3.compileShader(shrFragment);
    crc3.attachShader(webGLProgram, shrFragment);
    // link the program
    crc3.linkProgram(webGLProgram);
    // tell the rendering context to use the program  
    crc3.useProgram(webGLProgram);
    // retrieve the index of vPosition in the shader
    // create vertices for a simple trigon
    vertices = new Float32Array([
        0.0, 1, 0.0,
        -1, -1, 0.0,
        1, -1, 0.0
    ]);
    // create and bind a new buffer                                          
    buffer = crc3.createBuffer();
    crc3.bindBuffer(crc3.ARRAY_BUFFER, buffer);
    // prepare data for rendering
    crc3.bufferData(crc3.ARRAY_BUFFER, vertices, crc3.STATIC_DRAW);
    window.requestAnimationFrame(update);
}
function update() {
    crc3.clearColor(0.0, 0.0, 0.0, 1.0);
    crc3.clear(crc3.COLOR_BUFFER_BIT);
    let iVertexPos = crc3.getAttribLocation(webGLProgram, "vPosition");
    crc3.vertexAttribPointer(iVertexPos, 3, crc3.FLOAT, false, 0, 0);
    crc3.enableVertexAttribArray(iVertexPos);
    let offset = crc3.getUniformLocation(webGLProgram, "offset");
    let value = crc3.getUniform(webGLProgram, offset);
    value += 0.01;
    // console.log(value);
    crc3.uniform1f(offset, value);
    // render
    crc3.drawArrays(crc3.TRIANGLES, 0, 3);
    window.requestAnimationFrame(update);
}
//# sourceMappingURL=Main.js.map