namespace Fudge {
  export class MenuItemsCreator {
    public static getNormalDisplayItem(_callback: ContextMenuCallback, normalsAreDisplayed: boolean): Electron.MenuItem {
      let stateAsString: string = !normalsAreDisplayed ? "display" : "hide";
      let item: Electron.MenuItem = new remote.MenuItem({
        label: stateAsString + " normals",
        id: String(ModellerMenu.DISPLAY_NORMALS),
        click: _callback
      });
      return item;
    }

    public static getInvertNormalsItem(_callback: ContextMenuCallback): Electron.MenuItem {
      let item: Electron.MenuItem = new remote.MenuItem({
        label: "invert normals",
        id: String(ModellerMenu.INVERT_NORMALS),
        click: _callback
      });
      return item;
    }

  }
}