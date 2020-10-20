namespace Fudge {
  import ƒ = FudgeCore;
  export class ObjectRotation extends AbstractRotation {
    selection: ƒ.Node;

    onmousedown(_event: ƒ.EventPointer): void {
      console.log("ObjectRotation activated");
    }

    onmouseup(_event: ƒ.EventPointer): void {
      throw new Error("Method not implemented.");
    }

    onmove(_event: ƒ.EventPointer): void {
      throw new Error("Method not implemented.");
    }
  }
}