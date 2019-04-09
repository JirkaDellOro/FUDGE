namespace Fudge {
    export interface MapClassToComponents {
        [className: string]: Component[];
    }

    /**
     * Represents a node in the scenetree.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class Node extends EventTarget implements Serializable {
        public name: string; // The name to call this node by.
        private parent: Node | null = null; // The parent of this node.
        private children: Node[] = []; // Associative array nodes appended to this node.
        private components: MapClassToComponents = {};
        // private tags: string[] = []; // Names of tags that are attached to this node. (TODO: As of yet no functionality)
        // private layers: string[] = []; // Names of the layers this node is on. (TODO: As of yet no functionality)
        private listeners: MapEventTypeToListener = {};
        private captures: MapEventTypeToListener = {};

        /**
         * Creates a new node with a name and initializes all attributes
         * @param _name The name by which the node can be called.
         */
        public constructor(_name: string) {
            super();
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
            if (this.children.includes(_node))
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
            _node.dispatchEvent(new Event(EVENT.CHILD_ADD, {bubbles: true}));
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
            _node.dispatchEvent(new Event(EVENT.CHILD_REMOVE, {bubbles: true}));
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
            _component.dispatchEvent(new Event(EVENT.COMPONENT_ADD));
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
                _component.dispatchEvent(new Event(EVENT.COMPONENT_REMOVE));
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

        // #region Events
        /**
         * Adds an event listener to the node. The given handler will be called when a matching event is passed to the node.
         * Deviating from the standard EventTarget, here the _handler must be a function and _capture is the only option.
         * @param _type The type of the event, should be an enumerated value of NODE_EVENT, can be any string
         * @param _handler The function to call when the event reaches this node
         * @param _capture When true, the listener listens in the capture phase, when the event travels deeper into the hierarchy of nodes.
         */
        addEventListener(_type: EVENT | string, _handler: EventListener, _capture: boolean /*| AddEventListenerOptions*/ = false): void {
            if (_capture) {
                if (!this.captures[_type])
                    this.captures[_type] = [];
                this.captures[_type].push(_handler);
            }
            else {
                if (!this.listeners[_type])
                    this.listeners[_type] = [];
                this.listeners[_type].push(_handler);
            }
        }
        /**
         * Dispatches a synthetic event event to target. This implementation always returns true (standard: return true only if either event's cancelable attribute value is false or its preventDefault() method was not invoked)
         * The event travels into the hierarchy to this node dispatching the event, invoking matching handlers of the nodes ancestors listening to the capture phase, 
         * than the matching handler of the target node in the target phase, and back out of the hierarchy in the bubbling phase, invoking appropriate handlers of the anvestors
         * @param _event The event to dispatch
         */
        dispatchEvent(_event: Event): boolean {
            let ancestors: Node[] = [];
            let upcoming: Node = this;
            // overwrite event target
            Object.defineProperty(_event, "target", { writable: true, value: this });

            while (upcoming.parent)
                ancestors.push(upcoming = upcoming.parent);

            // capture phase
            Object.defineProperty(_event, "eventPhase", { writable: true, value: Event.CAPTURING_PHASE });
            for (let i: number = ancestors.length - 1; i >= 0; i--) {
                let ancestor: Node = ancestors[i];
                Object.defineProperty(_event, "currentTarget", { writable: true, value: ancestor });
                let captures: EventListener[] = ancestor.captures[_event.type] || [];
                for (let handler of captures)
                    handler(_event);
            }

            if (!_event.bubbles)
                return true;

            // target phase
            Object.defineProperty(_event, "eventPhase", { writable: true, value: Event.AT_TARGET });
            Object.defineProperty(_event, "currentTarget", { writable: true, value: this });
            let listeners: EventListener[] = this.listeners[_event.type] || [];
            for (let handler of listeners)
                handler(_event);

            // bubble phase
            Object.defineProperty(_event, "eventPhase", { writable: true, value: Event.BUBBLING_PHASE });
            for (let i: number = 0; i < ancestors.length; i++) {
                let ancestor: Node = ancestors[i];
                Object.defineProperty(_event, "currentTarget", { writable: true, value: ancestor });
                let listeners: Function[] = ancestor.listeners[_event.type] || [];
                for (let handler of listeners)
                    handler(_event);
            }
            return true; //TODO: return a meaningful value, see documentation of dispatch event
        }
        /**
         * Broadcasts a synthetic event event to this node and from there to all nodes deeper in the hierarchy,
         * invoking matching handlers of the nodes listening to the capture phase. Watch performance when there are many nodes involved
         * @param _event The event to broadcast
         */
        broadcastEvent(_event: Event): void {
            // overwrite event target and phase
            Object.defineProperty(_event, "eventPhase", { writable: true, value: Event.CAPTURING_PHASE });
            Object.defineProperty(_event, "target", { writable: true, value: this });
            this.broadcastEventRecursive(_event);
        }

        private broadcastEventRecursive(_event: Event): void {
            // capture phase only
            Object.defineProperty(_event, "currentTarget", { writable: true, value: this });
            let captures: Function[] = this.captures[_event.type] || [];
            for (let handler of captures)
                handler(_event);
            // appears to be slower, astonishingly...
            // captures.forEach(function (handler: Function): void {
            //     handler(_event);
            // });

            // same for children
            for (let child of this.children) {
                child.broadcastEventRecursive(_event);
            }
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