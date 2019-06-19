"use strict";
var TestLib;
(function (TestLib) {
    TestLib.square = {
        vertices: [
            -0.9, 0.9, 0,
            -0.9, 0.1, 0,
            -0.1, 0.1, 0,
            -0.1, 0.9, 0
        ],
        indices: [0, 1, 2, 0, 2, 3],
        getTextureUVs: function () { return calcTextureUVs(this); }
    };
    TestLib.triangle = {
        vertices: [
            0.1, 0.1, 0,
            0.5, 0.9, 0,
            0.9, 0.1, 0
        ],
        indices: [0, 1, 2],
        getTextureUVs: function () { return calcTextureUVs(this); }
    };
    TestLib.penta = {
        vertices: [
            -0.5, -0.1, 0,
            -0.9, -0.45, 0,
            -0.7, -0.9, 0,
            -0.3, -0.9, 0,
            -0.1, -0.45, 0
        ],
        indices: [0, 1, 2, 0, 2, 3, 0, 3, 4],
        getTextureUVs: function () { return calcTextureUVs(this); }
    };
    TestLib.hexa = {
        vertices: [
            0.7, -0.1, 0,
            0.3, -0.1, 0,
            0.1, -0.5, 0,
            0.3, -0.9, 0,
            0.7, -0.9, 0,
            0.9, -0.5, 0
        ],
        indices: [0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5],
        getTextureUVs: function () { return calcTextureUVs(this); }
    };
    function calcTextureUVs(_mesh) {
        console.log(_mesh);
        let result = [];
        for (let i = 0; i < _mesh.vertices.length; i += 3) {
            result.push((_mesh.vertices[i] + 1) % 1);
            result.push((_mesh.vertices[i + 1] + 1) % 1);
        }
        return result;
    }
    TestLib.calcTextureUVs = calcTextureUVs;
})(TestLib || (TestLib = {}));
//# sourceMappingURL=Meshes.js.map