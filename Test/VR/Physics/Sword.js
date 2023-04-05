var PhysicsVR;
(function (PhysicsVR) {
    var f = FudgeCore;
    f.Project.registerScriptNamespace(PhysicsVR); // Register the namespace to FUDGE for serialization
    class Sword extends f.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = f.Component.registerSubclass(Sword);
        // Properties may be mutated by users in the editor via the automatically created user interface
        static speed = 15;
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
                    this.node.getComponent(f.ComponentRigidbody).addEventListener("ColliderEnteredCollision" /* COLLISION_ENTER */, this.onColiisionEnter);
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
        onColiisionEnter = (_event) => {
            if (_event.cmpRigidbody.node.name == "CubeInstance") {
                if (_event.cmpRigidbody.node) {
                    _event.cmpRigidbody.node.getComponent(PhysicsVR.Translator).hasHitted = true;
                    _event.cmpRigidbody.setVelocity(f.Vector3.DIFFERENCE(_event.cmpRigidbody.mtxPivot.translation, this.node.mtxLocal.translation));
                    _event.cmpRigidbody.effectGravity = 1;
                    this.removeHittedObject(_event.cmpRigidbody.node);
                }
            }
        };
        removeHittedObject = async (_objectHit) => {
            await f.Time.game.delay(1250);
            PhysicsVR.cubeContainer.removeChild(_objectHit);
        };
    }
    PhysicsVR.Sword = Sword;
})(PhysicsVR || (PhysicsVR = {}));
//# sourceMappingURL=Sword.js.map