var PhysicsVR;
(function (PhysicsVR) {
    var f = FudgeCore;
    f.Project.registerScriptNamespace(PhysicsVR); // Register the namespace to FUDGE for serialization
    class Translator extends f.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = f.Component.registerSubclass(Translator);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "Translator added to ";
        static speed = 0.1;
        constructor() {
            super();
            // Don't start when running in editor
            if (f.Project.mode == f.MODE.EDITOR)
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
                    f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                    f.Loop.start();
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
        randomRot = f.Random.default.getRange(-0.5, 0.5);
        update = (_event) => {
            this.node.getComponent(f.ComponentTransform).mtxLocal.translateZ(Translator.speed);
            // this.node.getComponent(f.ComponentTransform).mtxLocal.rotateX(0.1);
            this.node.getComponent(f.ComponentTransform).mtxLocal.rotateZ(this.randomRot);
            if (this.node.getComponent(f.ComponentTransform).mtxLocal.translation.z > 70)
                PhysicsVR.cubeContainer.removeChild(this.node);
        };
    }
    PhysicsVR.Translator = Translator;
})(PhysicsVR || (PhysicsVR = {}));
//# sourceMappingURL=Translator.js.map