var ScriptSerialization;
(function (ScriptSerialization) {
    var ƒ = FudgeCore;
    class Test extends ƒ.ComponentScript {
        constructor() {
            super();
            this.startPosition = ƒ.Vector3.ONE(0);
            this.hndAddComponent = (_event) => {
                // ƒ.Debug.log(_event.type, this);
                this.getContainer().cmpTransform.local.translate(this.startPosition);
            };
            this.hndMutation = (_event) => {
                ƒ.Debug.log(_event.type, this);
                if (!this.getContainer())
                    return;
                this.getContainer().cmpTransform.local.translate(this.startPosition);
            };
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndAddComponent);
            this.addEventListener("mutate" /* MUTATE */, this.hndMutation);
        }
        reduceMutator(_mutator) {
            // delete properties that should not be mutated
            // undefined properties with not be included by default
        }
    }
    ScriptSerialization.Test = Test;
})(ScriptSerialization || (ScriptSerialization = {}));
//# sourceMappingURL=Test.js.map