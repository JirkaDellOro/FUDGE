namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  /**
   * View the properties of a resource
   * @author Jirka Dell'Oro-Friedl, HFU, 2020  
   */
  export class ViewProperties extends View {
    private resource: ƒ.SerializableResource;

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state); this.fillContent();

      this.dom.addEventListener(EVENT_EDITOR.FOCUS_RESOURCE, this.hndEvent);
      this.dom.addEventListener(ƒui.EVENT.CONTEXTMENU, this.openContextMenu);
      this.dom.addEventListener(ƒui.EVENT.SELECT, this.hndEvent);
      // this.dom.addEventListener(EVENT_EDITOR.SET_GRAPH, this.hndEvent);
      // this.dom.addEventListener(ƒui.EVENT.RENAME, this.hndEvent);
    }

    //#region  ContextMenu
    protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      let item: Electron.MenuItem;

      item = new remote.MenuItem({ label: "Add Component", submenu: [] });
      for (let subItem of ContextMenu.getComponents(_callback))
        item.submenu.append(subItem);
      menu.append(item);

      ContextMenu.appendCopyPaste(menu);
      return menu;
    }

    protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
      ƒ.Debug.info(`MenuSelect: Item-id=${CONTEXTMENU[_item.id]}`);

      switch (Number(_item.id)) {
        case CONTEXTMENU.ADD_COMPONENT:
          let iSubclass: number = _item["iSubclass"];
          let component: typeof ƒ.Component = ƒ.Component.subclasses[iSubclass];
          //@ts-ignore
          let cmpNew: ƒ.Component = new component();
          ƒ.Debug.info(cmpNew.type, cmpNew);

          // this.node.addComponent(cmpNew);
          this.dom.dispatchEvent(new CustomEvent(ƒui.EVENT.SELECT, { bubbles: true, detail: { data: this.resource } }));
          break;
      }
    }
    //#endregion

    private fillContent(): void {
      while (this.dom.lastChild && this.dom.removeChild(this.dom.lastChild));
      if (this.resource) {
        this.setTitle(this.resource.name);
        //   let components: ƒ.Component[] = this.resource.getAllComponents();
        //   for (let component of components) {
        if (this.resource instanceof ƒ.Mutable) {
          let fieldset: ƒui.FoldableFieldSet = ƒui.Generator.createFieldSetFromMutable(this.resource);
          let uiMutable: ControllerComponent = new ControllerComponent(this.resource, fieldset);
          this.dom.append(uiMutable.domElement);
          //   }
          // }
        }
        else {
          let cntEmpty: HTMLDivElement = document.createElement("div");
          this.dom.append(cntEmpty);
        }
      }
    }

    private hndEvent = (_event: CustomEvent): void => {
      switch (_event.type) {
        case ƒui.EVENT.RENAME: break;
        default:
          this.resource = _event.detail.data;
          this.fillContent();
          break;
      }
    }
  }
}