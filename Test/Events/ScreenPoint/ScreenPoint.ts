namespace ScreenPoint {
    import ƒ = Fudge;
    let canvas: HTMLCanvasElement;
    let camera: ƒ.Node;
    let viewPort: ƒ.Viewport;

    window.addEventListener("DOMContentLoaded", init);

    function init(): void {
        let branch: ƒ.Node = Scenes.createAxisCross();
        // initialize RenderManager and transmit content
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.recalculateAllNodeTransforms();

        let posCamera: ƒ.Vector3 = new ƒ.Vector3(-1, 2, 3);
        canvas = document.querySelector("canvas");
        let camera: ƒ.Node = Scenes.createCamera(posCamera);
        let cmpCamera: ƒ.ComponentCamera = <ƒ.ComponentCamera>camera.getComponent(ƒ.ComponentCamera);
        cmpCamera.projectCentral(1, 45);
        viewPort = new ƒ.Viewport();
        viewPort.initialize(canvas.id, branch, cmpCamera, canvas);

        viewPort.frameClientToCanvas.normAnchor = { left: 0, top: 0, right: 0.5, bottom: 0.5 };
        viewPort.frameClientToCanvas.pixelBorder = { left: 0, top: 0, right: 0, bottom: 0 };
        viewPort.frameCanvasToDestination.normAnchor = { left: 0.5, top: 0.5, right: 0, bottom: 0 };
        viewPort.frameCanvasToDestination.pixelBorder = { left: 5, top: 5, right: 5, bottom: 5 };
        viewPort.draw();

        viewPort.activatePointerEvent(ƒ.EVENT_POINTER.DOWN, true);
        viewPort.addEventListener(ƒ.EVENT_POINTER.DOWN, hndEvent);

        console.group("Frames");
        console.log("Client: ", viewPort.getClientRectangle());
        console.log("Canvas: ", viewPort.getCanvasRectangle());
        console.log("Destin: ", viewPort.rectDestination);
    }

    function hndEvent(_event: ƒ.PointerEventƒ | ƒ.DragDropEventƒ): void {
        console.group(`${_event.type} on ${viewPort.name}`);
        let pointClient: ƒ.Point = { x: _event.pointerX, y: _event.pointerY };
        calculate(pointClient);
        console.groupEnd();
    }

    export function calculate(_point: ƒ.Point): void {
        let pointCanvas: ƒ.Point;
        let pointDestination: ƒ.Point;
        let pointCanvasInverse: ƒ.Point;
        let pointInverse: ƒ.Point;
        let rectFrame: ƒ.Rectangle;

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

    function getViewport(_event: Event): ƒ.Viewport {
        let viewPort: ƒ.Viewport = <ƒ.Viewport>_event.target;
        return viewPort;
    }
}