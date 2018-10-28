function printType(_p) {
    var p;
    console.log(typeof (p) == typeof (_p));
    return p;
}
var GenericsTest = (function () {
    function GenericsTest() {
        //
    }
    GenericsTest.prototype.getT = function () {
        return this.t;
    };
    return GenericsTest;
}());
var TypedArrayHandler = (function () {
    function TypedArrayHandler() {
        this.arr = new Array(10);
    }
    return TypedArrayHandler;
}());
var tah = new TypedArrayHandler();
tah.arr[0] = "123";
var res = printType("Hallo");
var gt;
gt = new GenericsTest();
//gt.t = "Hallo";
console.log(gt.getT());
console.log(typeof (gt));
//# sourceMappingURL=Generics_Test1.js.map