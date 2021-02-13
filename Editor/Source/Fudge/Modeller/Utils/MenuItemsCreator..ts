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

    public static getInvertFaceItem(_callback: ContextMenuCallback): Electron.MenuItem {
      let item: Electron.MenuItem = new remote.MenuItem({
        label: "invert face",
        id: String(ModellerMenu.INVERT_FACE),
        click: _callback
      });
      return item;
    }

    public static getBackfaceCullItem(_callback: ContextMenuCallback): Electron.MenuItem {
      let backfaceCullItem: Electron.MenuItem = new remote.MenuItem({
        label: ViewModellerScene.isBackfaceCullingEnabled ? "disable backface-culling" : "enable backface-culling",
        id: String(ModellerMenu.TOGGLE_BACKFACE_CULLING),
        click: _callback
      });
      return backfaceCullItem;
    }
  }
}