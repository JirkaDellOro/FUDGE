var WebGl2Test3D;
(function (WebGl2Test3D) {
    var FudgeNode = /** @class */ (function () {
        /**
         * Creates a new Fudgenode with a name and initializes arrays for children and components.
         * @param _name The name by which the FudgeNode can be called.
         */
        function FudgeNode(_name) {
            this.name = _name;
            this.children = [];
            this.components = [];
        }
        /**
         * Sets the name of this FudgeNode.
         * @param _name The name by which the FudgeNode can be called.
         */
        FudgeNode.prototype.setName = function (_name) {
            this.name = _name;
        };
        /**
         * Returns the name of this FudgeNode
         */
        FudgeNode.prototype.getName = function () {
            return this.name;
        };
        /**
         * Returns the parentnode of this FudgeNode.
         */
        FudgeNode.prototype.getParent = function () {
            return this.parent;
        };
        /**
         * Sets the parent of this node to be the supplied node.
         * Will be called on the child that is appended to this node by appendChild().
         * WARNING!: This function should not be called on its own.
         * @param _name
         */
        FudgeNode.prototype.setParent = function (_parent) {
            this.parent = _parent;
        };
        /**
         * Returns the children array of this node.
         */
        FudgeNode.prototype.getChildren = function () {
            return this.children;
        };
        /**
        Iterates through this nodes children array and returns a child with the supplied name.
         * If there are multiple children with the same name in the array, only the first that is found will be returned.
         * Throws error if no child can be found by the name.
         * @param _name The name of the child to be found.
         */
        FudgeNode.prototype.getChildByName = function (_name) {
            var child;
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i].getName() == _name) {
                    child = this.children[i];
                    return child;
                }
            }
            if (child == undefined) {
                throw new Error("Unable to find child named  '" + _name + "'in FudgeNode named '" + this.getName() + "'");
            }
        };
        /**
         * Push the supplied child into this nodes children array.
         * @param _child The child to be pushed into the array
         */
        FudgeNode.prototype.appendChild = function (_child) {
            this.children.push(_child);
            _child.setParent(this);
        };
        /**
         * Iterates through this nodes children array, removes a child with the supplied name and sets the child's parent to null.
         * If there are multiple children with the same name in the array, only the first that is found will be removed.
         * Throws error if no child can be found by the name.
         * @param _name The name of the child to be removed.
         */
        FudgeNode.prototype.removeChild = function (_name) {
            var child;
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i].getName() == _name) {
                    child = this.children[i];
                    child.setParent(null);
                    this.children.splice(i, 1);
                    break;
                }
            }
            if (child == undefined) {
                throw new Error("Unable to find child named  '" + _name + "'in FudgeNode named '" + this.getName() + "'");
            }
        };
        /**
         * Returns the component array of this node.
         */
        FudgeNode.prototype.getComponents = function () {
            console.log(this.components);
            return this.components;
        };
        /**
         * Iterates through this nodes component array and returns a component with the supplied name.
         * If there are multiple components with the same name in the array, only the first that is found will be returned.
         * Throws error if no component can be found by the name.
         * @param _name The name of the component to be found.
         */
        FudgeNode.prototype.getComponentByName = function (_name) {
            var component;
            for (var i = 0; i < this.components.length; i++) {
                if (this.components[i].getName() == _name) {
                    component = this.components[i];
                    return component;
                }
            }
            if (component == undefined) {
                throw new Error("Unable to find component named  '" + _name + "'in FudgeNode named '" + this.getName() + "'");
            }
        };
        /**
         * Push the supplied component into this nodes component array.
         * @param _component The component to be pushed into the array.
         */
        FudgeNode.prototype.addComponent = function (_component) {
            this.components.push(_component);
            _component.setParent(this);
        };
        /**
         * Iterates through this nodes ccomponent array, removes a component with the supplied name and sets the components parent to null.
         * If there are multiple components with the same name in the array, only the first that is found will be removed.
         * Throws error if no component can be found by the name.
         * @param _name The name of the component to be found.
         */
        FudgeNode.prototype.removeComponent = function (_name) {
            var component;
            for (var i = 0; i < this.components.length; i++) {
                if (this.components[i].getName() == _name) {
                    component = this.components[i];
                    component.setParent(null);
                    this.components.splice(i, 1);
                    break;
                }
            }
            if (component == undefined) {
                throw new Error("Unable to find component named  '" + _name + "'in FudgeNode named '" + this.getName() + "'");
            }
        };
        return FudgeNode;
    }()); // End class.
    WebGl2Test3D.FudgeNode = FudgeNode;
})(WebGl2Test3D || (WebGl2Test3D = {})); // Close namespace.
//# sourceMappingURL=FudgeNode.js.map