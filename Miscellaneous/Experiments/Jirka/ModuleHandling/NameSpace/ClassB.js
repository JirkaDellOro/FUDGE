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
//# sourceMappingURL=ClassB.js.map