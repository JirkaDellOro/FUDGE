///<reference path="CustomElementTemplate.ts"/>
namespace FudgeUserInterface {
  export class CustomElementMatrix4x4 extends CustomElementTemplate {
    public getMutatorValue(): Object {
      console.log("GetMatrixMutatorValue");
      return null;
      
    }
    public setMutatorValue(_value: Object): void {
      console.log("SetMatrixMutatorValue");
      /* */
    }
  }
}