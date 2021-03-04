namespace FudgeCore {
  /**
   * Array for [[Mutable]]s. When used as a property of a [[Mutable]], the [[Mutator]]s of the entries are included as array in the [[Mutator]]
   * @author Jirka Dell'Oro-Friedl, HFU, 2021
   */
  // mainly for type-checking
  export class MutableArray<T extends Mutable> extends Array<T> {
    public getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes {
      let types: MutatorAttributeTypes = {};
      for (let entry in this)
        types[entry] = this[entry].constructor.name;

      return types;
    }
    public async mutate(_mutator: Mutator): Promise<void> {
      for (let entry in this)
        await this[entry].mutate(_mutator[entry]);
    }
  }
}