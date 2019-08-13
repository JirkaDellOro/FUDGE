var DrawTypes;
(function (DrawTypes) {
    class Vector2 {
        constructor(x, y = 0) {
            this.x = x;
            this.y = y;
        }
        equals(obj) {
            if (this.x != obj.x)
                return false;
            if (this.y != obj.y)
                return false;
            return true;
        }
    }
    DrawTypes.Vector2 = Vector2;
    class DrawObject {
        constructor(color = "black", name = "", order = 0) {
            this.color = color;
            this.name = name;
            this.order = order;
        }
    }
    DrawTypes.DrawObject = DrawObject;
    class DrawPath extends DrawObject {
        constructor(points, color = "rgba(0,0,0,0)", fillColor, name = "", order = 0) {
            super(color, name, order);
            this.fillColor = fillColor;
            this.points = points;
        }
        draw(context) {
            context.fillStyle = this.fillColor;
            context.fill(this.path2d);
            context.strokeStyle = this.color;
            context.stroke(this.path2d);
        }
        generatePath2D() {
            this.path2d = new Path2D();
            if (this.points.length < 0)
                return;
            this.path2d.moveTo(this.points[0].x, this.points[0].y);
            for (let i = 3; i < this.points.length; i += 3) {
                this.path2d.bezierCurveTo(this.points[i - 2].x, this.points[i - 2].y, this.points[i - 1].x, this.points[i - 1].y, this.points[i].x, this.points[i].y);
            }
            this.path2d.closePath();
        }
        addLineToEnd(bcp1, bcp2, end) {
            this.points.push(bcp1, bcp2, end);
            this.generatePath2D();
        }
        static sort(a, b) {
            return a.order - b.order;
        }
        getPath2D() {
            return this.path2d;
        }
        move(dordx, dy) {
            let deltaX;
            let deltaY;
            if (typeof dordx == "number") {
                deltaX = dordx;
                deltaY = dy;
            }
            else {
                deltaX = dordx.x;
                deltaY = dordx.y;
            }
            for (let point of this.points) {
                point.x += deltaX;
                point.y += deltaY;
            }
            this.generatePath2D();
            return this.path2d;
        }
    }
    DrawTypes.DrawPath = DrawPath;
    class DrawLine {
        constructor(startPoint, endPoint, /* width: number = 1, color: string | CanvasGradient | CanvasPattern = "black", */ startBezierPoint, endBezierPoint) {
            this.startPoint = startPoint;
            this.endPoint = endPoint;
            // this.width = width;
            // this.color = color;
            this.startBezierPoint = (startBezierPoint) ? startBezierPoint : startPoint;
            this.endBezierPoint = endBezierPoint ? endBezierPoint : endPoint;
            // console.debug("Created new DrawLine Object ↓");
            // console.debug(this);
        }
    }
    DrawTypes.DrawLine = DrawLine;
    class DrawPoint {
        /*constructor(path: Path2D, point: Vector2, parent: DrawPath) {
            this.path = path;
            this.x = point.x;
            this.y = point.y;
            this.parent = parent;
        }
        */
        constructor(x, y, parent = null) {
            this.x = x;
            this.y = y;
            this.parent = parent;
        }
        getPath2D() {
            return this.path;
        }
    }
    DrawTypes.DrawPoint = DrawPoint;
})(DrawTypes || (DrawTypes = {}));
//# sourceMappingURL=canvastypes.js.map