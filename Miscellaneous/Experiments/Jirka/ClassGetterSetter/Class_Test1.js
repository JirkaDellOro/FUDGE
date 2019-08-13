class CPoint {
    constructor() {
        this.x = 10;
        this.y = 10;
    }
    set $x(_x) {
        console.log("Setter called");
        this.x = _x;
    }
    get $x() {
        console.log("Getter called");
        return this.x;
    }
    test() {
        console.log("Hallo");
    }
}
var c = new CPoint();
c.x = 10;
c.$x = 20;
var d = [];
printClass(c);
function printClass(_a) {
    console.log(_a);
}
//# sourceMappingURL=Class_Test1.js.map