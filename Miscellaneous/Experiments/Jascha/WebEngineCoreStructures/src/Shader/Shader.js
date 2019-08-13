var WebEngine;
(function (WebEngine) {
    /**
     * Abstract superclass for the representation of WebGl shaderprograms.
     * Adjusted version of a class taken from Travis Vromans WebGL 2D-GameEngine
     */
    class Shader {
        /**
         * Creates a new shader.
         */
        constructor() {
            this.attributes = {}; // Associative array of shader atrributes.
            this.uniforms = {}; // Associative array of shader uniforms.
        }
        // Get and set methods.######################################################################################
        /**
         * Get location of an attribute by its name.
         * @param _name Name of the attribute to locate.
         */
        getAttributeLocation(_name) {
            if (this.attributes[_name] === undefined) {
                return null;
            }
            return this.attributes[_name];
        }
        /**
          * Get location of uniform by its name.
          * @param _name Name of the attribute to locate.
          */
        getUniformLocation(_name) {
            if (this.uniforms[_name] === undefined) {
                return null;
            }
            return this.uniforms[_name];
        }
        load(_vertexShaderSource, _fragmentShaderSource) {
            let vertexShader = this.loadShader(_vertexShaderSource, WebEngine.gl2.VERTEX_SHADER);
            let fragmentShader = this.loadShader(_fragmentShaderSource, WebEngine.gl2.FRAGMENT_SHADER);
            this.createProgram(vertexShader, fragmentShader);
            this.detectAttributes();
            this.detectUniforms();
        }
        // Utility methods.######################################################################################
        /**
         * Compiles shader from sourcestring.
         * @param _source The sourcevariable holding a GLSL shaderstring.
         * @param _shaderType The type of the shader to be compiled. (vertex or fragment).
         */
        loadShader(_source, _shaderType) {
            let shader = WebEngine.gl2.createShader(_shaderType);
            WebEngine.gl2.shaderSource(shader, _source);
            WebEngine.gl2.compileShader(shader);
            let error = WebEngine.gl2.getShaderInfoLog(shader);
            if (error !== "") {
                throw new Error("Error compiling shader: " + error);
            }
            // Check for any compilation errors.
            if (!WebEngine.gl2.getShaderParameter(shader, WebEngine.gl2.COMPILE_STATUS)) {
                alert(WebEngine.gl2.getShaderInfoLog(shader));
                return null;
            }
            return shader;
        }
        /**
         * Create shaderprogramm that will be used on GPU.
         * @param vertexShader The compiled vertexshader to be used by the programm.
         * @param fragmentShader The compiled fragmentshader to be used by the programm.
         */
        createProgram(vertexShader, fragmentShader) {
            this.program = WebEngine.gl2.createProgram();
            WebEngine.gl2.attachShader(this.program, vertexShader);
            WebEngine.gl2.attachShader(this.program, fragmentShader);
            WebEngine.gl2.linkProgram(this.program);
            let error = WebEngine.gl2.getProgramInfoLog(this.program);
            if (error !== "") {
                throw new Error("Error linking Shader: " + error);
            }
        }
        /**
         * Use this shader in Rendercontext on callup.
         */
        use() {
            WebEngine.gl2.useProgram(this.program);
        }
        /**
         * Iterates through all active attributes on an instance of shader and saves them in an associative array with the attribute's name as key and the location as value
         */
        detectAttributes() {
            let attributeCount = WebEngine.gl2.getProgramParameter(this.program, WebEngine.gl2.ACTIVE_ATTRIBUTES);
            for (let i = 0; i < attributeCount; i++) {
                let attributeInfo = WebEngine.gl2.getActiveAttrib(this.program, i);
                if (!attributeInfo) {
                    break;
                }
                this.attributes[attributeInfo.name] = WebEngine.gl2.getAttribLocation(this.program, attributeInfo.name);
            }
        }
        /**
        * Iterates through all active uniforms on an instance of shader and saves them in an associative array with the attribute's name as key and the location as value
        */
        detectUniforms() {
            let uniformCount = WebEngine.gl2.getProgramParameter(this.program, WebEngine.gl2.ACTIVE_UNIFORMS);
            for (let i = 0; i < uniformCount; i++) {
                let info = WebEngine.gl2.getActiveUniform(this.program, i);
                if (!info) {
                    break;
                }
                this.uniforms[info.name] = WebEngine.gl2.getUniformLocation(this.program, info.name);
            }
        }
    } // End class.
    WebEngine.Shader = Shader;
})(WebEngine || (WebEngine = {})); // End namespace.
//# sourceMappingURL=Shader.js.map