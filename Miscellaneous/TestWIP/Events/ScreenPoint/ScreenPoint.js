var ScreenPoint;
(function (ScreenPoint) {
    var ƒ = FudgeCore;
    let canvas;
    let camera;
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        let graph = Scenes.createAxisCross();
        let posCamera = new ƒ.Vector3(-1, 2, 3);
        canvas = document.querySelector("canvas");
        let cmpCamera = Scenes.createCamera(posCamera);
        cmpCamera.projectCentral(1, 45);
        ScreenPoint.viewPort = new ƒ.Viewport();
        ScreenPoint.viewPort.initialize(canvas.id, graph, cmpCamera, canvas);
        ScreenPoint.viewPort.frameClientToCanvas.setScale(0.5, 0.5);
        ScreenPoint.viewPort.frameCanvasToDestination.margin = { left: 0, top: 0.5, right: 0, bottom: 0 };
        ScreenPoint.viewPort.frameCanvasToDestination.padding = { left: 5, top: 0, right: 5, bottom: 5 };
        ScreenPoint.viewPort.draw();
        ScreenPoint.viewPort.activatePointerEvent("\u0192pointerdown" /* DOWN */, true);
        ScreenPoint.viewPort.addEventListener("\u0192pointerdown" /* DOWN */, hndEvent);
        console.group("Frames");
        console.log("Client: ", ScreenPoint.viewPort.getClientRectangle());
        console.log("Canvas: ", ScreenPoint.viewPort.getCanvasRectangle());
        console.log("Destin: ", ScreenPoint.viewPort.rectDestination);
    }
    function hndEvent(_event) {
        console.group(`${_event.type} on ${ScreenPoint.viewPort.name}`);
        let pointClient = { x: _event.pointerX, y: _event.pointerY };
        calculate(pointClient);
        console.groupEnd();
    }
    function calculate(_point) {
        let pointCanvas;
        let pointDestination;
        let pointCanvasInverse;
        let pointInverse;
        let rectFrame;
        rectFrame = ScreenPoint.viewPort.getClientRectangle();
        pointCanvas = ScreenPoint.viewPort.frameClientToCanvas.getPoint(_point, rectFrame);
        rectFrame = ScreenPoint.viewPort.getCanvasRectangle();
        pointDestination = ScreenPoint.viewPort.frameCanvasToDestination.getPoint(pointCanvas, rectFrame);
        pointCanvasInverse = ScreenPoint.viewPort.frameCanvasToDestination.getPointInverse(pointDestination, rectFrame);
        rectFrame = ScreenPoint.viewPort.getClientRectangle();
        pointInverse = ScreenPoint.viewPort.frameClientToCanvas.getPointInverse(pointCanvasInverse, rectFrame);
        console.log("Client: ", _point);
        console.log("Canvas: ", pointCanvas);
        console.log("Destin: ", pointDestination);
        console.log("Canvas: ", pointCanvasInverse);
        console.log("Client: ", pointInverse);
    }
    ScreenPoint.calculate = calculate;
    function getViewport(_event) {
        let viewPort = _event.target;
        return viewPort;
    }
})(ScreenPoint || (ScreenPoint = {}));
//# sourceMappingURL=ScreenPoint.js.map