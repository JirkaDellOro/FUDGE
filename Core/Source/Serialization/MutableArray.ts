namespace FudgeCore {
  /**
   * Array for [[Mutable]]s. When used as a property of a [[Mutable]], the [[Mutator]]s of the entries are included as array in the [[Mutator]]
   * @author Jirka Dell'Oro-Friedl, HFU, 2021
   */
  // no special implementation so far, just for type-checking
  export class MutableArray<T extends Mutable> extends Array<T> {
    public static getMutatorAttributeTypes<T extends Mutable>(_mutator: Mutator, _mutable: MutableArray<T>): MutatorAttributeTypes {
      let types: MutatorAttributeTypes = {};
      for (let entry in _mutable)
        types[/* "#" +  */entry] = _mutable[entry].constructor.name;

      return types;
    }
  }
}