"use strict";
export var nt = NamespaceTest = {};
var NamespaceTest;
(function (NamespaceTest) {
    class A {
        constructor() {
            console.log("Here is class", this.constructor.name);
        }
        test() {
            console.log("Testing", this.constructor.name);
        }
    }
    NamespaceTest.A = A;
})(NamespaceTest || (NamespaceTest = {}));
var NamespaceTest;
(function (NamespaceTest) {
    class B extends NamespaceTest.A {
    }
    NamespaceTest.B = B;
})(NamespaceTest || (NamespaceTest = {}));
//# sourceMappingURL=Test.mjs.map