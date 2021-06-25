namespace FudgeCore {
  export const enum EVENT_CONTROL {
    INPUT = "input",
    OUTPUT = "output"
  }

  export const enum CONTROL_TYPE {
    /** The output simply follows the scaled and delayed input */
    PROPORTIONAL,
    /** The output value changes over time with a rate given by the scaled and delayed input */
    INTEGRAL,
    /** The output value reacts to changes of the scaled input and drops to 0 with given delay, if input remains constant */
    DIFFERENTIAL
  }

  /**
   * Processes input signals of type number and generates an output signal of the same type using 
   * proportional, integral or differential mapping, an amplification factor and a linear dampening/delay
   * ```plaintext
   *          ┌─────────────────────────────────────────────────────────────┐
   *          │   ┌───────┐   ┌─────┐      pass through (Proportional)      │
   *  Input → │ → │amplify│ → │delay│ → ⚟ sum up over time (Integral) ⚞ → │ → Output
   *          │   └───────┘   └─────┘      pass change  (Differential)      │
   *          └─────────────────────────────────────────────────────────────┘ 
   * ```
   */
  export class Control extends EventTarget {
    public readonly type: CONTROL_TYPE;
    public active: boolean;
    public name: string;

    protected rateDispatchOutput: number = 0;
    protected valuePrevious: number = 0;
    protected outputBase: number = 0;
    protected outputTarget: number = 0;
    protected outputPrevious: number = 0;
    protected outputTargetPrevious: number = 0;
    protected factor: number = 0;

    protected time: Time = Time.game;
    protected timeValueDelay: number = 0;
    protected timeOutputTargetSet: number = 0;
    protected idTimer: number = undefined;

    constructor(_name: string, _factor: number = 1, _type: CONTROL_TYPE = CONTROL_TYPE.PROPORTIONAL, _active: boolean = true) {
      super();
      this.factor = _factor;
      this.type = _type;
      this.active = _active;
      this.name = _name;
    }

    /**
     * Set the time-object to be used when calculating the output in {@link CONTROL_TYPE.INTEGRAL}
     */
    public setTimebase(_time: Time): void {
      this.time = _time;
      this.calculateOutput();
    }

    /**
     * Feed an input value into this control and fire the events {@link EVENT_CONTROL.INPUT} and {@link EVENT_CONTROL.OUTPUT}
     */
    public setInput(_input: number): void {
      if (!this.active)
        return;
        
      this.outputBase = this.calculateOutput();
      this.valuePrevious = this.getValueDelayed();
      this.outputTarget = this.factor * _input;
      this.timeOutputTargetSet = this.time.get();

      if (this.type == CONTROL_TYPE.DIFFERENTIAL) {
        this.valuePrevious = this.outputTarget - this.outputTargetPrevious;
        this.outputTargetPrevious = this.outputTarget;
        this.outputTarget = 0;
      }

      this.dispatchEvent(new Event(EVENT_CONTROL.INPUT));
      if (this.type == CONTROL_TYPE.DIFFERENTIAL)
        this.dispatchOutput(this.valuePrevious);
      else
        this.dispatchOutput(null);
    }

    public pulse(_input: number): void {
      this.setInput(_input);
      this.setInput(0);
    }

    /**
     * Set the time to take for the internal linear dampening until the final ouput value is reached
     */
    public setDelay(_time: number): void {
      this.timeValueDelay = Math.max(0, _time);
    }

    /**
     * Set the number of output-events to dispatch per second. 
     * At the default of 0, the control output must be polled and will only actively dispatched once each time input occurs and the output changes.
     */
    public setRateDispatchOutput(_rateDispatchOutput: number = 0): void {
      this.rateDispatchOutput = _rateDispatchOutput;
      this.time.deleteTimer(this.idTimer);
      this.idTimer = undefined;
      if (this.rateDispatchOutput)
        this.idTimer = this.time.setTimer(1000 / this.rateDispatchOutput, 0, this.dispatchOutput);
    }

    /**
     * Set the factor to multiply the input value given with {@link setInput} with
     */
    public setFactor(_factor: number): void {
      this.factor = _factor;
    }

    /**
     * Get the value from the output of this control
     */
    public getOutput(): number {
      return this.calculateOutput();
    }

    /**
     * Calculates the output of this control
     */
    protected calculateOutput(): number {
      let output: number = 0;
      let value: number = this.getValueDelayed();

      switch (this.type) {
        case CONTROL_TYPE.INTEGRAL:
          let timeCurrent: number = this.time.get();
          let timeElapsedSinceInput: number = timeCurrent - this.timeOutputTargetSet;
          output = this.outputBase;

          if (this.timeValueDelay > 0) {
            if (timeElapsedSinceInput < this.timeValueDelay) {
              output += 0.5 * (this.valuePrevious + value) * timeElapsedSinceInput;
              break;
            }
            else {
              output += 0.5 * (this.valuePrevious + value) * this.timeValueDelay;
              timeElapsedSinceInput -= this.timeValueDelay;
            }
          }
          output += value * timeElapsedSinceInput;
          // value += 0.5 * (this.inputPrevious - input) * this.timeInputDelay + input * timeElapsedSinceInput;
          break;
        case CONTROL_TYPE.DIFFERENTIAL:
        case CONTROL_TYPE.PROPORTIONAL:
        default:
          output = value;
          break;
      }
      return output;
    }
    /**
     * calculates the output considering the time of the delay
     */
    private getValueDelayed(): number {
      if (this.timeValueDelay > 0) {
        let timeElapsedSinceInput: number = this.time.get() - this.timeOutputTargetSet;
        if (timeElapsedSinceInput < this.timeValueDelay)
          return this.valuePrevious + (this.outputTarget - this.valuePrevious) * timeElapsedSinceInput / this.timeValueDelay;
      }
      return this.outputTarget;
    }
    
    private dispatchOutput = (_eventOrValue: EventTimer | number): void => {
      if (!this.active)
        return;
        
      let timer: Timer = this.time.getTimer(this.idTimer);
      let output: number;
      if (typeof (_eventOrValue) == "number")
        output = _eventOrValue;
      else
        output = this.calculateOutput();
      let outputChanged: boolean = (output != this.outputPrevious);

      if (timer) {
        timer.active = outputChanged;
        if (!outputChanged)
          return;
      }

      this.outputPrevious = output;

      let event: CustomEvent = new CustomEvent(EVENT_CONTROL.OUTPUT, {
        detail: {
          output: output
        }
      });

      this.dispatchEvent(event);
    }
  }
}