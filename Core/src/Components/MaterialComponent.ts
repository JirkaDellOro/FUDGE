namespace Fudge {
    /**
     * Class that holds all data concerning color and texture, to pass and apply to the node it is attached to.
     */
    export class MaterialComponent extends Component {
        private material: Material;
        
        // TODO: clearify what a "material" actually is and its relation to the shader. Isn't it just shader parameters? Can then the material be independent of the shader?
        public initialize(_material: Material) {
            this.material = _material;
        }

        public get Material(): Material {
            return this.material;
        }


    }
}