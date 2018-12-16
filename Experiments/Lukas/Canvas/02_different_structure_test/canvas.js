// import { drawTypes } from "./canvastypes";
var Line = DrawTypes.DrawLine;
var Vector2 = DrawTypes.Vector2;
var Path = DrawTypes.DrawPath;
var Point = DrawTypes.DrawPoint;
window.addEventListener("load", init);
var crc;
// let l1: Line = new Line(new Vector2(100, 100), new Vector2(200, 200), new Vector2(100, 100), new Vector2(100, 200));
// let l2: Line = new Line(new Vector2(200, 200), new Vector2(300, 100), new Vector2(200, 200), new Vector2(300, 200));
// let l3: Line = new Line(new Vector2(300, 100), new Vector2(200, 0));
// let l4: Line = new Line(new Vector2(200, 0), new Vector2(100, 100));
// let exPath: Path = new Path([l1, l2, l3, l4], "yellow", "test");
// let l5: Line = new Line(new Vector2(0, 0), new Vector2(200, 200), new Vector2(100, 100), new Vector2(100, 200));
// let l6: Line = new Line(new Vector2(100, 100), new Vector2(200, 200), new Vector2(100, 100), new Vector2(100, 200));
// let exPath2: Path = new Path([l5,l6], "hotpink", "test");
var paths = [];
var currentlySelectedPath;
var points = [];
var currentlySelectedPoint;
var originalPos;
function init() {
    var canvas = document.getElementById("myCanvas");
    canvas.addEventListener("mousedown", mousedown);
    canvas.addEventListener("mousemove", mousemove);
    canvas.addEventListener("mouseup", mouseup);
    crc = canvas.getContext("2d");
    // crc.beginPath();
    // crc.moveTo(0, 0);
    // crc.lineTo(100, 100);
    // crc.stroke();
    // exPath.draw(crc);
    // exPath2.draw(crc);
    for (var i = 0; i < 3; i++) {
        var previousEnd = new Point(Utils.RandomRange(0, 500), Utils.RandomRange(0, 500), null);
        var path = new Path([previousEnd], "black", Utils.RandomColor(), "path" + i, i);
        for (var k = 0; k < 2; k++) {
            var newEnd = new Point(Utils.RandomRange(0, 500), Utils.RandomRange(0, 500), null);
            path.addLineToEnd(previousEnd, newEnd, newEnd);
            previousEnd = newEnd;
        }
        path.addLineToEnd(previousEnd, path.points[0], path.points[0]);
        paths.push(path);
    }
    redrawAll();
}
function redrawAll() {
    crc.clearRect(0, 0, 500, 500);
    paths.sort(Path.sort);
    for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
        var path = paths_1[_i];
        path.draw(crc);
    }
}
function mousedown(_event) {
    var foundPath;
    for (var _i = 0, paths_2 = paths; _i < paths_2.length; _i++) {
        var path = paths_2[_i];
        if (crc.isPointInPath(path.getPath2D(), _event.clientX, _event.clientY)) {
            foundPath = path;
        }
    }
    if (foundPath) {
        console.debug("clicked on " + foundPath.name);
        selectPath(foundPath, _event);
    }
}
function selectPath(pathToSelect, _event) {
    if (!pathToSelect)
        return;
    currentlySelectedPath = pathToSelect;
    originalPos = new Vector2(_event.clientX, _event.clientY);
}
function mouseup() {
    currentlySelectedPath = null;
}
function mousemove(_event) {
    if (!currentlySelectedPath)
        return;
    currentlySelectedPath.move(originalPos.x - _event.clientX, originalPos.y - _event.clientY);
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