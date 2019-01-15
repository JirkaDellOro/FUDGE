var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var WebGl2Test3D;
(function (WebGl2Test3D) {
    /**
     * Represents a webGL Shader.
     */
    var Shader = /** @class */ (function (_super) {
        __extends(Shader, _super);
        /**
         * Creates a new shader.
         * @param _name The name of this shader.
         * @param _vertexSRC The variable holding the GLSL vertexshaderstring.
         * @param _fragmentSRC The variable holding the GLSL vertexshaderstring.
         */
        function Shader(_vertexShaderSource, _fragmentShaderSource) {
            var _this = _super.call(this) || this;
            _this.attributes = {}; // Associative array of shader atrributes.
            _this.uniforms = {}; // Associative array of shader uniforms.
            _this.setName("Shader");
            var vertexShader = _this.loadShader(_vertexShaderSource, WebGl2Test3D.gl2.VERTEX_SHADER);
            var fragmentShader = _this.loadShader(_fragmentShaderSource, WebGl2Test3D.gl2.FRAGMENT_SHADER);
            _this.createProgram(vertexShader, fragmentShader);
            _this.detectAttributes();
            _this.detectUniforms();
            return _this;
        }
        /**
         * Returns the name of this shader.
         */
        Shader.prototype.getShaderName = function () {
            return this.getName();
        };
        /**
         * Use this shader in Rendercontext on callup.
         */
        Shader.prototype.use = function () {
            WebGl2Test3D.gl2.useProgram(this.program);
        };
        /**
         * Get location of attribute by its name.
         * @param _name Name of the attribute to locate.
         */
        Shader.prototype.getAttributeLocation = function (_name) {
            if (this.attributes[_name] === undefined) {
                throw new Error("Unable to find attribute named  '" + _name + "'in shader named '" + this.getName() + "'");
            }
            return this.attributes[_name];
        };
        /**
          * Get location of uniform by its name.
          * @param _name Name of the attribute to locate.
          */
        Shader.prototype.getUniformLocation = function (_name) {
            if (this.uniforms[_name] === undefined) {
                throw new Error("Unable to find attribute named  '" + _name + "'in shader named '" + this.getName() + "'");
            }
            return this.uniforms[_name];
        };
        /**
         * Compiles shader from sourcestring.
         * @param _source The sourcevariable holding a GLSL shaderstring.
         * @param _shaderType The type of the shader to be compiled. (vertex or fragment).
         */
        Shader.prototype.loadShader = function (_source, _shaderType) {
            var shader = WebGl2Test3D.gl2.createShader(_shaderType);
            WebGl2Test3D.gl2.shaderSource(shader, _source);
            WebGl2Test3D.gl2.compileShader(shader);
            var error = WebGl2Test3D.gl2.getShaderInfoLog(shader);
            if (error !== "") {
                throw new Error("Error compiling shader '" + this.getName() + "': " + error);
            }
            // Check for any compilation errors.
            if (!WebGl2Test3D.gl2.getShaderParameter(shader, WebGl2Test3D.gl2.COMPILE_STATUS)) {
                alert(WebGl2Test3D.gl2.getShaderInfoLog(shader));
                return null;
            }
            console.log("shaderLoaded: " + _source);
            return shader;
        };
        /**
         * Create shaderprogramm that will be used on GPU.
         * @param vertexShader The compiled vertexshader to be used by the programm.
         * @param fragmentShader The compiled fragmentshader to be used by the programm.
         */
        Shader.prototype.createProgram = function (vertexShader, fragmentShader) {
            this.program = WebGl2Test3D.gl2.createProgram();
            WebGl2Test3D.gl2.attachShader(this.program, vertexShader);
            WebGl2Test3D.gl2.attachShader(this.program, fragmentShader);
            WebGl2Test3D.gl2.linkProgram(this.program);
            var error = WebGl2Test3D.gl2.getProgramInfoLog(this.program);
            if (error !== "") {
                throw new Error("Error linking Shader'" + this.getName() + "': " + error);
            }
        };
        /**
         * Iterates through all existing attributes on an instance of shader and saves them in an associative array with the attribute's name as key and the location as value
         */
        Shader.prototype.detectAttributes = function () {
            var attributeCount = WebGl2Test3D.gl2.getProgramParameter(this.program, WebGl2Test3D.gl2.ACTIVE_ATTRIBUTES);
            for (var i = 0; i < attributeCount; i++) {
                var attributeInfo = WebGl2Test3D.gl2.getActiveAttrib(this.program, i);
                if (!attributeInfo) {
                    break;
                }
                this.attributes[attributeInfo.name] = WebGl2Test3D.gl2.getAttribLocation(this.program, attributeInfo.name);
            }
        };
        /**
        * Iterates through all existing uniforms on an instance of shader and saves them in an associative array with the attribute's name as key and the location as value
        */
        Shader.prototype.detectUniforms = function () {
            var uniformCount = WebGl2Test3D.gl2.getProgramParameter(this.program, WebGl2Test3D.gl2.ACTIVE_UNIFORMS);
            for (var i = 0; i < uniformCount; i++) {
                var info = WebGl2Test3D.gl2.getActiveUniform(this.program, i);
                if (!info) {
                    break;
                }
                this.uniforms[info.name] = WebGl2Test3D.gl2.getUniformLocation(this.program, info.name);
            }
        };
        return Shader;
    }(WebGl2Test3D.Component));
    WebGl2Test3D.Shader = Shader;
})(WebGl2Test3D || (WebGl2Test3D = {}));
//# sourceMappingURL=Shader.js.map