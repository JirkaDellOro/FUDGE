namespace Fudge {
    /**
     * Class to hold all data needed by the WebGL vertexbuffer to draw the shape of an object.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class ComponentMesh extends Component {
        public pivot: Matrix4x4 = Matrix4x4.IDENTITY;
        private mesh: Mesh = null;

        public setMesh(_mesh: Mesh): void {
            this.mesh = _mesh;
        }
        public getMesh(): Mesh {
            return this.mesh;
        }

        public serialize(): Serialization {
            let serialization: Serialization = {
                mesh: this.mesh.serialize(),
                [super.type]: super.serialize()
            };
            return serialization;
        }
        public deserialize(_serialization: Serialization): Serializable {
            let mesh: Mesh = <Mesh>Serializer.deserialize(_serialization.mesh);
            this.setMesh(mesh);
            super.deserialize(_serialization[super.type]);
            return this;
        }
    }
}
