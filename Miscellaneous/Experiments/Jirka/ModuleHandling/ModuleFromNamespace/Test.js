var Test;
(function (Test) {
    window.addEventListener("load", init);
    var lib = Library;
    // init(null);
    function init(_event) {
        console.group("Library");
        console.log(lib);
        console.groupEnd();
        console.group("Interface");
        let interface = {
            prop: "Interface",
            sayHello: () => console.log(lib.getGreet(lib.ENUM.INTERFACE))
        };
        console.log(interface);
        interface.sayHello();
        console.groupEnd();
        console.group("SuperClass");
        let sup = new lib.SuperClass();
        console.log(sup);
        sup.sayHello();
        console.groupEnd();
        console.group("SubClass");
        let sub = new lib.SubClass();
        console.log(sub);
        sub.sayHello();
        console.groupEnd();
        let test = new Test.TestClass();
        console.log(test);
    }
})(Test || (Test = {}));
///<reference types="./Build/Library"/>
var Test;
///<reference types="./Build/Library"/>
(function (Test) {
    var lib = Library;
    class TestClass {
        constructor() {
            this.sub = new lib.SubClass();
        }
    }
    Test.TestClass = TestClass;
})(Test || (Test = {}));
//# sourceMappingURL=Test.js.map