"use strict";
var TestColor;
(function (TestColor) {
    TestColor.square = {
        vertices: [
            -0.9, 0.9, 0,
            -0.9, 0.1, 0,
            -0.1, 0.1, 0,
            -0.1, 0.9, 0
        ],
        indices: [0, 1, 2, 0, 2, 3]
    };
    TestColor.triangle = {
        vertices: [
            0.1, 0.1, 0,
            0.5, 0.9, 0,
            0.9, 0.1, 0
        ],
        indices: [0, 1, 2]
    };
})(TestColor || (TestColor = {}));
//# sourceMappingURL=Meshes.js.map