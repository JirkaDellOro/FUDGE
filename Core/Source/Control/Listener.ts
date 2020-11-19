namespace FudgeCore {
  export class Listener extends Control {
    protected keyPressed: boolean = false;
    protected key: KEYBOARD_CODE;

    protected mappedInactive: number;
    protected mappedActive: number;

    public constructor(_name: string, _factor: number = 1, _key: KEYBOARD_CODE, _type: CONTROL_TYPE = CONTROL_TYPE.PROPORTIONAL, _active: boolean = true) {
      super(_name, _factor, _type, _active);
      this.key = _key;

      Loop.addEventListener(EVENT.LOOP_FRAME, this.hndLoop);
    }

    public setInputMapped(_active: number, _inactive: number): void {
      this.mappedActive = _active;
      this.mappedInactive = _inactive;
    }

    public getOutput(): number {
      return super.getOutput();
    }

    protected hndLoop = () => {
      let input: number = this.mappedInactive; 
      if (Keyboard.isPressed(this.key))
        input = this.mappedActive;
      super.setInput(input);
    }
  }
}