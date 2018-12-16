module DrawTypes {

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

	export class DrawPath extends DrawObject {
		private closed: boolean;
		private path2d: Path2D;
		public points: DrawPoint[];
		public fillColor: string | CanvasGradient | CanvasPattern;

		constructor(points: DrawPoint[], color: string | CanvasGradient | CanvasPattern = "rgba(0,0,0,0)", fillColor: string | CanvasGradient | CanvasPattern, name = "", order = 0) {
			super(color, name, order);
			this.fillColor = fillColor;
			this.points = points;
		}

		draw(context: CanvasRenderingContext2D) {
			context.fillStyle = this.fillColor;
			context.fill(this.path2d);
			context.strokeStyle = this.color;
			context.stroke(this.path2d);
		}

		generatePath2D() {
			this.path2d = new Path2D();
			if (this.points.length < 0) return;
			this.path2d.moveTo(this.points[0].x, this.points[0].y);
			for (let i: number = 3; i < this.points.length; i += 3) {
				this.path2d.bezierCurveTo(this.points[i - 2].x, this.points[i - 2].y, this.points[i - 1].x, this.points[i - 1].y, this.points[i].x, this.points[i].y);
			}
			this.path2d.closePath();
		}

		addLineToEnd(bcp1: DrawPoint, bcp2: DrawPoint, end: DrawPoint) {
			this.points.push(bcp1, bcp2, end);
			this.generatePath2D();
		}

		static sort(a: DrawObject, b: DrawObject): number {
			return a.order - b.order;
		}

		getPath2D(): Path2D {
			return this.path2d;
		}

		move(d: Vector2): Path2D;
		move(dx: number, dy: number): Path2D;
		move(dordx: number | Vector2, dy?: number): Path2D {
			let deltaX: number;
			let deltaY: number;
			if (typeof dordx == "number") {
				deltaX = dordx;
				deltaY = dy;
			} else {
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

		/*
		addLine(line: DrawLine): void {
			this.path.push(line);
			line.parent = this;
			this.closed = this.checkIfClosed();
			this.generatePoints();
		}

		checkIfClosed(): boolean {
			if (this.path.length > 0 &&
				this.path[0].startPoint.equals(this.path.slice(-1)[0].endPoint)) {
				for (let i: number = 0; i < this.path.length - 1; i++) {
					if (!this.path[i].endPoint.equals(this.path[i + 1].startPoint)) {
						return false;
					}
				}
				return true;
			}
			return false;
		}

		draw(context: CanvasRenderingContext2D): void {
			this.path2d = new Path2D();
			if (this.closed) {
				this.path2d.moveTo(this.path[0].startPoint.x, this.path[0].startPoint.y);

				for (let line of this.path) {
					this.path2d.bezierCurveTo(line.startBezierPoint.x, line.startBezierPoint.y, line.endBezierPoint.x, line.endBezierPoint.y, line.endPoint.x, line.endPoint.y);
					console.debug("drew line: ", line.startPoint.x, line.startPoint.y, line.startBezierPoint.x, line.startBezierPoint.y, line.endBezierPoint.x, line.endBezierPoint.y, line.endPoint.x, line.endPoint.y);
				}
				this.path2d.closePath()
				context.fillStyle = this.color;
				context.fill(this.path2d);
			} else {
				for (let line of this.path) {
					this.path2d.moveTo(line.startPoint.x, line.startPoint.y);
					this.path2d.bezierCurveTo(line.startBezierPoint.x, line.startBezierPoint.y, line.endBezierPoint.x, line.endBezierPoint.y, line.endPoint.x, line.endPoint.y);
					console.debug("drew line: ", line.startPoint.x, line.startPoint.y, line.startBezierPoint.x, line.startBezierPoint.y, line.endBezierPoint.x, line.endBezierPoint.y, line.endPoint.x, line.endPoint.y);
				}
			}
			context.stroke(this.path2d);
		}




		generatePoints(){
			this.points = [];
			for (let line of this.path) {
				let p: Path2D = new Path2D();
				p.arc(line.startPoint.x, line.startPoint.y, 5, 0, 2 * Math.PI);
				p.closePath();
				this.points.push(new DrawPoint(p, line.startPoint, this));
			}
			// console.log(this.points);
		}

		returnAndDrawCornerPoints(context: CanvasRenderingContext2D): DrawPoint[] {
			for(let point of this.points){
				context.fillStyle = "rgb(0,0,0)";
				context.fill();
				context.stroke(point.getPath2D());
			}
			return this.points;
		}

		changePoint(oldPoint: Vector2, newPoint:Vector2){					//KRÜCKE!!! UNBEDINGT ÄNDERN!
			for(let line of this.path){
				if (line.startPoint.equals(oldPoint)){
					line.startPoint = newPoint;
					line.startBezierPoint = newPoint;
				} else if (line.endPoint.equals(oldPoint)){
					line.endPoint = newPoint;
					line.endBezierPoint = newPoint;
				}
			}
		} */
	}

	export class DrawLine {
		public startPoint: Vector2;
		public endPoint: Vector2;
		public startBezierPoint: Vector2;
		public endBezierPoint: Vector2;
		// public width: number;
		// public color: string | CanvasGradient | CanvasPattern;
		public parent: DrawPath;
		// public stroke: CanvasFillStrokeStyles;
		public cap: CanvasLineCap;

		constructor(startPoint: Vector2, endPoint: Vector2, /* width: number = 1, color: string | CanvasGradient | CanvasPattern = "black", */ startBezierPoint?: Vector2, endBezierPoint?: Vector2) {
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

	export class DrawPoint {
		private path: Path2D;
		public x: number;
		public y: number;
		public parent: DrawPath;

		/*constructor(path: Path2D, point: Vector2, parent: DrawPath) {
			this.path = path;
			this.x = point.x;
			this.y = point.y;
			this.parent = parent;
		}
		*/
		constructor(x: number, y: number, parent: DrawPath = null) {
			this.x = x;
			this.y = y;
			this.parent = parent;
		}

		getPath2D(): Path2D {
			return this.path;
		}
	}
}