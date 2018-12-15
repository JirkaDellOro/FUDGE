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
        var path = new Path([], "red", "path" + i, i);
        var previousEnd = new Vector2(RandomRange(0, 500), RandomRange(0, 500));
        for (var k = 0; k < 2; k++) {
            var newEnd = new Vector2(RandomRange(0, 500), RandomRange(0, 500));
            path.addLine(new Line(previousEnd, newEnd));
            previousEnd = newEnd;
        }
        path.addLine(new Line(previousEnd, path.path[0].startPoint));
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
    var selPoint;
    for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
        var point = points_1[_i];
        if (crc.isPointInPath(point.getPath2D(), _event.clientX, _event.clientY)) {
            selPoint = point;
        }
    }
    if (selPoint) {
        selectPoint(selPoint);
    }
    else {
        var foundPath = void 0;
        for (var _a = 0, paths_2 = paths; _a < paths_2.length; _a++) {
            var path = paths_2[_a];
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
function RandomRange(min, max) {
    return Math.floor((Math.random() * (max + min)) - min);
}
function selectPath(pathToSelect) {
    if (!pathToSelect)
        return;
    currentlySelectedPath = pathToSelect;
    redrawAll();
    points = currentlySelectedPath.returnAndDrawCornerPoints(crc);
}
function selectPoint(pointToSelect) {
    if (!pointToSelect)
        return;
    currentlySelectedPoint = pointToSelect;
}
function mousemove(_event) {
    if (!currentlySelectedPoint)
        return;
    currentlySelectedPoint.parent.changePoint(currentlySelectedPoint.point, new Vector2(_event.clientX, _event.clientY));
    redrawAll();
    currentlySelectedPoint.point = new Vector2(_event.clientX, _event.clientY);
    console.log(currentlySelectedPath);
    currentlySelectedPath.returnAndDrawCornerPoints(crc);
}
function mouseup() {
    if (!currentlySelectedPoint)
        return;
    currentlySelectedPoint = null;
}
//# sourceMappingURL=canvas.js.map