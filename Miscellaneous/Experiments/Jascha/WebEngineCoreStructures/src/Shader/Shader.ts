namespace WebEngine {
    /**
     * Abstract superclass for the representation of WebGl shaderprograms. 
     * Adjusted version of a class taken from Travis Vromans WebGL 2D-GameEngine
     */
    export  abstract class Shader {


        private program: WebGLProgram; // Declaration of graphicprocessing-programm.
        private attributes: { [name: string]: number } = {}; // Associative array of shader atrributes.
        private uniforms: { [name: string]: WebGLUniformLocation } = {}; // Associative array of shader uniforms.

        /**
         * Creates a new shader.
         */
        public constructor() {
        }

        // Get and set methods.######################################################################################
        /**
         * Get location of an attribute by its name.
         * @param _name Name of the attribute to locate.
         */
        public getAttributeLocation(_name: string): number {
            if (this.attributes[_name] === undefined) {
                return null;
            }
            return this.attributes[_name];
        }
        /**
          * Get location of uniform by its name.
          * @param _name Name of the attribute to locate.
          */
        public getUniformLocation(_name: string): WebGLUniformLocation {
            if (this.uniforms[_name] === undefined) {
                return null;
            }
            return this.uniforms[_name];
        }
        
        protected load(_vertexShaderSource: string, _fragmentShaderSource: string):void{
            let vertexShader = this.loadShader(_vertexShaderSource, gl2.VERTEX_SHADER);
            let fragmentShader = this.loadShader(_fragmentShaderSource, gl2.FRAGMENT_SHADER);
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
        private loadShader(_source: string, _shaderType: number): WebGLShader {
            let shader: WebGLShader = gl2.createShader(_shaderType);
            gl2.shaderSource(shader, _source);
            gl2.compileShader(shader);
            let error: string = gl2.getShaderInfoLog(shader);
            if (error !== "") {
                throw new Error("Error compiling shader: " + error);
            }
            // Check for any compilation errors.
            if (!gl2.getShaderParameter(shader, gl2.COMPILE_STATUS)) {
                alert(gl2.getShaderInfoLog(shader));
                return null;
            }
            return shader;
        }
        /**
         * Create shaderprogramm that will be used on GPU.
         * @param vertexShader The compiled vertexshader to be used by the programm.
         * @param fragmentShader The compiled fragmentshader to be used by the programm.
         */
        private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): void {
            this.program = gl2.createProgram();

            gl2.attachShader(this.program, vertexShader);
            gl2.attachShader(this.program, fragmentShader);

            gl2.linkProgram(this.program);

            let error = gl2.getProgramInfoLog(this.program);
            if (error !== "") {
                throw new Error("Error linking Shader: " + error);
            }
        }
        /**
         * Use this shader in Rendercontext on callup.
         */
        public use(): void {
            gl2.useProgram(this.program);
        }
        /**
         * Iterates through all active attributes on an instance of shader and saves them in an associative array with the attribute's name as key and the location as value
         */
        private detectAttributes(): void {
            let attributeCount: number = gl2.getProgramParameter(this.program, gl2.ACTIVE_ATTRIBUTES);
            for (let i: number = 0; i < attributeCount; i++) {
                let attributeInfo: WebGLActiveInfo = gl2.getActiveAttrib(this.program, i);
                if (!attributeInfo) {
                    break;
                }
                this.attributes[attributeInfo.name] = gl2.getAttribLocation(this.program, attributeInfo.name);
            }
        }
        /**
        * Iterates through all active uniforms on an instance of shader and saves them in an associative array with the attribute's name as key and the location as value
        */
        private detectUniforms(): void {
            let uniformCount: number = gl2.getProgramParameter(this.program, gl2.ACTIVE_UNIFORMS);
            for (let i: number = 0; i < uniformCount; i++) {
                let info: WebGLActiveInfo = gl2.getActiveUniform(this.program, i);
                if (!info) {
                    break;
                }
                this.uniforms[info.name] = gl2.getUniformLocation(this.program, info.name);
            }
        }
    }// End class.
}// End namespace.