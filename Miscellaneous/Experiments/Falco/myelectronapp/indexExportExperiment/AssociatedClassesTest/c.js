System.register([], function (exports_1, context_1) {
    "use strict";
    var c;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            c = /** @class */ (function () {
                function c() {
                    this.name = "C";
                }
                c.prototype.c_speak = function () {
                    console.log(name);
                };
                return c;
            }());
            exports_1("c", c);
        }
    };
});
