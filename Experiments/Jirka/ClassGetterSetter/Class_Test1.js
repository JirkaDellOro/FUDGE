var CPoint = (function () {
    function CPoint() {
        this.x = 10;
        this.y = 10;
    }
    Object.defineProperty(CPoint.prototype, "$x", {
        get: function () {
            console.log("Getter called");
            return this.x;
        },
        set: function (_x) {
            console.log("Setter called");
            this.x = _x;
        },
        enumerable: true,
        configurable: true
    });
    CPoint.prototype.test = function () {
        console.log("Hallo");
    };
    return CPoint;
}());
var c = new CPoint();
c.x = 10;
c.$x = 20;
var d = [];
printClass(c);
function printClass(_a) {
    console.log(_a);
}
//# sourceMappingURL=Class_Test1.js.map