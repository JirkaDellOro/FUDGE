var EventPassing;
(function (EventPassing) {
    var ƒ = FudgeCore;
    let canvas;
    let camera;
    let viewPorts = [];
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        let graph = Scenes.createAxisCross();
        let posCameras = [new ƒ.Vector3(-1, 2, 3), new ƒ.Vector3(1, 2, 3)];
        let canvasList = document.getElementsByTagName("canvas");
        for (let i = 0; i < canvasList.length; i++) {
            let cmpCamera = Scenes.createCamera(posCameras[i]);
            cmpCamera.projectCentral(1, 45);
            let viewport = new ƒ.Viewport();
            viewport.initialize(canvasList[i].id, graph, cmpCamera, canvasList[i]);
            viewPorts.push(viewport);
            viewport.draw();
            viewport.addEventListener("focusin" /* FOCUS_IN */, hndEvent);
            viewport.addEventListener("focusout" /* FOCUS_OUT */, hndEvent);
            viewport.activatePointerEvent("\u0192pointerup" /* UP */, true);
            viewport.addEventListener("\u0192pointerup" /* UP */, hndEvent);
            viewport.activateDragDropEvent("\u0192dragstart" /* START */, true);
            viewport.addEventListener("\u0192dragstart" /* START */, hndEvent);
            viewport.activateDragDropEvent("\u0192drop" /* DROP */, true);
            viewport.addEventListener("\u0192drop" /* DROP */, hndEvent);
            viewport.activateDragDropEvent("\u0192dragover" /* OVER */, true);
            viewport.addEventListener("\u0192dragover" /* OVER */, hndEvent);
            Scenes.dollyViewportCamera(viewport);
        }
    }
    function hndEvent(_event) {
        if (_event.type == "\u0192dragover" /* OVER */)
            return;
        let viewPort = getViewport(_event);
        if (_event.type == "\u0192pointerup" /* UP */)
            viewPort.setFocus(true);
        console.group(`${_event.type} on ${viewPort.name}`);
        console.log(`Position (${_event.pointerX} | ${_event.pointerY})`);
        console.groupEnd();
    }
    function getViewport(_event) {
        let viewport = _event.target;
        return viewport;
    }
})(EventPassing || (EventPassing = {}));
//# sourceMappingURL=Passing.js.map