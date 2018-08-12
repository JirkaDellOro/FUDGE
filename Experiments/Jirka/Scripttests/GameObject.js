var Scripttest;
(function (Scripttest) {
    class GameObject {
        constructor(_scriptName) {
            this.scriptName = _scriptName;
            this.scriptObject = new Scripttest[this.scriptName];
        }
    }
    Scripttest.GameObject = GameObject;
})(Scripttest || (Scripttest = {}));
//# sourceMappingURL=GameObject.js.map