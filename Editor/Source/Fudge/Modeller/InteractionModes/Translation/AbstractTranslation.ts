namespace Fudge {
  export abstract class AbstractTranslation implements IInteractionMode {
    public readonly type: InteractionMode = InteractionMode.TRANSLATE;
    viewport: ƒ.Viewport;
    selection: Object;
    editableNode: ƒ.Node;
    protected dragging: boolean = false;
    protected distance: number;

    abstract onmousedown(_event: ƒ.EventPointer): void;
    abstract onmouseup(_event: ƒ.EventPointer): void;
    // abstract onclick(_event: ƒ.EventPointer): void;
    abstract onmove(_event: ƒ.EventPointer): void;
  }
}