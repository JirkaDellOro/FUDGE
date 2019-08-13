System.register(["./a", "./b", "./c"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (a_1_1) {
                exports_1({
                    "a": a_1_1["a"]
                });
            },
            function (b_1_1) {
                exports_1({
                    "b": b_1_1["b"]
                });
            },
            function (c_1_1) {
                exports_1({
                    "c": c_1_1["c"]
                });
            }
        ],
        execute: function () {
        }
    };
});
