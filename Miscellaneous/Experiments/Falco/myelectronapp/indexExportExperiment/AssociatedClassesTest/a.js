System.register([], function (exports_1, context_1) {
    "use strict";
    var a;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            a = /** @class */ (function () {
                function a() {
                    this.name = "A";
                }
                a.prototype.a_speak = function () {
                    console.log(name);
                };
                return a;
            }());
            exports_1("a", a);
        }
    };
});
