namespace Fudge {
    /**
     * Attaches a transform-[[Matrix4x4]] to the node, moving, scaling and rotating it in space relative to its parent.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class ComponentTransform extends Component {
        public local: Matrix4x4;

        public constructor(_matrix: Matrix4x4 = Matrix4x4.IDENTITY) {
            super();
            this.local = _matrix;
        }

        //#region Transfer
        public serialize(): Serialization {
            let serialization: Serialization = {
                local: this.local.serialize(),
                [super.type]: super.serialize()
            };
            return serialization;
        }
        public deserialize(_serialization: Serialization): Serializable {
            super.deserialize(_serialization[super.type]);
            this.local.deserialize(_serialization.local);
            return this;
        }

        public mutate(_mutator: Mutator): void {
            this.local.mutate(_mutator);
        }
        public getMutator(): Mutator { 
            return this.local.getMutator();
        }
        protected reduceMutator(_mutator: Mutator): void {
            delete _mutator.world;
            super.reduceMutator(_mutator);
        }
        //#endregion
    }
}
