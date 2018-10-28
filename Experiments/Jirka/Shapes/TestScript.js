var Shapes;
(function (Shapes) {
    class TestScript extends Shapes.Script {
        sayHello() {
            console.log("Hello");
        }
    }
    Shapes.TestScript = TestScript;
})(Shapes || (Shapes = {}));
//# sourceMappingURL=TestScript.js.map