namespace FudgeCore {
  /**
   * Mutable array of {@link Mutable}s. The {@link Mutator}s of the entries are included as array in the {@link Mutator}
   * @author Jirka Dell'Oro-Friedl, HFU, 2021
   */
  export class MutableArray<T extends Mutable> extends Array<T> {
    #type: new () => T;

    public constructor(_type: new () => T, ..._args: T[]) {
      super(..._args);
      this.#type = _type;
    }
    
    public get type(): new () => T {
      return this.#type;
    }

    public rearrange(_sequence: number[]): void {
      let length: number = this.length;
      for (let index of _sequence) {
        let original: T = this[index];
        // TODO: optimize, copy only double entries
        //@ts-ignore
        let copy: T = new original.constructor();
        copy.mutate(original.getMutator());
        this.push(copy);
      }
      this.splice(0, length);
    }
    public getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes {
      let types: MutatorAttributeTypes = {};
      for (let entry in this)
        types[entry] = this[entry].constructor.name;

      return types;
    }
    public getMutator(): Mutator {
      return this.map((_value) => _value.getMutator());
    }
    public getMutatorForUserInterface(): Mutator {
      return this.getMutator();
    }
    public async mutate(_mutator: Mutator): Promise<void> {
      for (let entry in this)
        await this[entry].mutate(_mutator[entry]);
    }

    /**
     * Updates the values of the given mutator according to the current state of the instance
     */
    public updateMutator(_mutator: Mutator): void {
      for (let entry in this) {
        let mutatorValue: Object = _mutator[entry];
        if (!mutatorValue)
          continue;
        if (this[entry] instanceof Mutable)
          _mutator[entry] = this[entry].getMutator();
        else
          _mutator[entry] = this[entry];
      }
    }
  }
}