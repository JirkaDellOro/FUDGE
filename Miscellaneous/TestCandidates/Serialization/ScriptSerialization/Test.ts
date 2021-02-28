namespace ScriptSerialization {
    import ƒ = FudgeCore;

    export class Test extends ƒ.ComponentScript {
        public startPosition: ƒ.Vector3 = ƒ.Vector3.ONE(0);

        constructor() {
            super();
            this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndAddComponent);
            this.addEventListener(ƒ.EVENT.MUTATE, this.hndMutation);
        }

        hndAddComponent = (_event: Event) => {
            // ƒ.Debug.log(_event.type, this);
            this.getContainer().mtxLocal.translate(this.startPosition);
        }

        hndMutation = (_event: Event) => {
            ƒ.Debug.log(_event.type, this);
            if (!this.getContainer()) return;
            this.getContainer().mtxLocal.translate(this.startPosition);
        }

        protected reduceMutator(_mutator: ƒ.Mutator): void {
            // delete properties that should not be mutated
            // undefined properties with not be included by default
        }
    }
}