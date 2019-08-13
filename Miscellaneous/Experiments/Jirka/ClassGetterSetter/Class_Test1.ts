class CPoint {// implements IPoint {
    x: number;
    y: number;
    d: number;

    constructor() {
        this.x = 10;
        this.y = 10;
    }

    set $x(_x: number) {
        console.log("Setter called");
        this.x = _x;
    }

    get $x(): number {
        console.log("Getter called");
        return this.x;
    }

    test(): void {
        console.log("Hallo");
    }
}

var c: CPoint = new CPoint();
c.x = 10;
c.$x = 20;
var d: CPoint[] = [];

printClass(c);

function printClass(_a: CPoint): void {
    console.log(_a);
}