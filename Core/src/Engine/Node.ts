namespace Fudge {
    export interface MapClassToComponents {
        [className: string]: Component[];
    }
    export interface AssocStringNode {
        [key: string]: Node;
    }
    /**
     * Represents a node in the scenetree.
     */
    export class Node {
        private name: string; // The name to call this node by.
        private parent: Node | null; // The parent of this node.
        private children: AssocStringNode; // Associative array nodes appended to this node.
        private components: MapClassToComponents;
        private tags: string[]; // Names of tags that are attached to this node. (TODO: As of yet no functionality)
        private layers: string[]; // Names of the layers this node is on. (TODO: As of yet no functionality)

        /**
         * Creates a new node with a name and initializes all attributes
         * @param _name The name by which the node can be called.
         */
        public constructor(_name: string) {
            this.name = _name;
            this.children = {};
            this.components = {};
            this.layers = [];
            this.tags = [];
            AssetManager.addAsset(this);
        }

        // Get and set methods.######################################################################################
        public set Name(_name: string) {
            this.name = _name;
        }
        public get Name(): string {
            return this.name;
        }
        public get Parent(): Node | null {
            return this.parent;
        }

        public get Layers(): string[] {
            return this.layers;
        }
        public get Tags(): string[] {
            return this.tags;
        }

        // Layer methods.######################################################################################
        /**
         * Adds the name of a layer to this nodes layerarray.
         * @param _name The name of the layer to add.
         */
        public addLayer(_name: string): void {
            for (let i: number = 0; i < this.layers.length; i++) {
                if (this.layers[i] == _name) {
                    console.log(`Node "${this.name}" is already on the layer "${_name}".`);
                    return;
                }
            }
            this.layers.push(_name);
            console.log(`Layer "${_name}" added to node "${this.name}".`);
        }
        /**
         * Removes the name of a layer from this nodes layerarray.
         * @param _name The name of the layer to remove.
         */
        public removeLayer(_name: string): void {
            for (let i: number = 0; i < this.layers.length; i++) {
                if (this.layers[i] == _name) {
                    this.layers.splice(i, 1);
                    console.log(`Layer "${_name}" removed from node "${this.name}".`);
                    return;
                }
            }
            console.log(`Node "${this.name}" is not on the layer "${_name}".`);
        }

        // Tag methods.######################################################################################
        /**
         * Adds the name of a tag to this nodes tagarray.
         * @param _name The name of the tag to add.
         */
        public addTag(_name: string): void {
            for (let i: number = 0; i < this.tags.length; i++) {
                if (this.tags[i] == _name) {
                    console.log(`Node "${this.name}" already has the tag "${_name}".`);
                    return;
                }
            }
            this.tags.push(_name);
            console.log(`Tag "${_name}" added to node "${this.name}".`);
        }
        /**
         * Removes the name of a tag to this nodes tagarray.
         * @param _name The name of the tag to remove.
         */
        public removeTag(_name: string): void {
            for (let i: number = 0; i < this.tags.length; i++) {
                if (this.tags[i] == _name) {
                    this.tags.splice(i, 1);
                    console.log(`Tag "${_name}" removed from node "${this.name}".`);
                    return;
                }
            }
            console.log(`Tag "${_name}" is not attached to node "${this.name}".`);
        }

        // Children methods.######################################################################################
        /**
         * Returns the children array of this node.
         */
        public getChildren(): AssocStringNode {
            return this.children;
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
                throw new Error(`Unable to find component named  '${_name}'in node named '${this.Name}'`);
            }
        }

        /**
         * Adds the supplied child into this nodes children array.
         * Calls setParent method of supplied child with this Node as parameter.
         * @param _child The child to be pushed into the array
         */
        public appendChild(_child: Node): void {
            let name: string = _child.Name;
            if (this.children[name] != undefined) {
                throw new Error(`There is already a Child by the name '${_child.name}' in node named '${this.Name}'`);
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

        /**
         * Returns all components of the given class. 
         * @param _name The name of the component to be found.
         */
        public getComponents(_class: typeof Component): Component[] {
            return this.components[_class.name] || [];
        }

        /**
         * Adds the supplied component into the nodes component map.
         * @param _component The component to be pushed into the array.
         */
        public addComponent(_component: Component): void {
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
         * Looks through this nodes component array, removes a component with the supplied name and sets the components parent to null. 
         * Throws error if no component can be found by the name.
         * @param _name The name of the component to be found.
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
        /**
         * Sets the parent of this node to be the supplied node. Will be called on the child that is appended to this node by appendChild().
         * @param _parent The parent to be set for this node.
         */
        private setParent(_parent: Node | null): void {
            this.parent = _parent;
        }
    }
}