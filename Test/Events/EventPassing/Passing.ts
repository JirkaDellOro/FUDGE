namespace EventPassing {
    import ƒ = Fudge;
    let canvas: HTMLCanvasElement;
    let camera: ƒ.Node;
    let viewPorts: ƒ.Viewport[] = [];

    window.addEventListener("DOMContentLoaded", init);

    function init(): void {
        let branch: ƒ.Node = Scenes.createAxisCross();
        // initialize RenderManager and transmit content
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.recalculateAllNodeTransforms();

        let posCameras: ƒ.Vector3[] = [new ƒ.Vector3(-1, 2, 3), new ƒ.Vector3(1, 2, 3)];
        let canvasList: HTMLCollectionOf<HTMLCanvasElement> = document.getElementsByTagName("canvas");
        for (let i: number = 0; i < canvasList.length; i++) {
            let camera: ƒ.Node = Scenes.createCamera(posCameras[i]);
            let cmpCamera: ƒ.ComponentCamera = <ƒ.ComponentCamera>camera.getComponent(ƒ.ComponentCamera);
            cmpCamera.projectCentral(1, 45);
            let viewPort: ƒ.Viewport = new ƒ.Viewport();
            viewPort.initialize(canvasList[i].id, branch, cmpCamera, canvasList[i]);
            viewPorts.push(viewPort);
            viewPort.draw();

            viewPort.addEventListener(ƒ.EVENT.FOCUS_IN, hndEvent);
            viewPort.addEventListener(ƒ.EVENT.FOCUS_OUT, hndEvent);

            viewPort.activatePointerEvent(ƒ.EVENT_POINTER.UP, true);
            viewPort.addEventListener(ƒ.EVENT_POINTER.UP, hndEvent);

            viewPort.activateDragDropEvent(ƒ.EVENT_DRAGDROP.START, true);
            viewPort.addEventListener(ƒ.EVENT_DRAGDROP.START, hndEvent);
            viewPort.activateDragDropEvent(ƒ.EVENT_DRAGDROP.DROP, true);
            viewPort.addEventListener(ƒ.EVENT_DRAGDROP.DROP, hndEvent);
            viewPort.activateDragDropEvent(ƒ.EVENT_DRAGDROP.OVER, true);
            viewPort.addEventListener(ƒ.EVENT_DRAGDROP.OVER, hndEvent);

            viewPort.activateKeyboardEvent(ƒ.EVENT_KEYBOARD.DOWN, true);
            // viewPort.addEventListener(ƒ.EVENT_KEYBOARD.DOWN, hndEvent);
            viewPort.addEventListener(ƒ.EVENT_KEYBOARD.DOWN, rotate);
        }
    }

    function hndEvent(_event: ƒ.PointerEventƒ | ƒ.DragDropEventƒ): void {
        if (_event.type == ƒ.EVENT_DRAGDROP.OVER)
            return;

        let viewPort: ƒ.Viewport = getViewport(_event);
        if (_event.type == ƒ.EVENT_POINTER.UP)
            viewPort.setFocus(true);

        console.group(`${_event.type} on ${viewPort.name}`);
        console.log(`Position (${_event.pointerX} | ${_event.pointerY})`);
        console.groupEnd();
    }

    function rotate(_event: ƒ.KeyboardEventƒ): void {
        let viewPort: ƒ.Viewport = getViewport(_event);
        let cmpCameraTransform: ƒ.ComponentTransform = viewPort.camera.getContainer().cmpTransform;
        cmpCameraTransform.translateY(0.1 *
            (_event.code == "ArrowUp" || _event.code == "KeyW" ? 1 :
                _event.code == "ArrowDown" || _event.code == "KeyS" ? -1 :
                    0));
        cmpCameraTransform.translateX(0.1 *
            (_event.code == "ArrowLeft" || _event.code == "KeyA" ? 1 :
                _event.code == "ArrowRight" || _event.code == "KeyD" ? -1 :
                    0));
        cmpCameraTransform.lookAt(new ƒ.Vector3());

        viewPort.draw();
    }

    function getViewport(_event: Event): ƒ.Viewport {
        let viewPort: ƒ.Viewport = <ƒ.Viewport>_event.target;
        return viewPort;
    }
}