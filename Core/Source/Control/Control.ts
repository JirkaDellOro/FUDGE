namespace FudgeCore {
  export const enum EVENT_CONTROL {
    INPUT = "input",
    OUTPUT = "output"
  }

  export const enum CONTROL_TYPE {
    PROPORTIONAL, INTEGRAL, DIFFERENTIAL
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
     * Set the time-object to be used when calculating the output in [[CONTROL_TYPE.INTEGRAL]]
     */
    public setTimebase(_time: Time): void {
      this.time = _time;
      this.calculateOutput();
    }

    /**
     * Feed an input value into this control and fire the [[EVENT_CONTROL.INPUT]]-event
     */
    public setInput(_input: number): void {
      this.outputBase = this.calculateOutput();
      this.valuePrevious = this.getValueDelayed();
      this.outputTarget = this.factor * _input;
      this.timeOutputTargetSet = this.time.get();

      if (this.type == CONTROL_TYPE.DIFFERENTIAL) {
        this.valuePrevious = this.outputTarget;
        this.outputTarget = 0;
      }

      this.dispatchEvent(new Event(EVENT_CONTROL.INPUT));
      this.dispatchOutput(null);
    }

    /**
     * Set the time to take for the internal linear dampening until the input value given with [[setInput]] is reached
     */
    public setDelay(_time: number): void {
      // TODO: check if this needs to be disallowed for type DIFFERENTIAL
      this.timeValueDelay = Math.max(0, _time);
    }

    /**
     * Set the number of output-events to dispatch per second. 
     * At the default of 0, the control value must be polled and will only actively dispatched once each time input occurs and the resulting value changes.
     */
    public setRateDispatchOutput(_rateDispatchOutput: number = 0): void {
      this.rateDispatchOutput = _rateDispatchOutput;
      this.time.deleteTimer(this.idTimer);
      this.idTimer = undefined;
      if (this.rateDispatchOutput)
        this.idTimer = this.time.setTimer(1000 / this.rateDispatchOutput, 0, this.dispatchOutput);
    }

    /**
     * Set the factor to multiply the input value given with [[setInput]] with
     */
    public setFactor(_factor: number): void {
      this.factor = _factor;
    }

    /**
     * Sets the base value to be applied for the following calculations of output. 
     * Applicable to [[CONTROL_TYPE.INTEGRAL]] and [[CONTROL_TYPE.DIFFERENTIAL]] only.
     * TODO: check if inputTarget/inputPrevious must be adjusted too
     */
    // public setValue(_value: number): void {
    //   this.outputBase = _value;
    // }

    /**
     * Get the value from the output of this control
     */
    public getOutput(): number {
      return this.calculateOutput();
    }
    /**
     * Get the value from the output of this control
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
          // output = this.outputBase + value;
          // this.inputTargetPrevious = this.outputTarget;
          // this.outputTarget = 0;
          // this.outputBase = output;
          // break;
        case CONTROL_TYPE.PROPORTIONAL:
        default:
          output = value;
          break;
      }
      return output;
    }

    private getValueDelayed(): number {
      if (this.timeValueDelay > 0) {
        let timeElapsedSinceInput: number = this.time.get() - this.timeOutputTargetSet;
        if (timeElapsedSinceInput < this.timeValueDelay)
          return this.valuePrevious + (this.outputTarget - this.valuePrevious) * timeElapsedSinceInput / this.timeValueDelay;
      }
      return this.outputTarget;
    }

    private dispatchOutput = (_event: EventTimer): void => {
      let output: number = this.calculateOutput();
      let timer: Timer = this.time.getTimer(this.idTimer);
      let outputChanged: boolean = (output != this.outputPrevious);

      if (timer)
        timer.active = outputChanged;

      if (!outputChanged)
        return;

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