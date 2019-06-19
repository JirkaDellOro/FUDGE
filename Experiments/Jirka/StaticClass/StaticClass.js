"use strict";
var StaticClass;
(function (StaticClass) {
    class Base {
        get type() {
            return this.constructor.name;
        }
        static addClass(_class) {
            return Base.classRegister.push(_class);
        }
    }
    Base.classRegister = [];
    class Sub1 extends Base {
        constructor() {
            super();
            console.log("Hi, I'm an instance of Sub1");
        }
    }
    Sub1.iRegister = Base.addClass(Sub1);
    StaticClass.Sub1 = Sub1;
    class Sub2 extends Base {
        constructor() {
            super();
            console.log("Hi, I'm an instance of Sub2");
        }
    }
    Sub2.iRegister = Base.addClass(Sub2);
    StaticClass.Sub2 = Sub2;
    for (let type of Base.classRegister)
        console.log(type);
    for (let i = 0; i < 10; i++) {
        let choice = Math.round(Math.random());
        let typeChosen = Base.classRegister[choice];
        // console.log(typeChosen);
        let instance = new typeChosen();
        console.log(instance.type);
    }
})(StaticClass || (StaticClass = {}));
//# sourceMappingURL=StaticClass.js.map