namespace Fudge {
  import ƒui = FudgeUserInterface;
  import ƒ = FudgeCore;

  export enum MENU {
    NEW_NODE
  }

  type ContextMenuCallback = (menuItem: Electron.MenuItem, browserWindow: Electron.BrowserWindow, event: Electron.KeyboardEvent) => void;

  export class ContextMenu {
    public static build(_for: typeof View, _callback: ContextMenuCallback): Electron.Menu {
      let template: Electron.MenuItemConstructorOptions[] = ContextMenu.getTemplate(_for, _callback);
      let menu: Electron.Menu = remote.Menu.buildFromTemplate(template);
      return menu;
    }

    private static getTemplate(_for: typeof View, _callback: ContextMenuCallback): Electron.MenuItemConstructorOptions[] {
      const menu: Electron.MenuItemConstructorOptions[] = [
        { label: "New Node", id: String(MENU.NEW_NODE), click: _callback, accelerator: process.platform == "darwin" ? "N" : "N" }
      ];
      return menu;
    }
  }
}