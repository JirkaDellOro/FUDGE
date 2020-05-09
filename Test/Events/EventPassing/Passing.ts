namespace EventPassing {
    import ƒ = FudgeCore;
    
    
    let canvas: HTMLCanvasElement;
    let camera: ƒ.Node;
    let viewPorts: ƒ.Viewport[] = [];

    window.addEventListener("DOMContentLoaded", init);

    function init(): void {
        let graph: ƒ.Node = Scenes.createAxisCross();

        let posCameras: ƒ.Vector3[] = [new ƒ.Vector3(-1, 2, 3), new ƒ.Vector3(1, 2, 3)];
        let canvasList: HTMLCollectionOf<HTMLCanvasElement> = document.getElementsByTagName("canvas");
        for (let i: number = 0; i < canvasList.length; i++) {
            let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(posCameras[i]);
            cmpCamera.projectCentral(1, 45);
            let viewport: ƒ.Viewport = new ƒ.Viewport();
            viewport.initialize(canvasList[i].id, graph, cmpCamera, canvasList[i]);
            viewPorts.push(viewport);
            viewport.draw();

            viewport.addEventListener(ƒ.EVENT.FOCUS_IN, hndEvent);
            viewport.addEventListener(ƒ.EVENT.FOCUS_OUT, hndEvent);

            viewport.activatePointerEvent(ƒ.EVENT_POINTER.UP, true);
            viewport.addEventListener(ƒ.EVENT_POINTER.UP, hndEvent);

            viewport.activateDragDropEvent(ƒ.EVENT_DRAGDROP.START, true);
            viewport.addEventListener(ƒ.EVENT_DRAGDROP.START, hndEvent);
            viewport.activateDragDropEvent(ƒ.EVENT_DRAGDROP.DROP, true);
            viewport.addEventListener(ƒ.EVENT_DRAGDROP.DROP, hndEvent);
            viewport.activateDragDropEvent(ƒ.EVENT_DRAGDROP.OVER, true);
            viewport.addEventListener(ƒ.EVENT_DRAGDROP.OVER, hndEvent);

            Scenes.dollyViewportCamera(viewport);
        }
    }

    function hndEvent(_event: ƒ.EventPointer | ƒ.EventDragDrop): void {
        if (_event.type == ƒ.EVENT_DRAGDROP.OVER)
            return;

        let viewPort: ƒ.Viewport = getViewport(_event);
        if (_event.type == ƒ.EVENT_POINTER.UP)
            viewPort.setFocus(true);

        console.group(`${_event.type} on ${viewPort.name}`);
        console.log(`Position (${_event.pointerX} | ${_event.pointerY})`);
        console.groupEnd();
    }

    function getViewport(_event: Event): ƒ.Viewport {
        let viewport: ƒ.Viewport = <ƒ.Viewport>_event.target;
        return viewport;
    }
}