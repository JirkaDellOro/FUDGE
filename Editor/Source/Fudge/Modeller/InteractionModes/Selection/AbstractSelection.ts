namespace Fudge {
  export abstract class AbstractSelection extends IInteractionMode {
    public readonly type: InteractionModes = InteractionModes.SELECT;
    viewport: ƒ.Viewport;
    editableNode: ƒ.Node;

    // abstract onmousedown(_event: ƒ.EventPointer): void;
    // abstract onmouseup(_event: ƒ.EventPointer): string;
    // abstract onmove(_event: ƒ.EventPointer): void;
    getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[] {
      return [];
    }

    contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
      console.log(_item);
    }


    cleanup(): void {
      //
    }
  }
}