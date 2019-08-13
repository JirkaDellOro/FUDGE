"use strict";
/// <reference path="ClassB.ts"/>;
var ModuleTest;
(function (ModuleTest) {
    //import * as ClassB from "ClassB";
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
//# sourceMappingURL=ClassA.js.map