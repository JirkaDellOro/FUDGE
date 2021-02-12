namespace Fudge {
  export class MenuItemsCreator {
    public static getNormalDisplayItem(_callback: ContextMenuCallback): Electron.MenuItem {
      let item: Electron.MenuItem;  
      item = new remote.MenuItem({
        label: "display normals",
        id: String(ModellerMenu.DISPLAY_NORMALS),
        click: _callback
      });
      return item;
    }
  }
}