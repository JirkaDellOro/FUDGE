//import { ModuleTest } from "./Build/Module.js";
// /<reference types="./Build/Library"/>
var Test;
(function (Test) {
    var lib = Library;
    console.group("Library");
    console.log(Library);
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
})(Test || (Test = {}));
//# sourceMappingURL=Test.js.map