"use strict";
var Library;
(function (Library) {
    console.group("Loading Library");
    let ENUM;
    (function (ENUM) {
        ENUM["INTERFACE"] = "Interface";
        ENUM["SUPERCLASS"] = "SuperClass";
        ENUM["SUBCLASS"] = "SubClass";
    })(ENUM = Library.ENUM || (Library.ENUM = {}));
})(Library || (Library = {}));
var Library;
(function (Library) {
    function getGreet(_name) {
        return "Hello from " + _name;
    }
    Library.getGreet = getGreet;
})(Library || (Library = {}));
var Library;
(function (Library) {
    class SuperClass {
        constructor() {
            this.prop = Library.ENUM.SUPERCLASS;
        }
        sayHello() {
            console.log(Library.getGreet(this.prop));
        }
    }
    Library.SuperClass = SuperClass;
    let sup = new SuperClass();
    sup.sayHello();
})(Library || (Library = {}));
///<reference path="SuperClass.ts"/>
var Library;
///<reference path="SuperClass.ts"/>
(function (Library) {
    class SubClass extends Library.SuperClass {
        constructor() {
            super();
            this.prop = Library.ENUM.SUBCLASS;
        }
    }
    Library.SubClass = SubClass;
    let sub = new SubClass();
    sub.sayHello();
    console.groupEnd();
})(Library || (Library = {}));
//# sourceMappingURL=Library.js.map