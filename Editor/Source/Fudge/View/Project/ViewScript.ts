namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  /**
   * List the scripts loaded
   * @author Jirka Dell'Oro-Friedl, HFU, 2020-23
   */
  export class ViewScript extends View {
    // TODO: consider script namespaces ƒ.ScriptNamespaces to find all scripts not just ComponentScripts
    private table: ƒui.Table<ScriptInfo>;

    constructor(_container: ComponentContainer, _state: JsonValue | undefined) {
      super(_container, _state);

      this.dom.addEventListener(EVENT_EDITOR.OPEN, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.UPDATE, this.hndEvent);
      // this.dom.addEventListener(EVENT_EDITOR.SELECT, this.hndEvent);
      // this.dom.addEventListener(EVENT_EDITOR.MODIFY, this.hndEvent);
    }

    public listScripts(): void {
      this.dom.title = `Drag & drop scripts on "Components"`;
      while (this.dom.lastChild && this.dom.removeChild(this.dom.lastChild));
      let scriptinfos: ScriptInfo[] = [];
      for (let namespace in ƒ.Project.scriptNamespaces) {
        for (let index in ƒ.Project.scriptNamespaces[namespace]) {
          let script: Function = ƒ.Project.scriptNamespaces[namespace][index];
          if (script.name)
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
    // protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
    //   const menu: Electron.Menu = new remote.Menu();
    //   return menu;
    // }

    // protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
    //   ƒ.Debug.fudge(`MenuSelect | id: ${CONTEXTMENU[_item.id]} | event: ${_event}`);
    // }
    //#endregion

    private hndEvent = (_event: CustomEvent): void => {
      switch (_event.type) {
        case EVENT_EDITOR.UPDATE:
        case EVENT_EDITOR.OPEN:
          if (!_event.detail.data)
            this.listScripts();
          break;
      }
    }
  }
}