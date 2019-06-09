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
})(TestLib || (TestLib = {}));
//# sourceMappingURL=Meshes.js.map