"use strict"; 
import {Library} from "./Library.js";
var Consumer;
(function (Consumer) {
    var lib = Library;
    class ConsumerClass {
        constructor() {
            this.sub = new lib.SubClass();
        }
    }
    Consumer.ConsumerClass = ConsumerClass;
})(Consumer || (Consumer = {}));
var Consumer;
(function (Consumer) {
    var lib = Library;
    console.group("Library");
    console.log(Library);
    console.log(lib);
    console.groupEnd();
    console.group("Interface");
    let inter = {
        prop: "Interface",
        sayHello: () => console.log(lib.getGreet(lib.ENUM.INTERFACE))
    };
    console.log(inter);
    inter.sayHello();
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
    console.group("ConsumerClass");
    let consumer = new Consumer.ConsumerClass();
    console.log(consumer);
    console.groupEnd();
})(Consumer || (Consumer = {}));
//# sourceMappingURL=Consumer.js.map