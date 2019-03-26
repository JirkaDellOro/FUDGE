namespace Fudge {
    export interface MapClassToComponents {
        [className: string]: Component[];
    }
    export interface MapStringToNode {
        [key: string]: Node;
    }
    /**
     * Represents a node in the scenetree.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class Node implements Serializable {
        public name: string; // The name to call this node by.
        private parent: Node | null = null; // The parent of this node.
        private children: MapStringToNode = {}; // Associative array nodes appended to this node.
        private components: MapClassToComponents = {};
        // private tags: string[] = []; // Names of tags that are attached to this node. (TODO: As of yet no functionality)
        // private layers: string[] = []; // Names of the layers this node is on. (TODO: As of yet no functionality)

        /**
         * Creates a new node with a name and initializes all attributes
         * @param _name The name by which the node can be called.
         */
        public constructor(_name: string) {
            this.name = _name;
        }

        public getParent(): Node | null {
            return this.parent;
        }

        public get cmpTransform(): ComponentTransform {
            return <ComponentTransform>this.getComponents(ComponentTransform)[0];
        }

        // #region Hierarchy
        /**
         * Returns the children array of this node.
         */
        public getChildren(): MapStringToNode {
            return this.children; //.slice(0); Return a clone of the list of children
        }
        /**
         * Looks through this Nodes children array and returns a child with the supplied name. 
         * If there are multiple children with the same name in the array, only the first that is found will be returned.
         * Throws error if no child can be found by the supplied name.
         * @param _name The name of the child to be found.
         */
        public getChildByName(_name: string): Node {
            let child: Node;
            if (this.children[_name] != undefined) {
                child = this.children[_name];
                return child;
            }
            else {
                throw new Error(`Unable to find component named  '${_name}'in node named '${this.name}'`);
            }
        }

        /**
         * Adds the supplied child into this nodes children array.
         * Calls setParent method of supplied child with this Node as parameter.
         * @param _child The child to be pushed into the array
         */
        public appendChild(_child: Node): void {
            let name: string = _child.name;
            if (this.children[name] != undefined) {
                throw new Error(`There is already a Child by the name '${_child.name}' in node named '${this.name}'`);
            }
            else {
                this.children[name] = _child;
                _child.setParent(this);
            }
        }

        /**
         * Looks through this nodes children array, removes a child with the supplied name and sets the child's parent to undefined. 
         * If there are multiple children with the same name in the array, only the first that is found will be removed.
         * Throws error if no child can be found by the name.
         * @param _name The name of the child to be removed.
         */
        public removeChild(_name: string): void {
            if (this.children[_name] != undefined) {
                let child: Node = this.children[_name];
                child.setParent(null);
                delete this.children[_name];
            }
            else {
                throw new Error(`Unable to find child named  '${_name}'in node named '${this.name}'`);
            }
        }
        // #endregion

        // #region Components
        /**
         * Returns a clone of the list of components of the given class attached this node. 
         * @param _class The class of the components to be found.
         */
        public getComponents(_class: typeof Component): Component[] {
            return (this.components[_class.name] || []).slice(0) ;
        }

        /**
         * Adds the supplied component into the nodes component map.
         * @param _component The component to be pushed into the array.
         */
        public addComponent(_component: Component): void {
            if (_component.getContainer() == this)
                return;  
            if (this.components[_component.type] === undefined)
                this.components[_component.type] = [_component];
            else
                if (_component.isSingleton)
                    throw new Error("Component is marked singleton and can't be attached, no more than one allowed");
                else
                    this.components[_component.type].push(_component);

            _component.setContainer(this);
        }
        /** 
         * Removes the given component from the node, if it was attached, and sets its parent to null. 
         * @param _component The component to be removed
         * @throws Exception when component is not found
         */
        public removeComponent(_component: Component): void {
            try {
                let componentsOfType: Component[] = this.components[_component.type];
                let foundAt: number = componentsOfType.indexOf(_component);
                componentsOfType.splice(foundAt, 1);
                _component.setContainer(null);
            } catch {
                throw new Error(`Unable to find component '${_component}'in node named '${this.name}'`);
            }
        }
        // #endregion

        // #region Serialization
        public serialize(): Serialization {
            return null;
        }
        public deserialize(): Serializable {
            return null;
        }
        // #endregion


        /**
         * Sets the parent of this node to be the supplied node. Will be called on the child that is appended to this node by appendChild().
         * @param _parent The parent to be set for this node.
         */
        private setParent(_parent: Node | null): void {
            this.parent = _parent;
        }
    }
}