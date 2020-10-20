namespace Fudge {
  import ƒ = FudgeCore;

  export interface IInteractionMode {
    type: InteractionMode;
    selection: Object;
    viewport: ƒ.Viewport;
    editableNode: ƒ.Node;

    onmousedown(_event: ƒ.EventPointer): void;
    onmouseup(_event: ƒ.EventPointer): void;
    // onclick(_event: ƒ.EventPointer): void;
    onmove(_event: ƒ.EventPointer): void;
  }
}