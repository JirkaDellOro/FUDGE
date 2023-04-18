namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  /**
   * View the properties of a resource
   * @author Jirka Dell'Oro-Friedl, HFU, 2020  
   */
  export class ViewProperties extends View {
    private resource: ƒ.SerializableResource;

    constructor(_container: ComponentContainer, _state: JsonValue | undefined) {
      super(_container, _state);
      this.fillContent();

      this.dom.addEventListener(ƒui.EVENT.SELECT, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.MODIFY, this.hndEvent, true);
      // this.dom.addEventListener(EVENT_EDITOR.SET_PROJECT, this.hndEvent);
    }

    //#region  ContextMenu
    // protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
    //   const menu: Electron.Menu = new remote.Menu();
    //   let item: Electron.MenuItem;

    //   item = new remote.MenuItem({ label: "Add Component", submenu: [] });
    //   for (let subItem of ContextMenu.getComponents(_callback))
    //     item.submenu.append(subItem);
    //   menu.append(item);

    //   ContextMenu.appendCopyPaste(menu);
    //   return menu;
    // }

    // protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
    //   ƒ.Debug.info(`MenuSelect: Item-id=${CONTEXTMENU[_item.id]}`);

    //   switch (Number(_item.id)) {
    //     case CONTEXTMENU.ADD_COMPONENT:
    //       let iSubclass: number = _item["iSubclass"];
    //       let component: typeof ƒ.Component = ƒ.Component.subclasses[iSubclass];
    //       //@ts-ignore
    //       let cmpNew: ƒ.Component = new component();
    //       ƒ.Debug.info(cmpNew.type, cmpNew);

    //       // this.node.addComponent(cmpNew);
    //       this.dom.dispatchEvent(new CustomEvent(ƒui.EVENT.SELECT, { bubbles: true, detail: { data: this.resource } }));
    //       break;
    //   }
    // }
    //#endregion

    protected hndDragOver(_event: DragEvent, _viewSource: View): void {
      // console.log(_event.target, _event.currentTarget);
      // _event.dataTransfer.dropEffect = "link";
      // _event.preventDefault();
      // console.log("DragOver");
    }

    private fillContent(): void {
      while (this.dom.lastChild && this.dom.removeChild(this.dom.lastChild));
      // console.log(this.resource);
      let content: HTMLElement = document.createElement("div");
      content.style.whiteSpace = "nowrap";
      if (this.resource) {
        this.setTitle("Properties | " + this.resource.name);
        if (this.resource instanceof ƒ.Mutable) {
          let fieldset: ƒui.Details = ƒui.Generator.createDetailsFromMutable(this.resource);
          let uiMutable: ControllerComponent = new ControllerComponent(this.resource, fieldset);
          content = uiMutable.domElement;
        } else if (this.resource instanceof DirectoryEntry && this.resource.stats) {
          content.innerHTML += "Size: " + (this.resource.stats["size"] / 1024).toFixed(2) + " KiB<br/>";
          content.innerHTML += "Created: " + this.resource.stats["birthtime"].toLocaleString() + "<br/>";
          content.innerHTML += "Modified: " + this.resource.stats["ctime"].toLocaleString() + "<br/>";
        } else if (this.resource instanceof ƒ.Graph) {
          content.innerHTML = this.resource.toHierarchyString();
        } else if (this.resource instanceof ScriptInfo) {
          for (let key in this.resource.script) {
            let value: ƒ.General = this.resource.script[key];
            if (value instanceof Function)
              value = value.name;
            if (value instanceof Array)
              value = "Array(" + value.length + ")";
            content.innerHTML += key + ": " + value + "<br/>";
          }
        }
      }
      else {
        this.setTitle("Properties");
        content.innerHTML = "Select an internal or external resource to examine properties";
      }
      this.dom.append(content);
    }

    private hndEvent = (_event: CustomEvent): void => {
      switch (_event.type) {
        // case EVENT_EDITOR.SET_PROJECT:
        //   this.resource = undefined;
        //   break;
        case ƒui.EVENT.SELECT:
          // let detail: EventDetail = <EventDetail>_event.detail;
          this.resource = <ƒ.SerializableResource>(_event.detail.data);
          break;
        default:
          break;
      }
      this.fillContent();
    }
  }
}