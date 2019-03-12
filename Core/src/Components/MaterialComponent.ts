namespace Fudge {
    /**
     * Class that holds all data concerning color and texture, to pass and apply to the node it is attached to.
     */
    export class MaterialComponent extends Component {
        private material: Material;
        
        public initialize(_material: Material) {
            this.material = _material;
        }

        public get Material(): Material {
            return this.material;
        }


    }
}