var Scripttest;
(function (Scripttest) {
    class Script extends EventTarget {
        constructor() {
            super();
            console.log("Script created");
        }
        sayHello() {
            console.log("Hello from " + this.constructor.name);
        }
    }
    Scripttest.Script = Script;
})(Scripttest || (Scripttest = {}));
//# sourceMappingURL=Script.js.map