var ModuleTest;
(function (ModuleTest) {
    class ClassA extends ModuleTest.ClassB {
        static sayHello() {
            console.log("Hello from ClassA");
        }
    }
    ModuleTest.ClassA = ClassA;
})(ModuleTest || (ModuleTest = {}));
//# sourceMappingURL=ClassA.js.map