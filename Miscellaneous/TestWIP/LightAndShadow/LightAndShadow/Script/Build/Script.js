"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class CustomComponentScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(CustomComponentScript);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "CustomComponentScript added to ";
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    ƒ.Debug.log(this.message, this.node);
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "nodeDeserialized" /* NODE_DESERIALIZED */:
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        };
    }
    Script.CustomComponentScript = CustomComponentScript;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    /// GAME HIRARCHIE \\\
    let canvas;
    let crc2;
    let graph;
    let viewport;
    let camNode;
    let cmpCamera;
    let point1;
    let point2;
    let point3;
    let pitch = 15;
    let pitchSpeed = 1.5;
    let yaw = 180;
    let yawSpeed = 0.5;
    let bounceSpeed = 0.01;
    let x1 = 0;
    let x2 = 1.05;
    let x3 = 2.1;
    let fps = [];
    let phong;
    let gouraud;
    let toggleShading = false;
    let toggleMist = false;
    let toggleBloom = false;
    let toggleAo = false;
    let toggleMovement = true;
    window.addEventListener("load", init);
    document.addEventListener("interactiveViewportStarted", start);
    function init(_event) {
        startViewport();
    }
    function startViewport() {
        window.addEventListener("keydown", hndKeydown);
        canvas = document.querySelector("canvas");
        crc2 = canvas.getContext("2d");
        document.getElementById("info").style.display = "none";
        setupViewport();
    }
    async function setupViewport() {
        // load resources referenced in the link-tag
        await FudgeCore.Project.loadResourcesFromHTML();
        FudgeCore.Debug.log("Project:", FudgeCore.Project.resources);
        // pick the graph to show
        graph = FudgeCore.Project.resources["Graph|2023-06-14T22:31:41.192Z|38185"];
        FudgeCore.Debug.log("Graph:", graph);
        if (!graph) {
            alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
            return;
        }
        // setup the viewport
        let cmpCamera = new FudgeCore.ComponentCamera();
        viewport = new FudgeCore.Viewport();
        viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
        viewport.draw();
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
    }
    function start(_event) {
        viewport = _event.detail;
        camNode = graph.getChildrenByName("camCenter")[0];
        viewport.camera = cmpCamera = camNode.getChildren()[0].getComponent(ƒ.ComponentCamera);
        point1 = graph.getChildrenByName("light")[0].getChildrenByName("points")[0].getChildren()[0];
        point2 = graph.getChildrenByName("light")[0].getChildrenByName("points")[0].getChildren()[1];
        point3 = graph.getChildrenByName("light")[0].getChildrenByName("points")[0].getChildren()[2];
        phong = graph.getChildrenByName("phong")[0];
        gouraud = graph.getChildrenByName("gouraud")[0];
        console.log(point1);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        viewport.draw();
        if (toggleMovement)
            yaw += yawSpeed;
        camNode.mtxLocal.rotation = new ƒ.Vector3(pitch, yaw, 0);
        for (let i = 0; i < phong.getChildren().length; i++) {
            phong.getChildren()[i].getComponent(ƒ.ComponentMesh).activate(!toggleShading);
        }
        for (let i = 0; i < gouraud.getChildren().length; i++) {
            gouraud.getChildren()[i].getComponent(ƒ.ComponentMesh).activate(toggleShading);
        }
        camNode.getChildren()[0].getComponent(ƒ.ComponentMist).activate(!toggleMist);
        camNode.getChildren()[0].getComponent(ƒ.ComponentBloom).activate(!toggleBloom);
        camNode.getChildren()[0].getComponent(ƒ.ComponentAmbientOcclusion).activate(!toggleAo);
        crc2.fillStyle = "#fff";
        crc2.font = canvas.height * 0.012 + "px sans-serif";
        crc2.fillText("S to toggle old and new shading; M to toglle Mist, B to toggle Bloom and A to toggle AO; Press the Up or Down key to change the cameras pitch", canvas.height * 0.05, canvas.height * 0.07);
        let deltafps = 0;
        if (fps.length > 30) {
            fps.splice(0, 1);
        }
        fps.push(1000 / ƒ.Loop.timeFrameGame);
        for (let i = 0; i < fps.length; i++) {
            deltafps += fps[i];
        }
        deltafps = deltafps / fps.length;
        crc2.fillText("FPS: " + Math.round(deltafps), canvas.width * 0.95, canvas.height * 0.05);
        crc2.font = canvas.height * 0.02 + "px sans-serif";
        if (toggleShading) {
            crc2.fillText("OLD: Gouraud shading", canvas.height * 0.05, canvas.height * 0.05);
        }
        else {
            crc2.fillText("NEW: Phong shading + Normal Maps", canvas.height * 0.05, canvas.height * 0.05);
        }
        if (toggleMovement) {
            if (x1 < Math.PI) {
                x1 += bounceSpeed;
            }
            else {
                x1 = 0;
            }
            if (x2 < Math.PI) {
                x2 += bounceSpeed;
            }
            else {
                x2 = 0;
            }
            if (x3 < Math.PI) {
                x3 += bounceSpeed;
            }
            else {
                x3 = 0;
            }
            point1.mtxLocal.translation = new ƒ.Vector3(0.15, Math.sin(x1) / 2, 0);
            point2.mtxLocal.translation = new ƒ.Vector3(-0.15, Math.sin(x2) / 2, 0);
            point3.mtxLocal.translation = new ƒ.Vector3(0, Math.sin(x3) / 2, 0.15);
        }
    }
    function hndKeydown(_event) {
        switch (_event.code) {
            case "KeyS":
                toggleShading = !toggleShading;
                break;
            case "KeyM":
                toggleMist = !toggleMist;
                break;
            case "KeyB":
                toggleBloom = !toggleBloom;
                break;
            case "KeyA":
                toggleAo = !toggleAo;
                break;
            case "ArrowUp":
                pitch = Math.max(Math.min(pitch + pitchSpeed, 90), -8);
                break;
            case "ArrowDown":
                pitch = Math.max(Math.min(pitch - pitchSpeed, 90), -8);
                break;
            case "ArrowLeft":
                if (!toggleMovement)
                    yaw -= pitchSpeed;
                break;
            case "ArrowRight":
                if (!toggleMovement)
                    yaw += pitchSpeed;
                break;
            case "Space":
                toggleMovement = !toggleMovement;
                break;
        }
    }
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map