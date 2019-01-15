namespace WebGl2Test3D {

    /**
     * Represents an object in a scene.
     */
    export class FudgeNode {
        private name: string;
        private count: number;
        private parent: FudgeNode;
        private children: FudgeNode[];
        private components: Component[];

        /**
         * Creates a new Fudgenode with a name and initializes arrays for children and components.
         * @param _name The name by which the FudgeNode can be called.
         */
        public constructor(_name: string) {
            this.name = _name;
            this.children = [];
            this.components = [];
        }

        /**
         * Sets the name of this FudgeNode.
         * @param _name The name by which the FudgeNode can be called in a scene.
         */
        public setName(_name: string): void {
            this.name = _name;
        }

        /**
         * Returns the name of this FudgeNode.
         */
        public getName(): string {
            return this.name;
        }

        /**
         * Returns the parentnode of this FudgeNode.
         */
        public getParent(): FudgeNode {
            return this.parent;
        }

        /**
         * Sets the parent of this fudgeNode to be the supplied node.
         * Will be called on the child that is appended to this node by appendChild().
         * WARNING!: This function should not be called on its own.
         * @param _parent The parent to be set for this fudgeNode.
         */
        public setParent(_parent: FudgeNode): void {
            this.parent = _parent;
        }

        /**
         * Returns the children array of this fudgeNode.
         */
        public getChildren(): FudgeNode[] {
            return this.children;
        }

        /**
         * Iterates through this fudgeNodes children array and returns a child with the supplied name. 
         * If there are multiple children with the same name in the array, only the first that is found will be returned.
         * Throws error if no child can be found by the supplied name.
         * @param _name The name of the child to be found.
         */
        public getChildByName(_name: string): FudgeNode {
            let child: FudgeNode;
            for (let i: number = 0; i < this.children.length; i++) {
                if (this.children[i].getName() == _name) {
                    child = this.children[i];
                    return child;
                }
            }
            if (child == undefined) {
                throw new Error(`Unable to find child named  '${_name}'in FudgeNode named '${this.getName()}'`);
            }
        }

        /**
         * Push the supplied child into this fudgeNodes children array.
         * Calls setParend method of supplied child with this fudgeNode as parameter.
         * @param _child The child to be pushed into the array
         */
        public appendChild(_child: FudgeNode): void {
            this.children.push(_child);
            _child.setParent(this);
        }

        /**
         * Iterates through this fudgeNodes children array, removes a child with the supplied name and sets the child's parent to null. 
         * If there are multiple children with the same name in the array, only the first that is found will be removed.
         * Throws error if no child can be found by the name.
         * @param _name The name of the child to be removed.
         */
        public removeChild(_name: string): void {
            let child: FudgeNode
            for (let i: number = 0; i < this.children.length; i++) {
                if (this.children[i].getName() == _name) {
                    child = this.children[i];
                    child.setParent(null);
                    this.children.splice(i, 1);
                    break;
                }
            }
            if (child == undefined) {
                throw new Error(`Unable to find child named  '${_name}'in FudgeNode named '${this.getName()}'`);
            }
        }

        /**
         * Returns the component array of this node.
         */
        public getComponents(): Component[] {
            console.log(this.components);
            return this.components;
        }

        /**
         * Iterates through this nodes component array and returns a component with the supplied name. 
         * If there are multiple components with the same name in the array, only the first that is found will be returned.
         * Throws error if no component can be found by the name.
         * @param _name The name of the component to be found.
         */
        public getComponentByName(_name: string): Component {
            let component: Component;
            for (let i: number = 0; i < this.components.length; i++) {
                if (this.components[i].getName() == _name) {
                    component = this.components[i];
                    return component;
                }
            }
            if (component == undefined) {
                throw new Error(`Unable to find component named  '${_name}'in FudgeNode named '${this.getName()}'`);
            }
        }
        /**
         * Push the supplied component into this nodes component array.
         * @param _component The component to be pushed into the array.
         */
        public addComponent(_component: Component): void {
            this.components.push(_component);
            _component.setParent(this);
        }


        /**
         * Iterates through this nodes ccomponent array, removes a component with the supplied name and sets the components parent to null. 
         * If there are multiple components with the same name in the array, only the first that is found will be removed.
         * Throws error if no component can be found by the name.
         * @param _name The name of the component to be found.
         */
        public removeComponent(_name: string): void {
            let component: Component;
            for (let i: number = 0; i < this.components.length; i++) {
                if (this.components[i].getName() == _name) {
                    component = this.components[i];
                    component.setParent(null);
                    this.components.splice(i, 1);
                    break;
                }
            }
            if (component == undefined) {
                throw new Error(`Unable to find component named  '${_name}'in FudgeNode named '${this.getName()}'`);
            }
        }
    }// End class.

}// Close namespace.