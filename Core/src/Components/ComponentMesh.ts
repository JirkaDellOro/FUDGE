namespace Fudge {
    /**
     * Attaches a [[Mesh]] to the node
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class ComponentMesh extends Component {
        public pivot: Matrix4x4 = Matrix4x4.IDENTITY;
        public mesh: Mesh = null;

        public constructor(_mesh: Mesh = null) {
            super();
            this.mesh = _mesh;
        }

        //#region Transfer
        public serialize(): Serialization {
            let serialization: Serialization = {
                mesh: this.mesh.serialize(),
                [super.type]: super.serialize()
            };
            return serialization;
        }
        public deserialize(_serialization: Serialization): Serializable {
            let mesh: Mesh = <Mesh>Serializer.deserialize(_serialization.mesh);
            this.mesh = mesh;
            super.deserialize(_serialization[super.type]);
            return this;
        }
        //#endregion
    }
}
