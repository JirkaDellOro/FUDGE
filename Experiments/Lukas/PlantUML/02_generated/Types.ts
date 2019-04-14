import Vector2 = Utils.Vector2;
export class DrawObject {
	public color: string | CanvasGradient | CanvasPattern;
	public name: String;
	public order: number;
	public lineWidth: number;

	constructor(color: string | CanvasGradient | CanvasPattern = "black", name: string = "", order = 0, lineWidth: number = 1) {
		this.color = color;
		this.name = name;
		this.order = order;
		this.lineWidth = lineWidth;
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

	constructor(points: Vertex[], color: string | CanvasGradient | CanvasPattern = "rgba(0,0,0,0)", fillColor: string | CanvasGradient | CanvasPattern, name = "", order = 0, lineWidth = 0) {
		super(color, name, order, lineWidth);
		this.fillColor = fillColor;
		this.points = points;
		this.closed = false;
	}

	draw(context: CanvasRenderingContext2D, selected: boolean = false) {
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
		bcp1.parent = this;

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
			point.tangentIn.move(deltaX, deltaY);
			point.tangentOut.move(deltaX, deltaY);
		}
		this.generatePath2D();
		return this.path2d;
	}

	setClosed(closed: boolean) {
		this.closed = closed;
	}

	setTangentsToThirdOfTheWays() {
		for (let i: number = 0; i < this.points.length; i++) {
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

	getPreviousVertex(v: Vertex): Vertex {
		let index: number = this.points.indexOf(v);
		if (index < 0) return null;
		if (index == 0) return this.points[this.points.length - 1];
		return this.points[index - 1];
	}

	getNextVertex(v: Vertex): Vertex {
		let index: number = this.points.indexOf(v);
		if (index < 0) return null;
		if (index == this.points.length - 1) return this.points[0];
		return this.points[index + 1];
	}
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
	protected path: Path2D;
	public x: number;
	public y: number;

	/*constructor(path: Path2D, point: Vector2, parent: DrawPath) {
		this.path = path;
		this.x = point.x;
		this.y = point.y;
		this.parent = parent;
	}
	*/
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.generatePath2D();
	}

	getPath2D(): Path2D {
		return this.path;
	}

	generatePath2D(): Path2D {
		this.path = new Path2D();
		this.path.arc(this.x, this.y, 5 / VectorEditor.scale, 0, 2 * Math.PI);
		this.path.closePath();
		return this.path;
	}

	draw(context: CanvasRenderingContext2D, selected: boolean = false) {
		context.strokeStyle = "#000";
		context.lineWidth = 1 / VectorEditor.scale;
		if (selected) {
			context.fillStyle = "#000";
			context.fill(this.generatePath2D());
		}
		context.stroke(this.generatePath2D());
	}

	move(dx: number, dy: number): Path2D {
		// if(!dx || !dy) return this.path;
		this.x += dx;
		this.y += dy;
		this.generatePath2D();
		return this.path;
	}

	moveTo(x: number, y: number): Path2D {
		// if(!x || !y) return this.path;
		this.x = x;
		this.y = y;
		this.generatePath2D();
		return this.path;
	}
}



export class Vertex extends DrawPoint {
	tangentIn: TangentPoint;
	tangentOut: TangentPoint;
	public parent: DrawPath;

	constructor(x: number, y: number, parent: DrawPath = null, tIn: TangentPoint = null, tOut: TangentPoint = null) {
		super(x, y);
		this.parent = parent;
		if (tIn == null) tIn = new TangentPoint(x, y, this);
		if (tOut == null) tOut = new TangentPoint(x, y, this);
		this.tangentIn = tIn;
		this.tangentOut = tOut;
	}

	draw(context: CanvasRenderingContext2D, selected: boolean = false, showTangents: boolean = false) {
		super.draw(context, selected);
		if (showTangents) {
			this.tangentIn.draw(context);
			this.tangentOut.draw(context);

			let line: Path2D = new Path2D();
			line.lineTo(this.tangentIn.x, this.tangentIn.y);
			line.lineTo(this.x, this.y);
			line.lineTo(this.tangentOut.x, this.tangentOut.y);
			context.stroke(line);
		}
	}

	move(dx: number, dy: number): Path2D {
		if (VectorEditor.pressedKeys.indexOf(Utils.KEYCODE.CONTROL) < 0) {
			//TODO: On SHIFT make Tangents opposite of each other
			let newTInPos: Vector2 = determineNewTangentPoint(this, this.parent.getPreviousVertex(this), this.tangentIn, dx, dy);
			this.tangentIn.moveTo(newTInPos.x, newTInPos.y);
			let newTOutPos: Vector2 = determineNewTangentPoint(this, this.parent.getNextVertex(this), this.tangentOut, dx, dy);
			this.tangentOut.moveTo(newTOutPos.x, newTOutPos.y);
			let newOtInPos: Vector2 = determineNewTangentPoint(this, this.parent.getPreviousVertex(this), this.parent.getPreviousVertex(this).tangentOut, dx, dy);
			this.parent.getPreviousVertex(this).tangentOut.moveTo(newOtInPos.x, newOtInPos.y);
			let newOtOutPos: Vector2 = determineNewTangentPoint(this, this.parent.getNextVertex(this), this.parent.getNextVertex(this).tangentIn, dx, dy);
			this.parent.getNextVertex(this).tangentIn.moveTo(newOtOutPos.x, newOtOutPos.y);
		}
		return super.move(dx, dy);
	}
}

function determineNewTangentPoint(movingVertex: Vertex, stationaryVertex: Vertex, tangent: TangentPoint, dx: number, dy: number): Vector2 {
	let ac: Vector2 = new Vector2(stationaryVertex.x - movingVertex.x, stationaryVertex.y - movingVertex.y);
	let ab: Vector2 = new Vector2(tangent.x - movingVertex.x, tangent.y - movingVertex.y);

	//calculate important stuff
	let magnitude: number = ac.sqrMagnitude();
	let acabProduct: number = Vector2.dot(ab, ac);
	let distance: number = acabProduct / magnitude;
	let p: Vector2 = new Vector2(movingVertex.x + ac.x * distance, movingVertex.y + ac.y * distance);
	let pb: Vector2 = new Vector2(tangent.x - p.x, tangent.y - p.y);
	let acPerpendicular: Vector2 = ac.perpendicularVector();
	let xScale: number = pb.x / acPerpendicular.x;
	let yScale: number = pb.y / acPerpendicular.y;
	let PBScale: number = xScale ? xScale : yScale;

	let newac: Vector2 = new Vector2(stationaryVertex.x - (movingVertex.x + dx), stationaryVertex.y - (movingVertex.y + dy));
	let newP: Vector2 = new Vector2(movingVertex.x + dx + newac.x * distance, movingVertex.y + dy + newac.y * distance);
	let newacPerpendicular: Vector2 = newac.perpendicularVector();
	let newX: number = newP.x + newacPerpendicular.x * PBScale;
	let newY: number = newP.y + newacPerpendicular.y * PBScale;

	return new Vector2(newX, newY);
}


export class TangentPoint extends DrawPoint {
	public parent: Vertex;

	constructor(x: number, y: number, parent: Vertex) {
		super(x, y);
		this.parent = parent;
	}

	generatePath2D(): Path2D {
		this.path = new Path2D();
		this.path.rect(this.x - 5 / VectorEditor.scale, this.y - 5 / VectorEditor.scale, 10 / VectorEditor.scale, 10 / VectorEditor.scale);
		return this.path;
	}
}
