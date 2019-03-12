namespace Shapes {
    export class Shape extends Component {
        splinePoints: SplinePoint[] = [];
        fillColor: string = "red";
        lineColor: string = "black";
        lineWidth: number = 1;
        closed: boolean = false;

        constructor() {
            super();
            this.singleton = true;
        }

        addPoint(_x: number, _y: number, _xd1: number, _yd1: number, _xd2: number, _yd2: number): void {
            let sp: SplinePoint = new SplinePoint(_x, _y, _xd1, _yd1, _xd2, _yd2);
            this.splinePoints.push(sp);
        }

        draw(c: CanvasRenderingContext2D): void {
            c.save();
            c.lineWidth = this.lineWidth;
            c.strokeStyle = this.lineColor;
            c.fillStyle = this.fillColor;
            c.fill();
            c.stroke();
            c.restore();
        }

        createPath(_c: CanvasRenderingContext2D): void {
            if (this.splinePoints.length == 0)
                return;

            _c.beginPath();
            let spFrom: SplinePoint = this.splinePoints[0];
            _c.moveTo(spFrom.x, spFrom.y);
            for (let i: number = 1; i < this.splinePoints.length; i++) {
                let spTo: SplinePoint = this.splinePoints[i];
                _c.bezierCurveTo(
                    spFrom.x + spFrom.xd2, spFrom.y + spFrom.yd2,
                    spTo.x + spTo.xd1, spTo.y + spTo.yd1,
                    spTo.x, spTo.y);
                spFrom = spTo;
            }
            if (this.closed)
                _c.closePath();
        }
    }
}