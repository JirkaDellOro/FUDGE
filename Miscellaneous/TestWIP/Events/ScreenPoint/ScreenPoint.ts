namespace ScreenPoint {
    import ƒ = FudgeCore;
    
    
    let canvas: HTMLCanvasElement;
    let camera: ƒ.Node;
    export let viewPort: ƒ.Viewport;

    window.addEventListener("DOMContentLoaded", init);

    function init(): void {
        let graph: ƒ.Node = Scenes.createAxisCross();

        let posCamera: ƒ.Vector3 = new ƒ.Vector3(-1, 2, 3);
        canvas = document.querySelector("canvas");
        let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(posCamera);
        cmpCamera.projectCentral(1, 45);
        viewPort = new ƒ.Viewport();
        viewPort.initialize(canvas.id, graph, cmpCamera, canvas);

        viewPort.frameClientToCanvas.setScale(0.5, 0.5);
        viewPort.frameCanvasToDestination.margin = { left: 0, top: 0.5, right: 0, bottom: 0 };
        viewPort.frameCanvasToDestination.padding = { left: 5, top: 0, right: 5, bottom: 5 };
        viewPort.draw();

        viewPort.activatePointerEvent(ƒ.EVENT_POINTER.DOWN, true);
        viewPort.addEventListener(ƒ.EVENT_POINTER.DOWN, hndEvent);

        console.group("Frames");
        console.log("Client: ", viewPort.getClientRectangle());
        console.log("Canvas: ", viewPort.getCanvasRectangle());
        console.log("Destin: ", viewPort.rectDestination);
    }

    function hndEvent(_event: ƒ.EventPointer | ƒ.EventDragDrop): void {
        console.group(`${_event.type} on ${viewPort.name}`);
        let pointClient: ƒ.Vector2 = <ƒ.Vector2>{ x: _event.pointerX, y: _event.pointerY };
        calculate(pointClient);
        console.groupEnd();
    }

    export function calculate(_point: ƒ.Vector2): void {
        let pointCanvas: ƒ.Vector2;
        let pointDestination: ƒ.Vector2;
        let pointCanvasInverse: ƒ.Vector2;
        let pointInverse: ƒ.Vector2;
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