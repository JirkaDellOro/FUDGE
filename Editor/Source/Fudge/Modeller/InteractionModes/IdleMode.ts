namespace Fudge {
  export class IdleMode implements IInteractionMode {
    public readonly type: InteractionMode = InteractionMode.IDLE;
    selection: Object;
    viewport: ƒ.Viewport;
    editableNode: ƒ.Node;
    onmousedown(_event: ƒ.EventPointer): void {
      //@ts-ignore
    }
    onmouseup(_event: ƒ.EventPointer): void {
      //@ts-ignore
    }
    onmove(_event: ƒ.EventPointer): void {
      //@ts-ignore
    }
    
  }
}