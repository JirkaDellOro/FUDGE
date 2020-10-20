namespace Fudge {
  import ƒ = FudgeCore;
  export class ObjectSelection extends AbstractSelection {
    // public static readonly iSubclass: number = ObjectMode.registerMode(ObjectSelection);

    selection: ƒ.Node;

    onmousedown(_event: ƒ.EventPointer): void {
      console.log("ObjectSelection activated");
      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.X])) {
        console.log("x is pressed");
      }
    }

    onmouseup(_event: ƒ.EventPointer): void {
      //@ts-ignore
    }

    onmove(_event: ƒ.EventPointer): void {
      //@ts-ignore
    }
  }
}