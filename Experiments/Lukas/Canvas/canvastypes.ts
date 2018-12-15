namespace drawTypes {

    export class Vector2 {
        public x: number;
        public y: number;
    }

    export class DrawObject {
        public color: string | CanvasGradient | CanvasPattern;
        public name: String;
        public order: number;

        constructor(color: string | CanvasGradient | CanvasPattern = "black", name = "", order = 0){
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

        constructor(path: DrawLine[], color: string | CanvasGradient | CanvasPattern = "black", name = "", order = 0){
            super(color, name, order);
            this.path = path;
            console.debug(this);
        }

        draw(context: CanvasRenderingContext2D) {
            context.beginPath();
            for (let line of this.path) {
                context.moveTo(line.startPoint.x, line.startPoint.y);
                context.bezierCurveTo(line.startBezierPoint.x, line.startBezierPoint.x, line.endBezierPoint.x, line.endBezierPoint.x, line.endPoint.x, line.endPoint.x);
            }
            if (closed) {
                context.closePath()
            }
            context.fillStyle = this.color;
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

        constructor(startPoint: Vector2, endPoint: Vector2, width: number = 1, color: string | CanvasGradient | CanvasPattern = "black", startBezierPoint?: Vector2, endBezierPoint?: Vector2){
            this.startPoint = startPoint;
            this.endPoint = endPoint;
            this.width = width;
            this.color = color;
            this.startBezierPoint = startBezierPoint;
            this.endBezierPoint = endBezierPoint;
            console.debug(this);
        }
    }
}