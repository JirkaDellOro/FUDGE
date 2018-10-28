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
var tah = new TypedArrayHandler();
tah.arr[0] = "123";
var res = printType("Hallo");
var gt;
gt = new GenericsTest();
//gt.t = "Hallo";
console.log(gt.getT());
console.log(typeof (gt));
//# sourceMappingURL=Generics_Test1.js.map