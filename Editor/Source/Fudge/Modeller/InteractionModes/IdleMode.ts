namespace Fudge {
  export class IdleMode extends IInteractionMode {
    public readonly type: InteractionMode = InteractionMode.IDLE;

    initialize(): void {
      //@ts-ignore
    }

    onmousedown(_event: ƒ.EventPointer): void {

    }
    onmouseup(_event: ƒ.EventPointer): string {
      return null;
      //@ts-ignore
    }
    onmove(_event: ƒ.EventPointer): void {
      //@ts-ignore
    }

    onkeydown(_pressedKey: string): void {

    }
    
    onkeyup(_pressedKey: string): string {
      return null;
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