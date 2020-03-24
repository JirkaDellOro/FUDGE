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
    protected valueBase: number = 0;
    protected inputTarget: number = 0;
    protected valuePrevious: number = 0;
    protected inputPrevious: number = 0;
    protected factor: number = 0;

    protected time: Time = Time.game;
    protected timeInputDelay: number = 0;
    protected timeInputTargetSet: number = 0;
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
      this.calculateValue();
    }

    /**
     * Feed an input value into this control and fire the [[EVENT_CONTROL.INPUT]]-event
     */
    public setInput(_input: number): void {
      this.valueBase = this.calculateValue();
      this.inputPrevious = this.getInputDelayed();
      this.inputTarget = this.factor * _input;
      this.timeInputTargetSet = this.time.get();

      this.dispatchEvent(new Event(EVENT_CONTROL.INPUT));
      this.dispatchOutput(null);
    }

    /**
     * Set the time to take for the internal linear dampening until the input value given with [[setInput]] is reached
     */
    public setDelay(_time: number): void {
      // TODO: check if this needs to be disallowed for type DIFFERENTIAL
      this.timeInputDelay = Math.max(0, _time);
    }

    /**
     * Set the number of output-events to dispatch per second. 
     * At the default of 0, the control value must be polled and will only actively dispatched once each time input occurs and the resulting value changes.
     */
    public setRateDispatchOutput(_rateDispatchOutput: number = 0): void {
      this.rateDispatchOutput = _rateDispatchOutput;
      this.dispatchOutput(null);
    }

    /**
     * Set the factor to multiply the input value given with [[setInput]] with
     */
    public setFactor(_factor: number): void {
      this.factor = _factor;
    }

    /**
     * Sets the base value to be applied for the following calculations of value. 
     * Applicable to [[CONTROL_TYPE.INTEGRAL]] and [[CONTROL_TYPE.DIFFERENTIAL]] only.
     * TODO: check if inputTarget/inputPrevious must be adjusted too
     */
    public setValue(_value: number): void {
      this.valueBase = _value;
    }

    /**
     * Get the value from the output of this control
     */
    public getValue(): number {
      return this.calculateValue();
    }
    /**
     * Get the value from the output of this control
     */
    protected calculateValue(): number {
      let value: number = 0;
      let input: number = this.getInputDelayed();

      switch (this.type) {
        case CONTROL_TYPE.INTEGRAL:
          let timeCurrent: number = this.time.get();
          let timeElapsedSinceInput: number = timeCurrent - this.timeInputTargetSet;
          value = this.valueBase;

          if (this.timeInputDelay > 0) {
            if (timeElapsedSinceInput < this.timeInputDelay) {
              value += 0.5 * (this.inputPrevious + input) * timeElapsedSinceInput;
              break;
            }
            else {
              value += 0.5 * (this.inputPrevious + input) * this.timeInputDelay;
              timeElapsedSinceInput -= this.timeInputDelay;
            }
          }
          value += input * timeElapsedSinceInput;
          // value += 0.5 * (this.inputPrevious - input) * this.timeInputDelay + input * timeElapsedSinceInput;
          break;
        case CONTROL_TYPE.DIFFERENTIAL:
          value = this.valueBase + input;
          this.inputTarget = 0;
          this.valueBase = value;
          break;
        case CONTROL_TYPE.PROPORTIONAL:
        default:
          value = input;
          break;
      }
      return value;
    }

    private getInputDelayed(): number {
      if (this.timeInputDelay > 0) {
        let timeElapsedSinceInput: number = this.time.get() - this.timeInputTargetSet;
        if (timeElapsedSinceInput < this.timeInputDelay)
          return this.inputPrevious + (this.inputTarget - this.inputPrevious) * timeElapsedSinceInput / this.timeInputDelay;
      }
      return this.inputTarget;
    }

    private dispatchOutput = (_event: EventTimer): void => {
      // TODO: reuse timer by setting count to 0, de-/activating, adjusting dispatchRate -> create Timer directly for more control
      if (this.rateDispatchOutput > 0) {
        this.time.deleteTimer(this.idTimer);
        this.idTimer = this.time.setTimer(1000 / this.rateDispatchOutput, 1, this.dispatchOutput);
      }

      let value: number = this.calculateValue();
      if (value == this.valuePrevious)
        return;

      this.valuePrevious = value;

      let event: CustomEvent = new CustomEvent(EVENT_CONTROL.OUTPUT, {
        detail: {
          value: value
        }
      });

      this.dispatchEvent(event);
    }
  }
}