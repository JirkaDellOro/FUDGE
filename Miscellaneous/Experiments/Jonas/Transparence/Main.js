"use strict";
///<reference types="../../../../Core/Build/FudgeCore"/>
///<reference types="../../../../Aid/Build/FudgeAid"/>
var Transparence;
///<reference types="../../../../Core/Build/FudgeCore"/>
///<reference types="../../../../Aid/Build/FudgeAid"/>
(function (Transparence) {
    Transparence.f = FudgeCore;
    Transparence.fAid = FudgeAid;
    window.addEventListener("load", hndLoad);
    let root = new Transparence.f.Node("Root");
    let viewport;
    let camera;
    let speedCameraRotation = 0.2;
    let speedCameraTranslation = 0.02;
    function hndLoad(_event) {
        Transparence.f.RenderManager.initialize(true, false);
        Transparence.f.RenderManager.setDepthTest(false);
        Transparence.f.RenderManager.setBlendMode(Transparence.f.BLEND.PARTICLE);
        const canvas = document.querySelector("canvas");
        Transparence.f.Debug.log("Canvas", canvas);
        Transparence.f.Debug.setFilter(Transparence.f.DebugConsole, Transparence.f.DEBUG_FILTER.NONE);
        // enable unlimited mouse-movement (user needs to click on canvas first)
        canvas.addEventListener("mousedown", canvas.requestPointerLock);
        canvas.addEventListener("mouseup", () => document.exitPointerLock());
        Transparence.fAid.addStandardLightComponents(root);
        // setup orbiting camera
        camera = new Transparence.fAid.CameraOrbit(new Transparence.f.ComponentCamera(), 4);
        camera.component.backgroundColor = ƒ.Color.CSS("black");
        root.addChild(camera);
        // setup coordinate axes
        let coordinateSystem = new Transparence.fAid.NodeCoordinateSystem("Coordinates", Transparence.f.Matrix4x4.SCALING(new Transparence.f.Vector3(1, 1, 1)));
        root.addChild(coordinateSystem);
        // setup viewport
        viewport = new Transparence.f.Viewport();
        viewport.initialize("Viewport", root, camera.component, canvas);
        Transparence.f.Debug.log("Viewport", viewport);
        // setup event handling
        viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
        viewport.activateWheelEvent("\u0192wheel" /* WHEEL */, true);
        viewport.addEventListener("\u0192pointermove" /* MOVE */, hndPointerMove);
        viewport.addEventListener("\u0192wheel" /* WHEEL */, hndWheelMove);
        // setup particles
        let img = document.querySelector("img");
        let txtImage = new Transparence.f.TextureImage();
        txtImage.image = img;
        let coat = new Transparence.f.CoatTextured();
        coat.texture = txtImage;
        // TODO: Relevant part is here
        let mesh = new Transparence.f.MeshQuad();
        // let material: f.Material = new f.Material("Material", f.ShaderUniColor, new f.CoatColored(f.Color.CSS("WHITE")));
        // let material: f.Material = new f.Material("Material", f.ShaderFlat, new f.CoatColored(f.Color.CSS("WHITE")));
        let material = new Transparence.f.Material("Material", Transparence.f.ShaderTexture, coat);
        let back = new Transparence.fAid.Node("back", Transparence.f.Matrix4x4.TRANSLATION(new Transparence.f.Vector3(0, 0.5, -1)), material, mesh);
        back.getComponent(Transparence.f.ComponentMaterial).clrPrimary = Transparence.f.Color.CSS("orangered", 1);
        let middle = new Transparence.fAid.Node("middle", Transparence.f.Matrix4x4.TRANSLATION(Transparence.f.Vector3.Z(0)), material, mesh);
        middle.getComponent(Transparence.f.ComponentMaterial).clrPrimary = Transparence.f.Color.CSS("orangered", 1); // only middle is set to be transparent
        let front = new Transparence.fAid.Node("front", Transparence.f.Matrix4x4.TRANSLATION(new Transparence.f.Vector3(0.5, 0, 1)), material, mesh);
        front.getComponent(Transparence.f.ComponentMaterial).clrPrimary = Transparence.f.Color.CSS("orangered", 1);
        let quads = new Transparence.f.Node("quads");
        root.addChild(quads);
        quads.addChild(back);
        quads.addChild(middle);
        quads.addChild(front);
        Transparence.f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        Transparence.f.Loop.start(Transparence.f.LOOP_MODE.TIME_GAME, 30);
        function update(_event) {
            try {
                let mtxCamera = Transparence.f.Matrix4x4.MULTIPLICATION(camera.component.getContainer().mtxWorld, camera.component.pivot);
                for (let quad of root.getChildrenByName("quads")[0].getChildren()) {
                    // quad.mtxLocal.lookAt(mtxCamera.translation); //, f.Vector3.Y());
                    quad.mtxLocal.showTo(mtxCamera.translation); //, f.Vector3.Y());
                }
            }
            catch (_error) {
                ƒ.Debug.warn(_error);
            }
            viewport.draw();
        }
    }
    function hndPointerMove(_event) {
        if (!_event.buttons)
            return;
        camera.rotateY(_event.movementX * speedCameraRotation);
        camera.rotateX(_event.movementY * speedCameraRotation);
    }
    function hndWheelMove(_event) {
        camera.distance = camera.distance + _event.deltaY * speedCameraTranslation;
    }
})(Transparence || (Transparence = {}));
//# sourceMappingURL=Main.js.map