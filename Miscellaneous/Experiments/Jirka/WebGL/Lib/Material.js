"use strict";
var TestLib;
(function (TestLib) {
    class Material {
    }
    TestLib.Material = Material;
    class MaterialColor extends Material {
        constructor(_r, _g, _b, _a) {
            super();
            this.color = new Float32Array([_r, _g, _b, _a]);
        }
        useRenderData(_gl, _shaderInfo) {
            let uLoc = _shaderInfo.uniforms["uColor"];
            _gl.uniform4fv(uLoc, this.color);
        }
    }
    TestLib.MaterialColor = MaterialColor;
    class MaterialTexture extends Material {
        constructor(_img) {
            super();
            this.image = _img;
        }
        useRenderData(_gl, _shaderInfo) {
            if (this.renderData) {
                // buffers exist
                _gl.activeTexture(WebGL2RenderingContext.TEXTURE0);
                _gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.renderData["texture"]);
                _gl.uniform1i(_shaderInfo.uniforms["uSampler"], 0);
            }
            else {
                this.renderData = {};
                const texture = _gl.createTexture();
                _gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);
                _gl.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, this.image);
                _gl.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
                _gl.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST);
                _gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);
                this.renderData["texture"] = texture;
                this.useRenderData(_gl, _shaderInfo);
            }
        }
    }
    TestLib.MaterialTexture = MaterialTexture;
})(TestLib || (TestLib = {}));
//# sourceMappingURL=Material.js.map