var ScreenPoint;
(function (ScreenPoint) {
    var ƒ = Fudge;
    let canvas;
    let camera;
    let viewPort;
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        let branch = Scenes.createAxisCross();
        // initialize RenderManager and transmit content
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.recalculateAllNodeTransforms();
        let posCamera = new ƒ.Vector3(-1, 2, 3);
        canvas = document.querySelector("canvas");
        let camera = Scenes.createCamera(posCamera);
        let cmpCamera = camera.getComponent(ƒ.ComponentCamera);
        cmpCamera.projectCentral(1, 45);
        viewPort = new ƒ.Viewport();
        viewPort.initialize(canvas.id, branch, cmpCamera, canvas);
        viewPort.frameClientToCanvas.normAnchor = { left: 0, top: 0, right: 0.5, bottom: 0.5 };
        viewPort.frameClientToCanvas.pixelBorder = { left: 0, top: 0, right: 0, bottom: 0 };
        viewPort.frameCanvasToDestination.normAnchor = { left: 0.5, top: 0.5, right: 0, bottom: 0 };
        viewPort.frameCanvasToDestination.pixelBorder = { left: 5, top: 5, right: 5, bottom: 5 };
        viewPort.draw();
        viewPort.activatePointerEvent("\u0192pointerdown" /* DOWN */, true);
        viewPort.addEventListener("\u0192pointerdown" /* DOWN */, hndEvent);
        console.group("Frames");
        console.log("Client: ", viewPort.getClientRectangle());
        console.log("Canvas: ", viewPort.getCanvasRectangle());
        console.log("Destin: ", viewPort.rectDestination);
    }
    function hndEvent(_event) {
        console.group(`${_event.type} on ${viewPort.name}`);
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
        rectFrame = viewPort.getClientRectangle();
        pointCanvas = viewPort.frameClientToCanvas.getPoint(_point, rectFrame);
        rectFrame = viewPort.getCanvasRectangle();
        pointDestination = viewPort.frameCanvasToDestination.getPoint(pointCanvas, rectFrame);
        pointCanvasInverse = viewPort.frameCanvasToDestination.getPointInverse(pointDestination, rectFrame);
        rectFrame = viewPort.getClientRectangle();
        pointInverse = viewPort.frameClientToCanvas.getPointInverse(pointCanvasInverse, rectFrame);
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