namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  export let typesOfResources: ƒ.General[] = [
    ƒ.Mesh
  ];

  /**
   * List the internal resources
   * @author Jirka Dell'Oro-Friedl, HFU, 2020  
   */
  export class ViewInternal extends View {
    private table: ƒui.Table<ƒ.SerializableResource>;

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);

      this.dom.addEventListener(EVENT_EDITOR.SET_PROJECT, this.hndEvent);
      this.dom.addEventListener(ƒui.EVENT.CONTEXTMENU, this.openContextMenu);
    }

    public listResources(): void {
      while (this.dom.lastChild && this.dom.removeChild(this.dom.lastChild));
      this.table = new ƒui.Table<ƒ.SerializableResource>(new ControllerTableResource(), Object.values(ƒ.Project.resources));
      this.dom.appendChild(this.table);
    }

    // #region  ContextMenu
    protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      let item: Electron.MenuItem;

      item = new remote.MenuItem({ label: "Edit", id: String(CONTEXTMENU.EDIT), click: _callback, accelerator: process.platform == "darwin" ? "E" : "E" });
      menu.append(item);
      item = new remote.MenuItem({ label: "Create" , submenu: ContextMenu.getSubMenu(ƒ.Mesh, _callback)});
      // item.submenu = ContextMenu.getSubMenu(ƒ.Mesh, _callback);
      menu.append(item);

      // ContextMenu.appendCopyPaste(menu);
      return menu;
    }

    protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
      ƒ.Debug.info(`MenuSelect: Item-id=${CONTEXTMENU[_item.id]}`);

      switch (Number(_item.id)) {
        case CONTEXTMENU.CREATE:
          let iSubclass: number = _item["iSubclass"];
          let type: typeof ƒ.Mesh = ƒ.Mesh.subclasses[iSubclass];
          //@ts-ignore
          let meshNew: ƒ.Mesh = new type();
          ƒ.Debug.info(meshNew.type, meshNew);
          
          // this.dom.dispatchEvent(new CustomEvent(ƒui.EVENT.SELECT, { bubbles: true, detail: { data: this.node } }));
          break;
        case CONTEXTMENU.EDIT:
          let resource: ƒ.SerializableResource = this.table.getFocussed();
          console.log("Edit", resource);
          this.dom.dispatchEvent(new CustomEvent(EVENT_EDITOR.SET_GRAPH, { bubbles: true, detail: resource }));
          break;
      }
    }
    //#endregion

    private hndEvent = (_event: CustomEvent): void => {
      switch (_event.type) {
        case EVENT_EDITOR.SET_PROJECT:
          this.listResources();
          break;
        // case ƒui.EVENT.SELECT:
        //   console.log(_event.detail.data);
        //   break;
      }
    }
  }
}