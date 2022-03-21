namespace Consumer {
  import lib = Library;

  console.group("Library");
  console.log(Library);
  console.log(lib);
  console.groupEnd();

  console.group("Interface");
  let inter: lib.Interface = {
    prop: "Interface",
    sayHello: () => console.log(lib.getGreet(lib.ENUM.INTERFACE))
  };
  console.log(inter);
  inter.sayHello();
  console.groupEnd();

  console.group("SuperClass");
  let sup: lib.SuperClass = new lib.SuperClass();
  console.log(sup);
  sup.sayHello();
  console.groupEnd();

  console.group("SubClass");
  let sub: lib.SubClass = new lib.SubClass();
  console.log(sub);
  sub.sayHello();
  console.groupEnd();

  console.group("ConsumerClass");
  let consumer: ConsumerClass = new ConsumerClass();
  console.log(consumer);
  console.groupEnd();
}