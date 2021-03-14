declare module ModuleTest {
    class ClassB {
        static sayHello(): void;
    }
}
declare module ModuleTest {
    class ClassA extends ClassB {
        private x;
        static sayHello(): void;
        static test(_b: ClassB): void;
    }
}
