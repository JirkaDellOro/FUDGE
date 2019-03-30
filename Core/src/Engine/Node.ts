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
        private children: Node[] = []; // Associative array nodes appended to this node.
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
         * Returns a clone of the list of children
         */
        public getChildren(): Node[] {
            return this.children.slice(0);
        }
        /**
         * Returns an array of references to childnodes with the supplied name. 
         * @param _name The name of the nodes to be found.
         * @return An array with references to nodes
         */
        public getChildrenByName(_name: string): Node[] {
            let found: Node[] = [];
            found = this.children.filter((_node: Node) => _node.name == _name);
            return found;
        }

        /**
         * Adds the given reference to a node to the list of children, if not already in
         * @param _node The node to be added as a child
         * @throws Error when trying to add an ancestor of this 
         */
        public appendChild(_node: Node): void {
            if (this.children.indexOf(_node) >= 0)
                // _node is already a child of this
                return;

            let ancestor: Node = this.parent;
            while (ancestor) {
                if (ancestor == _node)
                    throw (new Error("Cyclic reference prohibited in node hierarchy, ancestors must not be added as children"));
                else
                    ancestor = ancestor.parent;
            }

            this.children.push(_node);
            _node.setParent(this);
        }

        /**
         * Removes the reference to the give node from the list of children
         * @param _node The node to be removed.
         */
        public removeChild(_node: Node): void {
            let iFound: number = this.children.indexOf(_node);
            if (iFound < 0)
                return;

            this.children.splice(iFound, 1);
            _node.setParent(null);
        }
        // #endregion

        // #region Components
        /**
         * Returns a clone of the list of components of the given class attached this node. 
         * @param _class The class of the components to be found.
         */
        public getComponents(_class: typeof Component): Component[] {
            return (this.components[_class.name] || []).slice(0);
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
            let serialization: Serialization = {
                name: this.name
                // TODO: serialize references, does parent need to be serialized at all?
                //parent: this.parent
            };

            let components: Serialization = {};
            for (let type in this.components) {
                components[type] = [];
                for (let component of this.components[type]) {
                    components[type].push(component.serialize());
                }
            }
            serialization["components"] = components;

            let children: Serialization[] = [];
            for (let child of this.children) {
                children.push(child.serialize());
            }
            serialization["children"] = children;

            return serialization;
        }

        public deserialize(_serialization: Serialization): Serializable {
            this.name = _serialization.name;
            // this.parent = is set when the nodes are added

            for (let type in _serialization.components) {
                for (let data of _serialization.components[type]) {
                    let serializedComponent: Serialization = { [type]: data };
                    let deserializedComponent: Component = <Component>Serializer.deserialize(serializedComponent);
                    this.addComponent(deserializedComponent);
                }
            }

            for (let child of _serialization.children) {
                let serializedChild: Serialization = { "Node": child };
                let deserializedChild: Node = <Node>Serializer.deserialize(serializedChild);
                this.appendChild(deserializedChild);
            }

            return this;
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