namespace FudgeCore {
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
            let serialization: Serialization;
            /* at this point of time, serialization as resource and as inline object is possible. TODO: check if inline becomes obsolete */
            let idMesh: string = this.mesh.idResource;
            if (idMesh)
                serialization = { idMesh: idMesh };
            else
                serialization = { mesh: Serializer.serialize(this.mesh) };

            serialization.pivot = this.pivot.serialize();
            serialization[super.constructor.name] = super.serialize();
            return serialization;
        }

        public deserialize(_serialization: Serialization): Serializable {
            let mesh: Mesh;
            if (_serialization.idMesh)
                mesh = <Mesh>ResourceManager.get(_serialization.idMesh);
            else
                mesh = <Mesh>Serializer.deserialize(_serialization.mesh);
            this.mesh = mesh;

            this.pivot.deserialize(_serialization.pivot);
            super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
        //#endregion
    }
}
