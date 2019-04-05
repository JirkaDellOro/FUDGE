/// <reference path="ClassB.ts"/>;
namespace ModuleTest {
    export class ClassA extends ClassB {
        static sayHello(): void {
            console.log("Hello from ClassA");
            ClassA.test(new ClassB());
        }

        static test(_b: ClassA): void {
            console.log(_b);
        }
        private x: number = 10;
    }

    ClassA.sayHello();
}
