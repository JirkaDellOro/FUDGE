/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>

namespace Fudge {
  interface AnimationStructure {
    [attribute: string]: Serialization | AnimationSequence;
  }

  /**
   * Animation Class to hold all required Objects that are part of an Animation.
   * Also holds functions to play said Animation.
   * @author Lukas Scheuerle, HFU, 2019
   */
  export class Animation extends Mutable implements SerializableResource {
    idResource: string;
    name: string;
    totalTime: number = 0;
    labels: AnimationLabel = {};
    fps: number = 60;
    sps: number = 10;
    animationStructure: AnimationStructure = {};

    constructor(_animStructure: AnimationStructure) {
      super();
      this.animationStructure = _animStructure;
    }

    getMutated(_time: number, _direction: number): Mutator {
      let m: Mutator = {};
      this.totalTime = 5000;
      // this.calculateTotalTime();

      m = this.traverseStructureForMutator(this.animationStructure, m, _time);
      return m;
    }

    get getLabels(): Enumerator {
      let en: Enumerator = new Enumerator(this.labels);
      return en;
    }

    calculateTotalTime(): void {
      this.totalTime = 0;
      this.traverseStructureForTime(this.animationStructure);
    }
    //#region transfer
    serialize(): Serialization {
      // let s: Serialization = {
      //   name: this.name,
      //   labels: {},
      //   fps: this.fps,
      //   sps: this.sps,
      //   animationStructure: this.animationStructure.getMutatir()
      // };
      // for (let name in this.labels) {
      //   s.labels[name] = this.labels[name];
      // }
      return this.getMutator();
    }
    deserialize(_serialization: Serialization): Serializable {
      this.name = _serialization.name;
      this.fps = _serialization.fps;
      this.sps = _serialization.sps;
      this.labels = {};
      for (let name in _serialization.labels) {
        this.labels[name] = _serialization.labels[name];
      }

      this.animationStructure = this.traverseStructureForDeserialisation(_serialization.animationStructure, {});

      this.calculateTotalTime();
      return this;
    }
    protected reduceMutator(_mutator: Mutator): void {
      delete _mutator.totalTime;
    }
    private traverseStructureForDeserialisation(_serialization: Serialization, _structure: AnimationStructure): AnimationStructure {
      for (let n in _serialization) {
        if (_serialization[n].animationSequence) {
          let animSeq: AnimationSequence = new AnimationSequence();
          _structure[n] = animSeq.deserialize(_serialization[n]);
        } else {
          _structure[n] = this.traverseStructureForDeserialisation(_serialization[n], <AnimationStructure>_structure[n]);
        }
      }
      return _structure;
    }
    //#endregion

    private traverseStructureForMutator(_structure: AnimationStructure, _newMutator: Mutator, _time: number): Mutator {
      for (let n in _structure) {
        if (_structure[n] instanceof AnimationSequence) {
          _newMutator[n] = (<AnimationSequence>_structure[n]).evaluate(_time);
        } else {
          _newMutator[n] = this.traverseStructureForMutator(<AnimationStructure>_structure[n], {}, _time);
        }
      }
      return _newMutator;
    }


    private traverseStructureForTime(_structure: AnimationStructure): void {
      for (let n in _structure) {
        if (_structure[n] instanceof AnimationSequence && _structure[n].keys.length > 0) {
          let sequenceTime: number = _structure[n].keys[_structure[n].keys.length - 1].time;
          this.totalTime = sequenceTime > this.totalTime ? sequenceTime : this.totalTime;
        } else {
          this.traverseStructureForTime(<AnimationStructure>_structure[n]);
        }
      }
    }
  }
}