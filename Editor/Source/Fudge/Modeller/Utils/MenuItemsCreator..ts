namespace Fudge {
  export class MenuItemsCreator {
    public static getNormalDisplayItem(_callback: ContextMenuCallback, normalsAreDisplayed: boolean): Electron.MenuItem {
      let item: Electron.MenuItem = new remote.MenuItem({
        label: "toggle normals",
        type: "checkbox",
        checked: normalsAreDisplayed,
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
      let item: Electron.MenuItem = new remote.MenuItem({
        type: "checkbox",
        checked: ViewModellerScene.isBackfaceCullingEnabled,
        label: "toggle backface culling",
        id: String(ModellerMenu.TOGGLE_BACKFACE_CULLING),
        click: _callback
      });
      return item;
    }
  }
}