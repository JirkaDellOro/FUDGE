namespace Fudge {
  import ƒ = FudgeCore;
  export interface IInteractionMode {
    readonly type: INTERACTION_MODE;
    selection: Array<number>;
    viewport: ƒ.Viewport;
    editableNode: ƒ.Node;

    onmousedown(_event: ƒ.EventPointer): void;
    onmouseup(_event: ƒ.EventPointer): string;
    onmove(_event: ƒ.EventPointer): void;
    onkeydown(_pressedKey: string): void;
    onkeyup(_pressedKey: string): string;
    update(): void;
    getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[];
    contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void; 

    initialize(): void;
    cleanup(): void;
    animate(): void;
    updateAfterUndo(): void;
  }
}