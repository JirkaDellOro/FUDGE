namespace FudgeCore {
  export interface MapClassToComponents {
    [className: string]: Component[];
  }

  /**
   * Represents a node in the scenetree.
   * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class Node extends EventTarget implements Serializable {
    public name: string; // The name to call this node by.
    public mtxWorld: Matrix4x4 = Matrix4x4.IDENTITY;
    public timestampUpdate: number = 0;

    private parent: Node | null = null; // The parent of this node.
    private children: Node[] = []; // array of child nodes appended to this node.
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

    /**
     * Returns a reference to this nodes parent node
     */
    public getParent(): Node | null {
      return this.parent;
    }

    /**
     * Traces back the ancestors of this node and returns the first
     */
    public getAncestor(): Node | null {
      let ancestor: Node = this;
      while (ancestor.getParent())
        ancestor = ancestor.getParent();
      return ancestor;
    }

    /**
     * Shortcut to retrieve this nodes [[ComponentTransform]]
     */
    public get cmpTransform(): ComponentTransform {
      return <ComponentTransform>this.getComponents(ComponentTransform)[0];
    }
    /**
     * Shortcut to retrieve the local [[Matrix4x4]] attached to this nodes [[ComponentTransform]]  
     * Returns null if no [[ComponentTransform]] is attached
     */
    // TODO: rejected for now, since there is some computational overhead, so node.mtxLocal should not be used carelessly
    // public get mtxLocal(): Matrix4x4 {
    //     let cmpTransform: ComponentTransform = this.cmpTransform;
    //     if (cmpTransform)
    //         return cmpTransform.local;
    //     else
    //         return null;
    // }

    // #region Scenetree
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

      let ancestor: Node = this;
      while (ancestor) {
        if (ancestor == _node)
          throw (new Error("Cyclic reference prohibited in node hierarchy, ancestors must not be added as children"));
        else
          ancestor = ancestor.parent;
      }

      this.children.push(_node);
      _node.setParent(this);
      _node.dispatchEvent(new Event(EVENT.CHILD_APPEND, { bubbles: true }));
    }

    /**
     * Removes the reference to the give node from the list of children
     * @param _node The node to be removed.
     */
    public removeChild(_node: Node): void {
      let found: number = this.findChild(_node);
      if (found < 0)
        return;

      _node.dispatchEvent(new Event(EVENT.CHILD_REMOVE, { bubbles: true }));
      this.children.splice(found, 1);
      _node.setParent(null);
    }

    /**
     * Returns the position of the node in the list of children or -1 if not found
     * @param _node The node to be found.
     */
    public findChild(_node: Node): number {
      return this.children.indexOf(_node);
    }

    /**
     * Replaces a child node with another, preserving the position in the list of children
     * @param _replace The node to be replaced
     * @param _with The node to replace with
     */
    public replaceChild(_replace: Node, _with: Node): boolean {
      let found: number = this.findChild(_replace);
      if (found < 0)
        return false;
      let previousParent: Node = _with.getParent();
      if (previousParent)
        previousParent.removeChild(_with);
      _replace.setParent(null);
      this.children[found] = _with;
      _with.setParent(this);
      return true;
    }

    /**
     * Generator yielding the node and all successors in the branch below for iteration
     */
    public get branch(): IterableIterator<Node> {
      return this.getBranchGenerator();
    }

    public isUpdated(_timestampUpdate: number): boolean {
      return (this.timestampUpdate == _timestampUpdate);
    }

    /**
     * Applies a Mutator from [[Animation]] to all its components and transfers it to its children.
     * @param _mutator The mutator generated from an [[Animation]]
     */
    public applyAnimation(_mutator: Mutator): void {
      if (_mutator.components) {
        for (let componentName in _mutator.components) {
          if (this.components[componentName]) {
            let mutatorOfComponent: Mutator = <Mutator>_mutator.components;
            for (let i in mutatorOfComponent[componentName]) {
              if (this.components[componentName][+i]) {
                let componentToMutate: Component = this.components[componentName][+i];
                let mutatorArray: Mutator[] = (<Array<Mutator>>mutatorOfComponent[componentName]);
                let mutatorWithComponentName: Mutator = <Mutator>mutatorArray[+i];
                for (let cname in mutatorWithComponentName) {   // trick used to get the only entry in the list
                  let mutatorToGive: Mutator = <Mutator>mutatorWithComponentName[cname];
                  componentToMutate.mutate(mutatorToGive);
                }
              }
            }
          }
        }
      }
      if (_mutator.children) {
        for (let i: number = 0; i < (<Array<Object>>_mutator.children).length; i++) {
          let name: string = (<Node>(<Array<Mutator>>_mutator.children)[i]["ƒ.Node"]).name;
          let childNodes: Node[] = this.getChildrenByName(name);
          for (let childNode of childNodes) {
            childNode.applyAnimation(<Mutator>(<Array<Mutator>>_mutator.children)[i]["ƒ.Node"]);
          }
        }
      }
    }
    // #endregion

    // #region Components
    /**
     * Returns a list of all components attached to this node, independent of type. 
     */
    public getAllComponents(): Component[] {
      let all: Component[] = [];
      for (let type in this.components) {
        all = all.concat(this.components[type]);
      }
      return all;
    }

    /**
     * Returns a clone of the list of components of the given class attached to this node. 
     * @param _class The class of the components to be found.
     */
    public getComponents<T extends Component>(_class: new () => T): T[] {
      return <T[]>(this.components[_class.name] || []).slice(0);
    }
    /**
     * Returns the first compontent found of the given class attached this node or null, if list is empty or doesn't exist
     * @param _class The class of the components to be found.
     */
    public getComponent<T extends Component>(_class: new () => T): T {
      let list: T[] = <T[]>this.components[_class.name];
      if (list)
        return list[0];
      return null;
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
        if (foundAt < 0)
          return;
        componentsOfType.splice(foundAt, 1);
        _component.setContainer(null);
        _component.dispatchEvent(new Event(EVENT.COMPONENT_REMOVE));
      } catch {
        throw new Error(`Unable to remove component '${_component}'in node named '${this.name}'`);
      }
    }
    // #endregion

    // #region Serialization
    public serialize(): Serialization {
      let serialization: Serialization = {
        name: this.name
      };

      let components: Serialization = {};
      for (let type in this.components) {
        components[type] = [];
        for (let component of this.components[type]) {
          // components[type].push(component.serialize());
          components[type].push(Serializer.serialize(component));
        }
      }
      serialization["components"] = components;

      let children: Serialization[] = [];
      for (let child of this.children) {
        children.push(Serializer.serialize(child));
      }
      serialization["children"] = children;

      this.dispatchEvent(new Event(EVENT.NODE_SERIALIZED));
      return serialization;
    }

    public deserialize(_serialization: Serialization): Serializable {
      this.name = _serialization.name;
      // this.parent = is set when the nodes are added

      // deserialize components first so scripts can react to children being appended
      for (let type in _serialization.components) {
        for (let serializedComponent of _serialization.components[type]) {
          let deserializedComponent: Component = <Component>Serializer.deserialize(serializedComponent);
          this.addComponent(deserializedComponent);
        }
      }

      for (let serializedChild of _serialization.children) {
        let deserializedChild: Node = <Node>Serializer.deserialize(serializedChild);
        this.appendChild(deserializedChild);
      }

      this.dispatchEvent(new Event(EVENT.NODE_DESERIALIZED));
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
    public addEventListener(_type: EVENT | string, _handler: EventListener, _capture: boolean /*| AddEventListenerOptions*/ = false): void {
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
    public dispatchEvent(_event: Event): boolean {
      let ancestors: Node[] = [];
      let upcoming: Node = this;
      // overwrite event target
      Object.defineProperty(_event, "target", { writable: true, value: this });
      // TODO: consider using Reflect instead of Object throughout. See also Render and Mutable...
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
    public broadcastEvent(_event: Event): void {
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

    private *getBranchGenerator(): IterableIterator<Node> {
      yield this;
      for (let child of this.children)
        yield* child.branch;
    }
  }
}