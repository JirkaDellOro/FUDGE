System.register([], function (exports_1, context_1) {
    "use strict";
    var b;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            b = /** @class */ (function () {
                function b() {
                    this.name = "B";
                }
                b.prototype.b_speak = function () {
                    console.log(name);
                };
                return b;
            }());
            exports_1("b", b);
        }
    };
});
