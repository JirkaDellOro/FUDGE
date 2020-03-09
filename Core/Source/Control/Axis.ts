///<reference path="Control.ts"/>
namespace FudgeCore {
  /**
   * Handles multiple controls as inputs and creates an output from that
   */
  export class Axis extends Control {
    private controls: Map<string, Control> = new Map();
    private sumPrevious: number = 0;

    public addControl(_control: Control): void {
      this.controls.set(_control.name, _control);
    }

    public getControl(_name: string): Control {
      return this.controls.get(_name);
    }

    public removeControl(_name: string): void {
      // let index: number = this.controls.indexOf(_control);
      // this.controls.splice(index, 1);
      this.controls.delete(_name);
    }

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