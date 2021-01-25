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

    onkeydown(_pressedKey: string): string {
      return null;
    }
    
    onkeyup(_pressedKey: string): void {
      //@ts-ignore
    }

    update(): void {
      //@ts-ignore
    }

    cleanup(): void {
      //@ts-ignore
    }
  }
}