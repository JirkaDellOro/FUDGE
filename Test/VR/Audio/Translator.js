var AudioSceneVR;
(function (AudioSceneVR) {
    var f = FudgeCore;
    f.Project.registerScriptNamespace(AudioSceneVR); // Register the namespace to FUDGE for serialization
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
        isTranslating = false;
        update = (_event) => {
            if (this.isTranslating) {
                if (this.node.getComponent(f.ComponentTransform).mtxLocal.translation.x < 8.1 && !this.hasToTurn) {
                    this.node.mtxLocal.translateX(0.01);
                    if (this.node.getComponent(f.ComponentTransform).mtxLocal.translation.x > 8)
                        this.hasToTurn = true;
                }
                else if (this.node.getComponent(f.ComponentTransform).mtxLocal.translation.x > -8.1 && this.hasToTurn) {
                    this.node.mtxLocal.translateX(-0.01);
                    if (this.node.getComponent(f.ComponentTransform).mtxLocal.translation.x < -8)
                        this.hasToTurn = false;
                }
            }
        };
    }
    AudioSceneVR.Translator = Translator;
})(AudioSceneVR || (AudioSceneVR = {}));
//# sourceMappingURL=Translator.js.map