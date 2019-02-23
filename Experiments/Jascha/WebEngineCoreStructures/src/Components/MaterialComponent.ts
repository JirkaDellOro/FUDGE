namespace WebEngine {


    /**
     * Class that holds all data concerning color and texture, to pass and apply to the node it is attached to.
     */
    export class MaterialComponent extends Component {

        private material: Material;


        public constructor(_material: Material) {
            super();
            this.name = "Material";
            this.material = _material;

        }

        // Get and set methods.######################################################################################
        public get Material(): Material {
            return this.material;
        }


    }// End class.
}// End namespace.