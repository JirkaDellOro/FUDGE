/// <reference path="../InteractionMode.ts" />
namespace Fudge {
  /*
    idle class with no functionality incase now other mode is selected  
  */
  export class IdleMode extends InteractionMode {
    public readonly type: INTERACTION_MODE = INTERACTION_MODE.IDLE;

    initialize(): void {
      //@ts-ignore
    }

    onmousedown(_event: ƒ.EventPointer): void {
      //@ts-ignore
    }
    onmouseup(_event: ƒ.EventPointer): string {
      return null;
      //@ts-ignore
    }
    onmove(_event: ƒ.EventPointer): void {
      //@ts-ignore
    }

    onkeydown(_pressedKey: string): void {
      //@ts-ignore
    }
    
    onkeyup(_pressedKey: string): string {
      return null;
    }

    getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[] {
      return [];
    }

    contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
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