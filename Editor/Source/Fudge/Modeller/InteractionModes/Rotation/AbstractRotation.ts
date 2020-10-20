namespace Fudge {
  export abstract class AbstractRotation implements IInteractionMode {
    public readonly type: InteractionMode = InteractionMode.ROTATE;
    viewport: ƒ.Viewport;
    selection: Object;
    editableNode: ƒ.Node;

    abstract onmousedown(_event: ƒ.EventPointer): void;
    abstract onmouseup(_event: ƒ.EventPointer): void;
    // abstract onclick(_event: ƒ.EventPointer): void;
    abstract onmove(_event: ƒ.EventPointer): void;
  }
}