// import { drawTypes } from "./canvastypes";

module VectorEditor {

	import Path = DrawTypes.DrawPath;
	import Point = DrawTypes.DrawPoint;
	import Vertex = DrawTypes.Vertex;
	import Tangent = DrawTypes.TangentPoint;
	import Vector2 = Utils.Vector2;

	window.addEventListener("load", init);

	let crc: CanvasRenderingContext2D;

	let originalPos: Vector2 = new Vector2();

	let paths: Path[] = [];

	let currentlySelectedPath: Path;

	let points: Point[] = [];

	let currentlySelectedPoint: Point;

	export let pressedKeys: number[] = [];

	let pivotPoint: Vector2 = new Vector2(0, 0);


	function init() {
		let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("myCanvas");
		canvas.addEventListener("mousedown", mousedown);
		canvas.addEventListener("mousemove", mousemove);
		canvas.addEventListener("mouseup", mouseup);
		window.addEventListener("keydown", keydown);
		window.addEventListener("keyup", keyup);

		crc = canvas.getContext("2d");
		createTestObjects();
	}

	function createTestObjects() {
		paths = [];
		let amountObjects: number = 3;
		let amountPoints: number = 3;

		for (let i: number = 0; i < amountObjects; i++) {
			let start: Vertex = new Vertex(Utils.RandomRange(0, 500), Utils.RandomRange(0, 500));
			let path: Path = new Path([], "black", Utils.RandomColor(), "path" + i, i);
			path.addVertexToEnd(start);
			for (let k: number = 0; k < amountPoints - 1; k++) {
				let newPoint: Vertex = new Vertex(Utils.RandomRange(0, 500), Utils.RandomRange(0, 500));
				path.addVertexToEnd(newPoint);
			}
			path.setClosed(true);
			path.setTangentsToThirdOfTheWays();
			paths.push(path);
		}

		redrawAll();
	}

	function redrawAll() {
		crc.resetTransform();
		crc.clearRect(0, 0, crc.canvas.width, crc.canvas.height);
		crc.translate(pivotPoint.x, pivotPoint.y);

		paths.sort(Path.sort);

		for (let path of paths) {
			path.draw(crc);
		}

		if (currentlySelectedPath) {
			let drawTangents: boolean = pressedKeys.indexOf(Utils.KEYCODE.CONTROL) > -1;
			for (let p of currentlySelectedPath.points) {
				p.draw(crc, drawTangents);
			}
		}
		let pivotPath: Path2D = new Path2D();
		pivotPath.moveTo(245, 250);
		pivotPath.lineTo(255, 250);
		pivotPath.moveTo(250, 245);
		pivotPath.lineTo(250, 255);
		crc.stroke(pivotPath);

		// crc.setTransform(0, 0, 0, 0, pivotPoint.x, pivotPoint.y);
		// console.log(pivotPoint);


		// for (let path of paths) {
		//     if (path == currentlySelectedPath) 
		//     for(let p of path.points){
		//         p.draw(crc);
		//     }
		// }

	}

	function mousedown(_event: MouseEvent) {
		let foundPoint: Point;

		let foundPath: Path;
		for (let path of paths) {
			if (crc.isPointInPath(path.getPath2D(), _event.clientX, _event.clientY)) {
				foundPath = path;
			}

			for (let point of path.points) {
				if(pressedKeys.indexOf(Utils.KEYCODE.CONTROL) > -1){
					if (crc.isPointInPath(point.tangentIn.getPath2D(), _event.clientX, _event.clientY)) {
						foundPoint = point.tangentIn;
					}
					if (crc.isPointInPath(point.tangentOut.getPath2D(), _event.clientX, _event.clientY)) {
						foundPoint = point.tangentOut;
					}

				}
				if (crc.isPointInPath(point.getPath2D(), _event.clientX, _event.clientY)) {
					foundPoint = point;
				}
			}
			
		}

		if (foundPoint) {
			selectPoint(foundPoint, _event);
			// selectPath(null, null)
		}
		else if (foundPath) {
			// console.debug("clicked on " + foundPath.name);
			selectPath(foundPath, _event);
			selectPoint(null, _event);
		}
		else {
			selectPath(null, _event);
			selectPoint(null, _event);
		}
		originalPos = new Vector2(_event.clientX, _event.clientY);
		redrawAll();
	}


	function selectPath(pathToSelect: Path, _event: MouseEvent): void {
		currentlySelectedPath = pathToSelect;
		if (!pathToSelect) return;
		// originalPos = new Vector2(_event.clientX, _event.clientY);
		// redrawAll();
	}

	function selectPoint(pointToSelect: Point, _event: MouseEvent): void {
		currentlySelectedPoint = pointToSelect;
		if (!pointToSelect) return;
		// originalPos = new Vector2(_event.clientX, _event.clientY);
		// redrawAll();
	}

	function mouseup() {
		// currentlySelectedPath = null;
		// console.log("mouseup");
	}

	function mousemove(_event: MouseEvent) {
		if (_event.buttons == 0) return;
		if (currentlySelectedPoint) {
			currentlySelectedPoint.move(_event.clientX - originalPos.x, _event.clientY - originalPos.y);
		}
		else if (currentlySelectedPath) {
			currentlySelectedPath.move(_event.clientX - originalPos.x, _event.clientY - originalPos.y);
		} else {
			pivotPoint = new Vector2(pivotPoint.x + _event.clientX - originalPos.x, pivotPoint.y + _event.clientY - originalPos.y)
		}
		redrawAll();
		originalPos = new Vector2(_event.clientX, _event.clientY);
	}

	function keydown(_event: KeyboardEvent) {
		if (pressedKeys.indexOf(_event.keyCode) < 0) {
			pressedKeys.push(_event.keyCode);
		}

		if (_event.keyCode == Utils.KEYCODE.SPACE) {
			pivotPoint = new Vector2();
			redrawAll();
		}
		if (_event.keyCode == Utils.KEYCODE.CONTROL) {
			redrawAll();
		}
	}

	function keyup(_event: KeyboardEvent) {
		let index: number = pressedKeys.indexOf(_event.keyCode);
		if (index > -1) {
			pressedKeys.splice(index, 1);
		}
		if (_event.keyCode == Utils.KEYCODE.CONTROL) {
			redrawAll();
		}
	}

	/*
	function mousedown(_event: MouseEvent) {
		let selPoint: Point;
		for (let point of points) {
			if (crc.isPointInPath(point.getPath2D(), _event.clientX, _event.clientY)) {
				selPoint = point;
			}
		}
		if (selPoint) {
			selectPoint(selPoint);
		} else {
			let foundPath: Path;
			for (let path of paths) {
				if (crc.isPointInPath(path.getPath2D(), _event.clientX, _event.clientY)) {
					foundPath = path;
				}
			}
			if (foundPath) {
				console.debug("clicked on " + foundPath.name);
				selectPath(foundPath);
	
			}
		}
	}
	
	
	
		function selectPath(pathToSelect: Path): void {
			if (!pathToSelect) return;
			currentlySelectedPath = pathToSelect;
			redrawAll();
			points = currentlySelectedPath.returnAndDrawCornerPoints(crc);
		}
	
		function selectPoint(pointToSelect: Point) {
			if (!pointToSelect) return;
			currentlySelectedPoint = pointToSelect;
		}
	
		function mousemove(_event: MouseEvent) {
			if (!currentlySelectedPoint) return;
			currentlySelectedPoint.parent.changePoint(currentlySelectedPoint.point, new Vector2(_event.clientX, _event.clientY));
			redrawAll();
			currentlySelectedPoint.point = new Vector2(_event.clientX, _event.clientY);
			console.log(currentlySelectedPath);
			currentlySelectedPath.returnAndDrawCornerPoints(crc);
		}
	
		function mouseup() {
			if (!currentlySelectedPoint) return;
			currentlySelectedPoint = null;
		}
		*/
}