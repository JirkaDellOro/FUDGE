var GenericsTest;
(function (GenericsTest_1) {
    function printType(_p) {
        var p;
        console.log(typeof (p) == typeof (_p));
        return p;
    }
    class GenericsTest {
        constructor() {
            //
        }
        getT() {
            return this.t;
        }
    }
    class TypedArrayHandler {
        constructor() {
            this.arr = new Array(10);
        }
    }
    class Base {
        sayHello() {
            console.log("Hi, I'm Base");
        }
    }
    class Sub extends Base {
        sayHello() {
            console.log("Hi, I'm Sub");
        }
    }
    function implicitGeneric(_type) {
        let result = [new _type(), new _type()];
        return result;
    }
    var tah = new TypedArrayHandler();
    tah.arr[0] = "123";
    var res = printType("Hallo");
    var gt;
    gt = new GenericsTest();
    //gt.t = "Hallo";
    console.log(gt.getT());
    console.log(typeof (gt));
    let t = implicitGeneric(Sub);
    console.log(t);
    t.forEach((t) => { t.sayHello(); });
})(GenericsTest || (GenericsTest = {}));
//# sourceMappingURL=Generics_Test.js.map