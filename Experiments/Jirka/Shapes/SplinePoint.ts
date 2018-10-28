namespace Shapes {
    export class SplinePoint {
        x: number;
        y: number;
        xd1: number;
        yd1: number;
        xd2: number;
        yd2: number;

        constructor(_x: number, _y: number, _xd1: number, _yd1: number, _xd2: number, _yd2: number) {
            this.x = _x;
            this.y = _y;
            this.xd1 = _xd1;
            this.yd1 = _yd1;
            this.xd2 = _xd2;
            this.yd2 = _yd2;
        }
    }
}