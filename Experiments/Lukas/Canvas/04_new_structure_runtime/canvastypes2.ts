module DrawTypes2 {

	import Vector2 = Utils.Vector2;
	export class DrawObject {
		public color: string | CanvasGradient | CanvasPattern;
		public name: String;
		public order: number;

		constructor(color: string | CanvasGradient | CanvasPattern = "black", name = "", order = 0) {
			this.color = color;
			this.name = name;
			this.order = order;
		}

		static sort(a: DrawObject, b: DrawObject): number {
			return a.order - b.order;
		}
	}

	export class DrawPath extends DrawObject {
		private closed: boolean;
		private path2d: Path2D;
		public points: Vertex[];
		public fillColor: string | CanvasGradient | CanvasPattern;

		constructor(points: Vertex[], color: string | CanvasGradient | CanvasPattern = "rgba(0,0,0,0)", fillColor: string | CanvasGradient | CanvasPattern, name = "", order = 0) {
			super(color, name, order);
			this.fillColor = fillColor;
			this.points = points;
			this.closed = false;
		}

		draw(context: CanvasRenderingContext2D, includeCorners: boolean = false) {
			this.generatePath2D();
			context.fillStyle = this.fillColor;
			context.fill(this.path2d);
			context.strokeStyle = this.color;
			context.stroke(this.path2d);

			if (includeCorners) {
				for (let point of this.points) {
					point.draw(context);
				}
			}
		}

		generatePath2D() {
			this.path2d = new Path2D();
			if (this.points.length < 1) return;
			this.path2d.moveTo(this.points[0].x, this.points[0].y);
			for (let i: number = 1; i < this.points.length; i++) {
				this.path2d.bezierCurveTo(
					this.points[i - 1].tangentOut.x, this.points[i - 1].tangentOut.y,
					this.points[i].tangentIn.x, this.points[i].tangentIn.y,
					this.points[i].x, this.points[i].y);
			}
			if (this.closed) {
				this.path2d.bezierCurveTo(
					this.points[this.points.length - 1].tangentOut.x, this.points[this.points.length - 1].tangentOut.y,
					this.points[0].tangentIn.x, this.points[0].tangentIn.y,
					this.points[0].x, this.points[0].y
				);
				this.path2d.closePath();
			}
		}

		addVertexToEnd(bcp1: Vertex) {
			this.points.push(bcp1);
			this.generatePath2D();
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

		setClosed(closed: boolean) {
			this.closed = closed;
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
		// public cap: CanvasLineCap;

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
			this.generatePath2D();
		}

		getPath2D(): Path2D {
			return this.path;
		}

		generatePath2D(): Path2D {
			this.path = new Path2D();
			this.path.arc(this.x, this.y, 5, 0, 2 * Math.PI);
			this.path.closePath();
			return this.path;
		}

		draw(context: CanvasRenderingContext2D) {
			context.stroke(this.generatePath2D());
		}


		move(dx: number, dy: number): Path2D {
			let deltaX: number;
			let deltaY: number;
			this.x += dx;
			this.y += dy;
			this.generatePath2D();
			return this.path;
		}
	}

	export class Vertex extends DrawPoint {
		tangentIn: TangentPoint;
		tangentOut: TangentPoint;

		constructor(x: number, y: number, tIn: TangentPoint = null, tOut: TangentPoint = null, parent: DrawPath = null) {
			super(x, y, parent);
			if (tIn == null) tIn = new TangentPoint(x, y, parent);
			if (tOut == null) tOut = new TangentPoint(x, y, parent);
			this.tangentIn = tIn;
			this.tangentOut = tOut;
		}
	}

	export class TangentPoint extends DrawPoint {

	}
}