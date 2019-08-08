/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>

namespace Fudge {
  /**
   * 
   * @author Lukas Scheuerle, HFU, 2019
   */
  export class AnimationSequence extends Mutable implements Serializable {
    keys: AnimationKey[] = [];

    evaluate(_time: number): number {
      // console.log(this.keys.length == 1 || this.keys[0].time < _time);
      if (this.keys.length == 1 || this.keys[0].time >= _time)
        return this.keys[0].value;

      if (this.keys.length == 0)
        return 0;

      for (let i: number = 0; i < this.keys.length - 1; i++) {
        if (this.keys[i].time <= _time && this.keys[i + 1].time > _time) {
          return this.keys[i].functionOut.evaluate(_time);
        }
      }
      return this.keys[this.keys.length - 1].value;
    }

    addKey(_key: AnimationKey): void {
      this.keys.push(_key);
      this.keys.sort(AnimationKey.sort);
      this.regenerateFunctions();
    }

    removeKey(_key: AnimationKey): void {
      for (let i: number = 0; i < this.keys.length; i++) {
        if (this.keys[i] == _key) {
          this.keys.splice(i, 1);
          this.regenerateFunctions();
          return;
        }
      }
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
    deserialize(_serialization: Serialization): Serializable {
      for (let i: number = 0; i < _serialization.keys.length; i++) {
        // this.keys.push(<AnimationKey>Serializer.deserialize(_serialization.keys[i]));
        let k: AnimationKey = new AnimationKey();
        k.deserialize(_serialization.keys[i]);
      }

      this.regenerateFunctions();
      return this;
    }
    protected reduceMutator(_mutator: Mutator): void {
      //
    }
    //#endregion

    private regenerateFunctions(): void {
      for (let i: number = 0; i < this.keys.length; i++) {
        let f: AnimationFunction = new AnimationFunction(this.keys[i]);
        this.keys[i].functionOut = f;
        if (i == this.keys.length - 1) {
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