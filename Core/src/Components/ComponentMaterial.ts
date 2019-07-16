namespace Fudge {
    /**
     * Attaches a [[Material]] to the node
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class ComponentMaterial extends Component {
        public material: Material;

        public constructor(_material: Material = null) {
            super();
            this.material = _material;
        }
        
        //#region Transfer
        public serialize(): Serialization {
            let serialization: Serialization = {
                material: this.material.serialize(),
                [super.constructor.name]: super.serialize()
            };
            return serialization;
        }
        public deserialize(_serialization: Serialization): Serializable {
            let material: Material = <Material>Serializer.deserialize(_serialization.material);
            this.material = material;
            super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
        //#endregion
    }
}