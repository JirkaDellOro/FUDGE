"use strict";
var ModuleTest;
(function (ModuleTest) {
    class ClassB {
        static sayHello() {
            console.log("Hello from ClassB");
        }
    }
    ModuleTest.ClassB = ClassB;
})(ModuleTest || (ModuleTest = {}));
/// <reference path="ClassB.ts"/>;
var ModuleTest;
(function (ModuleTest) {
    class ClassA extends ModuleTest.ClassB {
        constructor() {
            super(...arguments);
            this.x = 10;
        }
        static sayHello() {
            console.log("Hello from ClassA");
            ClassA.test(new ModuleTest.ClassB());
        }
        static test(_b) {
            console.log(_b);
        }
    }
    ModuleTest.ClassA = ClassA;
    ClassA.sayHello();
})(ModuleTest || (ModuleTest = {}));
//# sourceMappingURL=Test.js.map