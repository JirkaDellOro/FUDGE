///<reference path="CustomElementTemplate.ts"/>
namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  export class CustomElementMatrix4x4 extends CustomElementTemplate {

    public getMutatorValue(): Object {
      let steppers: NodeListOf<CustomElementStepper> = this.querySelectorAll("fudge-stepper");
      let mutator: ƒ.Mutator = {};
      mutator.translation = { x: steppers[0].value, y: steppers[1].value, z: steppers[2].value };
      mutator.rotation = { x: steppers[3].value, y: steppers[4].value, z: steppers[5].value };
      mutator.scaling = { x: steppers[6].value, y: steppers[7].value, z: steppers[8].value };
      return mutator;

    }
    public setMutatorValue(_mutator: ƒ.Mutator): void {
      let steppers: NodeListOf<CustomElementStepper> = this.querySelectorAll("fudge-stepper");
      let count: number = 0;
      for (let vector of ["translation", "rotation", "scaling"])
        for (let dimension of ["x", "y", "z"])
          steppers[count++].setMutatorValue(Number((<ƒ.Mutator>_mutator[vector])[dimension]));
    }

    protected connectedCallback(): void {
      super.connectedCallback();
      console.log("Matrix Callback");
      let label: HTMLLabelElement = this.querySelector("label");
      label.textContent = this.getAttribute("label");
    }
  }
}