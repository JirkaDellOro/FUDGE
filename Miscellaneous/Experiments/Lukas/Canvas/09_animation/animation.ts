interface Vector2 {
	x: number;
	y: number;
}

let time: number = Date.now();

let canvas: HTMLCanvasElement = document.getElementsByTagName("canvas")[0];
let crc: CanvasRenderingContext2D = canvas.getContext("2d");

let y: number = 100;

draw();

function draw() {
	let startPoint: Vector2 = { x: 10, y: 100 };
	let tangentPoint1: Vector2 = { x: 50, y: 100 };
	let tangentPoint2: Vector2 = { x: 60, y: 10 };
	let endPoint: Vector2 = { x: 100, y: 10 };

	crc.clearRect(0, 0, canvas.width, canvas.height);

	let bezierPath: Path2D = new Path2D();
	bezierPath.arc(startPoint.x, startPoint.y, 5, 0, 2 * Math.PI);
	bezierPath.moveTo(startPoint.x, startPoint.y);
	bezierPath.bezierCurveTo(tangentPoint1.x, tangentPoint1.y, tangentPoint2.x, tangentPoint2.y, endPoint.x, endPoint.y);
	bezierPath.arc(endPoint.x, endPoint.y, 5, 0, 2 * Math.PI);
	crc.stroke(bezierPath);

	let duration: number = 2000;
	let timeModulo: number = (Date.now() - time) % duration

	let currentPosition: Vector2 = getBezierXY(timeModulo / duration, startPoint.x, startPoint.y, tangentPoint1.x, tangentPoint1.y, tangentPoint2.x, tangentPoint2.y, endPoint.x, endPoint.y);
	let halfwayPosition: Vector2 = getBezierXY(0.5, startPoint.x, startPoint.y, tangentPoint1.x, tangentPoint1.y, tangentPoint2.x, tangentPoint2.y, endPoint.x, endPoint.y);

	let currentPointPath: Path2D = new Path2D();
	currentPointPath.rect(currentPosition.x - 5, currentPosition.y - 5, 10, 10);

	crc.stroke(currentPointPath);

	drawRect(currentPosition.y);

	crc.moveTo(halfwayPosition.x, halfwayPosition.y);
	crc.arc(halfwayPosition.x, halfwayPosition.y, 3, 0, Math.PI * 2);
	crc.stroke();

	let fps: number = 60;
	setTimeout(draw, 1000 / fps);



}

function drawRect(_y: number) {
	let offsetY: number = 100;
	let rectPath: Path2D = new Path2D();
	rectPath.rect(200, _y + offsetY, 50, 50);
	crc.fill(rectPath);
}


function getBezierXY(t: number, sx: number, sy: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number, ex: number, ey: number): Vector2 {

	return {
		x: Math.pow(1 - t, 3) * sx + 3 * t * Math.pow(1 - t, 2) * cp1x
			+ 3 * t * t * (1 - t) * cp2x + t * t * t * ex,
		y: Math.pow(1 - t, 3) * sy + 3 * t * Math.pow(1 - t, 2) * cp1y
			+ 3 * t * t * (1 - t) * cp2y + t * t * t * ey
	};
}