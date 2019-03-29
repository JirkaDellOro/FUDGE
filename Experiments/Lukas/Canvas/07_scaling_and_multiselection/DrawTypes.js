var DrawTypes;
(function (DrawTypes) {
    var Vector2 = Utils.Vector2;
    class DrawObject {
        constructor(color = "black", name = "", order = 0, lineWidth = 1) {
            this.color = color;
            this.name = name;
            this.order = order;
            this.lineWidth = lineWidth;
        }
        static sort(a, b) {
            return a.order - b.order;
        }
    }
    DrawTypes.DrawObject = DrawObject;
    class DrawPath extends DrawObject {
        constructor(points, color = "rgba(0,0,0,0)", fillColor, name = "", order = 0, lineWidth = 0) {
            super(color, name, order, lineWidth);
            this.fillColor = fillColor;
            this.points = points;
            this.closed = false;
        }
        draw(context, selected = false) {
            this.generatePath2D();
            context.fillStyle = this.fillColor;
            context.fill(this.path2d);
            context.strokeStyle = this.color;
            context.lineWidth = this.lineWidth > 0 ? this.lineWidth : 1 / VectorEditor.scale;
            context.stroke(this.path2d);
            if (selected) {
                for (let point of this.points) {
                    point.draw(context);
                }
            }
        }
        generatePath2D() {
            this.path2d = new Path2D();
            if (this.points.length < 1)
                return;
            this.path2d.moveTo(this.points[0].x, this.points[0].y);
            for (let i = 1; i < this.points.length; i++) {
                this.path2d.bezierCurveTo(this.points[i - 1].tangentOut.x, this.points[i - 1].tangentOut.y, this.points[i].tangentIn.x, this.points[i].tangentIn.y, this.points[i].x, this.points[i].y);
            }
            if (this.closed) {
                this.path2d.bezierCurveTo(this.points[this.points.length - 1].tangentOut.x, this.points[this.points.length - 1].tangentOut.y, this.points[0].tangentIn.x, this.points[0].tangentIn.y, this.points[0].x, this.points[0].y);
                this.path2d.closePath();
            }
        }
        addVertexToEnd(bcp1) {
            bcp1.parent = this;
            this.points.push(bcp1);
            this.generatePath2D();
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
                point.tangentIn.move(deltaX, deltaY);
                point.tangentOut.move(deltaX, deltaY);
            }
            this.generatePath2D();
            return this.path2d;
        }
        setClosed(closed) {
            this.closed = closed;
        }
        setTangentsToThirdOfTheWays() {
            for (let i = 0; i < this.points.length; i++) {
                if (i == this.points.length - 1) {
                    this.points[i].tangentOut.x = this.points[i].x + (this.points[0].x - this.points[i].x) * 0.3;
                    this.points[i].tangentOut.y = this.points[i].y + (this.points[0].y - this.points[i].y) * 0.3;
                    this.points[i].tangentIn.x = this.points[i].x + (this.points[i - 1].x - this.points[i].x) * 0.3;
                    this.points[i].tangentIn.y = this.points[i].y + (this.points[i - 1].y - this.points[i].y) * 0.3;
                    continue;
                }
                if (i == 0) {
                    this.points[i].tangentOut.x = this.points[i].x + (this.points[i + 1].x - this.points[i].x) * 0.3;
                    this.points[i].tangentOut.y = this.points[i].y + (this.points[i + 1].y - this.points[i].y) * 0.3;
                    this.points[i].tangentIn.x = this.points[i].x + (this.points[this.points.length - 1].x - this.points[i].x) * 0.3;
                    this.points[i].tangentIn.y = this.points[i].y + (this.points[this.points.length - 1].y - this.points[i].y) * 0.3;
                    continue;
                }
                this.points[i].tangentOut.x = this.points[i].x + (this.points[i + 1].x - this.points[i].x) * 0.3;
                this.points[i].tangentOut.y = this.points[i].y + (this.points[i + 1].y - this.points[i].y) * 0.3;
                this.points[i].tangentIn.x = this.points[i].x + (this.points[i - 1].x - this.points[i].x) * 0.3;
                this.points[i].tangentIn.y = this.points[i].y + (this.points[i - 1].y - this.points[i].y) * 0.3;
            }
        }
        getPreviousVertex(v) {
            let index = this.points.indexOf(v);
            if (index < 0)
                return null;
            if (index == 0)
                return this.points[this.points.length - 1];
            return this.points[index - 1];
        }
        getNextVertex(v) {
            let index = this.points.indexOf(v);
            if (index < 0)
                return null;
            if (index == this.points.length - 1)
                return this.points[0];
            return this.points[index + 1];
        }
    }
    DrawTypes.DrawPath = DrawPath;
    class DrawLine {
        // public stroke: CanvasFillStrokeStyles;
        // public cap: CanvasLineCap;
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
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.generatePath2D();
        }
        getPath2D() {
            return this.path;
        }
        generatePath2D() {
            this.path = new Path2D();
            this.path.arc(this.x, this.y, 5 / VectorEditor.scale, 0, 2 * Math.PI);
            this.path.closePath();
            return this.path;
        }
        draw(context, selected = false) {
            context.strokeStyle = "#000";
            context.lineWidth = 1 / VectorEditor.scale;
            if (selected) {
                context.fillStyle = "#000";
                context.fill(this.generatePath2D());
            }
            context.stroke(this.generatePath2D());
        }
        move(dx, dy) {
            // if(!dx || !dy) return this.path;
            this.x += dx;
            this.y += dy;
            this.generatePath2D();
            return this.path;
        }
        moveTo(x, y) {
            // if(!x || !y) return this.path;
            this.x = x;
            this.y = y;
            this.generatePath2D();
            return this.path;
        }
    }
    DrawTypes.DrawPoint = DrawPoint;
    class Vertex extends DrawPoint {
        constructor(x, y, parent = null, tIn = null, tOut = null) {
            super(x, y);
            this.parent = parent;
            if (tIn == null)
                tIn = new TangentPoint(x, y, this);
            if (tOut == null)
                tOut = new TangentPoint(x, y, this);
            this.tangentIn = tIn;
            this.tangentOut = tOut;
        }
        draw(context, selected = false, showTangents = false) {
            super.draw(context, selected);
            if (showTangents) {
                this.tangentIn.draw(context);
                this.tangentOut.draw(context);
                let line = new Path2D();
                line.lineTo(this.tangentIn.x, this.tangentIn.y);
                line.lineTo(this.x, this.y);
                line.lineTo(this.tangentOut.x, this.tangentOut.y);
                context.stroke(line);
            }
        }
        move(dx, dy) {
            if (VectorEditor.pressedKeys.indexOf(Utils.KEYCODE.CONTROL) < 0) {
                //TODO: On SHIFT make Tangents opposite of each other
                let newTInPos = determineNewTangentPoint(this, this.parent.getPreviousVertex(this), this.tangentIn, dx, dy);
                this.tangentIn.moveTo(newTInPos.x, newTInPos.y);
                let newTOutPos = determineNewTangentPoint(this, this.parent.getNextVertex(this), this.tangentOut, dx, dy);
                this.tangentOut.moveTo(newTOutPos.x, newTOutPos.y);
                let newOtInPos = determineNewTangentPoint(this, this.parent.getPreviousVertex(this), this.parent.getPreviousVertex(this).tangentOut, dx, dy);
                this.parent.getPreviousVertex(this).tangentOut.moveTo(newOtInPos.x, newOtInPos.y);
                let newOtOutPos = determineNewTangentPoint(this, this.parent.getNextVertex(this), this.parent.getNextVertex(this).tangentIn, dx, dy);
                this.parent.getNextVertex(this).tangentIn.moveTo(newOtOutPos.x, newOtOutPos.y);
            }
            return super.move(dx, dy);
        }
    }
    DrawTypes.Vertex = Vertex;
    function determineNewTangentPoint(movingVertex, stationaryVertex, tangent, dx, dy) {
        let ac = new Vector2(stationaryVertex.x - movingVertex.x, stationaryVertex.y - movingVertex.y);
        let ab = new Vector2(tangent.x - movingVertex.x, tangent.y - movingVertex.y);
        //calculate important stuff
        let magnitude = ac.sqrMagnitude();
        let acabProduct = Vector2.dot(ab, ac);
        let distance = acabProduct / magnitude;
        let p = new Vector2(movingVertex.x + ac.x * distance, movingVertex.y + ac.y * distance);
        let pb = new Vector2(tangent.x - p.x, tangent.y - p.y);
        let acPerpendicular = ac.perpendicularVector();
        let xScale = pb.x / acPerpendicular.x;
        let yScale = pb.y / acPerpendicular.y;
        let PBScale = xScale ? xScale : yScale;
        let newac = new Vector2(stationaryVertex.x - (movingVertex.x + dx), stationaryVertex.y - (movingVertex.y + dy));
        let newP = new Vector2(movingVertex.x + dx + newac.x * distance, movingVertex.y + dy + newac.y * distance);
        let newacPerpendicular = newac.perpendicularVector();
        let newX = newP.x + newacPerpendicular.x * PBScale;
        let newY = newP.y + newacPerpendicular.y * PBScale;
        return new Vector2(newX, newY);
    }
    class TangentPoint extends DrawPoint {
        constructor(x, y, parent) {
            super(x, y);
            this.parent = parent;
        }
        generatePath2D() {
            this.path = new Path2D();
            this.path.rect(this.x - 5 / VectorEditor.scale, this.y - 5 / VectorEditor.scale, 10 / VectorEditor.scale, 10 / VectorEditor.scale);
            return this.path;
        }
    }
    DrawTypes.TangentPoint = TangentPoint;
})(DrawTypes || (DrawTypes = {}));
//# sourceMappingURL=DrawTypes.js.map