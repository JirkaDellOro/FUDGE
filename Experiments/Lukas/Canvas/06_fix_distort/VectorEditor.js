// import { drawTypes } from "./canvastypes";
var VectorEditor;
(function (VectorEditor) {
    var Path = DrawTypes.DrawPath;
    var Vertex = DrawTypes.Vertex;
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
        crc = canvas.getContext("2d");
        createTestObjects();
    }
    function createTestObjects() {
        paths = [];
        let amountObjects = 3;
        let amountPoints = 3;
        for (let i = 0; i < amountObjects; i++) {
            let start = new Vertex(Utils.RandomRange(0, 500), Utils.RandomRange(0, 500));
            let path = new Path([], "black", Utils.RandomColor(), "path" + i, i);
            path.addVertexToEnd(start);
            for (let k = 0; k < amountPoints - 1; k++) {
                let newPoint = new Vertex(Utils.RandomRange(0, 500), Utils.RandomRange(0, 500));
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
        crc.translate(pivotPoint.x - pivotPoint.x / VectorEditor.scale, pivotPoint.y - pivotPoint.y / VectorEditor.scale);
        // console.log(pivotPoint.x - pivotPoint.x / scale, pivotPoint.y - pivotPoint.y / scale);
        crc.scale(VectorEditor.scale, VectorEditor.scale);
        paths.sort(Path.sort);
        for (let path of paths) {
            path.draw(crc);
        }
        if (currentlySelectedPath) {
            let drawTangents = VectorEditor.pressedKeys.indexOf(Utils.KEYCODE.CONTROL) > -1;
            for (let p of currentlySelectedPath.points) {
                p.draw(crc, drawTangents);
            }
        }
        let pivotPath = new Path2D();
        pivotPath.moveTo(-5, 0);
        pivotPath.lineTo(5, 0);
        pivotPath.moveTo(0, -5);
        pivotPath.lineTo(0, 5);
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
    function mousedown(_event) {
        let foundPoint;
        let foundPath;
        for (let path of paths) {
            if (crc.isPointInPath(path.getPath2D(), _event.clientX, _event.clientY)) {
                foundPath = path;
            }
            for (let point of path.points) {
                if (VectorEditor.pressedKeys.indexOf(Utils.KEYCODE.CONTROL) > -1) {
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
        if (currentlySelectedPoint instanceof DrawTypes.Vertex) {
            currentlySelectedPoint.prepareMovementValues();
        }
        // originalPos = new Vector2(_event.clientX, _event.clientY);
        // redrawAll();
    }
    function mouseup() {
        // currentlySelectedPath = null;
        // currentlySelectedPoint = null;
        // console.log("mouseup");
    }
    function mousemove(_event) {
        if (_event.buttons == 0)
            return;
        let deltaX = (_event.clientX - originalPos.x) / VectorEditor.scale;
        let deltaY = (_event.clientY - originalPos.y) / VectorEditor.scale;
        if (currentlySelectedPoint) {
            currentlySelectedPoint.move(deltaX, deltaY);
        }
        else if (currentlySelectedPath) {
            currentlySelectedPath.move(deltaX, deltaY);
        }
        else {
            pivotPoint = new Vector2(pivotPoint.x + deltaX * VectorEditor.scale, pivotPoint.y + deltaY * VectorEditor.scale);
        }
        redrawAll();
        originalPos = new Vector2(_event.clientX, _event.clientY);
    }
    function keydown(_event) {
        if (VectorEditor.pressedKeys.indexOf(_event.keyCode) < 0) {
            VectorEditor.pressedKeys.push(_event.keyCode);
        }
        if (_event.keyCode == Utils.KEYCODE.SPACE) {
            pivotPoint = new Vector2();
            redrawAll();
        }
        if (_event.keyCode == Utils.KEYCODE.CONTROL) {
            redrawAll();
        }
    }
    function keyup(_event) {
        let index = VectorEditor.pressedKeys.indexOf(_event.keyCode);
        if (index > -1) {
            VectorEditor.pressedKeys.splice(index, 1);
        }
        if (_event.keyCode == Utils.KEYCODE.CONTROL) {
            redrawAll();
        }
    }
    function scroll(_event) {
        let scaleMutiplier = 0.9;
        _event.preventDefault();
        if (_event.deltaY > 0) {
            VectorEditor.scale = +Math.max(0.1, Math.min(VectorEditor.scale * scaleMutiplier, 10)).toFixed(2);
            // pivotPoint = new Vector2(pivotPoint.x + (pivotPoint.x - _event.clientX) * scale, (pivotPoint.y - _event.clientY) + _event.clientY * scale);
        }
        else if (_event.deltaY < 0) {
            VectorEditor.scale = +Math.max(0.1, Math.min(VectorEditor.scale / scaleMutiplier, 10)).toFixed(2);
        }
        console.log(VectorEditor.scale);
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