/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>

namespace FudgeCore {
  interface AnimationStructure {
    [attribute: string]: Serialization | AnimationSequence;
  }

  /**
  * Holds information about Animation Labels
  * @author Lukas Scheuerle, HFU, 2019
  */
  export interface AnimationLabel {
    [name: string]: number;
  }

  /**
  * Holds information about Animation Event Triggers
  * @author Lukas Scheuerle, HFU, 2019
  */
  export interface AnimationEventTrigger {
    [name: string]: number;
  }

  enum ANIMATION_STRUCTURE_TYPE {
    NORMAL,
    REVERSE,
    RASTERED,
    RASTEREDREVERSE
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
    stepsPerSecond: number = 10;
    animationStructure: AnimationStructure;
    private framesPerSecond: number = 60;
    private events: AnimationEventTrigger = {};
    private eventsProcessed: Map<ANIMATION_STRUCTURE_TYPE, AnimationEventTrigger> = new Map<ANIMATION_STRUCTURE_TYPE, AnimationEventTrigger>();
    private animationStructuresProcessed: Map<ANIMATION_STRUCTURE_TYPE, AnimationStructure> = new Map<ANIMATION_STRUCTURE_TYPE, AnimationStructure>();

    constructor(_name: string, _animStructure: AnimationStructure = {}, _fps: number = 60) {
      super();
      this.name = _name;
      this.animationStructure = _animStructure;
      this.animationStructuresProcessed.set(ANIMATION_STRUCTURE_TYPE.NORMAL, _animStructure);
      this.framesPerSecond = _fps;
      this.calculateTotalTime();
    }


    getMutated(_time: number, _direction: number, _playback: ANIMATION_PLAYBACK): Mutator {
      let m: Mutator = {};
      if (_playback == ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS) {
        if (_direction >= 0) {
          m = this.traverseStructureForMutator(this.getProcessedAnimationStructure(ANIMATION_STRUCTURE_TYPE.NORMAL), m, _time);
        } else {
          m = this.traverseStructureForMutator(this.getProcessedAnimationStructure(ANIMATION_STRUCTURE_TYPE.REVERSE), m, _time);
        }
      } else {
        if (_direction >= 0) {
          m = this.traverseStructureForMutator(this.getProcessedAnimationStructure(ANIMATION_STRUCTURE_TYPE.RASTERED), m, _time);
        } else {
          m = this.traverseStructureForMutator(this.getProcessedAnimationStructure(ANIMATION_STRUCTURE_TYPE.RASTEREDREVERSE), m, _time);
        }
      }

      return m;
    }

    getEventsToFire(_min: number, _max: number, _playback: ANIMATION_PLAYBACK, _direction: number): string[] {
      let eventList: string[] = [];
      let minSection: number = Math.floor(_min / this.totalTime);
      let maxSection: number = Math.floor(_max / this.totalTime);
      _min = _min % this.totalTime;
      _max = _max % this.totalTime;

      while (minSection <= maxSection) {
        let eventTriggers: AnimationEventTrigger = this.getCorrectEventList(_direction, _playback);
        if (minSection == maxSection) {
          eventList = eventList.concat(this.checkEventsBetween(eventTriggers, _min, _max));
        } else {
          eventList = eventList.concat(this.checkEventsBetween(eventTriggers, _min, this.totalTime));
          _min = 0;
        }
        minSection++;
      }

      return eventList;
    }

    setEvent(_name: string, _time: number): void {
      this.events[_name] = _time;
    }

    removeEvent(_name: string): void {
      delete this.events[_name];
    }

    get getLabels(): Enumerator {
      let en: Enumerator = new Enumerator(this.labels);
      return en;
    }

    get fps(): number {
      return this.framesPerSecond;
    }

    set fps(_fps: number) {
      this.framesPerSecond = _fps;
      this.eventsProcessed = new Map<ANIMATION_STRUCTURE_TYPE, AnimationEventTrigger>();
      this.animationStructuresProcessed = new Map<ANIMATION_STRUCTURE_TYPE, AnimationStructure>();
    }

    calculateTotalTime(): void {
      this.totalTime = 0;
      this.traverseStructureForTime(this.animationStructure);
    }

    //#region transfer
    serialize(): Serialization {
      let s: Serialization = {
        idResource: this.idResource,
        name: this.name,
        labels: {},
        events: {},
        fps: this.framesPerSecond,
        sps: this.stepsPerSecond
      };
      for (let name in this.labels) {
        s.labels[name] = this.labels[name];
      }
      for (let name in this.events) {
        s.events[name] = this.events[name];
      }
      s.animationStructure = this.traverseStructureForSerialisation({}, this.animationStructure);
      return s;
    }
    deserialize(_serialization: Serialization): Serializable {
      this.idResource = _serialization.idResource;
      this.name = _serialization.name;
      this.framesPerSecond = _serialization.fps;
      this.stepsPerSecond = _serialization.sps;
      this.labels = {};
      for (let name in _serialization.labels) {
        this.labels[name] = _serialization.labels[name];
      }
      this.events = {};
      for (let name in _serialization.events) {
        this.events[name] = _serialization.events[name];
      }
      this.eventsProcessed = new Map<ANIMATION_STRUCTURE_TYPE, AnimationEventTrigger>();

      this.animationStructure = this.traverseStructureForDeserialisation(_serialization.animationStructure, {});

      this.animationStructuresProcessed = new Map<ANIMATION_STRUCTURE_TYPE, AnimationStructure>();

      this.calculateTotalTime();
      return this;
    }
    public getMutator(): Mutator {
      return this.serialize();
    }
    protected reduceMutator(_mutator: Mutator): void {
      delete _mutator.totalTime;
    }
    private traverseStructureForSerialisation(_serialization: Serialization, _structure: AnimationStructure): Serialization {
      for (let n in _structure) {
        if (_structure[n] instanceof AnimationSequence) {
          _serialization[n] = _structure[n].serialize();
        } else {
          _serialization[n] = this.traverseStructureForSerialisation({}, <AnimationStructure>_structure[n]);
        }
      }
      return _serialization;
    }
    private traverseStructureForDeserialisation(_serialization: Serialization, _structure: AnimationStructure): AnimationStructure {
      for (let n in _serialization) {
        if (_serialization[n].animationSequence) {
          let animSeq: AnimationSequence = new AnimationSequence();
          _structure[n] = animSeq.deserialize(_serialization[n]);
        } else {
          _structure[n] = this.traverseStructureForDeserialisation(_serialization[n], {});
        }
      }
      return _structure;
    }
    //#endregion

    private getCorrectEventList(_direction: number, _playback: ANIMATION_PLAYBACK): AnimationEventTrigger {
      if (_playback != ANIMATION_PLAYBACK.FRAMEBASED) {
        if (_direction >= 0) {
          return this.getProcessedEventTrigger(ANIMATION_STRUCTURE_TYPE.NORMAL);
        } else {
          return this.getProcessedEventTrigger(ANIMATION_STRUCTURE_TYPE.REVERSE);
        }
      } else {
        if (_direction >= 0) {
          return this.getProcessedEventTrigger(ANIMATION_STRUCTURE_TYPE.RASTERED);
        } else {
          return this.getProcessedEventTrigger(ANIMATION_STRUCTURE_TYPE.RASTEREDREVERSE);
        }
      }
    }

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
        if (_structure[n] instanceof AnimationSequence) {
          let sequence: AnimationSequence = <AnimationSequence>_structure[n];
          if (sequence.keys.length > 0) {
            let sequenceTime: number = sequence.keys[sequence.keys.length - 1].time;
            this.totalTime = sequenceTime > this.totalTime ? sequenceTime : this.totalTime;
          }
        } else {
          this.traverseStructureForTime(<AnimationStructure>_structure[n]);
        }
      }
    }

    private getProcessedAnimationStructure(_type: ANIMATION_STRUCTURE_TYPE): AnimationStructure {
      if (!this.animationStructuresProcessed.has(_type)) {
        this.calculateTotalTime();
        let ae: AnimationStructure = {};
        switch (_type) {
          case ANIMATION_STRUCTURE_TYPE.NORMAL:
            ae = this.animationStructure;
            break;
          case ANIMATION_STRUCTURE_TYPE.REVERSE:
            ae = this.traverseStructureForNewStructure(this.animationStructure, {}, this.calculateReverseSequence.bind(this));
            break;
          case ANIMATION_STRUCTURE_TYPE.RASTERED:
            ae = this.traverseStructureForNewStructure(this.animationStructure, {}, this.calculateRasteredSequence.bind(this));
            break;
          case ANIMATION_STRUCTURE_TYPE.RASTEREDREVERSE:
            ae = this.traverseStructureForNewStructure(this.getProcessedAnimationStructure(ANIMATION_STRUCTURE_TYPE.REVERSE), {}, this.calculateRasteredSequence.bind(this));
            break;
          default:
            return {};
        }
        this.animationStructuresProcessed.set(_type, ae);
      }
      return this.animationStructuresProcessed.get(_type);
    }

    private getProcessedEventTrigger(_type: ANIMATION_STRUCTURE_TYPE): AnimationEventTrigger {
      if (!this.eventsProcessed.has(_type)) {
        this.calculateTotalTime();
        let ev: AnimationEventTrigger = {};
        switch (_type) {
          case ANIMATION_STRUCTURE_TYPE.NORMAL:
            ev = this.events;
            break;
          case ANIMATION_STRUCTURE_TYPE.REVERSE:
            ev = this.calculateReverseEventTriggers(this.events);
            break;
          case ANIMATION_STRUCTURE_TYPE.RASTERED:
            ev = this.calculateRasteredEventTriggers(this.events);
            break;
          case ANIMATION_STRUCTURE_TYPE.RASTEREDREVERSE:
            ev = this.calculateRasteredEventTriggers(this.getProcessedEventTrigger(ANIMATION_STRUCTURE_TYPE.REVERSE));
            break;
          default:
            return {};
        }
        this.eventsProcessed.set(_type, ev);
      }
      return this.eventsProcessed.get(_type);
    }

    private traverseStructureForNewStructure(_oldStructure: AnimationStructure, _newStructure: AnimationStructure, _functionToUse: Function): AnimationStructure {
      for (let n in _oldStructure) {
        if (_oldStructure[n] instanceof AnimationSequence) {
          _newStructure[n] = _functionToUse(_oldStructure[n]);
        } else {
          _newStructure[n] = this.traverseStructureForNewStructure(<AnimationStructure>_oldStructure[n], {}, _functionToUse);
        }
      }
      return _newStructure;
    }

    private calculateReverseSequence(_sequence: AnimationSequence): AnimationSequence {
      let seq: AnimationSequence = new AnimationSequence();
      for (let i: number = 0; i < _sequence.keys.length; i++) {
        let oldKey: AnimationKey = _sequence.keys[i];
        let key: AnimationKey = new AnimationKey(this.totalTime - oldKey.time, oldKey.value, oldKey.getSlopeOut, oldKey.getSlopeIn, oldKey.constant);
        seq.addKey(key);
      }
      return seq;
    }

    private calculateRasteredSequence(_sequence: AnimationSequence): AnimationSequence {
      let seq: AnimationSequence = new AnimationSequence();
      let frameTime: number = 1000 / this.framesPerSecond;
      for (let i: number = 0; i < this.totalTime; i += frameTime) {
        let key: AnimationKey = new AnimationKey(i, _sequence.evaluate(i), 0, 0, true);
        seq.addKey(key);
      }
      return seq;
    }
    // private calculateReverseRasteredSequence(_sequence: AnimationSequence): AnimationSequence {
    //   let seq: AnimationSequence = new AnimationSequence();
    //   let frameTime: number = 1000 / this.framesPerSecond;
    //   for (let i: number = 0; i < _sequence.keys.length; i++) {
    //     let oldKey: AnimationKey = _sequence.keys[i];
    //     let key: AnimationKey = new AnimationKey(this.totalTime - oldKey.time - frameTime, oldKey.value, oldKey.getSlopeOut, oldKey.getSlopeIn, oldKey.constant);
    //     seq.addKey(key);
    //   }
    //   return seq;
    // }

    private calculateReverseEventTriggers(_events: AnimationEventTrigger): AnimationEventTrigger {
      let ae: AnimationEventTrigger = {};
      for (let name in _events) {
        ae[name] = this.totalTime - _events[name];
      }
      return ae;
    }

    private calculateRasteredEventTriggers(_events: AnimationEventTrigger): AnimationEventTrigger {
      let ae: AnimationEventTrigger = {};
      let frameTime: number = 1000 / this.framesPerSecond;
      for (let name in _events) {
        ae[name] = _events[name] - (_events[name] % frameTime);
      }
      return ae;
    }
    // private calculateRasteredReverseEventTriggers(_events: AnimationEventTrigger): AnimationEventTrigger {
    //   let ae: AnimationEventTrigger = {};
    //   let frameTime: number = 1000 / this.framesPerSecond;
    //   for (let name in _events) {
    //     ae[name] = this.totalTime - _events[name] + frameTime + (_events[name] % frameTime);
    //   }
    //   return ae;
    // }
    private checkEventsBetween(_eventTriggers: AnimationEventTrigger, _min: number, _max: number): string[] {
      let eventsToTrigger: string[] = [];
      for (let name in _eventTriggers) {
        if (_min <= _eventTriggers[name] && _eventTriggers[name] < _max) {
          eventsToTrigger.push(name);
        }
      }
      return eventsToTrigger;
    }
  }
}