// / <reference path="../Transfer/Serializer.ts"/>
// / <reference path="../Transfer/Mutable.ts"/>
namespace FudgeCore {
  /** 
   * Superclass for all {@link Component}s that can be attached to {@link Node}s.
   * @authors Jirka Dell'Oro-Friedl, HFU, 2020 | Jascha Karagöl, HFU, 2019  
   * @link https://github.com/JirkaDellOro/FUDGE/wiki/Component
   */
  export abstract class Component extends Mutable implements Serializable {
    /** subclasses get a iSubclass number for identification */
    public static readonly iSubclass: number;
    /** refers back to this class from any subclass e.g. in order to find compatible other resources*/
    public static readonly baseClass: typeof Component = Component;
    /** list of all the subclasses derived from this class, if they registered properly*/
    public static readonly subclasses: typeof Component[] = [];
    
    #node: Node | null = null;
    protected singleton: boolean = true;
    protected active: boolean = true;

    protected static registerSubclass(_subclass: typeof Component): number { return Component.subclasses.push(_subclass) - 1; }

    public get isActive(): boolean {
      return this.active;
    }

    /**
     * Is true, when only one instance of the component class can be attached to a node
     */
    public get isSingleton(): boolean {
      return this.singleton;
    }

    /**
     * Retrieves the node, this component is currently attached to
     */
    public get node(): Node | null {
      return this.#node;
    }

    public activate(_on: boolean): void {
      this.active = _on;
      this.dispatchEvent(new Event(_on ? EVENT.COMPONENT_ACTIVATE : EVENT.COMPONENT_DEACTIVATE));
    }


    /**
     * Tries to attach the component to the given node, removing it from the node it was attached to if applicable
     */
    public attachToNode(_container: Node | null): void {
      if (this.#node == _container)
        return;
      let previousContainer: Node = this.#node;
      try {
        if (previousContainer)
          previousContainer.removeComponent(this);
        this.#node = _container;
        if (this.#node)
          this.#node.addComponent(this);
      } catch (_error) {
        this.#node = previousContainer;
      }
    }
    
    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = {
        active: this.active
      };
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.active = _serialization.active;
      return this;
    }

    protected reduceMutator(_mutator: Mutator): void {
      delete _mutator.singleton;
      delete _mutator.mtxWorld;
    }
    //#endregion
  }
}