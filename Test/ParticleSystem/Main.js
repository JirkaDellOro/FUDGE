var ParticleSystemTest;
(function (ParticleSystemTest) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    ƒ.Project.registerScriptNamespace(ParticleSystemTest);
    let viewport;
    window.addEventListener("load", init);
    async function init() {
        let graphId = document.head.querySelector("meta[autoView]").getAttribute("autoView");
        await ƒ.Project.loadResourcesFromHTML();
        let graph = ƒ.Project.resources[graphId];
        if (!graph) {
            alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
            return;
        }
        // setup the viewport
        let cmpCamera = new ƒ.ComponentCamera();
        // cmpCamera.clrBackground = ƒ.Color.CSS("SKYBLUE");
        let canvas = document.querySelector("canvas");
        viewport = new ƒ.Viewport();
        viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
        ƒAid.Viewport.expandCameraToInteractiveOrbit(viewport);
        let fpsSpan = document.getElementById("fps");
        let lastUpdateTime = 0;
        const updateInterval = 200;
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.dispatchEvent(new CustomEvent("start"));
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
        function update(_event) {
            if (ƒ.Loop.timeFrameStartReal - lastUpdateTime > updateInterval) {
                fpsSpan.innerText = "FPS: " + ƒ.Loop.fpsRealAverage.toFixed(0);
                lastUpdateTime = ƒ.Loop.timeFrameStartReal;
            }
            // ƒ.Physics.simulate();  // if physics is included and used
            viewport.draw();
        }
    }
    class ParticleSystemController extends ƒ.ComponentScript {
        static iSubclass = ƒ.Component.registerSubclass(ParticleSystemController);
        dependencyNames = "";
        #cmpParticleSystem;
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
        get dependencies() {
            let dependencies = [];
            let root = this.node?.getAncestor();
            if (!root)
                return dependencies;
            for (let name of this.dependencyNames.split(", ")) {
                let dependency;
                for (let descendant of root) {
                    if (descendant.name == name) {
                        dependency = descendant;
                        break;
                    }
                }
                if (dependency)
                    dependencies.push(dependency);
            }
            return dependencies;
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "nodeDeserialized" /* NODE_DESERIALIZED */:
                    ƒ.Loop.addEventListener("start", this.start);
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        };
        start = (_event) => {
            this.#cmpParticleSystem = this.node.getComponent(ƒ.ComponentParticleSystem);
            let activation = document.getElementById(this.node.name.toLocaleLowerCase());
            let size = document.getElementById(this.node.name.toLocaleLowerCase() + "size");
            activation.checked = this.node.isActive;
            size.value = this.#cmpParticleSystem.size.toString();
            activation.onchange = (_event) => {
                this.node.activate(activation.checked);
                size.hidden = !activation.checked;
                this.dependencies.forEach(_node => _node.activate(activation.checked));
            };
            size.onchange = (_event) => {
                this.#cmpParticleSystem.size = size.valueAsNumber;
            };
            activation.dispatchEvent(new Event("change"));
        };
    }
    ParticleSystemTest.ParticleSystemController = ParticleSystemController;
})(ParticleSystemTest || (ParticleSystemTest = {}));
//# sourceMappingURL=Main.js.map