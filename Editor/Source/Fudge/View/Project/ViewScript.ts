namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  /**
   * List the scripts loaded
   * @author Jirka Dell'Oro-Friedl, HFU, 2020  
   */
  export class ViewScript extends View {
    // TODO: consider script namespaces ƒ.ScriptNamespaces to find all scripts not just ComponentScripts
    private table: ƒui.Table<ScriptInfo>;

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);

      this.dom.addEventListener(EVENT_EDITOR.SET_PROJECT, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.UPDATE, this.hndEvent);
      this.dom.addEventListener(ƒui.EVENT.CONTEXTMENU, this.openContextMenu);
    }

    public listScripts(): void {
      while (this.dom.lastChild && this.dom.removeChild(this.dom.lastChild));
      let scriptinfos: ScriptInfo[] = [];
      for (let namespace in ƒ.Project.scriptNamespaces) {
        for (let index in ƒ.Project.scriptNamespaces[namespace]) {
          let script: Function = ƒ.Project.scriptNamespaces[namespace][index];
          scriptinfos.push(new ScriptInfo(script, namespace));
        }
      }
      this.table = new ƒui.Table<ScriptInfo>(new ControllerTableScript(), scriptinfos);
      this.dom.appendChild(this.table);
    }

    public getSelection(): ScriptInfo[] {
      return this.table.controller.selection;
    }

    public getDragDropSources(): ScriptInfo[] {
      return this.table.controller.dragDrop.sources;
    }

    // #region  ContextMenu
    protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      let item: Electron.MenuItem;

      item = new remote.MenuItem({ label: "Edit", id: String(CONTEXTMENU.EDIT), click: _callback, accelerator: process.platform == "darwin" ? "E" : "E" });
      menu.append(item);
      item = new remote.MenuItem({
        label: "Create",
        submenu: ContextMenu.getSubclassMenu<typeof ƒ.Mesh>(CONTEXTMENU.CREATE_MESH, ƒ.Mesh.subclasses, _callback)
      });
      // item.submenu = ContextMenu.getSubMenu(ƒ.Mesh, _callback);
      menu.append(item);

      // ContextMenu.appendCopyPaste(menu);
      return menu;
    }

    protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
      ƒ.Debug.fudge(`MenuSelect | id: ${CONTEXTMENU[_item.id]} | event: ${_event}`);

      switch (Number(_item.id)) {
        // case CONTEXTMENU.CREATE:
        //   let iSubclass: number = _item["iSubclass"];
        //   let type: typeof ƒ.Mesh = ƒ.Mesh.subclasses[iSubclass];
        //   //@ts-ignore
        //   let meshNew: ƒ.Mesh = new type();
        //   // ƒ.Debug.info(meshNew.type, meshNew);

        //   this.dom.dispatchEvent(new Event(EVENT_EDITOR.UPDATE, { bubbles: true }));
        //   this.table.selectInterval(meshNew, meshNew);
        //   break;
        // case CONTEXTMENU.EDIT:
        //   let resource: ƒ.SerializableResource = this.table.getFocussed();
        //   console.log("Edit", resource);
        //   this.dom.dispatchEvent(new CustomEvent(EVENT_EDITOR.SET_GRAPH, { bubbles: true, detail: resource }));
        //   break;
      }
    }
    //#endregion

    private hndEvent = (_event: CustomEvent): void => {
      switch (_event.type) {
        case EVENT_EDITOR.SET_PROJECT:
        case EVENT_EDITOR.UPDATE:
          this.listScripts();
          break;
        // case ƒui.EVENT.SELECT:
        //   console.log(_event.detail.data);
        //   break;
      }
    }
  }
}