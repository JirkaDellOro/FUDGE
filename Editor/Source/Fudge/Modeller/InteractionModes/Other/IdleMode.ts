namespace Fudge {
  export class IdleMode extends IInteractionMode {
    public readonly type: InteractionModes = InteractionModes.IDLE;

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

    getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[] {
      return [];
    }

    contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
      console.log(_item);
    }

    update(): void {
      //@ts-ignore
    }

    cleanup(): void {
      //@ts-ignore
    }
  }
}