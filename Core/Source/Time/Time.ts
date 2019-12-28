namespace FudgeCore {
  export interface TimeUnits {
    hours?: number;
    minutes?: number;
    seconds?: number;
    tenths?: number;
    hundreds?: number;
    thousands?: number;
    fraction?: number;
    asHours?: number;
    asMinutes?: number;
    asSeconds?: number;
  }

  export interface Timers extends Object {
    [id: number]: Timer;
  }

  /**
   * Instances of this class generate a timestamp that correlates with the time elapsed since the start of the program but allows for resetting and scaling.  
   * Supports [[Timer]]s similar to window.setInterval but with respect to the scaled time.
   * All time values are given in milliseconds
   * 
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class Time extends EventTargetƒ {
    private static gameTime: Time = new Time();
    private start: number;
    private scale: number;
    private offset: number;
    private lastCallToElapsed: number;
    private timers: Timers = {};
    private idTimerNext: number = 0;

    constructor() {
      super();
      this.start = performance.now();
      this.scale = 1.0;
      this.offset = 0.0;
      this.lastCallToElapsed = 0.0;
    }

    /**
     * Returns the game-time-object which starts automatically and serves as base for various internal operations. 
     */
    public static get game(): Time {
      return Time.gameTime;
    }

    public static getUnits(_milliseconds: number): TimeUnits {
      let units: TimeUnits = {};

      units.asSeconds = _milliseconds / 1000;
      units.asMinutes = units.asSeconds / 60;
      units.asHours = units.asMinutes / 60;

      units.hours = Math.floor(units.asHours);
      units.minutes = Math.floor(units.asMinutes) % 60;
      units.seconds = Math.floor(units.asSeconds) % 60;

      units.fraction = _milliseconds % 1000;
      units.thousands = _milliseconds % 10;
      units.hundreds = _milliseconds % 100 - units.thousands;
      units.tenths = units.fraction - units.hundreds - units.thousands;

      return units;
    }

    //#region Get/Set time and scaling
    /**
     * Retrieves the current scaled timestamp of this instance in milliseconds
     */
    public get(): number {
      return this.offset + this.scale * (performance.now() - this.start);
    }

    /**
     * Returns the remaining time to the given point of time
     */
    public getRemainder(_to: number): number {
      return _to - this.get();
    }

    /**
     * (Re-) Sets the timestamp of this instance
     * @param _time The timestamp to represent the current time (default 0.0)
     */
    public set(_time: number = 0): void {
      this.offset = _time;
      this.start = performance.now();
      this.getElapsedSincePreviousCall();
    }

    /**
     * Sets the scaling of this time, allowing for slowmotion (<1) or fastforward (>1) 
     * @param _scale The desired scaling (default 1.0)
     */
    public setScale(_scale: number = 1.0): void {
      this.set(this.get());
      this.scale = _scale;
      //TODO: catch scale=0
      this.rescaleAllTimers();
      this.getElapsedSincePreviousCall();
      this.dispatchEvent(new Event(EVENT.TIME_SCALED));
    }

    /**
     * Retrieves the current scaling of this time
     */
    public getScale(): number {
      return this.scale;
    }

    /**
     * Retrieves the offset of this time
     */
    public getOffset(): number {
      return this.offset;
    }

    /**
     * Retrieves the scaled time in milliseconds passed since the last call to this method
     * Automatically reset at every call to set(...) and setScale(...)
     */
    public getElapsedSincePreviousCall(): number {
      let current: number = this.get();
      let elapsed: number = current - this.lastCallToElapsed;
      this.lastCallToElapsed = current;
      return elapsed;
    }
    //#endregion


    //#region Timers
    /**
     * Returns a Promise<void> to be resolved after the time given. To be used with async/await
     */
    public delay(_lapse: number): Promise<void> {
      return new Promise(_resolve => this.setTimer(_lapse, 1, () => _resolve()));
    }

    // TODO: examine if web-workers would enhance performance here!
    /**
     * Stops and deletes all [[Timer]]s attached. Should be called before this Time-object leaves scope
     */
    public clearAllTimers(): void {
      for (let id in this.timers) {
        this.deleteTimer(Number(id));
      }
    }

    /**
     * Deletes [[Timer]] found using the internal id of the connected interval-object
     * @param _id 
     */
    public deleteTimerByItsInternalId(_id: number): void {
      for (let id in this.timers) {
        let timer: Timer = this.timers[id];
        if (timer.id == _id) {
          timer.clear();
          delete this.timers[id];
        }
      }
    }

    /**
     * Installs a timer at this time object
     * @param _lapse The object-time to elapse between the calls to _callback
     * @param _count The number of calls desired, 0 = Infinite
     * @param _handler The function to call each the given lapse has elapsed
     * @param _arguments Additional parameters to pass to callback function
     */
    public setTimer(_lapse: number, _count: number, _handler: TimerHandler, ..._arguments: Object[]): number {
      let timer: Timer = new Timer(this, _lapse, _count, _handler, _arguments);
      this.timers[++this.idTimerNext] = timer;
      return this.idTimerNext;
    }

    /**
     * Deletes the timer with the id given by this time object
     */
    public deleteTimer(_id: number): void {
      this.timers[_id].clear();
      delete this.timers[_id];
    }

    /**
     * Returns a copy of the list of timers currently installed on this time object
     */
    public getTimers(): Timers {
      let result: Timers = {};
      return Object.assign(result, this.timers);
    }

    /**
     * Returns true if there are [[Timers]] installed to this
     */
    public hasTimers(): boolean {
      return (Object.keys(this.timers).length > 0);
    }

    /**
     * Recreates [[Timer]]s when scaling changes
     */
    private rescaleAllTimers(): void {
      for (let id in this.timers) {
        let timer: Timer = this.timers[id];
        timer.clear();
        if (!this.scale)
          // Time has stopped, no need to replace cleared timers
          continue;

        this.timers[id] = timer.installCopy();
      }
    }
  }
  //#endregion

  /**
   * Standard [[Time]]-instance. Starts running when Fudge starts up and may be used as the main game-time object
   */
  export const time: Time = Time.game; // TODO: eliminate Time.gameTime and use time solely
}