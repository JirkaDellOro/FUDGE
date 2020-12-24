///<reference path="CustomElementTemplate.ts"/>
namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  export class CustomElementVector3 extends CustomElementTemplate {
    public getMutatorValue(): Object {
      let steppers: NodeListOf<CustomElementStepper> = this.querySelectorAll("fudge-stepper");
      let mutator: ƒ.Mutator = {};
      let count: number = 0;
      for (let dimension of ["x", "y", "z"])
        (<ƒ.Mutator> mutator)[dimension] = steppers[count++].getMutatorValue();
      return mutator;
    }

    public setMutatorValue(_mutator: ƒ.Mutator): void {
      let steppers: NodeListOf<CustomElementStepper> = this.querySelectorAll("fudge-stepper");
      let count: number = 0;
      for (let dimension of ["x", "y", "z"])
        steppers[count++].setMutatorValue(Number((<ƒ.Mutator>_mutator)[dimension]));
    }

    protected connectedCallback(): void {
      super.connectedCallback();
      // console.log("Matrix Callback");
      let label: HTMLLabelElement = this.querySelector("label");
      label.textContent = this.getAttribute("label");
    }

  }
}