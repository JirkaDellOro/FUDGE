var Curves;
(function (Curves) {
    var V2 = Vector.Vector2D;
    class ControlPoint extends V2 {
        constructor(_num, _position) {
            super(_position.x, _position.y);
            this.radius = 5;
            this.number = _num;
        }
        /**
         * Display this object as a circle with its color and size
         */
        display() {
            crc2.beginPath();
            crc2.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            crc2.fillText(this.number.toString(), this.x + this.radius, this.y - this.radius);
            crc2.stroke();
        }
        /**
       * Returns true if the coordinates given are within the size of this object
       */
        testHit(_hit) {
            return this.getDistanceTo(_hit) < this.radius;
        }
    }
    Curves.ControlPoint = ControlPoint;
})(Curves || (Curves = {}));
//# sourceMappingURL=ControlPoint.js.map