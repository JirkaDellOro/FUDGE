var WebEngine;
(function (WebEngine) {
    /**
     * Superclass for all components that hold data for a sceneobject (i.e. SceneNodes).
     */
    class Component {
        /**
         * The Superclass' constructor. Values will be overridden by subclass constructors
         * values will be set by the subclass' constructor.
         */
        // Get and set methods.######################################################################################
        get Name() {
            return this.name;
        }
        get Container() {
            return this.container;
        }
        set Container(_container) {
            this.container = _container;
        }
    } // End class.
    WebEngine.Component = Component;
})(WebEngine || (WebEngine = {})); // End namespace.
//# sourceMappingURL=Component.js.map