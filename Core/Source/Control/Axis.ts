namespace FudgeCore {
  export const enum EVENT_CONTROL {
    INPUT = "input",
    OUTPUT = "output"
  }

  export const enum AXIS_TYPE {
    PROPORTIONAL, INTEGRAL, DIFFERENTIAL
  }

  export class Axis extends EventTarget {
    public readonly type: AXIS_TYPE;
    protected valueBase: number = 0;
    protected inputTarget: number = 0;
    protected valuePrevious: number = 0;
    protected inputPrevious: number = 0;
    protected timeInputDelay: number = 0;
    protected factor: number = 0;
    protected timeInputTargetSet: number = 0;

    protected time: Time = Time.game;

    constructor(_factor: number = 1, _type: AXIS_TYPE = AXIS_TYPE.PROPORTIONAL) {
      super();
      this.factor = _factor;
      this.type = _type;
    }

    setTime(_time: Time): void {
      this.time = _time;
      this.getValue();
    }

    setInput(_target: number): void {
      this.valueBase = this.getValue();
      this.inputPrevious = this.getInputDelayed();
      this.inputTarget = this.factor * _target;
      this.timeInputTargetSet = this.time.get();
      this.dispatchEvent(new Event(EVENT_CONTROL.INPUT));
    }

    setDelay(_time: number): void {
      // TODO: check if this needs to be disallowed for type DIFFERENTIAL
      this.timeInputDelay = Math.max(0, _time);
    }

    setFactor(_factor: number): void {
      this.factor = _factor;
    }

    public getValue(): number {
      let value: number = 0;
      let input: number = this.getInputDelayed();

      switch (this.type) {
        case AXIS_TYPE.INTEGRAL:
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
        case AXIS_TYPE.DIFFERENTIAL:
          value = this.valueBase + input;
          this.inputTarget = 0;
          this.valueBase = value;
          break;
        case AXIS_TYPE.PROPORTIONAL:
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
  }
}