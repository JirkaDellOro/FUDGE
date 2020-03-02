namespace FudgeCore {
  export const enum EVENT_AXIS {
    INPUT = "input"
  }

  export const enum AXIS_TYPE {
    PROPORTIONAL, INTEGRAL, DIFFERENTIAL
  }

  export class Axis extends EventTarget {
    protected type: AXIS_TYPE = AXIS_TYPE.PROPORTIONAL;
    protected valueCurrent: number = 0;
    protected valueDelta: number = 0;
    protected inputTarget: number = 0;
    protected inputCurrent: number = 0;
    protected inputDelay: number = 0;
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
    }

    setInput(_target: number): void {
      this.inputTarget = _target;
      this.timeInputTargetSet = time.get();
    }

    setDelay(_delay: number): void {
      this.inputDelay = _delay;
    }

    getValue(): number {
      let value: number = 0;
      // TODO: use delayed input
      let input: number = this.inputTarget;

      switch (this.type) {
        case AXIS_TYPE.INTEGRAL:
          value = this.valueCurrent + this.inputTarget;
          break;
        case AXIS_TYPE.DIFFERENTIAL:
          value = this.valueCurrent + this.inputTarget;
          this.inputTarget = 0;
          break;
        case AXIS_TYPE.PROPORTIONAL:
        default:
          value = input * this.factor;
          break;
      }
      this.valueCurrent = value;
      return value;
    }
  }
}