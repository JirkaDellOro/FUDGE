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
var DrawTypes;
(function (DrawTypes) {
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
    DrawTypes.Vector2 = Vector2;
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
    DrawTypes.DrawObject = DrawObject;
    var DrawPath = /** @class */ (function (_super) {
        __extends(DrawPath, _super);
        function DrawPath(points, color, fillColor, name, order) {
            if (color === void 0) { color = "rgba(0,0,0,0)"; }
            if (name === void 0) { name = ""; }
            if (order === void 0) { order = 0; }
            var _this = _super.call(this, color, name, order) || this;
            _this.fillColor = fillColor;
            _this.points = points;
            return _this;
        }
        DrawPath.prototype.draw = function (context) {
            context.fillStyle = this.fillColor;
            context.fill(this.path2d);
            context.strokeStyle = this.color;
            context.stroke(this.path2d);
        };
        DrawPath.prototype.generatePath2D = function () {
            this.path2d = new Path2D();
            if (this.points.length < 0)
                return;
            this.path2d.moveTo(this.points[0].x, this.points[0].y);
            for (var i = 3; i < this.points.length; i += 3) {
                this.path2d.bezierCurveTo(this.points[i - 2].x, this.points[i - 2].y, this.points[i - 1].x, this.points[i - 1].y, this.points[i].x, this.points[i].y);
            }
            this.path2d.closePath();
        };
        DrawPath.prototype.addLineToEnd = function (bcp1, bcp2, end) {
            this.points.push(bcp1, bcp2, end);
            this.generatePath2D();
        };
        DrawPath.sort = function (a, b) {
            return a.order - b.order;
        };
        DrawPath.prototype.getPath2D = function () {
            return this.path2d;
        };
        DrawPath.prototype.move = function (dordx, dy) {
            if (typeof dordx == "number") {
                for (var i = 0; i < this.points.length; i++) {
                    // console.log("two coords", point, dordx, dy);
                    this.points[i].x -= dordx;
                    this.points[i].y -= dy;
                    // console.log(point);
                }
            }
            else {
                for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
                    var point = _a[_i];
                    point.x -= dordx.x;
                    point.y -= dordx.y;
                }
            }
            this.generatePath2D();
            return this.path2d;
        };
        return DrawPath;
    }(DrawObject));
    DrawTypes.DrawPath = DrawPath;
    var DrawLine = /** @class */ (function () {
        function DrawLine(startPoint, endPoint, /* width: number = 1, color: string | CanvasGradient | CanvasPattern = "black", */ startBezierPoint, endBezierPoint) {
            this.startPoint = startPoint;
            this.endPoint = endPoint;
            // this.width = width;
            // this.color = color;
            this.startBezierPoint = (startBezierPoint) ? startBezierPoint : startPoint;
            this.endBezierPoint = endBezierPoint ? endBezierPoint : endPoint;
            // console.debug("Created new DrawLine Object ↓");
            // console.debug(this);
        }
        return DrawLine;
    }());
    DrawTypes.DrawLine = DrawLine;
    var DrawPoint = /** @class */ (function () {
        /*constructor(path: Path2D, point: Vector2, parent: DrawPath) {
            this.path = path;
            this.x = point.x;
            this.y = point.y;
            this.parent = parent;
        }
        */
        function DrawPoint(x, y, parent) {
            this.x = x;
            this.y = y;
            this.parent = parent;
        }
        DrawPoint.prototype.getPath2D = function () {
            return this.path;
        };
        return DrawPoint;
    }());
    DrawTypes.DrawPoint = DrawPoint;
})(DrawTypes || (DrawTypes = {}));
//# sourceMappingURL=canvastypes.js.map