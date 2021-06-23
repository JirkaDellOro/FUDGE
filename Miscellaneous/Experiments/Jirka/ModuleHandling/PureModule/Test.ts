import { Library } from "./Build/Library.js";
import { TestClass } from "./Test2.js";

window.addEventListener("load", init);
// import lib = Library;
let lib: typeof Library;

async function init(_event: Event): Promise<void> {
  lib = Library;
  console.group("Library");
  console.log(lib);
  console.groupEnd();

  console.group("Interface");
  let interfacex: Library.Interface = {
    prop: "Interface",
    sayHello: () => console.log(lib.getGreet(lib.ENUM.INTERFACE))
  };
  console.log(interfacex);
  interfacex.sayHello();
  console.groupEnd();

  console.group("SuperClass");
  let sup: Library.SuperClass = new lib.SuperClass();
  console.log(sup);
  sup.sayHello();
  console.groupEnd();

  console.group("SubClass");
  let sub: Library.SubClass = new lib.SubClass();
  console.log(sub);
  sub.sayHello();
  console.groupEnd();

  let test: TestClass = new TestClass();
  console.log(test);
}