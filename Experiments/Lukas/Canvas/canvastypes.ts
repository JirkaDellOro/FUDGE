namespace drawTypes {

    export class Vector2 {
        public x: number;
        public y: number;

        constructor(x: number, y: number = 0) {
            this.x = x;
            this.y = y;
        }

        equals(obj: Vector2): boolean {
            if (this.x != obj.x) return false;
            if (this.y != obj.y) return false;
            return true;
        }
    }

    export class DrawObject {
        public color: string | CanvasGradient | CanvasPattern;
        public name: String;
        public order: number;

        constructor(color: string | CanvasGradient | CanvasPattern = "black", name = "", order = 0) {
            this.color = color;
            this.name = name;
            this.order = order;
        }
    }

    export class ColorStop {
        private _offset: number;
        public color: string;
        get offset(): number {
            return this._offset;
        }
        set offset(newOffset: number) {
            if (0 <= newOffset && newOffset <= 1) {
                this._offset = newOffset;
            } else {
                console.warn(`Tried to set ColorStop offset to ${newOffset} but only 0..1 is allowed.`)
            }
        }
    }

    export class DrawPath extends DrawObject {
        public path: DrawLine[];
        public closed: boolean;

        constructor(path: DrawLine[], color: string | CanvasGradient | CanvasPattern = "black", name = "", order = 0) {
            super(color, name, order);
            this.path = path;

            // console.debug("Created new DrawPath Object ↓");
            // console.debug(this);

            this.checkIfClosed();
        }

        checkIfClosed(): void {
            console.debug(this.path.length);
            console.debug(this.path[0]);
            console.debug(this.path.slice(-1)[0]);
            if (this.path.length > 0 &&
                this.path[0].startPoint.equals(this.path.slice(-1)[0].endPoint)) {
                this.closed = true;
            } else {
                this.closed = false;
            }
            console.debug("closed: " + this.closed);

        }

        draw(context: CanvasRenderingContext2D): void {
            context.beginPath();
            if (this.closed) {
                context.moveTo(this.path[0].startPoint.x, this.path[0].startPoint.y);

                for (let line of this.path) {
                    context.bezierCurveTo(line.startBezierPoint.x, line.startBezierPoint.y, line.endBezierPoint.x, line.endBezierPoint.y, line.endPoint.x, line.endPoint.y);
                    console.debug("drew line: ", line.startPoint.x, line.startPoint.y, line.startBezierPoint.x, line.startBezierPoint.y, line.endBezierPoint.x, line.endBezierPoint.y, line.endPoint.x, line.endPoint.y);
                }

                context.closePath()
            } else {
                for (let line of this.path) {
                    context.moveTo(line.startPoint.x, line.startPoint.y);
                    context.bezierCurveTo(line.startBezierPoint.x, line.startBezierPoint.y, line.endBezierPoint.x, line.endBezierPoint.y, line.endPoint.x, line.endPoint.y);
                    console.debug("drew line: ", line.startPoint.x, line.startPoint.y, line.startBezierPoint.x, line.startBezierPoint.y, line.endBezierPoint.x, line.endBezierPoint.y, line.endPoint.x, line.endPoint.y);
                }
            }
            context.fillStyle = this.color;
            context.fill();
            context.stroke();
        }
    }

    export class DrawLine {
        public startPoint: Vector2;
        public endPoint: Vector2;
        public startBezierPoint: Vector2;
        public endBezierPoint: Vector2;
        public width: number;
        public color: string | CanvasGradient | CanvasPattern;
        public parent: DrawPath;
        // public stroke: CanvasFillStrokeStyles;
        public cap: CanvasLineCap;

        constructor(startPoint: Vector2, endPoint: Vector2, width: number = 1, color: string | CanvasGradient | CanvasPattern = "black", startBezierPoint?: Vector2, endBezierPoint?: Vector2) {
            this.startPoint = startPoint;
            this.endPoint = endPoint;
            this.width = width;
            this.color = color;
            this.startBezierPoint = (startBezierPoint) ? startBezierPoint : startPoint;
            this.endBezierPoint = endBezierPoint ? endBezierPoint : endPoint;
            // console.debug("Created new DrawLine Object ↓");
            // console.debug(this);
        }
    }
}