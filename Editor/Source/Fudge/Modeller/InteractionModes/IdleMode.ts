namespace Fudge {
  export class IdleMode extends IInteractionMode {
    public readonly type: InteractionMode = InteractionMode.IDLE;
    selection: Array<number>;
    viewport: ƒ.Viewport;
    editableNode: ƒ.Node;

    constructor (viewport: ƒ.Viewport, editableNode: ƒ.Node) {
      super(viewport, editableNode);
    }

    initialize(): void {
      //@ts-ignore
    }

    onmousedown(_event: ƒ.EventPointer): string {
      return null;
    }
    onmouseup(_event: ƒ.EventPointer): void {
      //@ts-ignore
    }
    onmove(_event: ƒ.EventPointer): void {
      //@ts-ignore
    }

    onkeydown(_event: ƒ.EventKeyboard): void {
    }
    
    onkeyup(_event: ƒ.EventKeyboard): void {
    }

    
    cleanup(): void {
      //@ts-ignore
    }
  }
}