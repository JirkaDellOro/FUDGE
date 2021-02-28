namespace Fudge {
  /* 
    creates electron menu items according to the inserted types

    incase someone wants to add a menu item: 
    1. add one entry with MODELLER_MENU, shortcut in ViewModellerScene.menuitemToShortcutsMap
    2. add one entry with MODELLER_MENU, function to the availableModes map in the desired interaction mode
    3. add one function here, which creates an item for the MODELLER_MENU value
    rest should be automatic
  */
  export class MenuItemsCreator {

    public static getMenuItems(types: MODELLER_MENU[], _callback: ContextMenuCallback): Electron.MenuItem[] {
      let items: Electron.MenuItem[] = [];
      for (let type of types) {
        switch (type) {
          case MODELLER_MENU.DISPLAY_NORMALS:
            items.push(MenuItemsCreator.getNormalDisplayItem(_callback));
            break;
          case MODELLER_MENU.TOGGLE_BACKFACE_CULLING:
            items.push(MenuItemsCreator.getBackfaceCullItem(_callback));
            break;
          case MODELLER_MENU.INVERT_FACE:
            items.push(MenuItemsCreator.getInvertFaceItem(_callback));
            break;
          case MODELLER_MENU.REMOVE_FACE: 
            items.push(MenuItemsCreator.getRemoveFaceItem(_callback));
        }
      }
      return items;
    }

    private static getNormalDisplayItem(_callback: ContextMenuCallback): Electron.MenuItem {
      let type: MODELLER_MENU = MODELLER_MENU.DISPLAY_NORMALS;
      let item: Electron.MenuItem = new remote.MenuItem({
        label: "toggle normals",
        type: "checkbox",
        checked: InteractionMode.normalsAreDisplayed,
        id: String(type),
        click: _callback,
        accelerator: MenuItemsCreator.getAccelerator(type)
      });
      return item;
    }

    private static getInvertFaceItem(_callback: ContextMenuCallback): Electron.MenuItem {
      let type: MODELLER_MENU = MODELLER_MENU.INVERT_FACE;
      let item: Electron.MenuItem = new remote.MenuItem({
        label: "invert face",
        id: String(MODELLER_MENU.INVERT_FACE),
        click: _callback,
        accelerator: MenuItemsCreator.getAccelerator(type)
      });
      return item;
    }

    private static getBackfaceCullItem(_callback: ContextMenuCallback): Electron.MenuItem {
      let type: MODELLER_MENU = MODELLER_MENU.TOGGLE_BACKFACE_CULLING;
      let item: Electron.MenuItem = new remote.MenuItem({
        type: "checkbox",
        checked: ViewModellerScene.isBackfaceCullingEnabled,
        label: "toggle backface culling",
        id: String(MODELLER_MENU.TOGGLE_BACKFACE_CULLING),
        click: _callback,
        accelerator: MenuItemsCreator.getAccelerator(type)
      });
      return item;
    }

    private static getRemoveFaceItem(_callback: ContextMenuCallback): Electron.MenuItem {
      let type: MODELLER_MENU = MODELLER_MENU.REMOVE_FACE;
      let item: Electron.MenuItem = new remote.MenuItem({
        label: "remove face",
        id: String(MODELLER_MENU.REMOVE_FACE),
        click: _callback,
        accelerator: MenuItemsCreator.getAccelerator(type)
      });
      return item;
    }


    private static getAccelerator(type: MODELLER_MENU): string {
      let result: string = "";
      let iterator: number = 0;
      for (let key of ViewModellerScene.menuitemToShortcutsMap.get(type)) {
        iterator++;
        result += key;
        if (iterator < ViewModellerScene.menuitemToShortcutsMap.get(type).size)
          result += "+";
      }
      return result;
    }
  }

}