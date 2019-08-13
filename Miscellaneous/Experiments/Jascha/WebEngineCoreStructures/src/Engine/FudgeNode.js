var WebEngine;
(function (WebEngine) {
    /**
     * Represents a node in the scenetree.
     */
    class FudgeNode {
        /**
         * Creates a new node with a name and initializes all attributes
         * @param _name The name by which the node can be called.
         */
        constructor(_name) {
            this.name = _name;
            this.children = {};
            this.components = {};
            this.layers = [];
            this.tags = [];
            WebEngine.AssetManager.addAsset(this);
        }
        // Get and set methods.######################################################################################
        set Name(_name) {
            this.name = _name;
        }
        get Name() {
            return this.name;
        }
        get Parent() {
            return this.parent;
        }
        /**
         * Sets the parent of this node to be the supplied node.
         * Will be called on the child that is appended to this node by appendChild().
         * @param _parent The parent to be set for this node.
         */
        setParent(_parent) {
            this.parent = _parent;
        }
        get Layers() {
            return this.layers;
        }
        get Tags() {
            return this.tags;
        }
        // Layer methods.######################################################################################
        /**
         * Adds the name of a layer to this nodes layerarray.
         * @param _name The name of the layer to add.
         */
        addLayer(_name) {
            for (let i = 0; i < this.layers.length; i++) {
                if (this.layers[i] = _name) {
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
        removeLayer(_name) {
            for (let i = 0; i < this.layers.length; i++) {
                if (this.layers[i] = _name) {
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
        addTag(_name) {
            for (let i = 0; i < this.tags.length; i++) {
                if (this.tags[i] = _name) {
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
        removeTag(_name) {
            for (let i = 0; i < this.tags.length; i++) {
                if (this.tags[i] = _name) {
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
        getChildren() {
            return this.children;
        }
        /**
         * Looks through this Nodes children array and returns a child with the supplied name.
         * If there are multiple children with the same name in the array, only the first that is found will be returned.
         * Throws error if no child can be found by the supplied name.
         * @param _name The name of the child to be found.
         */
        getChildByName(_name) {
            let child;
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
         * Calls setParend method of supplied child with this Node as parameter.
         * @param _child The child to be pushed into the array
         */
        appendChild(_child) {
            let name = _child.Name;
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
        removeChild(_name) {
            if (this.children[_name] != undefined) {
                let child = this.children[_name];
                child.setParent(undefined);
                delete this.children[_name];
            }
            else {
                throw new Error(`Unable to find child named  '${_name}'in node named '${this.name}'`);
            }
        }
        // Component methods.######################################################################################
        /**
         * Returns the component array of this node.
         */
        getComponents() {
            console.log(this.components);
            return this.components;
        }
        /**
         * Looks through this nodes component array and returns a component with the supplied name.
         * If there are multiple components with the same name in the array, only the first that is found will be returned.
         * Throws error if no component can be found by the name.
         * @param _name The name of the component to be found.
         */
        getComponentByName(_name) {
            let component;
            if (this.components[_name] != undefined) {
                component = this.components[_name];
                return component;
            }
            else {
                return null;
            }
        }
        /**
         * Adds the supplied component into this nodes component array.
         * If there is allready a component by the same name, it will be overridden.
         * @param _component The component to be pushed into the array.
         */
        addComponent(_component) {
            let name = _component.Name;
            if (this.components[name] != undefined) {
                console.log(`There is allready a component by the name '${_component.Name}'. Deleting component '${this.components[name]}'.`);
                delete this.components[name];
            }
            this.components[name] = _component;
            if (_component.Container != undefined) {
                _component.Container.removeComponent(_component.Name);
            }
            _component.Container = this;
        }
        /**
         * Looks through this nodes ccomponent array, removes a component with the supplied name and sets the components parent to null.
         * If there are multiple components with the same name in the array, only the first that is found will be removed.
         * Throws error if no component can be found by the name.
         * @param _name The name of the component to be found.
         */
        removeComponent(_name) {
            if (this.components[_name]) {
                this.components[_name].Container = undefined;
                delete this.components[_name];
                console.log(`Component '${_name}' removed.`);
            }
            else {
                throw new Error(`Unable to find component named  '${_name}'in node named '${this.name}'`);
            }
        }
    } // End class.
    WebEngine.FudgeNode = FudgeNode;
})(WebEngine || (WebEngine = {})); // Close namespace.
//# sourceMappingURL=FudgeNode.js.map