///<reference path="Control.ts"/>
namespace FudgeCore {
  /**
   * Handles multiple controls as inputs and creates an output from that.
   * As a subclass of {@link Control}, axis calculates the ouput summing up the inputs and processing the result using its own settings.  
   * Dispatches {@link EVENT_CONTROL.OUTPUT} and {@link EVENT_CONTROL.INPUT} when one of the controls dispatches them.
   * ```plaintext
   *           ┌───────────────────────────────────────────┐
   *           │ ┌───────┐                                 │
   *   Input → │ │control│\                                │
   *           │ └───────┘ \                               │
   *           │ ┌───────┐  \┌───┐   ┌─────────────────┐   │
   *   Input → │ │control│---│sum│ → │internal control │ → │ → Output
   *           │ └───────┘  /└───┘   └─────────────────┘   │
   *           │ ┌───────┐ /                               │
   *   Input → │ │control│/                                │
   *           │ └───────┘                                 │
   *           └───────────────────────────────────────────┘  
   * ```
   */
  export class Axis extends Control {
    private controls: Map<string, Control> = new Map();
    private sumPrevious: number = 0;

    /**
     * Add the control given to the list of controls feeding into this axis
     */
    public addControl(_control: Control): void {
      this.controls.set(_control.name, _control);
      _control.addEventListener(EVENT_CONTROL.INPUT, this.hndInputEvent);
      _control.addEventListener(EVENT_CONTROL.OUTPUT, this.hndOutputEvent);
    }

    /**
     * Returns the control with the given name
     */
    public getControl(_name: string): Control {
      return this.controls.get(_name);
    }

    /**
     * Removes the control with the given name
     */
    public removeControl(_name: string): void {
      let control: Control = this.getControl(_name);
      if (control) {
        control.removeEventListener(EVENT_CONTROL.INPUT, this.hndInputEvent);
        control.removeEventListener(EVENT_CONTROL.OUTPUT, this.hndOutputEvent);
        this.controls.delete(_name);
      }
    }

    /**
     * Returns the value of this axis after summing up all inputs and processing the sum according to the axis' settings
     */
    public getOutput(): number {
      let sumInput: number = 0;
      for (let control of this.controls) {

        if (control[1].active)
          sumInput += control[1].getOutput();
      }

      if (sumInput != this.sumPrevious)
        super.setInput(sumInput);

      this.sumPrevious = sumInput;

      return super.getOutput();
    }

    private hndOutputEvent: EventListener = (_event: Event): void => {
      if (!this.active)
        return;

      let control: Control = (<Control>_event.target);
      let event: CustomEvent = new CustomEvent(EVENT_CONTROL.OUTPUT, {detail: {
        control: control, 
        input: (<CustomEvent>_event).detail.output,
        output: this.getOutput()
      }});
      this.dispatchEvent(event);
    }

    private hndInputEvent: EventListener = (_event: Event): void => {
      if (!this.active)
        return;
        
      let event: Event = new Event(EVENT_CONTROL.INPUT, _event);
      this.dispatchEvent(event);
    }
  }
}