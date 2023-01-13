var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script);
    class ParticleSystemTimeController extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(ParticleSystemTimeController);
        #cmpParticleSystem;
        constructor() {
            super();
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        get scale() {
            return this.#cmpParticleSystem.time.getScale();
        }
        set scale(_value) {
            this.#cmpParticleSystem.time.setScale(_value);
        }
        get time() {
            return this.#cmpParticleSystem.time.get() / 1000;
        }
        set time(_value) {
            this.#cmpParticleSystem.time.set(_value * 1000);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                case "nodeDeserialized" /* NODE_DESERIALIZED */:
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    this.#cmpParticleSystem = this.node.getComponent(ƒ.ComponentParticleSystem);
                    break;
            }
        };
        getMutatorForUserInterface() {
            let mutator = super.getMutator(true);
            mutator.scale = this.scale;
            mutator.time = this.time;
            return mutator;
        }
    }
    Script.ParticleSystemTimeController = ParticleSystemTimeController;
})(Script || (Script = {}));
//# sourceMappingURL=ParticleSystemTimeController.js.map