// import { drawTypes } from "./canvastypes";
var Vector2 = Utils.Vector2;
var Line = DrawTypes.DrawLine;
var Path = DrawTypes.DrawPath;
var Point = DrawTypes.DrawPoint;
window.addEventListener("load", init);
let crc;
// let l1: Line = new Line(new Vector2(100, 100), new Vector2(200, 200), new Vector2(100, 100), new Vector2(100, 200));
// let l2: Line = new Line(new Vector2(200, 200), new Vector2(300, 100), new Vector2(200, 200), new Vector2(300, 200));
// let l3: Line = new Line(new Vector2(300, 100), new Vector2(200, 0));
// let l4: Line = new Line(new Vector2(200, 0), new Vector2(100, 100));
// let exPath: Path = new Path([l1, l2, l3, l4], "yellow", "test");
// let l5: Line = new Line(new Vector2(0, 0), new Vector2(200, 200), new Vector2(100, 100), new Vector2(100, 200));
// let l6: Line = new Line(new Vector2(100, 100), new Vector2(200, 200), new Vector2(100, 100), new Vector2(100, 200));
// let exPath2: Path = new Path([l5,l6], "hotpink", "test");
let paths = [];
let currentlySelectedPath;
let points = [];
let currentlySelectedPoint;
let originalPos;
function init() {
    let canvas = document.getElementById("myCanvas");
    canvas.addEventListener("mousedown", mousedown);
    canvas.addEventListener("mousemove", mousemove);
    canvas.addEventListener("mouseup", mouseup);
    crc = canvas.getContext("2d");
    // console.log("init");
    // crc.beginPath();
    // crc.moveTo(0, 0);
    // crc.lineTo(100, 100);
    // crc.stroke();
    // exPath.draw(crc);
    // exPath2.draw(crc);
    for (let i = 0; i < 3; i++) {
        let previousEnd = new Point(Utils.RandomRange(0, 500), Utils.RandomRange(0, 500), null);
        let path = new Path([previousEnd], "black", Utils.RandomColor(), "path" + i, i);
        for (let k = 0; k < 2; k++) {
            let newEnd = new Point(Utils.RandomRange(0, 500), Utils.RandomRange(0, 500), null);
            path.addLineToEnd(new Point(previousEnd.x, previousEnd.y), new Point(newEnd.x, newEnd.y), new Point(newEnd.x, newEnd.y));
            previousEnd = newEnd;
        }
        path.addLineToEnd(new Point(previousEnd.x, previousEnd.y), new Point(path.points[0].x, path.points[0].y), new Point(path.points[0].x, path.points[0].y));
        paths.push(path);
    }
    redrawAll();
}
function redrawAll() {
    crc.clearRect(0, 0, 500, 500);
    paths.sort(Path.sort);
    for (let path of paths) {
        crc.globalAlpha = (path == currentlySelectedPath) || (currentlySelectedPath == null) ? 1 : 0.5;
        path.draw(crc);
    }
    for (let path of paths) {
        if (path == currentlySelectedPath)
            for (let p of path.points) {
                p.draw(crc);
            }
    }
}
function mousedown(_event) {
    let foundPoint;
    let foundPath;
    for (let path of paths) {
        if (crc.isPointInPath(path.getPath2D(), _event.clientX, _event.clientY)) {
            foundPath = path;
        }
        // if (path == currentlySelectedPath) {
        for (let point of path.points) {
            if (crc.isPointInPath(point.getPath2D(), _event.clientX, _event.clientY)) {
                foundPoint = point;
            }
        }
        // }
    }
    if (foundPoint) {
        selectPoint(foundPoint, _event);
        // selectPath(null, null)
        return;
    }
    else if (foundPath) {
        // console.debug("clicked on " + foundPath.name);
        selectPath(foundPath, _event);
        selectPoint(null, _event);
    }
    else {
        selectPath(null, _event);
        selectPoint(null, _event);
        redrawAll();
    }
}
function selectPath(pathToSelect, _event) {
    currentlySelectedPath = pathToSelect;
    if (!pathToSelect)
        return;
    originalPos = new Vector2(_event.clientX, _event.clientY);
    redrawAll();
}
function selectPoint(pointToSelect, _event) {
    currentlySelectedPoint = pointToSelect;
    if (!pointToSelect)
        return;
    originalPos = new Vector2(_event.clientX, _event.clientY);
    redrawAll();
}
function mouseup() {
    // currentlySelectedPath = null;
    // console.log("mouseup");
}
function mousemove(_event) {
    if (_event.buttons == 0)
        return;
    if (currentlySelectedPoint) {
        currentlySelectedPoint.move(_event.clientX - originalPos.x, _event.clientY - originalPos.y);
    }
    else if (currentlySelectedPath) {
        currentlySelectedPath.move(_event.clientX - originalPos.x, _event.clientY - originalPos.y);
    }
    redrawAll();
    originalPos = new Vector2(_event.clientX, _event.clientY);
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
//# sourceMappingURL=canvas.js.map