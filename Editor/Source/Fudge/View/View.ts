namespace Fudge {
  import ƒ = FudgeCore;

  /**
   * Base class for all [[View]]s to support generic functionality
   * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export abstract class View {
    public dom: HTMLElement;
    protected contextMenu: Electron.Menu;
    private container: GoldenLayout.Container;

    constructor(_container: GoldenLayout.Container, _state: Object) {
      this.dom = document.createElement("div");
      this.dom.style.height = "100%";
      this.dom.style.overflow = "auto";
      this.dom.setAttribute("view", this.constructor.name);
      
      _container.getElement().append(this.dom);
      this.container = _container;
      this.container.on("destroy", (_e: Object) => this.dom.dispatchEvent(
        new CustomEvent(EVENT_EDITOR.DESTROY, { bubbles: true, detail: _e["instance"] }))
      );

      // console.log(this.contextMenuCallback);
      this.contextMenu = this.getContextMenu(this.contextMenuCallback.bind(this));
      this.dom.addEventListener(EVENT_EDITOR.SET_PROJECT, this.hndEventCommon);
    }

    public setTitle(_title: string): void {
      this.container.setTitle(_title);
    }

    //#region  ContextMenu
    protected openContextMenu = (_event: Event): void => {
      this.contextMenu.popup();
    }

    protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
      console.log(ipcRenderer);
      const menu: Electron.Menu = new remote.Menu();
      ContextMenu.appendCopyPaste(menu);
      return menu;
    }

    protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
      ƒ.Debug.info(`ContextMenu: Item-id=${CONTEXTMENU[_item.id]}`);
    }

    private hndEventCommon = (_event: Event): void => {
      switch (_event.type) {
        case EVENT_EDITOR.SET_PROJECT:
          this.contextMenu = this.getContextMenu(this.contextMenuCallback.bind(this));
          break;
      }
    }
  }
}