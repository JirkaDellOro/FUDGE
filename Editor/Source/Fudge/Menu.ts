namespace Fudge {
  import ƒui = FudgeUserInterface;
  import ƒ = FudgeCore;

  export type ContextMenuCallback = (menuItem: Electron.MenuItem, browserWindow: Electron.BrowserWindow, event: Electron.KeyboardEvent) => void;

  // TODO: figure out how to subclass MenuItem
  // export class MenuItem extends remote.MenuItem {
  //   public subclass: Function = null;

  //   constructor(_options: Electron.MenuItemConstructorOptions) {
  //     super(_options);
  //   }
  // }

  export class ContextMenu {
    // public static build(_for: typeof View, _callback: ContextMenuCallback): Electron.Menu {
    //   let template: Electron.MenuItemConstructorOptions[] = ContextMenu.getMenu(_for, _callback);
    //   let menu: Electron.Menu = remote.Menu.buildFromTemplate(template);
    //   return menu;
    // }

    public static appendCopyPaste(_menu: Electron.Menu): void {
      _menu.append(new remote.MenuItem({ role: "copy" }));
      _menu.append(new remote.MenuItem({ role: "cut" }));
      _menu.append(new remote.MenuItem({ role: "paste" }));
    }

    public static getComponents(_callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      for (let subclass of ƒ.Component.subclasses) {
        let item: Electron.MenuItem = new remote.MenuItem(
          { label: subclass.name, id: String(CONTEXTMENU.ADD_COMPONENT), click: _callback, submenu: ContextMenu.getSubMenu(subclass, _callback) }
        );
        // @ts-ignore
        item.overrideProperty("iSubclass", subclass.iSubclass);
        item["iSubclass"] = subclass.iSubclass;
        menu.append(item);
      }
      return menu;
    }

    public static getResources(_callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      for (let type of typesOfResources) {
        let item: Electron.MenuItem = new remote.MenuItem(
          { label: type.name, id: String(CONTEXTMENU.CREATE), click: _callback, submenu: ContextMenu.getSubMenu(type, _callback) }
        );
        // @ts-ignore
        // item.overrideProperty("iSubclass", subclass.iSubclass);
        // item["iSubclass"] = subclass.iSubclass;
        menu.push(item);
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
        case ƒ.Mesh:
          menu = new remote.Menu();
          for (let iSubclass in ƒ.Mesh.subclasses) {
            let subclass: typeof ƒ.Mesh = ƒ.Mesh.subclasses[iSubclass]
            let item: Electron.MenuItem = new remote.MenuItem(
              { label: subclass.name, id: String(CONTEXTMENU.CREATE), click: _callback }
            );
            //@ts-ignore
            item.overrideProperty("iSubclass", iSubclass);
            menu.append(item);
          }
          break;
      }
      return menu;
    }
  }
}