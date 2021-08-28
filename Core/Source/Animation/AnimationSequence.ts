namespace FudgeCore {
  /**
   * A sequence of {@link AnimationKey}s that is mapped to an attribute of a {@link Node} or its {@link Component}s inside the {@link Animation}.
   * Provides functions to modify said keys
   * @author Lukas Scheuerle, HFU, 2019
   */
  export class AnimationSequence extends Mutable implements Serializable {
    private keys: AnimationKey[] = [];

    get length(): number {
      return this.keys.length;
    }
    
    /**
     * Evaluates the sequence at the given point in time.
     * @param _time the point in time at which to evaluate the sequence in milliseconds.
     * @returns the value of the sequence at the given time. 0 if there are no keys.
     */
    evaluate(_time: number): number {
      if (this.keys.length == 0)
        return 0; //TODO: shouldn't return 0 but something indicating no change, like null. probably needs to be changed in Node as well to ignore non-numeric values in the applyAnimation function
      if (this.keys.length == 1 || this.keys[0].Time >= _time)
        return this.keys[0].Value;


      for (let i: number = 0; i < this.keys.length - 1; i++) {
        if (this.keys[i].Time <= _time && this.keys[i + 1].Time > _time) {
          return this.keys[i].functionOut.evaluate(_time);
        }
      }
      return this.keys[this.keys.length - 1].Value;
    }

    /**
     * Adds a new key to the sequence.
     * @param _key the key to add
     */
    addKey(_key: AnimationKey): void {
      this.keys.push(_key);
      this.keys.sort(AnimationKey.compare);
      this.regenerateFunctions();
    }

    /**
     * Removes a given key from the sequence.
     * @param _key the key to remove
     */
    removeKey(_key: AnimationKey): void {
      for (let i: number = 0; i < this.keys.length; i++) {
        if (this.keys[i] == _key) {
          this.keys.splice(i, 1);
          this.regenerateFunctions();
          return;
        }
      }
    }

    /**
     * Removes the Animation Key at the given index from the keys.
     * @param _index the zero-based index at which to remove the key
     * @returns the removed AnimationKey if successful, null otherwise.
     */
    removeKeyAtIndex(_index: number): AnimationKey {
      if (_index < 0 || _index >= this.keys.length) {
        return null;
      }
      let ak: AnimationKey = this.keys[_index];
      this.keys.splice(_index, 1);
      this.regenerateFunctions();
      return ak;
    }

    /**
     * Gets a key from the sequence at the desired index.
     * @param _index the zero-based index at which to get the key
     * @returns the AnimationKey at the index if it exists, null otherwise.
     */
    getKey(_index: number): AnimationKey {
      if (_index < 0 || _index >= this.keys.length)
        return null;
      return this.keys[_index];
    }


    //#region transfer
    serialize(): Serialization {
      let s: Serialization = {
        keys: [],
        animationSequence: true
      };
      for (let i: number = 0; i < this.keys.length; i++) {
        s.keys[i] = this.keys[i].serialize();
      }
      return s;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      for (let i: number = 0; i < _serialization.keys.length; i++) {
        // this.keys.push(<AnimationKey>Serializer.deserialize(_serialization.keys[i]));
        let k: AnimationKey = new AnimationKey();
        await k.deserialize(_serialization.keys[i]);
        this.keys[i] = k;
      }

      this.regenerateFunctions();
      return this;
    }
    protected reduceMutator(_mutator: Mutator): void {
      //
    }
    //#endregion

    /**
     * Utility function that (re-)generates all functions in the sequence.
     */
    private regenerateFunctions(): void {
      for (let i: number = 0; i < this.keys.length; i++) {
        let f: AnimationFunction = new AnimationFunction(this.keys[i]);
        this.keys[i].functionOut = f;
        if (i == this.keys.length - 1) {
          //TODO: check if this is even useful. Maybe update the runcondition to length - 1 instead. Might be redundant if functionIn is removed, see TODO in AnimationKey.
          f.setKeyOut = this.keys[0];
          this.keys[0].functionIn = f;
          break;
        }
        f.setKeyOut = this.keys[i + 1];
        this.keys[i + 1].functionIn = f;
      }
    }
  }
}