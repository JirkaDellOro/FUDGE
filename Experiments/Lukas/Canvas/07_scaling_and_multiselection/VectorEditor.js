// import { drawTypes } from "./canvastypes";
var VectorEditor;
(function (VectorEditor) {
    var Path = DrawTypes.DrawPath;
    var Vertex = DrawTypes.Vertex;
    var Tangent = DrawTypes.TangentPoint;
    var Vector2 = Utils.Vector2;
    window.addEventListener("load", init);
    let crc;
    let originalPos = new Vector2();
    let paths = [];
    let currentlySelectedPath;
    let points = [];
    let currentlySelectedPoint;
    VectorEditor.pressedKeys = [];
    let pivotPoint = new Vector2(0, 0);
    VectorEditor.scale = 1;
    function init() {
        let canvas = document.getElementById("myCanvas");
        canvas.addEventListener("mousedown", mousedown);
        canvas.addEventListener("mousemove", mousemove);
        canvas.addEventListener("mouseup", mouseup);
        window.addEventListener("keydown", keydown);
        window.addEventListener("keyup", keyup);
        window.addEventListener("wheel", scroll);
        window.oncontextmenu = () => { return false; };
        crc = canvas.getContext("2d");
        pivotPoint = new Vector2(canvas.height / 2, canvas.width / 2);
        createTestObjects();
    }
    function createTestObjects() {
        paths = [];
        let amountObjects = 3;
        let amountPoints = 3;
        for (let i = 0; i < amountObjects; i++) {
            let start = new Vertex(Utils.RandomRange(-250, 250), Utils.RandomRange(-250, 250));
            let path = new Path([], "black", Utils.RandomColor(), "path" + i, i);
            path.addVertexToEnd(start);
            for (let k = 0; k < amountPoints - 1; k++) {
                let newPoint = new Vertex(Utils.RandomRange(-250, 250), Utils.RandomRange(-250, 250));
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
        crc.scale(VectorEditor.scale, VectorEditor.scale);
        paths.sort(Path.sort);
        for (let path of paths) {
            path.draw(crc);
        }
        if (currentlySelectedPath) {
            let drawTangents = VectorEditor.pressedKeys.indexOf(Utils.KEYCODE.CONTROL) > -1;
            for (let p of currentlySelectedPath.points) {
                p.draw(crc, false, drawTangents);
            }
            if (currentlySelectedPoint instanceof Vertex || (currentlySelectedPoint instanceof Tangent && drawTangents))
                currentlySelectedPoint.draw(crc, true);
        }
        crc.resetTransform();
        crc.lineWidth = 1;
        let pivotPath = new Path2D();
        pivotPath.moveTo(pivotPoint.x - 5, pivotPoint.y);
        pivotPath.lineTo(pivotPoint.x + 5, pivotPoint.y);
        pivotPath.moveTo(pivotPoint.x, pivotPoint.y - 5);
        pivotPath.lineTo(pivotPoint.x, pivotPoint.y + 5);
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
    function getTransformedPoint(_point) {
        return new Vector2((_point.x - pivotPoint.x) / VectorEditor.scale, (_point.y - pivotPoint.y) / VectorEditor.scale);
    }
    function mousedown(_event) {
        _event.preventDefault();
        originalPos = new Vector2(_event.clientX, _event.clientY);
        if (_event.button != Utils.MOUSEBUTTON.LEFT)
            return;
        let transformedPoint = getTransformedPoint(new Vector2(_event.clientX, _event.clientY));
        let foundPoint;
        let foundPath;
        for (let path of paths) {
            if (crc.isPointInPath(path.getPath2D(), transformedPoint.x, transformedPoint.y)) {
                foundPath = path;
            }
            for (let point of path.points) {
                if (VectorEditor.pressedKeys.indexOf(Utils.KEYCODE.CONTROL) > -1) {
                    if (crc.isPointInPath(point.tangentIn.getPath2D(), transformedPoint.x, transformedPoint.y)) {
                        foundPoint = point.tangentIn;
                    }
                    if (crc.isPointInPath(point.tangentOut.getPath2D(), transformedPoint.x, transformedPoint.y)) {
                        foundPoint = point.tangentOut;
                    }
                }
                if (crc.isPointInPath(point.getPath2D(), transformedPoint.x, transformedPoint.y)) {
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
        redrawAll();
    }
    function selectPath(pathToSelect, _event) {
        currentlySelectedPath = pathToSelect;
        if (!pathToSelect)
            return;
        // originalPos = new Vector2(_event.clientX, _event.clientY);
        // redrawAll();
    }
    function selectPoint(pointToSelect, _event) {
        currentlySelectedPoint = pointToSelect;
        if (!pointToSelect)
            return;
        // originalPos = new Vector2(_event.clientX, _event.clientY);
        // redrawAll();
    }
    function mouseup(_event) {
        _event.preventDefault();
        if (currentlySelectedPoint instanceof Tangent && VectorEditor.pressedKeys.indexOf(Utils.KEYCODE.CONTROL) < 0) {
            currentlySelectedPoint = null;
        }
        // currentlySelectedPoint = null;
        // console.log("mouseup");
        redrawAll();
    }
    function mousemove(_event) {
        if (_event.buttons == 0)
            return;
        _event.preventDefault();
        if (currentlySelectedPoint && _event.buttons == 1) {
            currentlySelectedPoint.move((_event.clientX - originalPos.x) / VectorEditor.scale, (_event.clientY - originalPos.y) / VectorEditor.scale);
        }
        else if (currentlySelectedPath && _event.buttons == 1) {
            currentlySelectedPath.move((_event.clientX - originalPos.x) / VectorEditor.scale, (_event.clientY - originalPos.y) / VectorEditor.scale);
        }
        else if (_event.buttons == 1) {
        }
        else if (_event.buttons == 2) {
            pivotPoint = new Vector2(pivotPoint.x + _event.clientX - originalPos.x, pivotPoint.y + _event.clientY - originalPos.y);
        }
        redrawAll();
        originalPos = new Vector2(_event.clientX, _event.clientY);
    }
    function keydown(_event) {
        if (VectorEditor.pressedKeys.indexOf(_event.keyCode) < 0) {
            VectorEditor.pressedKeys.push(_event.keyCode);
        }
        switch (_event.keyCode) {
            case Utils.KEYCODE.UP:
                moveSomething(0, -1);
                break;
            case Utils.KEYCODE.DOWN:
                moveSomething(0, 1);
                break;
            case Utils.KEYCODE.LEFT:
                moveSomething(-1, 0);
                break;
            case Utils.KEYCODE.RIGHT:
                moveSomething(1, 0);
                break;
            case Utils.KEYCODE.CONTROL:
                redrawAll();
                break;
            case Utils.KEYCODE.SPACE:
                pivotPoint = new Vector2(crc.canvas.height / 2, crc.canvas.width / 2);
                redrawAll();
                break;
        }
    }
    function moveSomething(dx, dy) {
        if (currentlySelectedPoint) {
            currentlySelectedPoint.move(dx, dy);
        }
        else if (currentlySelectedPath) {
            currentlySelectedPath.move(dx, dy);
        }
        redrawAll();
    }
    function keyup(_event) {
        let index = VectorEditor.pressedKeys.indexOf(_event.keyCode);
        if (index > -1) {
            VectorEditor.pressedKeys.splice(index, 1);
        }
        switch (_event.keyCode) {
            case Utils.KEYCODE.CONTROL:
                if (currentlySelectedPoint instanceof Tangent && VectorEditor.pressedKeys.indexOf(Utils.KEYCODE.CONTROL) < 0) {
                    currentlySelectedPoint = null;
                }
                redrawAll();
                break;
        }
    }
    function scroll(_event) {
        let scaleMutiplier = 0.9;
        _event.preventDefault();
        if (_event.deltaY > 0) {
            let newScale = +Math.max(0.1, Math.min(VectorEditor.scale * scaleMutiplier, 10)).toFixed(2);
            let clientPos = new Vector2(_event.clientX, _event.clientY);
            // Vector2.add(clientPos, Vector2.add(clientPos, pivotPoint.scaled(-1)).scaled(-1 * newScale / scale));
            // pivotPoint = clientPos - ( (clientPos - pivotPoint) * (newScale / scale) )
            pivotPoint = new Vector2(_event.clientX - (_event.clientX - pivotPoint.x) * newScale / VectorEditor.scale, _event.clientY - (_event.clientY - pivotPoint.y) * newScale / VectorEditor.scale);
            VectorEditor.scale = newScale;
        }
        else if (_event.deltaY < 0) {
            let newScale = +Math.max(0.1, Math.min(VectorEditor.scale / scaleMutiplier, 10)).toFixed(2);
            pivotPoint = new Vector2(_event.clientX - (_event.clientX - pivotPoint.x) * newScale / VectorEditor.scale, _event.clientY - (_event.clientY - pivotPoint.y) * newScale / VectorEditor.scale);
            VectorEditor.scale = newScale;
        }
        redrawAll();
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
})(VectorEditor || (VectorEditor = {}));
//# sourceMappingURL=VectorEditor.js.map