namespace Fudge {
  import ƒui = FudgeUserInterface;
  import ƒ = FudgeCore;

  // export enum MENU {
  //   ADD_NODE, ADD_COMPONENT, DELETE_NODE
  // }

  export type ContextMenuCallback = (menuItem: Electron.MenuItem, browserWindow: Electron.BrowserWindow, event: Electron.KeyboardEvent) => void;

  export class ContextMenu {

    public static appendCopyPaste(_menu: Electron.Menu): void {
      _menu.append(new remote.MenuItem({ role: "copy" }));
      _menu.append(new remote.MenuItem({ role: "cut" }));
      _menu.append(new remote.MenuItem({ role: "paste" }));
    }

    public static getSubclassMenu<T extends {name: string; }>(_id: CONTEXTMENU, _superclass: T[], _callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      for (let iSubclass in _superclass) {
        let subclass: T = _superclass[iSubclass];
        let item: Electron.MenuItem = new remote.MenuItem(
          { label: subclass.name, id: String(_id), click: _callback }
        );
        //@ts-ignore
        item.overrideProperty("iSubclass", iSubclass);
        menu.append(item);
      }
      return menu;
    }

    public static getResources(_callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      for (let type of typesOfResources) {
        let item: Electron.MenuItem = new remote.MenuItem(          { 
          label: type.name, 
          submenu: ContextMenu.getSubclassMenu<typeof type>(CONTEXTMENU.CREATE, type, _callback) }
        );
        menu.append(item);
      }
      return menu;
    }

    public static getSubMenu(_object: Object, _callback: ContextMenuCallback): Electron.Menu {
      let menu: Electron.Menu;
      switch (_object) {
        case ƒ.ComponentScript:
          menu = new remote.Menu();
          let scripts: ƒ.ComponentScripts = ƒ.Project.getComponentScripts();
          for (let namespace in scripts) {
            let item: Electron.MenuItem = new remote.MenuItem(
              { label: namespace, id: null, click: null, submenu: [] }
            );

            for (let script of scripts[namespace]) {
              let name: string = Reflect.get(script, "name");
              let subitem: Electron.MenuItem = new remote.MenuItem(
                { label: name, id: String(CONTEXTMENU.ADD_COMPONENT_SCRIPT), click: _callback }
              );
              // @ts-ignore
              subitem.overrideProperty("Script", namespace + "." + name);
              item.submenu.append(subitem);
            }
            menu.append(item);
          }
          break;
      }
      return menu;
    }
  }
}