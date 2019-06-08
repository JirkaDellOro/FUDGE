"use strict";
var TestVAO;
(function (TestVAO) {
    TestVAO.square = {
        vertices: [
            -0.9, 0.9, 0,
            -0.9, 0.1, 0,
            -0.1, 0.1, 0,
            -0.1, 0.9, 0
        ],
        indices: [0, 1, 2, 0, 2, 3]
    };
    TestVAO.triangle = {
        vertices: [
            0.1, 0.1, 0,
            0.5, 0.9, 0,
            0.9, 0.1, 0
        ],
        indices: [0, 1, 2]
    };
})(TestVAO || (TestVAO = {}));
//# sourceMappingURL=Meshes.js.map