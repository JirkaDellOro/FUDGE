///<reference types="../../../UserInterface/Build/FudgeUserInterface"/>
var Picking;
///<reference types="../../../UserInterface/Build/FudgeUserInterface"/>
(function (Picking) {
    var ƒ = FudgeCore;
    var ƒUi = FudgeUserInterface;
    var ƒAid = FudgeAid;
    window.addEventListener("load", start);
    let cmpCamera;
    let viewport;
    let viewportPick = new ƒ.Viewport();
    let cameraPick;
    let mouse = new ƒ.Vector2();
    let cursor = new ƒAid.Node("Cursor", ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(0.05)), new ƒ.Material("Cursor", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("darkgray"))), new ƒ.MeshSphere("Cursor", 5, 5));
    class Data extends ƒ.Mutable {
        constructor() {
            super(...arguments);
            this.red = 100;
            this.green = 100;
            this.blue = 100;
            this.yellow = 100;
            this.cursor = 100;
        }
        reduceMutator(_mutator) { }
    }
    let data = new Data();
    let uiController;
    async function start(_event) {
        ƒ.Debug.fudge("Start Picking");
        let domHud = document.querySelector("div#ui");
        uiController = new ƒUi.Controller(data, domHud);
        await FudgeCore.Project.loadResourcesFromHTML();
        let canvas = document.querySelector("canvas");
        canvas.addEventListener("mousemove", setCursorPosition);
        // pick the graph to show
        let graph = await ƒ.Project.getResource("Graph|2021-02-03T16:20:47.935Z|07303");
        graph.appendChild(cursor);
        // setup the viewport
        cmpCamera = new ƒ.ComponentCamera();
        Reflect.set(cmpCamera, "far", 7.3);
        // Reflect.set(cmpCamera, "fieldOfView", 170);
        cmpCamera.mtxPivot.translateX(0.3);
        cmpCamera.mtxPivot.translateZ(2.1);
        // cmpCamera.pivot.translateY(-2.1);
        cmpCamera.mtxPivot.lookAt(ƒ.Vector3.ZERO());
        viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", graph, cmpCamera, canvas);
        // FudgeAid.Viewport.expandCameraToInteractiveOrbit(viewport);
        viewport.draw();
        let canvasPick = document.createElement("canvas");
        canvasPick.width = 10;
        canvasPick.height = 10;
        cameraPick = new ƒ.ComponentCamera();
        cameraPick.mtxPivot.set(cmpCamera.mtxPivot);
        cameraPick.projectCentral(1, 10);
        viewportPick.initialize("pick", graph, cameraPick, canvasPick);
        viewportPick.adjustingFrames = false;
        // viewportPick.adjustingCamera = false;
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 30);
        // canvas.addEventListener("mousemove", update);
        // window.addEventListener("resize", viewport.createPickBuffers.bind(viewport));
        function update(_event) {
            viewport.draw();
            pick();
        }
    }
    function pick() {
        let posProjection = viewport.pointClientToProjection(mouse);
        let ray = new ƒ.Ray(new ƒ.Vector3(posProjection.x, posProjection.y, 1));
        // let ray: ƒ.Ray = viewport.getRayFromClient(mouse);
        cameraPick.mtxPivot.lookAt(ray.direction);
        cameraPick.projectCentral(1, 0.001);
        cursor.getComponent(ƒ.ComponentMesh).activate(false);
        // let picks: ƒ.Pick[] = viewportPick.pick();
        let picks = ƒ.Picker.pickViewport(viewport, mouse);
        cursor.getComponent(ƒ.ComponentMesh).activate(true);
        picks.sort((a, b) => a.zBuffer > b.zBuffer ? 1 : -1);
        for (let hit of picks) {
            data[hit.node.name] = hit.zBuffer;
        }
        if (picks.length) {
            let pick = picks[0];
            cursor.mtxLocal.translation = pick.posWorld;
            // console.log(pick.normal.toString());
        }
    }
    function setCursorPosition(_event) {
        mouse = new ƒ.Vector2(_event.clientX, _event.clientY);
    }
})(Picking || (Picking = {}));
//# sourceMappingURL=Picking.js.map