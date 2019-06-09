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
        setRenderData(_gl, _shaderInfo) {
            let uLoc = _shaderInfo.uniforms["uColor"];
            _gl.uniform4fv(uLoc, this.color);
        }
    }
    TestLib.MaterialColor = MaterialColor;
})(TestLib || (TestLib = {}));
//# sourceMappingURL=Material.js.map