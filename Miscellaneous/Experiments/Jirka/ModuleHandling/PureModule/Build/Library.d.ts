export declare namespace Library {
    export enum ENUM {
        INTERFACE = "Interface",
        SUPERCLASS = "SuperClass",
        SUBCLASS = "SubClass"
    }
}
export declare namespace Library {
    export function getGreet(_name: string): string;
}
export declare namespace Library {
    export interface Interface {
        prop: string;
        sayHello(): void;
    }
}
export declare namespace Library {
    export class SuperClass implements Interface {
        prop: string;
        sayHello(): void;
    }
}
export declare namespace Library {
    export class SubClass extends SuperClass {
        constructor();
    }
}
