var Fudge;
(function (Fudge) {
    class Test {
        static sayHello() {
            console.log("Hello from the Test-Class of Fudge");
        }
        get x() { return this._x; }
        set x(v) { this._x = v; }
    }
    Fudge.Test = Test;
})(Fudge || (Fudge = {}));
//# sourceMappingURL=Fudge.js.map