/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>

namespace Fudge {
  /**
   * Holds different playmodes for the animation to use.
   * @author Lukas Scheuerle, HFU, 2019
   */
  export enum ANIMPLAYMODE {
    INHERIT,
    LOOP,
    PINGPONG,
    PLAYONCE,
    PLAYONCESTOPAFTER,
    REVERSELOOP,
    STOP
  }

  /**
   * Animation Class to hold all required Objects that are part of an Animation.
   * Also holds functions to play said Animation.
   * @author Lukas Scheuerle, HFU, 2019
   */
  export class Animation extends Mutable implements Serializable {
    // name: string;
    animatedObject: MutatorForAnimation;
    sequences: { [name: string]: AnimationSequence };
    totalTime: number = 0;
    events: AnimationEventTrigger = {};
    labels: AnimationLabel = {};
    playmode: ANIMPLAYMODE = ANIMPLAYMODE.LOOP;
    fps: number = 60;
    sps: number = 10;

    private startTime: number = 0;
    private timeAtStart: number = 0;
    private lastTime: number = 0;
    private direction: number = 0;

    constructor(_animObj: MutatorForAnimation) {
      super();
      this.animatedObject = _animObj;
      this.sequences = {};
    }

    /**
     * Updates the applied Mutator of the root object using the given time
     */

    update(_time: number): void {
      let time: number = this.calculateCurrentTime(_time);
      for (let name in this.sequences) {
        this.animatedObject[name] = this.sequences[name].evaluate(time);
      }

      this.checkEvents(time);
      this.lastTime = time;
    }

    get getLabels(): Enumerator {
      let en: Enumerator = new Enumerator(this.labels);
      return en;
    }


    //#region transfer
    serialize(): Serialization {
      let s: Serialization = {
        sequences: {},
        events: {},
        labels: {},
        playmode: this.playmode,
        fps: this.fps,
        sps: this.sps
      };
      for (let name in this.sequences) {
        s.sequences[name] = this.sequences[name].serialize();
      }
      for (let name in this.events) {
        s.events[name] = this.events[name];
      }
      for (let name in this.labels) {
        s.labels[name] = this.labels[name];
      }

      return s;
    }
    deserialize(_serialization: Serialization): Serializable {
      this.playmode = _serialization.playmode;
      this.fps = _serialization.fps;
      this.sps = _serialization.sps;
      this.sequences = {};
      this.events = {};
      this.labels = {};
      this.startTime = 0;

      for (let name in _serialization.sequences) {
        this.sequences[name] = _serialization.sequences[name].deserialize();
      }
      for (let name in _serialization.labels) {
        this.labels[name] = _serialization.labels[name];
      }
      for (let name in _serialization.events) {
        this.events[name] = _serialization.events[name];
      }
      this.calculateTotalTime();
      return this;
    }
    protected reduceMutator(_mutator: Mutator): void {
      delete _mutator.lastEvent;
    }
    //#endregion

    private calculateTotalTime(): void {
      this.totalTime = 0;
      for (let s in this.sequences) {
        if (this.sequences[s].keys.length > 0) {
          let sequenceTime: number = this.sequences[s].keys[this.sequences[s].keys.length - 1].time;
          this.totalTime = sequenceTime > this.totalTime ? sequenceTime : this.totalTime;
        }
      }
    }

    private calculateCurrentTime(_time: number): number {
      this.direction = this.calculateDirection(_time);
      let time: number = ((_time - this.timeAtStart) * this.direction + this.startTime) % this.totalTime;
      if (this.direction < 0) {
        time += this.totalTime;
      }
      return time;
      // _time = _time + this.startTime;

      // if (this.playmode == ANIMPLAYMODE.STOP) {
      //   this.timeAtStart = this.startTime;
      //   return;
      // }
      // if (this.playmode == ANIMPLAYMODE.PLAYONCE && _time > this.totalTime) {
      //   this.timeAtStart = this.totalTime;
      //   return;
      // }
      // if (this.playmode == ANIMPLAYMODE.PLAYONCESTOPAFTER && _time > this.totalTime) {
      //   this.timeAtStart = 0;
      //   return;
      // }

      // let t: number = _time % this.totalTime;
      // switch (this.playmode) {
      //   case ANIMPLAYMODE.PINGPONG:
      //     let tmp: number = Math.floor(_time / this.totalTime) % 2;
      //     if (tmp == 1)
      //       t = this.totalTime - t;
      //     break;
      //   case ANIMPLAYMODE.REVERSELOOP:
      //     t = this.totalTime - t;
      //     break;
      //   default:
      //     break;
      // }
      // this.timeAtStart = t;
    }

    private calculateDirection(_time: number): number {
      switch (this.playmode) {
        case ANIMPLAYMODE.PINGPONG:
          if (Math.floor(_time / this.totalTime) % 2 == 0)
            return 1;
          else
            return -1;
        case ANIMPLAYMODE.REVERSELOOP:
          return -1;
        case ANIMPLAYMODE.PLAYONCE:
        case ANIMPLAYMODE.PLAYONCESTOPAFTER:
          if (_time > this.totalTime) {
            return 0;
          }
        default:
          return 1;
      }
    }

    private checkEvents(_time: number): void {
      //TODO Catch Events at the beginning & end of the animation
      if (this.playmode == ANIMPLAYMODE.STOP || this.direction == 0)
        return;
      for (let name in this.events) {
        if ( this.direction > 0 && this.lastTime < this.events[name] && this.events[name] < _time
          || this.direction < 0 && this.lastTime > this.events[name] && this.events[name] > _time) {
          this.dispatchEvent(new Event(name));
        }
      }
    }
  }
}