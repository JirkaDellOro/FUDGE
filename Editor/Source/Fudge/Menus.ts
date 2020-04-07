namespace Fudge {
  import ƒui = FudgeUserInterface;
  import ƒ = FudgeCore;

  export enum MENU {
    ADD_NODE, ADD_COMPONENT
  }

  type ContextMenuCallback = (menuItem: Electron.MenuItem, browserWindow: Electron.BrowserWindow, event: Electron.KeyboardEvent) => void;

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

    public static getMenu(_for: typeof View, _callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      let item: Electron.MenuItem;

      item = new remote.MenuItem({ label: "Add Node", id: String(MENU.ADD_NODE), click: _callback, accelerator: process.platform == "darwin" ? "N" : "N" });
      menu.append(item);

      item = new remote.MenuItem({ label: "Add Component", submenu: [] });
      for (let subItem of ContextMenu.getComponents(_callback))
        item.submenu.append(subItem);
      menu.append(item);

      this.appendCopyPaste(menu);

      // menu.addListener("menu-will-close", (_event: Electron.Event) => { console.log(_event); });

      return menu;
    }

    private static appendCopyPaste(_menu: Electron.Menu): void {
      _menu.append(new remote.MenuItem({ role: "copy" }));
      _menu.append(new remote.MenuItem({ role: "cut" }));
      _menu.append(new remote.MenuItem({ role: "paste" }));
    }

    private static getComponents(_callback: ContextMenuCallback): Electron.MenuItem[] {
      const menuItems: Electron.MenuItem[] = [];
      for (let subclass of ƒ.Component.subclasses) {
        let item: Electron.MenuItem = new remote.MenuItem(
          { label: subclass.name, id: String(MENU.ADD_COMPONENT), click: _callback }
        );
        // @ts-ignore
        item.overrideProperty("iSubclass", subclass.iSubclass);
        item["iSubclass"] = subclass.iSubclass;
        // // Object.defineProperty(item, "subclass", {value: subclass, writable: true});
        // // item["subclass"] = subclass;
        // // console.log(subclass);
        //  function (): ƒ.Component {
        //   console.log(this);
        //   // @ts-ignore
        //   this.Fudge.newComponent = new subclass();
        //   // item.overrideProperty("component", new subclass());
        // });
        menuItems.push(item);
      }
      return menuItems;
    }
  }
}