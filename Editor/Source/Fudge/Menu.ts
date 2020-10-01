namespace Fudge {
  import ƒui = FudgeUserInterface;
  import ƒ = FudgeCore;

  // export enum MENU {
  //   ADD_NODE, ADD_COMPONENT, DELETE_NODE
  // }

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

    public static getComponents(_callback: ContextMenuCallback): Electron.MenuItem[] {
      const menuItems: Electron.MenuItem[] = [];
      for (let subclass of ƒ.Component.subclasses) {
        let item: Electron.MenuItem = new remote.MenuItem(
          { label: subclass.name, id: String(CONTEXTMENU.ADD_COMPONENT), click: _callback, submenu: ContextMenu.getSubMenu(subclass, _callback) }
        );
        // @ts-ignore
        item.overrideProperty("iSubclass", subclass.iSubclass);
        item["iSubclass"] = subclass.iSubclass;
        menuItems.push(item);
      }
      return menuItems;
    }

    public static getSubMenu(_object: Object, _callback: ContextMenuCallback): Electron.Menu {
      let menu: Electron.Menu;
      if (_object == ƒ.ComponentScript) {
        menu = new remote.Menu();
        let scripts: ƒ.ComponentScripts = ƒ.Project.getComponentScripts();
        for (let namespace in scripts) {
          // @ts-ignore
          // console.log(script.name, script);
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
      }
      return menu;
    }
  }
}