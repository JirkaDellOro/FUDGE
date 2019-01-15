namespace WebGl2Test3D {

    /**
     * Baseclass for all components that hold data for a sceneobjegt (i.e. fudgeNodes).
     */
    export class Component {

        private name: string; // The name to call the component by
        private parent: FudgeNode; // The sceneObject the component is attached to.

        /**
         * The Superclass' constructor. Initializes dummyvariables, as the actual
         * values will be set by the subclasses constructor.
         */
        public constructor() {
            this.parent = null;
            this.name = "";
        }

        // Get and set methods below.


        public setName(_name:string):void{
            this.name = _name;
        }

        public getName():string{
            return this.name;
        }

        public getParent(): FudgeNode{
            return this.parent;
        }

        public setParent(_parent:FudgeNode):void{
            this.parent = _parent;
        }
    }
}