"use strict";
///<reference types="../../../../Core/Build/FudgeCore"/>
///<reference types="../../../../Aid/Build/FudgeAid"/>
var MutatorGeneration;
///<reference types="../../../../Core/Build/FudgeCore"/>
///<reference types="../../../../Aid/Build/FudgeAid"/>
(function (MutatorGeneration) {
    var f = FudgeCore;
    var fAid = FudgeAid;
    window.addEventListener("load", hndLoad);
    let root = new f.Node("Root");
    let particle;
    let viewport;
    let camera;
    let speedCameraRotation = 0.2;
    let speedCameraTranslation = 0.02;
    function hndLoad(_event) {
        f.RenderManager.initialize(true, false);
        f.RenderManager.setDepthTest(false);
        f.RenderManager.setBlendMode(f.BLEND.PARTICLE);
        const canvas = document.querySelector("canvas");
        f.Debug.log("Canvas", canvas);
        f.Debug.setFilter(f.DebugConsole, f.DEBUG_FILTER.ERROR);
        // enable unlimited mouse-movement (user needs to click on canvas first)
        canvas.addEventListener("mousedown", canvas.requestPointerLock);
        canvas.addEventListener("mouseup", () => document.exitPointerLock());
        // setup orbiting camera
        camera = new fAid.CameraOrbit(new f.ComponentCamera(), 4);
        camera.component.backgroundColor = f.Color.CSS("black");
        root.addChild(camera);
        // setup coordinate axes
        let coordinateSystem = new fAid.NodeCoordinateSystem("Coordinates", f.Matrix4x4.SCALING(new f.Vector3(1, 1, 1)));
        root.addChild(coordinateSystem);
        // setup viewport
        viewport = new f.Viewport();
        viewport.initialize("Viewport", root, camera.component, canvas);
        f.Debug.log("Viewport", viewport);
        // setup event handling
        viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
        viewport.activateWheelEvent("\u0192wheel" /* WHEEL */, true);
        viewport.addEventListener("\u0192pointermove" /* MOVE */, hndPointerMove);
        viewport.addEventListener("\u0192wheel" /* WHEEL */, hndWheelMove);
        // setup particle
        let img = document.querySelector("img");
        let txtImage = new f.TextureImage();
        txtImage.image = img;
        let coat = new f.CoatTextured();
        coat.texture = txtImage;
        let material = new f.Material("Material", f.ShaderTexture, coat);
        let mesh = new f.MeshQuad();
        particle = new fAid.Node("Particle", f.Matrix4x4.IDENTITY(), material, mesh);
        root.addChild(particle);
        let storedValues = {
            "time": 0,
            "index": 0,
            "size": 1
        };
        let functionData;
        let randomNumbers = [];
        for (let i = 0; i < 1000; i++) {
            randomNumbers.push(Math.random());
        }
        // console.log(particle.getComponent(f.ComponentTransform).getMutator());
        // console.log(particle.getComponent(f.ComponentMaterial).getMutator());
        let importer = new MutatorGeneration.ParticleEffectImporter(storedValues, randomNumbers);
        functionData = importer.importFile("data.json");
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        // update();
        f.Loop.start(f.LOOP_MODE.TIME_GAME, 30);
        function update(_event = null) {
            storedValues["time"] = f.Time.game.get() / 1000;
            // particleSystem.updateParticleEffect(time);
            // console.log(particle.getComponent(f.ComponentTransform).getMutator());
            // evalute update storage
            let storage = functionData["Storage"];
            let update = storage["update"];
            for (const key in update) {
                storedValues[key] = update[key]();
            }
            // evalute closures
            for (const componentKey in functionData) {
                let component;
                switch (componentKey) {
                    case "ComponentTransform":
                        component = particle.getComponent(f.ComponentTransform);
                        break;
                    case "ComponentMaterial":
                        component = particle.getComponent(f.ComponentMaterial);
                        break;
                    default:
                        continue;
                }
                component.mutate(getMutator(functionData[componentKey]));
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
    function getMutator(_functionData) {
        let mutator = {};
        for (const attribute in _functionData) {
            let value = _functionData[attribute];
            if (typeof value === "function") {
                mutator[attribute] = value();
            }
            else {
                mutator[attribute] = getMutator(value);
            }
        }
        return mutator;
    }
})(MutatorGeneration || (MutatorGeneration = {}));
//# sourceMappingURL=Main.js.map