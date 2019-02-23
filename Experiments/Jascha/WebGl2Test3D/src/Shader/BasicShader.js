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
var WebEngine;
(function (WebEngine) {
    /**
     * Represents a WebGL shaderprogram
     */
    var BasicShader = /** @class */ (function (_super) {
        __extends(BasicShader, _super);
        function BasicShader() {
            var _this = _super.call(this) || this;
            _this.load(_this.loadVertexShaderSource(), _this.loadFragmentShaderSource());
            return _this;
        }
        BasicShader.prototype.loadVertexShaderSource = function () {
            return "#version 300 es\n \n        // an attribute is an input (in) to a vertex shader.\n        // It will receive data from a buffer\n        in vec4 a_position;\n        in vec4 a_color;\n        in vec2 a_textureCoordinate;\n    \n        // The Matrix to transform the positions by.\n        uniform mat4 u_matrix;\n    \n    \n        // Varying color in the fragmentshader.\n        out vec4 v_color;\n        // Varying texture in the fragmentshader.\n        out vec2 v_textureCoordinate;\n    \n    \n        // all shaders have a main function.\n        void main() {  \n            // Multiply all positions by the matrix.   \n            vec4 position = u_matrix * a_position;\n    \n    \n            gl_Position = u_matrix * a_position;\n    \n            // Pass color to fragmentshader.\n            v_color = a_color;\n            v_textureCoordinate = a_textureCoordinate;\n        }\n        ";
        };
        BasicShader.prototype.loadFragmentShaderSource = function () {
            return "#version 300 es\n     \n            // fragment shaders don't have a default precision so we need\n            // to pick one. mediump is a good default. It means \"medium precision\"\n            precision mediump float;\n            \n            // Color passed from vertexshader.\n            in vec4 v_color;\n            // Texture passed from vertexshader.\n            in vec2 v_textureCoordinate;\n        \n        \n            uniform sampler2D u_texture;\n            // we need to declare an output for the fragment shader\n            out vec4 outColor;\n            \n            void main() {\n            outColor = v_color;\n            outColor = texture(u_texture, v_textureCoordinate) * v_color;\n            }";
        };
        return BasicShader;
    }(WebEngine.Shader));
    WebEngine.BasicShader = BasicShader;
})(WebEngine || (WebEngine = {}));
//# sourceMappingURL=BasicShader.js.map