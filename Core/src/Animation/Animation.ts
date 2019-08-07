/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>

namespace Fudge {
  /**
   * Holds different playmodes for the animation to use.
   * @author Lukas Scheuerle, HFU, 2019
   */
  export enum ANIMATION_PLAYMODE {
    INHERIT,
    LOOP,
    PINGPONG,
    PLAYONCE,
    PLAYONCESTOPAFTER,
    REVERSELOOP,
    STOP
  }

  interface AnimationStructure {
    [attribute: string]: Serialization | AnimationSequence;
  }

  /**
   * Animation Class to hold all required Objects that are part of an Animation.
   * Also holds functions to play said Animation.
   * @author Lukas Scheuerle, HFU, 2019
   */
  export class Animation extends Mutable implements Serializable {
    name: string;
    // animatedObject: MutatorForAnimation;
    sequences: Map<Mutator, AnimationSequenceAsso>;
    totalTime: number = 0;
    events: AnimationEventTrigger = {};
    labels: AnimationLabel = {};
    fps: number = 60;
    sps: number = 10;
    playmode: ANIMATION_PLAYMODE;
    animationStructure: AnimationStructure = {};

    private startTime: number = 0;
    private timeAtStart: number = 0;
    private lastTime: number = 0;
    private direction: number = 0;

    constructor(_animStructure: AnimationStructure, _playmode: ANIMATION_PLAYMODE = ANIMATION_PLAYMODE.LOOP) {
      super();
      this.animationStructure = _animStructure;
      this.playmode = _playmode;
      this.sequences = new Map<Mutator, AnimationSequenceAsso>();
    }

    getMutated(_time: number, _playmode: ANIMATION_PLAYMODE = ANIMATION_PLAYMODE.LOOP): Mutator {
      let m: Mutator = {};
      this.totalTime = 5000;
      // this.calculateTotalTime();
      this.direction = this.calculateDirection(_time, _playmode);
      let time: number = this.calculateCurrentTime(_time);
      
      m = this.traverseStructure(this.animationStructure, m, time);
      return m;
    }

    /**
     * Updates the applied Mutator of the root object using the given time
     */
    update(_time: number): void {
      this.calculateTotalTime();
      let time: number = this.calculateCurrentTime(_time);
      for (let mutator of this.sequences.keys()) {
        let aa: AnimationSequenceAsso = this.sequences.get(mutator);
        for (let name in aa) {
          mutator[name] = aa[name].evaluate(time);
        }
      }

      this.checkEvents(time);
      this.lastTime = time;
    }

    get getLabels(): Enumerator {
      let en: Enumerator = new Enumerator(this.labels);
      return en;
    }

    jumpTo(_time: number, _currentTime: number): void {
      this.startTime = _time;
      this.timeAtStart = _currentTime;
      this.lastTime = _currentTime;
    }



    //#region transfer
    serialize(): Serialization {
      let s: Serialization = {
        name: this.name,
        sequences: {},
        events: {},
        labels: {},
        playmode: this.playmode,
        fps: this.fps,
        sps: this.sps
      };
      for (let name in this.events) {
        s.events[name] = this.events[name];
      }
      for (let name in this.labels) {
        s.labels[name] = this.labels[name];
      }

      for (let mutator of this.sequences.keys()) {
        for (let name in this.sequences.get(mutator)) {
          s.sequences[name] = this.sequences.get(mutator)[name].serialize();
        }
        // s.sequences.set(mutator, this.sequences.get(mutator).serialize())
      }
      return s;
    }
    deserialize(_serialization: Serialization): Serializable {
      this.name = _serialization.name;
      this.playmode = _serialization.playmode;
      this.fps = _serialization.fps;
      this.sps = _serialization.sps;
      this.events = {};
      this.labels = {};
      this.startTime = 0;

      for (let name in _serialization.labels) {
        this.labels[name] = _serialization.labels[name];
      }
      for (let name in _serialization.events) {
        this.events[name] = _serialization.events[name];
      }

      this.sequences = new Map<MutatorForAnimation, AnimationSequenceAsso>();
      // for (let name in _serialization.sequences) {
      //   this.sequences[name] = _serialization.sequences[name].deserialize();
      // }
      this.calculateTotalTime();
      return this;
    }
    protected reduceMutator(_mutator: Mutator): void {
      delete _mutator.lastEvent;
    }
    //#endregion

    private traverseStructure(_structure: AnimationStructure, _newMutator: Mutator, _time: number): Mutator {
      for (let n in _structure) {
        if (_structure[n] instanceof AnimationSequence) {
          _newMutator[n] = (<AnimationSequence>_structure[n]).evaluate(_time);
        } else {
          _newMutator[n] = this.traverseStructure(<AnimationStructure>_structure[n], {}, _time);
        }
      }

      return _newMutator;
    }

    private calculateTotalTime(): void {
      this.totalTime = 0;
      for (let aa of this.sequences.values()) {
        for (let s in aa) {
          if (aa[s].keys.length > 0) {
            let sequenceTime: number = aa[s].keys[aa[s].keys.length - 1].time;
            this.totalTime = sequenceTime > this.totalTime ? sequenceTime : this.totalTime;
          }
        }
      }
    }

    private calculateCurrentTime(_time: number): number {
      let time: number = ((_time - this.timeAtStart) * this.direction + this.startTime) % this.totalTime;
      if (this.direction < 0) {
        time += this.totalTime;
      }
      return time;
    }

    private calculateDirection(_time: number, _playmode: ANIMATION_PLAYMODE): number {
      _time = _time + this.startTime - this.timeAtStart;
      switch (_playmode) {
        case ANIMATION_PLAYMODE.STOP:
          return 0;
        case ANIMATION_PLAYMODE.PINGPONG:
          if (Math.floor(_time / this.totalTime) % 2 == 0)
            return 1;
          else
            return -1;
        case ANIMATION_PLAYMODE.REVERSELOOP:
          return -1;
        case ANIMATION_PLAYMODE.PLAYONCE:
        case ANIMATION_PLAYMODE.PLAYONCESTOPAFTER:
          if (_time > this.totalTime) {
            return 0;
          }
        default:
          return 1;
      }
    }

    private checkEvents(_time: number): void {
      //TODO Catch Events at the beginning & end of the animation
      if (this.playmode == ANIMATION_PLAYMODE.STOP || this.direction == 0)
        return;
      for (let name in this.events) {
        if (this.direction > 0 && this.lastTime < this.events[name] && this.events[name] < _time
          || this.direction < 0 && this.lastTime > this.events[name] && this.events[name] > _time) {
          this.dispatchEvent(new Event(name));
        }
      }
    }
  }
}