namespace Fudge {
    /**
     * Class to hold the transformation-data of the node it is attached to. Extends PivotComponent for fewer redundancies.
     * Affects the origin of a node and its descendants. Use [[ComponentPivot]] to transform only the mesh attached
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class ComponentTransform extends ComponentPivot {
        public worldMatrix: Matrix4x4;

        public constructor() {
            super();
            this.worldMatrix = Matrix4x4.identity();
        }

        public get WorldPosition(): Vector3 {
            return new Vector3(this.worldMatrix.data[12], this.worldMatrix.data[13], this.worldMatrix.data[14]);
        }

        public serialize(): Serialization {
            let serialization: Serialization = {
                // worldMatrix: this.worldMatrix.serialize(),  // is transient, doesn't need to be serialized...     
                [super.constructor.name]: super.serialize()
            };
            return serialization;
        }
        public deserialize(_serialization: Serialization): Serializable {
            // this.worldMatrix.deserialize(_serialization.worldMatrix);
            super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
    }
}
