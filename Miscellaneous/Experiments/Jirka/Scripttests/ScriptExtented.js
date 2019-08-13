var Scripttest;
(function (Scripttest) {
    class Sub extends Scripttest.Script {
        constructor() {
            super();
            console.log("Sub created");
        }
    }
    Scripttest.Sub = Sub;
})(Scripttest || (Scripttest = {}));
//# sourceMappingURL=ScriptExtented.js.map