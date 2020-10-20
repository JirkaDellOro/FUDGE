namespace Fudge {
  export abstract class AbstractSelection implements IInteractionMode {
    public readonly type: InteractionMode = InteractionMode.SELECT;
    viewport: ƒ.Viewport;
    selection: Object;
    editableNode: ƒ.Node;

    abstract onmousedown(_event: ƒ.EventPointer): void;
    abstract onmouseup(_event: ƒ.EventPointer): void;
    // abstract onclick(_event: ƒ.EventPointer): void;
    abstract onmove(_event: ƒ.EventPointer): void;
  }
}