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
    }
}