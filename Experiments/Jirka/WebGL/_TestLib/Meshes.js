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
        indices: [0, 1, 2, 0, 2, 3]
    };
    TestLib.triangle = {
        vertices: [
            0.1, 0.1, 0,
            0.5, 0.9, 0,
            0.9, 0.1, 0
        ],
        indices: [0, 1, 2]
    };
    TestLib.penta = {
        vertices: [
            -0.5, -0.1, 0,
            -0.9, -0.45, 0,
            -0.7, -0.9, 0,
            -0.3, -0.9, 0,
            -0.1, -0.45, 0
        ],
        indices: [0, 1, 2, 0, 2, 3, 0, 3, 4]
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
        indices: [0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5]
    };
})(TestLib || (TestLib = {}));
//# sourceMappingURL=Meshes.js.map