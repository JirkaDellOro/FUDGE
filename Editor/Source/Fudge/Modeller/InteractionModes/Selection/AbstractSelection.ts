namespace Fudge {
  export abstract class AbstractSelection extends IInteractionMode {
    public readonly type: InteractionMode = InteractionMode.SELECT;
    viewport: ƒ.Viewport;
    editableNode: ƒ.Node;

    abstract onmousedown(_event: ƒ.EventPointer): string;
    abstract onmouseup(_event: ƒ.EventPointer): void;
    abstract onmove(_event: ƒ.EventPointer): void;
    cleanup(): void {
      //
    }
  }
}