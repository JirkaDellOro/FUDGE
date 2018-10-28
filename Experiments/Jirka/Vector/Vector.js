var Vector;
(function (Vector) {
    var Vector2D = (function () {
        function Vector2D(_x, _y) {
            this.setXY(_x, _y);
        }
        Vector2D.prototype.setXY = function (_x, _y) {
            this.x = _x;
            this.y = _y;
        };
        Vector2D.prototype.setVector = function (_v) {
            this.setXY(_v.x, _v.y);
        };
        Vector2D.prototype.getDistanceTo = function (_v) {
            var dx = this.x - _v.x;
            var dy = this.y - _v.y;
            return Math.sqrt(dx * dx + dy * dy);
        };
        Vector2D.prototype.getLength = function () {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        };
        Vector2D.prototype.getDiff = function (_subtract) {
            return new Vector2D(this.x - _subtract.x, this.y - _subtract.y);
        };
        Vector2D.prototype.getSum = function (_add) {
            return new Vector2D(this.x + _add.x, this.y + _add.y);
        };
        Vector2D.prototype.subtract = function (_subtract) {
            this.x -= _subtract.x;
            this.y -= _subtract.y;
        };
        Vector2D.prototype.add = function (_add) {
            this.x += _add.x;
            this.y += _add.y;
        };
        Vector2D.prototype.scale = function (_s) {
            this.x *= _s;
            this.y *= _s;
        };
        Vector2D.prototype.normalize = function () {
            var l = this.getLength();
            if (l > 0)
                this.scale(1 / l);
        };
        return Vector2D;
    }());
    Vector.Vector2D = Vector2D;
})(Vector || (Vector = {}));
//# sourceMappingURL=Vector.js.map