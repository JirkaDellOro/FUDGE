var Picking;
(function (Picking) {
    var ƒ = FudgeCore;
    window.addEventListener("load", start);
    let cmpCamera;
    let viewport;
    let mouse = new ƒ.Vector2();
    async function start(_event) {
        ƒ.Debug.fudge("Start Picking");
        await FudgeCore.Project.loadResourcesFromHTML();
        let canvas = document.querySelector("canvas");
        canvas.addEventListener("mousemove", setCursorPosition);
        // pick the graph to show
        let graph = await ƒ.Project.getResource("Graph|2021-02-03T16:20:47.935Z|07303");
        // setup the viewport
        cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.pivot.translateZ(300);
        cmpCamera.pivot.rotateY(180);
        viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", graph, cmpCamera, canvas);
        // FudgeAid.Viewport.expandCameraToInteractiveOrbit(viewport);
        viewport.draw();
        viewport.createPickBuffers();
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, animate);
        ƒ.Loop.start();
        function animate(_event) {
            viewport.draw();
            adjustRayCamera();
            pickNodeAt(mouse);
            // let color: ƒ.Color = getPixelColor(mouse);           
        }
    }
    function pickNodeAt(_pos) {
        let posRender = viewport.pointClientToRender(new ƒ.Vector2(_pos.x, viewport.getClientRectangle().height - _pos.y));
        let output = document.querySelector("output");
        console.group("Hit");
        let hits = viewport.pickNodeAt(posRender);
        for (let hit of hits)
            console.log(hit.node.name + ":" + hit.zBuffer);
        console.groupEnd();
    }
    function adjustRayCamera() {
        // ƒ.Debug.group("Ray");
        let ray = computeRay();
        // ƒ.Debug.log(ray.direction.toString());
        ray.direction.transform(cmpCamera.pivot);
        // ƒ.Debug.log(ray.direction.toString());
        // ƒ.Debug.groupEnd();
    }
    function computeRay() {
        // let posMouse: ƒ.Vector2 = ƒ.Vector2.DIFFERENCE(mouse, new ƒ.Vector2(rect.width / 2, rect.height / 2));
        // posMouse.y *= -1;
        let posMouse = mouse.copy;
        // setUiPoint("Client", posMouse);
        let posRender = viewport.pointClientToRender(posMouse);
        // setUiPoint("Render", posRender);
        let rect = viewport.getClientRectangle();
        let result;
        result = viewport.frameClientToCanvas.getPoint(posMouse, rect);
        // setUiPoint("Canvas", result);
        rect = viewport.getCanvasRectangle();
        result = viewport.frameCanvasToDestination.getPoint(result, rect);
        // setUiPoint("Destination", result);
        result = viewport.frameDestinationToSource.getPoint(result, viewport.rectSource);
        // setUiPoint("Source", result);
        //TODO: when Source, Render and RenderViewport deviate, continue transformation 
        let posProjection = viewport.pointClientToProjection(posMouse);
        // let rectProjection: ƒ.Rectangle = cmpCamera.getProjectionRectangle();
        // setUiPoint("Projection", posProjection);
        let ray = new ƒ.Ray(new ƒ.Vector3(-posProjection.x, posProjection.y, 1));
        // ray = viewport.getRayFromScreenPoint(posMouse);
        return ray;
    }
    function setCursorPosition(_event) {
        mouse = new ƒ.Vector2(_event.clientX, _event.clientY);
    }
})(Picking || (Picking = {}));
//# sourceMappingURL=Picking.js.map