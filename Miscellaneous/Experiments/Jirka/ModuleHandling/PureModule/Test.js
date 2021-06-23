import { Library } from "./Build/Library.js";
import { TestClass } from "./Test2.js";
window.addEventListener("load", init);
// import lib = Library;
let lib;
// export { lib };
async function init(_event) {
    lib = Library;
    console.group("Library");
    console.log(lib);
    console.groupEnd();
    console.group("Interface");
    let interfacex = {
        prop: "Interface",
        sayHello: () => console.log(lib.getGreet(lib.ENUM.INTERFACE))
    };
    console.log(interfacex);
    interfacex.sayHello();
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
    let test = new TestClass();
    console.log(test);
}
//# sourceMappingURL=Test.js.map