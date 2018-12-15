var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var drawTypes;
(function (drawTypes) {
    var Vector2 = /** @class */ (function () {
        function Vector2(x, y) {
            if (y === void 0) { y = 0; }
            this.x = x;
            this.y = y;
        }
        Vector2.prototype.equals = function (obj) {
            if (this.x != obj.x)
                return false;
            if (this.y != obj.y)
                return false;
            return true;
        };
        return Vector2;
    }());
    drawTypes.Vector2 = Vector2;
    var DrawObject = /** @class */ (function () {
        function DrawObject(color, name, order) {
            if (color === void 0) { color = "black"; }
            if (name === void 0) { name = ""; }
            if (order === void 0) { order = 0; }
            this.color = color;
            this.name = name;
            this.order = order;
        }
        return DrawObject;
    }());
    drawTypes.DrawObject = DrawObject;
    var ColorStop = /** @class */ (function () {
        function ColorStop() {
        }
        Object.defineProperty(ColorStop.prototype, "offset", {
            get: function () {
                return this._offset;
            },
            set: function (newOffset) {
                if (0 <= newOffset && newOffset <= 1) {
                    this._offset = newOffset;
                }
                else {
                    console.warn("Tried to set ColorStop offset to " + newOffset + " but only 0..1 is allowed.");
                }
            },
            enumerable: true,
            configurable: true
        });
        return ColorStop;
    }());
    drawTypes.ColorStop = ColorStop;
    var DrawPath = /** @class */ (function (_super) {
        __extends(DrawPath, _super);
        function DrawPath(path, color, name, order) {
            if (color === void 0) { color = "rgba(0,0,0,0)"; }
            if (name === void 0) { name = ""; }
            if (order === void 0) { order = 0; }
            var _this = _super.call(this, color, name, order) || this;
            _this.path = path;
            // console.debug("Created new DrawPath Object ↓");
            // console.debug(this);
            _this.closed = _this.checkIfClosed();
            console.debug("closed: " + _this.closed);
            return _this;
        }
        DrawPath.prototype.checkIfClosed = function () {
            if (this.path.length > 0 &&
                this.path[0].startPoint.equals(this.path.slice(-1)[0].endPoint)) {
                for (var i = 0; i < this.path.length - 1; i++) {
                    if (!this.path[i].endPoint.equals(this.path[i + 1].startPoint)) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        };
        DrawPath.prototype.draw = function (context) {
            context.beginPath();
            if (this.closed) {
                context.moveTo(this.path[0].startPoint.x, this.path[0].startPoint.y);
                for (var _i = 0, _a = this.path; _i < _a.length; _i++) {
                    var line = _a[_i];
                    context.bezierCurveTo(line.startBezierPoint.x, line.startBezierPoint.y, line.endBezierPoint.x, line.endBezierPoint.y, line.endPoint.x, line.endPoint.y);
                    console.debug("drew line: ", line.startPoint.x, line.startPoint.y, line.startBezierPoint.x, line.startBezierPoint.y, line.endBezierPoint.x, line.endBezierPoint.y, line.endPoint.x, line.endPoint.y);
                }
                context.closePath();
                context.fillStyle = this.color;
                context.fill();
            }
            else {
                for (var _b = 0, _c = this.path; _b < _c.length; _b++) {
                    var line = _c[_b];
                    context.moveTo(line.startPoint.x, line.startPoint.y);
                    context.bezierCurveTo(line.startBezierPoint.x, line.startBezierPoint.y, line.endBezierPoint.x, line.endBezierPoint.y, line.endPoint.x, line.endPoint.y);
                    console.debug("drew line: ", line.startPoint.x, line.startPoint.y, line.startBezierPoint.x, line.startBezierPoint.y, line.endBezierPoint.x, line.endBezierPoint.y, line.endPoint.x, line.endPoint.y);
                }
            }
            context.stroke();
        };
        return DrawPath;
    }(DrawObject));
    drawTypes.DrawPath = DrawPath;
    var DrawLine = /** @class */ (function () {
        function DrawLine(startPoint, endPoint, width, color, startBezierPoint, endBezierPoint) {
            if (width === void 0) { width = 1; }
            if (color === void 0) { color = "black"; }
            this.startPoint = startPoint;
            this.endPoint = endPoint;
            this.width = width;
            this.color = color;
            this.startBezierPoint = (startBezierPoint) ? startBezierPoint : startPoint;
            this.endBezierPoint = endBezierPoint ? endBezierPoint : endPoint;
            // console.debug("Created new DrawLine Object ↓");
            // console.debug(this);
        }
        return DrawLine;
    }());
    drawTypes.DrawLine = DrawLine;
})(drawTypes || (drawTypes = {}));
//# sourceMappingURL=canvastypes.js.map