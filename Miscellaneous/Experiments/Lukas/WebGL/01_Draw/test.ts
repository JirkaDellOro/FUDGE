namespace WebGL2Test1{
    window.addEventListener("load",init);
    
    var canvas: HTMLCanvasElement;

    var vertexShaderSource = `#version 300 es
     
        // an attribute is an input (in) to a vertex shader.
        // It will receive data from a buffer
        in vec4 a_position;
         
        // all shaders have a main function
        void main() {
         
          // gl_Position is a special variable a vertex shader
          // is responsible for setting
          gl_Position = a_position;
        }
        `;
         
        var fragmentShaderSource = `#version 300 es
         
        // fragment shaders don't have a default precision so we need
        // to pick one. mediump is a good default. It means "medium precision"
        precision mediump float;

        uniform vec4 u_color;
         
        // we need to declare an output for the fragment shader
        out vec4 outColor;
         
        void main() {
          // Just set the output to a constant redish-purple
          outColor = vec4(1, 0, 0.5, 1);
        }
        `;

    function init(){
        canvas = <HTMLCanvasElement> document.getElementById("c");
        let gl: WebGL2RenderingContext = canvas.getContext("webgl2");
        if(!gl){
            console.log("NO WEBGL2 found!");
            return;
        }

        let vertexShader: WebGLShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        let fragmentShader: WebGLShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        let program: WebGLProgram = createProgram(gl, vertexShader, fragmentShader);
        let positionAttributeLocation: number = gl.getAttribLocation(program, "a_position");
        let positionBuffer: WebGLBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
        let positions: number[] = [
            -1, -1,
            0, 0.5,
            0.7, 0,
            1, 1,
            0.9, 1,
            1, 0.9
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        let vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        gl.enableVertexAttribArray(positionAttributeLocation);

        let size = 2;          // 2 components per iteration
        let type = gl.FLOAT;   // the data is 32bit floats
        let normalize = false; // don't normalize the data
        let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        let offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
        // webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0 , 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        gl.bindVertexArray(vao);
        let primitiveType = gl.TRIANGLES;
        offset = 0;
        let count = 6;
        gl.drawArrays(primitiveType, offset, count);
    }

    function createShader(gl: WebGLRenderingContext, type: number, source: string){
        let shader: WebGLShader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if(success){
            return shader;
        }
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }

    function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader){
        let program: WebGLProgram = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
          return program;
        }
       
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }

    function setRectangle(gl:WebGL2RenderingContext, x:number, y: number, width: number, height: number){
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

}