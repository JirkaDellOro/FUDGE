///<reference path="CustomElementTemplate.ts"/>
namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  export class CustomElementMatrix3x3 extends CustomElementTemplate {

    public getMutatorValue(): ƒ.Mutator {
      let steppers: NodeListOf<CustomElementStepper> = this.querySelectorAll("fudge-stepper");
      let mutator: ƒ.Mutator = { translation: {}, scaling: {}, rotation: 0 };
      let count: number = 0;
      for (let vector of ["translation", "scaling"])
        for (let dimension of ["x", "y"])
          (<ƒ.Mutator>mutator[vector])[dimension] = steppers[count++].getMutatorValue();

      mutator["rotation"] = steppers[count++].getMutatorValue();
      return mutator;
    }

    public setMutatorValue(_mutator: ƒ.Mutator): void {
      let steppers: NodeListOf<CustomElementStepper> = this.querySelectorAll("fudge-stepper");
      let count: number = 0;
      for (let vector of ["translation", "scaling"])
        for (let dimension of ["x", "y"])
          steppers[count++].setMutatorValue(Number((<ƒ.Mutator>_mutator[vector])[dimension]));
      steppers[count++].setMutatorValue(Number(_mutator["rotation"]));
    }

    protected connectedCallback(): void {
      super.connectedCallback();
      // console.log("Matrix Callback");
      let label: HTMLLabelElement = this.querySelector("label");
      label.textContent = this.getAttribute("label");
    }
  }
}