var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Curves;
(function (Curves) {
    var V2 = Vector.Vector2D;
    var ControlPoint = (function (_super) {
        __extends(ControlPoint, _super);
        function ControlPoint(_num, _position) {
            _super.call(this, _position.x, _position.y);
            this.radius = 5;
            this.number = _num;
        }
        /**
         * Display this object as a circle with its color and size
         */
        ControlPoint.prototype.display = function () {
            crc2.beginPath();
            crc2.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            crc2.fillText(this.number.toString(), this.x + this.radius, this.y - this.radius);
            crc2.stroke();
        };
        /**
       * Returns true if the coordinates given are within the size of this object
       */
        ControlPoint.prototype.testHit = function (_hit) {
            return this.getDistanceTo(_hit) < this.radius;
        };
        return ControlPoint;
    }(V2));
    Curves.ControlPoint = ControlPoint;
})(Curves || (Curves = {}));
//# sourceMappingURL=ControlPoint.js.map