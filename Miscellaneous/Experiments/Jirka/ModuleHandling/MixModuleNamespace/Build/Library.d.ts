declare namespace Library {
    enum ENUM {
        INTERFACE = "Interface",
        SUPERCLASS = "SuperClass",
        SUBCLASS = "SubClass"
    }
}
declare namespace Library {
    function getGreet(_name: string): string;
}
declare namespace Library {
    interface Interface {
        prop: string;
        sayHello(): void;
    }
}
declare namespace Library {
    class SuperClass implements Interface {
        prop: string;
        sayHello(): void;
    }
}
declare namespace Library {
    class SubClass extends SuperClass {
        constructor();
    }
}
