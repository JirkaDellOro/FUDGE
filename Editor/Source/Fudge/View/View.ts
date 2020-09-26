namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  export enum VIEW {
    HIERARCHY = "ViewHierarchy",
    ANIMATION = "ViewAnimation",
    RENDER = "ViewRender",
    COMPONENTS = "ViewComponents",
    CAMERA = "ViewCamera",
    MODELLER = "ViewModeller", 
    OBJECT_PROPERTIES = "ViewObjectProperties"
    // PROJECT = ViewProject,
    // SKETCH = ViewSketch,
    // MESH = ViewMesh,
  }

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
      console.log(this.contextMenuCallback);
      this.contextMenu = this.getContextMenu(this.contextMenuCallback.bind(this));
    }

    public setTitle(_title: string): void {
      this.container.setTitle(_title);
    }

    /** Cleanup when user closes view */
    protected abstract cleanup(): void;

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
      ƒ.Debug.info(`ContextMenu: Item-id=${MENU[_item.id]}`);
    }
  }
}