var WebEngine;
(function (WebEngine) {
    /**
     * Class that holds all data concerning color and texture, to pass and apply to the node it is attached to.
     */
    class MaterialComponent extends WebEngine.Component {
        constructor(_material) {
            super();
            this.name = "Material";
            this.material = _material;
        }
        // Get and set methods.######################################################################################
        get Material() {
            return this.material;
        }
    } // End class.
    WebEngine.MaterialComponent = MaterialComponent;
})(WebEngine || (WebEngine = {})); // End namespace.
//# sourceMappingURL=MaterialComponent.js.map