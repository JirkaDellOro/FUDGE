var Curves;
(function (Curves) {
    var V2 = Vector.Vector2D;
    var controlPoint = new Array();
    var iDragging = -1;
    Setup.size(800, 600);
    Setup.title("Curves");
    Setup.addEventListener(EVENTTYPE.MOUSEDOWN, mousedown);
    Setup.addEventListener(EVENTTYPE.MOUSEUP, mouseup);
    Setup.addEventListener(EVENTTYPE.MOUSEMOVE, mousemove);
    var stepper = document.getElementById("stepper");
    stepper.addEventListener("mousedown", Setup.stopPropagation);
    stepper.addEventListener("keydown", Setup.stopPropagation);
    stepper.addEventListener("change", change);
    setControlPoints(4);
    function change(_event) {
        var n = _event.target.valueAsNumber;
        setControlPoints(n);
    }
    function setControlPoints(_n) {
        var d = _n - controlPoint.length;
        for (var i = 0; i < Math.abs(d); i++) {
            if (d < 0)
                controlPoint.pop();
            else
                controlPoint.push(new Curves.ControlPoint(controlPoint.length, new V2(crc2.canvas.width / 2, crc2.canvas.height / 2)));
        }
        display();
        console.log("change: " + controlPoint.length);
    }
    function mousedown(_event) {
        var hit = new V2(Setup.pointerX, Setup.pointerY);
        for (let i = 0; i < controlPoint.length; i++) {
            if (controlPoint[i].testHit(hit)) {
                iDragging = i;
            }
        }
    }
    function mouseup(_event) {
        iDragging = -1;
    }
    function mousemove(_event) {
        if (iDragging > -1) {
            var hit = new V2(Setup.pointerX, Setup.pointerY);
            controlPoint[iDragging].setVector(hit);
            display();
        }
    }
    function display() {
        crc2.clearRect(0, 0, crc2.canvas.width, crc2.canvas.height);
        crc2.strokeStyle = "#000000";
        var cp = controlPoint[0];
        crc2.beginPath();
        crc2.moveTo(cp.x, cp.y);
        for (var i in controlPoint) {
            cp = controlPoint[i];
            crc2.lineTo(cp.x, cp.y);
            crc2.setLineDash([10, 4]);
            crc2.lineWidth = 0.5;
            crc2.stroke();
            crc2.lineWidth = 1;
            crc2.setLineDash([]);
            cp.display();
            //crc2.beginPath();
            crc2.moveTo(cp.x, cp.y);
        }
        crc2.strokeStyle = "#0000ff";
        crc2.setLineDash([]);
        for (var p = 2; p < controlPoint.length; p += 2) {
            crc2.beginPath();
            crc2.moveTo(controlPoint[p - 2].x, controlPoint[p - 2].y);
            crc2.quadraticCurveTo(controlPoint[p - 1].x, controlPoint[p - 1].y, controlPoint[p].x, controlPoint[p].y);
            crc2.stroke();
        }
        crc2.strokeStyle = "#ff0000";
        for (p = 3; p < controlPoint.length; p += 3) {
            crc2.beginPath();
            crc2.moveTo(controlPoint[p - 3].x, controlPoint[p - 3].y);
            crc2.bezierCurveTo(controlPoint[p - 2].x, controlPoint[p - 2].y, controlPoint[p - 1].x, controlPoint[p - 1].y, controlPoint[p].x, controlPoint[p].y);
            crc2.stroke();
        }
    }
})(Curves || (Curves = {}));
//# sourceMappingURL=Curves.js.map