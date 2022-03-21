namespace Fudge {
  // import ƒui = FudgeUserInterface;
  // import ƒ = FudgeCore;

  export type ContextMenuCallback = (menuItem: Electron.MenuItem, browserWindow: Electron.BrowserWindow, event: Electron.KeyboardEvent) => void;

  type Subclass<T> = {
    subclasses: T[]
    name: string
  };

  export class ContextMenu {
    public static appendCopyPaste(_menu: Electron.Menu): void {
      _menu.append(new remote.MenuItem({ role: "copy" }));
      _menu.append(new remote.MenuItem({ role: "cut" }));
      _menu.append(new remote.MenuItem({ role: "paste" }));
    }


    public static getSubclassMenu<T extends Subclass<T>>(_id: CONTEXTMENU, _class: T, _callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      for (let iSubclass in _class.subclasses) {
        let subclass: T = _class.subclasses[iSubclass];
        let item: Electron.MenuItem = new remote.MenuItem(
          { label: subclass.name, id: String(_id), click: _callback }
        );
        //@ts-ignore
        item.overrideProperty("iSubclass", iSubclass);
        menu.append(item);
      }
      return menu;
    }
  }
}