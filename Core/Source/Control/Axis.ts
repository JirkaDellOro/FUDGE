///<reference path="Control.ts"/>
namespace FudgeCore {
  /**
   * Handles multiple controls as inputs and creates an output from that.
   * As a subclass of [[Control]], axis calculates the ouput summing up the inputs and processing the result using its own settings.  
   */
  export class Axis extends Control {
    private controls: Map<string, Control> = new Map();
    private sumPrevious: number = 0;

    /**
     * Add the control given to the list of controls feeding into this axis
     */
    public addControl(_control: Control): void {
      this.controls.set(_control.name, _control);
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
      this.controls.delete(_name);
    }

    /**
     * Returns the value of this axis after summing up all inputs and processing the sum according to the axis' settings
     */
    public getValue(): number {
      let sumOutput: number = 0;
      for (let control of this.controls) {
        if (control[1].active)
          sumOutput += control[1].getValue();
      }

      if (sumOutput != this.sumPrevious)
        super.setInput(sumOutput);

      this.sumPrevious = sumOutput;

      return super.getValue();
    }
  }
}