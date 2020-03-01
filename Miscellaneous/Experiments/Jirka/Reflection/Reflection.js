var Reflection;
(function (Reflection) {
    class Test {
        static register() {
            return this.registration.push(this) - 1;
        }
    }
    Test.registration = [];
    Test.id = Test.register();
    Reflection.Test = Test;
    class Sub extends Test {
    }
    Sub.id = Sub.register();
    Reflection.Sub = Sub;
    console.dir(Test.registration);
})(Reflection || (Reflection = {}));
//# sourceMappingURL=Reflection.js.map