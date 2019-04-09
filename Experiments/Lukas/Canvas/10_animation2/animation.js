let time = Date.now();
let canvas = document.getElementsByTagName("canvas")[0];
let crc = canvas.getContext("2d");
let y = 100;
let startPoint = new Utils.Vector2(0, 100);
let endPoint = new Utils.Vector2(100, 100);
let startTangent = new Utils.Vector2();
let endTangent = new Utils.Vector2();
let a, b, c, d;
let m0 = 0.5;
let m1 = 5;
function calculateFunction() {
    d = startPoint.y;
    c = m0;
    a = (-endPoint.x * (m0 + m1) - 2 * startPoint.y + 2 * endPoint.y) / -Math.pow(endPoint.x, 3);
    b = (m1 - m0 - 3 * a * Math.pow(endPoint.x, 2)) / (2 * endPoint.x);
    // a = (2 / Math.pow(endPoint.x, 2)) * ((m0 - m1) / 2 + (startPoint.y - endPoint.y) / endPoint.x);
    // b = (m0 - m1) / (endPoint.x * -2) - (3 * a * endPoint.x) / 2
    startTangent = new Utils.Vector2(1, m0);
    startTangent = Utils.Vector2.add(startTangent.normalize().scaled(50), startPoint);
    endTangent = new Utils.Vector2(-1, -m1);
    endTangent = Utils.Vector2.add(endTangent.normalize().scaled(50), endPoint);
}
calculateFunction();
draw();
function draw() {
    crc.clearRect(0, 0, canvas.width, canvas.height);
    let animPath = new Path2D();
    animPath.arc(startPoint.x, startPoint.y, 5, 0, 2 * Math.PI);
    animPath.moveTo(startPoint.x, startPoint.y);
    animPath.lineTo(startTangent.x, startTangent.y);
    animPath.rect(startTangent.x - 5, startTangent.y - 5, 10, 10);
    animPath.moveTo(endPoint.x, endPoint.y);
    animPath.arc(endPoint.x, endPoint.y, 5, 0, 2 * Math.PI);
    animPath.moveTo(endPoint.x, endPoint.y);
    animPath.lineTo(endTangent.x, endTangent.y);
    animPath.rect(endTangent.x - 5, endTangent.y - 5, 10, 10);
    crc.stroke(animPath);
    crc.strokeStyle = "#f00";
    crc.moveTo(startPoint.x, startPoint.y);
    let startTangentBezier = new Utils.Vector2(1, m0);
    startTangentBezier = Utils.Vector2.add(startTangentBezier.normalize().scaled(34 * Math.max(1, Math.abs(m0))), startPoint);
    let endTangentBezier = new Utils.Vector2(-1, -m1);
    endTangentBezier = Utils.Vector2.add(endTangentBezier.normalize().scaled(34 * Math.max(1, Math.abs(m1))), endPoint);
    crc.bezierCurveTo(startTangentBezier.x, startTangentBezier.y, endTangentBezier.x, endTangentBezier.y, endPoint.x, endPoint.y);
    crc.stroke();
    crc.strokeStyle = "#000";
    let duration = 2000;
    let timeModulo = (Date.now() - time) % duration;
    let currentXPosition = (endPoint.x - startPoint.x) * timeModulo / duration;
    // let currentPosition: Vector2 = getBezierXY(timeModulo / duration, startPoint.x, startPoint.y, tangentPoint1.x, tangentPoint1.y, tangentPoint2.x, tangentPoint2.y, endPoint.x, endPoint.y);
    let currentYPosition = getBezierY(currentXPosition);
    let currentPointPath = new Path2D();
    currentPointPath.rect(currentXPosition - 5, currentYPosition - 5, 10, 10);
    crc.stroke(currentPointPath);
    drawRect(currentYPosition);
    let fps = 30;
    setTimeout(draw, 1000 / fps);
}
function drawRect(_y) {
    let offsetY = 100;
    let rectPath = new Path2D();
    rectPath.rect(200, _y + offsetY, 50, 50);
    crc.fill(rectPath);
}
function getBezierY(_x) {
    return a * Math.pow(_x, 3) + b * Math.pow(_x, 2) + c * _x + d;
}
function getBezierXY(t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {
    return new Utils.Vector2(Math.pow(1 - t, 3) * sx + 3 * t * Math.pow(1 - t, 2) * cp1x
        + 3 * t * t * (1 - t) * cp2x + t * t * t * ex, Math.pow(1 - t, 3) * sy + 3 * t * Math.pow(1 - t, 2) * cp1y
        + 3 * t * t * (1 - t) * cp2y + t * t * t * ey);
}
//# sourceMappingURL=animation.js.map