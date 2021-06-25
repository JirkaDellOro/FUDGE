namespace Test {
  window.addEventListener("load", init);
  import lib = Library;

  function init(_event: Event): void {    
    console.group("Library");
    console.log(lib);
    console.groupEnd();

    console.group("Interface");
    let interface: lib.Interface = {
      prop: "Interface",
      sayHello: () => console.log(lib.getGreet(lib.ENUM.INTERFACE))
    };
    console.log(interface);
    interface.sayHello();
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
}