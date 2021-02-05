var Picking;
(function (Picking) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    window.addEventListener("load", start);
    let cmpCamera;
    let viewport;
    let mouse = new ƒ.Vector2();
    let cursor = new ƒAid.Node("Cursor", ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(0.05)), new ƒ.Material("Cursor", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("darkgray"))), new ƒ.MeshSphere("Cursor", 5, 5));
    class Data extends ƒ.Mutable {
        constructor() {
            super(...arguments);
            this.red = 100;
            this.green = 100;
            this.blue = 100;
            this.yellow = 100;
        }
        reduceMutator(_mutator) { }
    }
    let data = new Data();
    let uiController;
    async function start(_event) {
        ƒ.Debug.fudge("Start Picking");
        // let domHud: HTMLDivElement = document.querySelector("div#ui");
        // uiController = new ƒUi.Controller(data, domHud);
        await FudgeCore.Project.loadResourcesFromHTML();
        let canvas = document.querySelector("canvas");
        canvas.addEventListener("mousemove", setCursorPosition);
        // pick the graph to show
        let graph = await ƒ.Project.getResource("Graph|2021-02-03T16:20:47.935Z|07303");
        graph.appendChild(cursor);
        // setup the viewport
        cmpCamera = new ƒ.ComponentCamera();
        Reflect.set(cmpCamera, "far", 4.3);
        // Reflect.set(cmpCamera, "fieldOfView", 170);
        cmpCamera.pivot.translateZ(2.1);
        cmpCamera.pivot.rotateY(180);
        viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", graph, cmpCamera, canvas);
        // FudgeAid.Viewport.expandCameraToInteractiveOrbit(viewport);
        viewport.draw();
        viewport.createPickBuffers();
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 30);
        // canvas.addEventListener("mousemove", update);
        // window.addEventListener("resize", viewport.createPickBuffers.bind(viewport));
        function update(_event) {
            viewport.draw();
            pickNodeAt(mouse);
        }
    }
    function pickNodeAt(_pos) {
        let mouseUp = new ƒ.Vector2(_pos.x, viewport.getClientRectangle().height - _pos.y);
        let posRender = viewport.pointClientToRender(mouseUp);
        let hits = viewport.pickNodeAt(posRender);
        for (let hit of hits) {
            data[hit.node.name] = hit.zBuffer / 128 - 1 || -1;
        }
        let posClip = new ƒ.Vector3(2 * mouse.x / viewport.getClientRectangle().width - 1, 1 - 2 * mouse.y / viewport.getClientRectangle().height, hits[0].zBuffer / 128 - 1);
        let mtxViewProjectionInverse = ƒ.Matrix4x4.INVERSION(cmpCamera.ViewProjectionMatrix);
        let m = mtxViewProjectionInverse.get();
        let rayWorld = ƒ.Vector3.TRANSFORMATION(posClip, mtxViewProjectionInverse, true);
        let w = m[3] * posClip.x + m[7] * posClip.y + m[11] * posClip.z + m[15];
        rayWorld.scale(1 / w);
        cursor.mtxLocal.translation = rayWorld;
    }
    function setCursorPosition(_event) {
        mouse = new ƒ.Vector2(_event.clientX, _event.clientY);
    }
})(Picking || (Picking = {}));
//# sourceMappingURL=Picking.js.map