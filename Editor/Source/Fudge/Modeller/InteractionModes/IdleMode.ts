namespace Fudge {
  export class IdleMode extends IInteractionMode {
    public readonly type: InteractionMode = InteractionMode.IDLE;

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

    onkeydown(_event: ƒ.EventKeyboard): string {
      return null;
    }
    
    onkeyup(_event: ƒ.EventKeyboard): void {
      //
    }

    cleanup(): void {
      //@ts-ignore
    }
  }
}