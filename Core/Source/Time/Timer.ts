namespace FudgeCore {
  /**
   * Defines the signature of handler functions for [[TimerEventƒ]]s, very similar to usual event handler
   */
  export type TimerHandler = (_event: EventTimer) => void;

  /**
   * A [[Timer]]-instance internally uses window.setInterval to call a given handler with a given frequency a given number of times,
   * passing an [[TimerEventƒ]]-instance with additional information and given arguments. 
   * The frequency scales with the [[Time]]-instance the [[Timer]]-instance is attached to.
   * 
   * @author Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class Timer {
    public active: boolean;
    public count: number;
    private handler: TimerHandler;
    private time: Time;
    private elapse: number;
    private event: EventTimer;
    private timeoutReal: number;
    private idWindow: number;

    /**
     * Creates a [[Timer]] instance.
     * @param _time The [[Time]] instance, the timer attaches to
     * @param _elapse The time in milliseconds to elapse, to the next call of _handler, measured in _time
     * @param _count The desired number of calls to _handler, Timer deinstalls automatically after last call. Passing 0 invokes infinite calls
     * @param _handler The [[TimerHandler]] instance to call
     * @param _arguments Additional arguments to pass to _handler
     */
    constructor(_time: Time, _elapse: number, _count: number, _handler: TimerHandler, ..._arguments: Object[]) {
      this.time = _time;
      this.elapse = _elapse;
      this.event = new EventTimer(this, _arguments);
      this.handler = _handler;
      this.count = _count;

      let scale: number = Math.abs(_time.getScale());

      if (!scale) {
        // Time is stopped, timer won't be active
        this.active = false;
        return;
      }

      this.timeoutReal = this.elapse / scale;

      let callback: Function = (): void => {
        this.event.lastCall = (this.count == 1);
        _handler(this.event);
        this.event.firstCall = false;

        if (this.count > 0)
          if (--this.count == 0)
            _time.deleteTimerByItsInternalId(this.idWindow);

      };

      this.idWindow = window.setInterval(callback, this.timeoutReal, _arguments);
      this.active = true;
    }

    /**
     * Returns the window-id of the timer, which was returned by setInterval
     */
    public get id(): number {
      return this.idWindow;
    }

    /**
     * Returns the time-intervall for calls to the handler
     */
    public get lapse(): number {
      return this.elapse;
    }

    /**
     * Attaches a copy of this at its current state to the same [[Time]]-instance. Used internally when rescaling [[Time]]
     */
    public installCopy(): Timer {
      return new Timer(this.time, this.elapse, this.count, this.handler, this.event.arguments);
    }

    /**
     * Clears the timer, removing it from the interval-timers handled by window
     */
    public clear(): void {
      // if (this.type == TIMER_TYPE.TIMEOUT) {
      //     if (this.active)
      //         // save remaining time to timeout as new timeout for restart
      //         this.timeout = this.timeout * (1 - (performance.now() - this.startTimeReal) / this.timeoutReal);
      //     window.clearTimeout(this.id);
      // }
      // else
      // TODO: reusing timer starts interval anew. Should be remaining interval as timeout, then starting interval anew 
      window.clearInterval(this.idWindow);
      this.active = false;
    }
  }
}