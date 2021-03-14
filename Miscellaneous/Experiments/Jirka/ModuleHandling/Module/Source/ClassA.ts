///<reference path="ClassB.ts"/>

module ModuleTest {
  export class ClassA extends ClassB {
    private x: number = 10;
    static sayHello(): void {
      console.log("Hello from ClassA");
      ClassA.test(new ClassB());
    }

    static test(_b: ClassB): void {
      console.log(_b);
    }
  }
}
