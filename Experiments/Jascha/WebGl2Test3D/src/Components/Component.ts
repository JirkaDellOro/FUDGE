namespace WebEngine {

    /**
     * Superclass for all components that hold data for a sceneobject (i.e. SceneNodes).
     */
    export abstract class Component {

        protected name: string; // The name to call the component by
        protected container: FudgeNode; // The sceneObject the component is attached to.

        /**
         * The Superclass' constructor. Values will be overridden by subclass constructors
         * values will be set by the subclass' constructor.
         */

        // Get and set methods.######################################################################################
        public get Name():string{
            return this.name;
        }
        public get Container(): FudgeNode{
            return this.container;
        }
        public set Container(_container:FudgeNode){
            this.container = _container;
        }
    }// End class.
}// End namespace.