"use strict";
var SerializeChain;
(function (SerializeChain) {
    class A extends Object {
        get type() {
            return this.constructor.name;
        }
        getType(_o) {
            return _o.constructor.name;
        }
        printInfo() {
            console.log("--A");
            console.log(this.type);
            console.log(this.constructor.name);
        }
    }
    class B extends A {
        printInfo() {
            console.log("--B");
            console.log(this.type);
            console.log(super.constructor.name);
            super.printInfo();
        }
    }
    class C extends B {
        printInfo() {
            console.log("--C");
            console.log(this.type);
            console.log(super.constructor.name);
            super.printInfo();
        }
    }
    let c = new C();
    c.printInfo();
})(SerializeChain || (SerializeChain = {}));
//# sourceMappingURL=Serialize.js.map