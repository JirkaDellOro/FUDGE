// /<reference path="ClassB.ts"/>
import { ClassB } from "./ClassB.js";
export class ClassA extends ClassB {
    constructor() {
        super(...arguments);
        this.x = 10;
    }
    static sayHello() {
        console.log("Hello from ClassA");
        ClassA.test(new ClassB());
    }
    static test(_b) {
        console.log(_b);
    }
}
//# sourceMappingURL=ClassA.js.map