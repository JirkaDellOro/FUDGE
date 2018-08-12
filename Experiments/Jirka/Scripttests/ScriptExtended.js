var Scripttest;
(function (Scripttest) {
    class ScriptExtended extends Scripttest.Script {
        constructor() {
            super();
            console.log("ScriptExtended created");
        }
    }
    Scripttest.ScriptExtended = ScriptExtended;
})(Scripttest || (Scripttest = {}));
//# sourceMappingURL=ScriptExtended.js.map