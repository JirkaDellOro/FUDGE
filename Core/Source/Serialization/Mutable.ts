namespace FudgeCore {
  /**
   * Interface describing the datatypes of the attributes a mutator as strings 
   */
  export interface MutatorAttributeTypes {
    [attribute: string]: string | Object;
  }
  /**
   * Interface describing a mutator, which is an associative array with names of attributes and their corresponding values
   */
  export interface Mutator {
    [attribute: string]: General;
  }

  /*
   * Interfaces dedicated for each purpose. Extra attribute necessary for compiletime type checking, not existent at runtime
   */
  export interface MutatorForAnimation extends Mutator { readonly forAnimation: null; }
  export interface MutatorForUserInterface extends Mutator { readonly forUserInterface: null; }
  // export interface MutatorForComponent extends Mutator { readonly forUserComponent: null; }

  /**
   * Collect applicable attributes of the instance and copies of their values in a Mutator-object
   */
  export function getMutatorOfArbitrary(_object: Object): Mutator {
    let mutator: Mutator = {};
    let attributes: (string | number | symbol)[] = Reflect.ownKeys(Reflect.getPrototypeOf(_object));
    for (let attribute of attributes) {
      let value: Object = Reflect.get(_object, attribute);
      if (value instanceof Function)
        continue;
      // if (value instanceof Object && !(value instanceof Mutable))
      //   continue;
      mutator[attribute.toString()] = value;
    }
    return mutator;
  }

  /**
   * Base class for all types being mutable using {@link Mutator}-objects, thus providing and using interfaces created at runtime.  
   * Mutables provide a {@link Mutator} that is build by collecting all object-properties that are either of a primitive type or again Mutable.
   * Subclasses can either reduce the standard {@link Mutator} built by this base class by deleting properties or implement an individual getMutator-method.
   * The provided properties of the {@link Mutator} must match public properties or getters/setters of the object.
   * Otherwise, they will be ignored if not handled by an override of the mutate-method in the subclass and throw errors in an automatically generated user-interface for the object.
   */
  export abstract class Mutable extends EventTargetUnified {
    /**
     * Decorator allows to attach {@link Mutable} functionality to existing classes. 
     */
    // public static decorate(_constructor: Function): void {
    //   Object.defineProperty(_constructor.prototype, "useRenderData", {
    //     value: function getMutator(this: MutableForUserInterface): Mutator {
    //       return getMutatorOfArbitrary(this);
    //     }
    //   });
    // }

    public static getMutatorFromPath(_mutator: Mutator, _path: string[]): Mutator {
      let key: string = _path[0];
      let mutator: Mutator = {};
      if (_mutator[key] == undefined) // if the path deviates from mutator structure, return the mutator
        return _mutator;
      mutator[key] = _mutator[key];
      if (_path.length > 1)
        mutator[key] = Mutable.getMutatorFromPath(mutator[key], _path.slice(1, _path.length));
      return mutator;
    }

    /**
     * Retrieves the type of this mutable subclass as the name of the runtime class
     * @returns The type of the mutable
     */
    public get type(): string {
      return this.constructor.name;
    }
    /**
     * Collect applicable attributes of the instance and copies of their values in a Mutator-object.
     * By default, a mutator cannot be extended, since extensions are not available in the object the mutator belongs to.
     * A mutator may be reduced by the descendants of {@link Mutable} to contain only the properties needed.
     */
    public getMutator(_extendable: boolean = false): Mutator {
      let mutator: Mutator = {};

      // collect primitive and mutable attributes
      for (let attribute in this) {
        let value: Object = this[attribute];
        if (value instanceof Function)
          continue;
        if (value instanceof Object && !(value instanceof Mutable) && !(value instanceof MutableArray) && !(value.hasOwnProperty("idResource")))
          continue;
        mutator[attribute] = this[attribute];
      }

      if (!_extendable)
        // mutator can be reduced but not extended!
        Object.preventExtensions(mutator);
      // delete unwanted attributes
      this.reduceMutator(mutator);

      // replace references to mutable objects with references to mutators
      for (let attribute in mutator) {
        let value: Object = mutator[attribute];
        if (value instanceof Mutable)
          mutator[attribute] = value.getMutator();
        if (value instanceof MutableArray)
          mutator[attribute] = value.map((_value) => _value.getMutator());
      }

      return mutator;
    }

    /**
     * Collect the attributes of the instance and their values applicable for animation.
     * Basic functionality is identical to {@link getMutator}, returned mutator should then be reduced by the subclassed instance
     */
    public getMutatorForAnimation(): MutatorForAnimation {
      return <MutatorForAnimation>this.getMutator();
    }
    /**
     * Collect the attributes of the instance and their values applicable for the user interface.
     * Basic functionality is identical to {@link getMutator}, returned mutator should then be reduced by the subclassed instance
     */
    public getMutatorForUserInterface(): MutatorForUserInterface {
      return <MutatorForUserInterface>this.getMutator();
    }
    /**
     * Collect the attributes of the instance and their values applicable for indiviualization by the component.
     * Basic functionality is identical to {@link getMutator}, returned mutator should then be reduced by the subclassed instance
     */
    // public getMutatorForComponent(): MutatorForComponent {
    //     return <MutatorForComponent>this.getMutator();
    // }
    /**
     * Returns an associative array with the same attributes as the given mutator, but with the corresponding types as string-values
     * Does not recurse into objects!
     */
    public getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes {
      let types: MutatorAttributeTypes = {};
      for (let attribute in _mutator) {
        let type: string = null;
        let value: number | boolean | string | object = _mutator[attribute];
        if (_mutator[attribute] != undefined)
          if (typeof (value) == "object")
            type = (<General>this)[attribute].constructor.name;
          else if (typeof (value) == "function")
            type = value["name"];
          else
            type = _mutator[attribute].constructor.name;
        types[attribute] = type;
      }
      return types;
    }
    /**
     * Updates the values of the given mutator according to the current state of the instance
     * @param _mutator 
     */
    public updateMutator(_mutator: Mutator): void {
      for (let attribute in _mutator) {
        let value: Object = _mutator[attribute];
        if (value instanceof Mutable)
          _mutator[attribute] = value.getMutator();
        else
          _mutator[attribute] = (<General>this)[attribute];
      }
    }
    /**
     * Updates the attribute values of the instance according to the state of the mutator.
     * The mutation may be restricted to a subset of the mutator and the event dispatching suppressed.
     * Uses mutateBase, but can be overwritten in subclasses
     */
    public async mutate(_mutator: Mutator, _selection: string[] = null, _dispatchMutate: boolean = true): Promise<void> {
      await this.mutateBase(_mutator, _selection);
      if (_dispatchMutate)
        this.dispatchEvent(new CustomEvent(EVENT.MUTATE, {bubbles: true, detail: {mutator: _mutator}}));
    }

    /**
     * Base method for mutation, always available to subclasses. Do not overwrite in subclasses!
     */
    protected async mutateBase(_mutator: Mutator, _selection?: string[]): Promise<void> {
      let mutator: Mutator = {};
      if (!_selection)
        mutator = _mutator;
      else
        for (let attribute of _selection) // reduce the mutator to the selection
          if (typeof (_mutator[attribute]) !== "undefined")
            mutator[attribute] = _mutator[attribute];

      for (let attribute in mutator) {
        if (!Reflect.has(this, attribute))
          continue;
        let mutant: Object = Reflect.get(this, attribute);
        let value: Mutator = <Mutator>mutator[attribute];
        if (mutant instanceof MutableArray || mutant instanceof Mutable)
          await mutant.mutate(value, null, false);
        else
          Reflect.set(this, attribute, value);
      }
    }
    /**
     * Reduces the attributes of the general mutator according to desired options for mutation. To be implemented in subclasses
     * @param _mutator 
     */
    protected abstract reduceMutator(_mutator: Mutator): void;
  }
}
