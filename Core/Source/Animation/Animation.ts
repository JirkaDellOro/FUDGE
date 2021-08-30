// / <reference path="../Transfer/Mutable.ts"/>

namespace FudgeCore {
  /**
   * Holds information about the AnimationStructure that the Animation uses to map the Sequences to the Attributes.
   * Built out of a {@link Node}'s serialsation, it swaps the values with {@link AnimationSequence}s.
   */
  export interface AnimationStructure {
    [attribute: string]: Serialization | AnimationSequence;
  }

  /**
  * An associative array mapping names of lables to timestamps.
  * Labels need to be unique per Animation.
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

  /**
   * Internally used to differentiate between the various generated structures and events.
   * @author Lukas Scheuerle, HFU, 2019
   */
  enum ANIMATION_STRUCTURE_TYPE {
    /**Default: forward, continous */
    NORMAL,
    /**backward, continous */
    REVERSE,
    /**forward, rastered */
    RASTERED,
    /**backward, rastered */
    RASTEREDREVERSE
  }

  /**
   * Holds different playmodes the animation uses to play back its animation.
   * @author Lukas Scheuerle, HFU, 2019
   */
  export enum ANIMATION_PLAYMODE {
    /**Plays animation in a loop: it restarts once it hit the end.*/
    LOOP,
    /**Plays animation once and stops at the last key/frame*/
    PLAYONCE,
    /**Plays animation once and stops on the first key/frame */
    PLAYONCESTOPAFTER,
    /**Plays animation like LOOP, but backwards.*/
    REVERSELOOP,
    /**Causes the animation not to play at all. Useful for jumping to various positions in the animation without proceeding in the animation.*/
    STOP
    //TODO: add an INHERIT and a PINGPONG mode
  }

  export enum ANIMATION_PLAYBACK {
    //TODO: add an in-depth description of what happens to the animation (and events) depending on the Playback. Use Graphs to explain.
    /**Calculates the state of the animation at the exact position of time. Ignores FPS value of animation.*/
    TIMEBASED_CONTINOUS,
    /**Limits the calculation of the state of the animation to the FPS value of the animation. Skips frames if needed.*/
    TIMEBASED_RASTERED_TO_FPS,
    /** Advances the time each frame according to the FPS value of the animation, ignoring the actual duration of the frames. Doesn't skip any frames.*/
    FRAMEBASED
  }

  /**
   * Animation Class to hold all required Objects that are part of an Animation.
   * Also holds functions to play said Animation.
   * Can be added to a Node and played through {@link ComponentAnimator}.
   * @author Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2021
   */
  export class Animation extends Mutable implements SerializableResource {
    idResource: string;
    name: string;
    totalTime: number = 0;
    labels: AnimationLabel = {};
    // stepsPerSecond: number = 10;
    animationStructure: AnimationStructure;
    events: AnimationEventTrigger = {};
    private framesPerSecond: number = 60;

    // processed eventlist and animation strucutres for playback.
    private eventsProcessed: Map<ANIMATION_STRUCTURE_TYPE, AnimationEventTrigger> = new Map<ANIMATION_STRUCTURE_TYPE, AnimationEventTrigger>();
    private animationStructuresProcessed: Map<ANIMATION_STRUCTURE_TYPE, AnimationStructure> = new Map<ANIMATION_STRUCTURE_TYPE, AnimationStructure>();

    constructor(_name: string, _animStructure: AnimationStructure = {}, _fps: number = 60) {
      super();
      this.name = _name;
      this.animationStructure = _animStructure;
      this.animationStructuresProcessed.set(ANIMATION_STRUCTURE_TYPE.NORMAL, _animStructure);
      this.framesPerSecond = _fps;
      this.calculateTotalTime();
      Project.register(this);
    }

    get getLabels(): Enumerator {
      //TODO: this actually needs testing
      let en: Enumerator = new Enumerator(this.labels);
      return en;
    }

    get fps(): number {
      return this.framesPerSecond;
    }

    set fps(_fps: number) {
      this.framesPerSecond = _fps;
      this.eventsProcessed.clear();
      this.animationStructuresProcessed.clear();
    }

    /**
     * Generates a new "Mutator" with the information to apply to the {@link Node} the {@link ComponentAnimator} is attached to with {@link Node.applyAnimation}.
     * @param _time The time at which the animation currently is at
     * @param _direction The direction in which the animation is supposed to be playing back. >0 == forward, 0 == stop, <0 == backwards
     * @param _playback The playbackmode the animation is supposed to be calculated with.
     * @returns a "Mutator" to apply.
     */
    getMutated(_time: number, _direction: number, _playback: ANIMATION_PLAYBACK): Mutator {     //TODO: find a better name for this
      let m: Mutator = {};
      let animationStructure: ANIMATION_STRUCTURE_TYPE;

      if (_playback == ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS)
        animationStructure = _direction < 0 ? ANIMATION_STRUCTURE_TYPE.REVERSE : ANIMATION_STRUCTURE_TYPE.NORMAL;
      else
        animationStructure = _direction < 0 ? ANIMATION_STRUCTURE_TYPE.RASTEREDREVERSE : ANIMATION_STRUCTURE_TYPE.RASTERED;

      m = this.traverseStructureForMutator(this.getProcessedAnimationStructure(animationStructure), _time);
      return m;
    }

    /**
     * Returns a list of the names of the events the {@link ComponentAnimator} needs to fire between _min and _max. 
     * @param _min The minimum time (inclusive) to check between
     * @param _max The maximum time (exclusive) to check between
     * @param _playback The playback mode to check in. Has an effect on when the Events are fired. 
     * @param _direction The direction the animation is supposed to run in. >0 == forward, 0 == stop, <0 == backwards
     * @returns a list of strings with the names of the custom events to fire.
     */
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

    /**
     * Adds an Event to the List of events.
     * @param _name The name of the event (needs to be unique per Animation).
     * @param _time The timestamp of the event (in milliseconds).
     */
    setEvent(_name: string, _time: number): void {
      this.events[_name] = _time;
      this.eventsProcessed.clear();
    }

    /**
     * Removes the event with the given name from the list of events.
     * @param _name name of the event to remove.
     */
    removeEvent(_name: string): void {
      delete this.events[_name];
      this.eventsProcessed.clear();
    }


    /**
     * (Re-)Calculate the total time of the Animation. Calculation-heavy, use only if actually needed.
     */
    calculateTotalTime(): void {
      this.totalTime = 0;
      this.traverseStructureForTime(this.animationStructure);
    }

    /**
     * Returns the time to use for animation sampling when applying a playmode
     */
    public getModalTime(_time: number, _playmode: ANIMATION_PLAYMODE, _timeStop: number = _time): number {
      switch (_playmode) {
        case ANIMATION_PLAYMODE.STOP:
          // return this.localTime.getOffset();
          return _timeStop;
        case ANIMATION_PLAYMODE.PLAYONCE:
          if (_time >= this.totalTime)
            return this.totalTime - 0.01;     //TODO: this might cause some issues
        case ANIMATION_PLAYMODE.PLAYONCESTOPAFTER:
          if (_time >= this.totalTime)
            // TODO: return _timeStop instead?
            return this.totalTime + 0.01;     //TODO: this might cause some issues
      }
      return _time;
    }

    /**
     * Calculates and returns the direction the animation should currently be playing in.
     * @param _time the time at which to calculate the direction
     * @returns 1 if forward, 0 if stop, -1 if backwards
     */
    public calculateDirection(_time: number, _playmode: ANIMATION_PLAYMODE): number {
      switch (_playmode) {
        case ANIMATION_PLAYMODE.STOP:
          return 0;
        // case ANIMATION_PLAYMODE.PINGPONG:
        //   if (Math.floor(_time / this.animation.totalTime) % 2 == 0)
        //     return 1;
        //   else
        //     return -1;
        case ANIMATION_PLAYMODE.REVERSELOOP:
          return -1;
        case ANIMATION_PLAYMODE.PLAYONCE:
        case ANIMATION_PLAYMODE.PLAYONCESTOPAFTER:
          if (_time >= this.totalTime) {
            return 0;
          }
        default:
          return 1;
      }
    }

    //#region transfer
    public serialize(): Serialization {
      let s: Serialization = {
        idResource: this.idResource,
        name: this.name,
        labels: {},
        events: {},
        fps: this.framesPerSecond,
        // sps: this.stepsPerSecond
      };
      for (let name in this.labels) {
        s.labels[name] = this.labels[name];
      }
      for (let name in this.events) {
        s.events[name] = this.events[name];
      }
      s.animationStructure = this.traverseStructureForSerialisation(this.animationStructure);
      return s;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.idResource = _serialization.idResource;
      this.name = _serialization.name;
      this.framesPerSecond = _serialization.fps;
      // this.stepsPerSecond = _serialization.sps;
      this.labels = {};
      for (let name in _serialization.labels) {
        this.labels[name] = _serialization.labels[name];
      }
      this.events = {};
      for (let name in _serialization.events) {
        this.events[name] = _serialization.events[name];
      }
      this.eventsProcessed = new Map<ANIMATION_STRUCTURE_TYPE, AnimationEventTrigger>();

      this.animationStructure = await this.traverseStructureForDeserialisation(_serialization.animationStructure);

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
    /**
     * Traverses an AnimationStructure and returns the Serialization of said Structure.
     * @param _structure The Animation Structure at the current level to transform into the Serialization.
     * @returns the filled Serialization.
     */
    private traverseStructureForSerialisation(_structure: AnimationStructure): Serialization {
      let newSerialization: Serialization = {};
      for (let n in _structure) {
        if (_structure[n] instanceof AnimationSequence) {
          newSerialization[n] = _structure[n].serialize();
        } else {
          newSerialization[n] = this.traverseStructureForSerialisation(<AnimationStructure>_structure[n]);
        }
      }
      return newSerialization;
    }
    /**
     * Traverses a Serialization to create a new AnimationStructure.
     * @param _serialization The serialization to transfer into an AnimationStructure
     * @returns the newly created AnimationStructure.
     */
    private async traverseStructureForDeserialisation(_serialization: Serialization): Promise<AnimationStructure> {
      let newStructure: AnimationStructure = {};
      for (let n in _serialization) {
        if (_serialization[n].animationSequence) {
          let animSeq: AnimationSequence = new AnimationSequence();
          newStructure[n] = await animSeq.deserialize(_serialization[n]);
        } else {
          newStructure[n] = await this.traverseStructureForDeserialisation(_serialization[n]);
        }
      }
      return newStructure;
    }
    //#endregion

    /**
     * Finds the list of events to be used with these settings.
     * @param _direction The direction the animation is playing in.
     * @param _playback The playbackmode the animation is playing in.
     * @returns The correct AnimationEventTrigger Object to use
     */
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

    /**
     * Traverses an AnimationStructure to turn it into the "Mutator" to return to the Component.
     * @param _structure The strcuture to traverse
     * @param _time the point in time to write the animation numbers into.
     * @returns The "Mutator" filled with the correct values at the given time. 
     */
    private traverseStructureForMutator(_structure: AnimationStructure, _time: number): Mutator {
      let newMutator: Mutator = {};
      for (let n in _structure) {
        if (_structure[n] instanceof AnimationSequence) {
          newMutator[n] = (<AnimationSequence>_structure[n]).evaluate(_time);
        } else {
          newMutator[n] = this.traverseStructureForMutator(<AnimationStructure>_structure[n], _time);
        }
      }
      return newMutator;
    }

    /**
     * Traverses the current AnimationStrcuture to find the totalTime of this animation.
     * @param _structure The structure to traverse
     */
    private traverseStructureForTime(_structure: AnimationStructure): void {
      for (let n in _structure) {
        if (_structure[n] instanceof AnimationSequence) {
          let sequence: AnimationSequence = <AnimationSequence>_structure[n];
          if (sequence.length > 0) {
            let sequenceTime: number = sequence.getKey(sequence.length - 1).Time;
            this.totalTime = sequenceTime > this.totalTime ? sequenceTime : this.totalTime;
          }
        } else {
          this.traverseStructureForTime(<AnimationStructure>_structure[n]);
        }
      }
    }

    /**
     * Ensures the existance of the requested {@link AnimationStrcuture} and returns it.
     * @param _type the type of the structure to get
     * @returns the requested {@link AnimationStructure]]
     */
    private getProcessedAnimationStructure(_type: ANIMATION_STRUCTURE_TYPE): AnimationStructure {
      if (!this.animationStructuresProcessed.has(_type)) {
        this.calculateTotalTime();
        let ae: AnimationStructure = {};
        switch (_type) {
          case ANIMATION_STRUCTURE_TYPE.NORMAL:
            ae = this.animationStructure;
            break;
          case ANIMATION_STRUCTURE_TYPE.REVERSE:
            ae = this.traverseStructureForNewStructure(this.animationStructure, this.calculateReverseSequence.bind(this));
            break;
          case ANIMATION_STRUCTURE_TYPE.RASTERED:
            ae = this.traverseStructureForNewStructure(this.animationStructure, this.calculateRasteredSequence.bind(this));
            break;
          case ANIMATION_STRUCTURE_TYPE.RASTEREDREVERSE:
            ae = this.traverseStructureForNewStructure(this.getProcessedAnimationStructure(ANIMATION_STRUCTURE_TYPE.REVERSE), this.calculateRasteredSequence.bind(this));
            break;
          default:
            return {};
        }
        this.animationStructuresProcessed.set(_type, ae);
      }
      return this.animationStructuresProcessed.get(_type);
    }

    /**
     * Ensures the existance of the requested {@link AnimationEventTrigger} and returns it.
     * @param _type The type of AnimationEventTrigger to get
     * @returns the requested {@link AnimationEventTrigger]]
     */
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

    /**
     * Traverses an existing structure to apply a recalculation function to the AnimationStructure to store in a new Structure.
     * @param _oldStructure The old structure to traverse
     * @param _functionToUse The function to use to recalculated the structure.
     * @returns A new Animation Structure with the recalulated Animation Sequences.
     */
    private traverseStructureForNewStructure(_oldStructure: AnimationStructure, _functionToUse: Function): AnimationStructure {
      let newStructure: AnimationStructure = {};
      for (let n in _oldStructure) {
        if (_oldStructure[n] instanceof AnimationSequence) {
          newStructure[n] = _functionToUse(_oldStructure[n]);
        } else {
          newStructure[n] = this.traverseStructureForNewStructure(<AnimationStructure>_oldStructure[n], _functionToUse);
        }
      }
      return newStructure;
    }

    /**
     * Creates a reversed Animation Sequence out of a given Sequence.
     * @param _sequence The sequence to calculate the new sequence out of
     * @returns The reversed Sequence
     */
    private calculateReverseSequence(_sequence: AnimationSequence): AnimationSequence {
      let seq: AnimationSequence = new AnimationSequence();
      for (let i: number = 0; i < _sequence.length; i++) {
        let oldKey: AnimationKey = _sequence.getKey(i);
        let key: AnimationKey = new AnimationKey(this.totalTime - oldKey.Time, oldKey.Value, oldKey.SlopeOut, oldKey.SlopeIn, oldKey.Constant);
        seq.addKey(key);
      }
      return seq;
    }

    /**
     * Creates a rastered {@link AnimationSequence} out of a given sequence.
     * @param _sequence The sequence to calculate the new sequence out of
     * @returns the rastered sequence.
     */
    private calculateRasteredSequence(_sequence: AnimationSequence): AnimationSequence {
      let seq: AnimationSequence = new AnimationSequence();
      let frameTime: number = 1000 / this.framesPerSecond;
      for (let i: number = 0; i < this.totalTime; i += frameTime) {
        let key: AnimationKey = new AnimationKey(i, _sequence.evaluate(i), 0, 0, true);
        seq.addKey(key);
      }
      return seq;
    }

    /**
     * Creates a new reversed {@link AnimationEventTrigger} object based on the given one.  
     * @param _events the event object to calculate the new one out of
     * @returns the reversed event object
     */
    private calculateReverseEventTriggers(_events: AnimationEventTrigger): AnimationEventTrigger {
      let ae: AnimationEventTrigger = {};
      for (let name in _events) {
        ae[name] = this.totalTime - _events[name];
      }
      return ae;
    }

    /**
     * Creates a rastered {@link AnimationEventTrigger} object based on the given one.  
     * @param _events the event object to calculate the new one out of
     * @returns the rastered event object
     */
    private calculateRasteredEventTriggers(_events: AnimationEventTrigger): AnimationEventTrigger {
      let ae: AnimationEventTrigger = {};
      let frameTime: number = 1000 / this.framesPerSecond;
      for (let name in _events) {
        ae[name] = _events[name] - (_events[name] % frameTime);
      }
      return ae;
    }

    /**
     * Checks which events lay between two given times and returns the names of the ones that do.
     * @param _eventTriggers The event object to check the events inside of
     * @param _min the minimum of the range to check between (inclusive)
     * @param _max the maximum of the range to check between (exclusive)
     * @returns an array of the names of the events in the given range. 
     */
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