namespace FudgeCore {
  export interface MapClassToComponents {
    [className: string]: Component[];
  }

  /**
   * Represents a node in the scenetree.
   * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
   * @link https://github.com/JirkaDellOro/FUDGE/wiki/Graph
   */
  export class Node extends EventTargetƒ implements Serializable {
    public name: string; // The name to call this node by.
    public readonly mtxWorld: Matrix4x4 = Matrix4x4.IDENTITY();
    public timestampUpdate: number = 0;
    public nNodesInBranch: number = 0;
    public radius: number = 0;

    #mtxWorldInverseUpdated: number;
    #mtxWorldInverse: Matrix4x4;

    private parent: Node | null = null; // The parent of this node.
    private children: Node[] = []; // array of child nodes appended to this node.
    private components: MapClassToComponents = {};
    // private tags: string[] = []; // Names of tags that are attached to this node. (TODO: As of yet no functionality)
    // private layers: string[] = []; // Names of the layers this node is on. (TODO: As of yet no functionality)
    private listeners: MapEventTypeToListener = {};
    private captures: MapEventTypeToListener = {};
    private active: boolean = true;


    /**
     * Creates a new node with a name and initializes all attributes
     */
    public constructor(_name: string) {
      super();
      this.name = _name;
    }

    public get isActive(): boolean {
      return this.active;
    }

    /**
     * Shortcut to retrieve this nodes {@link ComponentTransform}
     */
    public get cmpTransform(): ComponentTransform {
      return <ComponentTransform>this.getComponents(ComponentTransform)[0];
    }

    /**
     * Shortcut to retrieve the local {@link Matrix4x4} attached to this nodes {@link ComponentTransform}  
     * Fails if no {@link ComponentTransform} is attached
     */
    public get mtxLocal(): Matrix4x4 {
      return this.cmpTransform.mtxLocal;
    }

    public get mtxWorldInverse(): Matrix4x4 {
      if (this.#mtxWorldInverseUpdated != this.timestampUpdate)
        this.#mtxWorldInverse = Matrix4x4.INVERSION(this.mtxWorld);

      this.#mtxWorldInverseUpdated = this.timestampUpdate;
      return this.#mtxWorldInverse;
    }

    /**
     * Returns the number of children attached to this
     */
    public get nChildren(): number {
      return this.children.length;
    }

    /**
     * Generator yielding the node and all decendants in the graph below for iteration
     * Inactive nodes and their descendants can be filtered
     */
    public * getIterator(_active: boolean = false): IterableIterator<Node> {
      if (!_active || this.isActive) {
        yield this;
        for (let child of this.children)
          yield* child.getIterator(_active);
      }
    }

    public [Symbol.iterator](): IterableIterator<Node> {
      return this.getIterator();
    }

    public activate(_on: boolean): void {
      this.active = _on;
      // TODO: check if COMPONENT_ACTIVATE/DEACTIVATE is the correct event to dispatch. Shouldn't it be something like NODE_ACTIVATE/DEACTIVATE?
      this.dispatchEvent(new Event(_on ? EVENT.COMPONENT_ACTIVATE : EVENT.COMPONENT_DEACTIVATE));
    }

    // #region Scenetree
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
     * Traces the hierarchy upwards to the first ancestor and returns the path through the graph to this node
     */
    public getPath(): Node[] {
      let ancestor: Node = this;
      let path: Node[] = [this];
      while (ancestor.getParent())
        path.unshift(ancestor = ancestor.getParent());
      return path;
    }


    /**
     * Returns child at the given index in the list of children
     */
    public getChild(_index: number): Node {
      return this.children[_index];
    }

    /**
     * Returns a clone of the list of children
     */
    public getChildren(): Node[] {
      return this.children.slice(0);
    }

    /**
     * Returns an array of references to childnodes with the supplied name. 
     */
    public getChildrenByName(_name: string): Node[] {
      let found: Node[] = [];
      found = this.children.filter((_node: Node) => _node.name == _name);
      return found;
    }

    /**
     * Simply calls {@link addChild}. This reference is here solely because appendChild is the equivalent method in DOM.
     * See and preferably use {@link addChild}
     */
    // tslint:disable-next-line: member-ordering
    public readonly appendChild: (_child: Node) => void = this.addChild;

    /**
     * Adds the given reference to a node to the list of children, if not already in
     * @throws Error when trying to add an ancestor of this 
     */
    public addChild(_child: Node): void {
      if (this.children.includes(_child))
        // _node is already a child of this
        return;

      let inAudioGraph: boolean = false;
      let graphListened: Node = AudioManager.default.getGraphListeningTo();
      let ancestor: Node = this;
      while (ancestor) {
        ancestor.timestampUpdate = 0;
        inAudioGraph = inAudioGraph || (ancestor == graphListened);
        if (ancestor == _child)
          throw (new Error("Cyclic reference prohibited in node hierarchy, ancestors must not be added as children"));
        else
          ancestor = ancestor.parent;
      }

      let previousParent: Node = _child.parent;
      if (previousParent)
        previousParent.removeChild(_child);
      this.children.push(_child);
      _child.parent = this;
      _child.dispatchEvent(new Event(EVENT.CHILD_APPEND, { bubbles: true }));
      if (inAudioGraph)
        _child.broadcastEvent(new Event(EVENT_AUDIO.CHILD_APPEND));
    }

    /**
     * Removes the reference to the give node from the list of children
     */
    public removeChild(_child: Node): void {
      let found: number = this.findChild(_child);
      if (found < 0)
        return;

      _child.dispatchEvent(new Event(EVENT.CHILD_REMOVE, { bubbles: true }));
      if (this.isDescendantOf(AudioManager.default.getGraphListeningTo()))
        _child.broadcastEvent(new Event(EVENT_AUDIO.CHILD_REMOVE));
      this.children.splice(found, 1);
      _child.parent = null;
    }

    /**
     * Removes all references in the list of children
     */
    public removeAllChildren(): void {
      while (this.children.length)
        this.removeChild(this.children[0]);
    }

    /**
     * Returns the position of the node in the list of children or -1 if not found
     */
    public findChild(_search: Node): number {
      return this.children.indexOf(_search);
    }

    /**
     * Replaces a child node with another, preserving the position in the list of children
     */
    public replaceChild(_replace: Node, _with: Node): boolean {
      let found: number = this.findChild(_replace);
      if (found < 0)
        return false;

      let previousParent: Node = _with.getParent();
      if (previousParent)
        previousParent.removeChild(_with);

      _replace.parent = null;
      this.children[found] = _with;
      _with.parent = this;

      _with.dispatchEvent(new Event(EVENT.CHILD_APPEND, { bubbles: true }));
      if (this.isDescendantOf(AudioManager.default.getGraphListeningTo()))
        _with.broadcastEvent(new Event(EVENT_AUDIO.CHILD_APPEND));

      return true;
    }


    public isUpdated(_timestampUpdate: number): boolean {
      return (this.timestampUpdate == _timestampUpdate);
    }

    public isDescendantOf(_ancestor: Node): boolean {
      let node: Node = this;
      while (node && node != _ancestor)
        node = node.parent;
      return (node != null);
    }

    /**
     * Applies a Mutator from {@link Animation} to all its components and transfers it to its children.
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
     */
    public getComponents<T extends Component>(_class: new () => T): T[] {
      return <T[]>(this.components[_class.name] || []).slice(0);
    }
    /**
     * Returns the first compontent found of the given class attached this node or null, if list is empty or doesn't exist
     */
    public getComponent<T extends Component>(_class: new () => T): T {
      let list: T[] = <T[]>this.components[_class.name];
      if (list)
        return list[0];
      return null;
    }

    /**
     * Attach the given component to this node. Identical to {@link addComponent}
     */
    public attach(_component: Component): void {
      this.addComponent(_component);
    }
    /**
     * Attach the given component to this node
     */
    public addComponent(_component: Component): void {
      if (_component.node == this)
        return;
      let cmpList: Component[] = this.components[_component.type];
      if (cmpList === undefined)
        this.components[_component.type] = [_component];
      else
        if (cmpList.length && _component.isSingleton)
          throw new Error("Component is marked singleton and can't be attached, no more than one allowed");
        else
          cmpList.push(_component);

      _component.attachToNode(this);
      _component.dispatchEvent(new Event(EVENT.COMPONENT_ADD));
      this.dispatchEventToTargetOnly(new CustomEvent(EVENT.COMPONENT_ADD, { detail: _component })); // TODO: see if this is be feasable
    }

    /**
     * Detach the given component from this node. Identical to {@link removeComponent}
     */
    public detach(_component: Component): void {
      this.removeComponent(_component);
    }
    /** 
     * Removes the given component from the node, if it was attached, and sets its parent to null. 
     */
    public removeComponent(_component: Component): void {
      try {
        let componentsOfType: Component[] = this.components[_component.type];
        let foundAt: number = componentsOfType.indexOf(_component);
        if (foundAt < 0)
          return;
        _component.dispatchEvent(new Event(EVENT.COMPONENT_REMOVE));
        this.dispatchEventToTargetOnly(new CustomEvent(EVENT.COMPONENT_REMOVE, { detail: _component })); // TODO: see if this would be feasable
        componentsOfType.splice(foundAt, 1);
        _component.attachToNode(null);
      } catch (_error) {
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

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.name = _serialization.name;
      // this.parent = is set when the nodes are added

      // deserialize components first so scripts can react to children being appended
      for (let type in _serialization.components) {
        for (let serializedComponent of _serialization.components[type]) {
          let deserializedComponent: Component = <Component>await Serializer.deserialize(serializedComponent);
          this.addComponent(deserializedComponent);
        }
      }

      for (let serializedChild of _serialization.children) {
        let deserializedChild: Node = <Node>await Serializer.deserialize(serializedChild);
        this.appendChild(deserializedChild);
      }

      this.dispatchEvent(new Event(EVENT.NODE_DESERIALIZED));
      return this;
    }
    // #endregion

    /**
     * Creates a string as representation of this node and its descendants
     */
    public toHierarchyString(_node: Node = null, _level: number = 0): string {
      // TODO: refactor for better readability
      if (!_node)
        _node = this;

      let prefix: string = "+".repeat(_level);

      let output: string = prefix + " " + _node.name + " | ";
      for (let type in _node.components)
        output += _node.components[type].length + " " + type.split("Component").pop() + ", ";
      output = output.slice(0, -2) + "</br>";
      for (let child of _node.children) {
        output += this.toHierarchyString(child, _level + 1);
      }
      return output;
    }

    // #region Events
    /**
     * Adds an event listener to the node. The given handler will be called when a matching event is passed to the node.
     * Deviating from the standard EventTarget, here the _handler must be a function and _capture is the only option.
     */
    public addEventListener(_type: EVENT | string, _handler: EventListenerƒ, _capture: boolean /*| AddEventListenerOptions*/ = false): void {
      let listListeners: MapEventTypeToListener = _capture ? this.captures : this.listeners;
      if (!listListeners[_type])
        listListeners[_type] = [];
      listListeners[_type].push(_handler);
    }
    /**
     * Removes an event listener from the node. The signature must match the one used with addEventListener
     */
    public removeEventListener(_type: EVENT | string, _handler: EventListenerƒ, _capture: boolean /*| AddEventListenerOptions*/ = false): void {
      let listenersForType: EventListenerƒ[] = _capture ? this.captures[_type] : this.listeners[_type];
      if (listenersForType)
        for (let i: number = listenersForType.length - 1; i >= 0; i--)
          if (listenersForType[i] == _handler)
            listenersForType.splice(i, 1);
    }
    /**
     * Dispatches a synthetic event to target. This implementation always returns true (standard: return true only if either event's cancelable attribute value is false or its preventDefault() method was not invoked)
     * The event travels into the hierarchy to this node dispatching the event, invoking matching handlers of the nodes ancestors listening to the capture phase, 
     * than the matching handler of the target node in the target phase, and back out of the hierarchy in the bubbling phase, invoking appropriate handlers of the anvestors
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
        this.callListeners(ancestor.captures[_event.type], _event);
      }

      // target phase
      Object.defineProperty(_event, "eventPhase", { writable: true, value: Event.AT_TARGET });
      Object.defineProperty(_event, "currentTarget", { writable: true, value: this });
      this.callListeners(this.captures[_event.type], _event);
      this.callListeners(this.listeners[_event.type], _event);

      if (!_event.bubbles)
        return true;

      // bubble phase
      Object.defineProperty(_event, "eventPhase", { writable: true, value: Event.BUBBLING_PHASE });
      for (let i: number = 0; i < ancestors.length; i++) {
        let ancestor: Node = ancestors[i];
        Object.defineProperty(_event, "currentTarget", { writable: true, value: ancestor });
        this.callListeners(ancestor.listeners[_event.type], _event);
      }
      return true; //TODO: return a meaningful value, see documentation of dispatch event
    }
    /**
     * Dispatches a synthetic event to target without travelling through the graph hierarchy neither during capture nor bubbling phase
     */
    public dispatchEventToTargetOnly(_event: Event): boolean {
      Object.defineProperty(_event, "eventPhase", { writable: true, value: Event.AT_TARGET });
      Object.defineProperty(_event, "currentTarget", { writable: true, value: this });
      this.callListeners(this.listeners[_event.type], _event); // TODO: examine if this should go to the captures instead of the listeners
      return true;
    }
    /**
     * Broadcasts a synthetic event to this node and from there to all nodes deeper in the hierarchy,
     * invoking matching handlers of the nodes listening to the capture phase. Watch performance when there are many nodes involved
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
      let captures: EventListenerƒ[] = this.captures[_event.type] || [];
      for (let handler of captures)
        // @ts-ignore
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

    private callListeners(_listeners: EventListenerƒ[], _event: Event): void {
      if (_listeners?.length > 0)
        for (let handler of _listeners)
          // @ts-ignore
          handler(_event);
    }
    // #endregion
  }
}