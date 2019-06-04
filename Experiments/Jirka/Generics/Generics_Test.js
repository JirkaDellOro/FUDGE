"use strict";
var GenericsTest;
(function (GenericsTest) {
    class Base {
        constructor() {
            this.x = 10;
        }
        sayHello() {
            console.log("Hi, I'm Base");
        }
    }
    class Sub extends Base {
        constructor() {
            super(...arguments);
            this.t = "Hallo";
        }
        sayHello() {
            console.log("Hi, I'm Sub", this.t);
        }
    }
    class Sub2 extends Base {
        constructor() {
            super(...arguments);
            this.t = "Hallo again";
        }
        sayHello() {
            console.log("Hi, I'm Sub2", this.t);
        }
    }
    function implicitGeneric(_type) {
        let result = [new _type(), new _type()];
        return result;
    }
    implicitGeneric(Sub);
    let t = implicitGeneric(Sub);
    console.log(t);
    t[0].sayHello();
    let t2 = implicitGeneric(Sub2);
    console.log(t2);
    t2[0].sayHello();
    // t.forEach((t: Sub): void => { t.sayHello(); });
})(GenericsTest || (GenericsTest = {}));
//# sourceMappingURL=Generics_Test.js.map