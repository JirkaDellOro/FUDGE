var Shapes;
(function (Shapes) {
    class SplinePoint {
        constructor(_x, _y, _xd1, _yd1, _xd2, _yd2) {
            this.x = _x;
            this.y = _y;
            this.xd1 = _xd1;
            this.yd1 = _yd1;
            this.xd2 = _xd2;
            this.yd2 = _yd2;
        }
    }
    Shapes.SplinePoint = SplinePoint;
})(Shapes || (Shapes = {}));
//# sourceMappingURL=SplinePoint.js.map