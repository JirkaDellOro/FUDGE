var Shapes;
(function (Shapes) {
    class Shape extends Shapes.Component {
        constructor() {
            super();
            this.splinePoints = [];
            this.fillColor = "red";
            this.lineColor = "black";
            this.lineWidth = 1;
            this.closed = false;
            this.singleton = true;
        }
        addPoint(_x, _y, _xd1, _yd1, _xd2, _yd2) {
            let sp = new Shapes.SplinePoint(_x, _y, _xd1, _yd1, _xd2, _yd2);
            this.splinePoints.push(sp);
        }
        draw(c) {
            c.save();
            c.lineWidth = this.lineWidth;
            c.strokeStyle = this.lineColor;
            c.fillStyle = this.fillColor;
            c.fill();
            c.stroke();
            c.restore();
        }
        createPath(_c) {
            if (this.splinePoints.length == 0)
                return;
            _c.beginPath();
            let spFrom = this.splinePoints[0];
            _c.moveTo(spFrom.x, spFrom.y);
            for (let i = 1; i < this.splinePoints.length; i++) {
                let spTo = this.splinePoints[i];
                _c.bezierCurveTo(spFrom.x + spFrom.xd2, spFrom.y + spFrom.yd2, spTo.x + spTo.xd1, spTo.y + spTo.yd1, spTo.x, spTo.y);
                spFrom = spTo;
            }
            if (this.closed)
                _c.closePath();
        }
    }
    Shapes.Shape = Shape;
})(Shapes || (Shapes = {}));
//# sourceMappingURL=Shape.js.map