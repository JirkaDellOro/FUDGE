var VRIntegration;
(function (VRIntegration) {
    var f = FudgeCore;
    f.Project.registerScriptNamespace(VRIntegration); // Register the namespace to FUDGE for serialization
    class Translator extends f.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = f.Component.registerSubclass(Translator);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "CustomComponentScript added to ";
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
        hasToTurn = false;
        update = (_event) => {
            if (this.node.name != "FudgeLogo") {
                if (this.node.getComponent(f.ComponentTransform).mtxLocal.translation.x < 6.1 && !this.hasToTurn) {
                    this.node.getComponent(f.ComponentRigidbody).applyForce(f.Vector3.X(2.2));
                    if (this.node.getComponent(f.ComponentTransform).mtxLocal.translation.x > 6)
                        this.hasToTurn = true;
                }
                else if (this.node.getComponent(f.ComponentTransform).mtxLocal.translation.x > -6.1 && this.hasToTurn) {
                    this.node.getComponent(f.ComponentRigidbody).applyForce(f.Vector3.X(-2.2));
                    if (this.node.getComponent(f.ComponentTransform).mtxLocal.translation.x < -6)
                        this.hasToTurn = false;
                }
            }
            else
                this.node.getComponent(f.ComponentTransform).mtxLocal.rotateY(0.1);
        };
    }
    VRIntegration.Translator = Translator;
})(VRIntegration || (VRIntegration = {}));
//# sourceMappingURL=Translator.js.map