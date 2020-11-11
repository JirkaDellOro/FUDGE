namespace Fudge {
  import ƒ = FudgeCore;
  export class EditRotation extends AbstractRotation {
    selection: ƒ.Node;

    initialize(): void {
      throw new Error("Method not implemented.");
    }

    onmousedown(_event: ƒ.EventPointer): void {
      console.log("EditRotation activated");
      console.log(this.selection);
    }

    onmouseup(_event: ƒ.EventPointer): void {
      throw new Error("Method not implemented.");
    }

    onmove(_event: ƒ.EventPointer): void {
      throw new Error("Method not implemented.");
    }
  }
}