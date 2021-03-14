namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  type Views = { [id: string]: View };
  /**
   * Base class for all [[View]]s to support generic functionality
   * @authors Monika Galkewitsch, HFU, 2019 | Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export abstract class View {
    private static views: Views = {};
    private static idCount: number = 0;

    public dom: HTMLElement;
    protected contextMenu: Electron.Menu;
    private container: GoldenLayout.Container;
    private id: number;

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

      this.id = View.registerViewForDragDrop(this);
    }

    public static getViewSource(_event: DragEvent): View {
      for (let item of _event.dataTransfer.items)
        if (item.type.startsWith("sourceview"))
          return View.views[item.type.split(":").pop()];
      return null;
    }

    private static registerViewForDragDrop(_this: View): number {
      View.views[View.idCount] = _this;

      // when drag starts, add identifier to the event in a way that allows dragover to process the soure
      _this.dom.addEventListener(ƒui.EVENT.DRAG_START, (_event: DragEvent) => {
        _event.stopPropagation();
        _event.dataTransfer.setData("SourceView:" + _this.id.toString(), "typesHack");
      });

      // when dragging over a view, get the original source view for dragging and call hndDragOver
      _this.dom.addEventListener(ƒui.EVENT.DRAG_OVER, (_event: DragEvent) => {
        _event.stopPropagation();
        let viewSource: View = View.getViewSource(_event);
        _this.hndDragOver(_event, viewSource);
      });

      // when dropping into a view, get the original source view for dragging and call hndDrop
      _this.dom.addEventListener(
        ƒui.EVENT.DROP,
        (_event: DragEvent) => {
          // _event.stopPropagation();
          let viewSource: View = View.getViewSource(_event);
          _this.hndDrop(_event, viewSource);
        },
        true);

      return View.idCount++;
    }

    public setTitle(_title: string): void {
      this.container.setTitle(_title);
    }

    public getDragDropSources(): Object[] {
      return [];
    }

    //#region  ContextMenu
    protected openContextMenu = (_event: Event): void => {
      this.contextMenu.popup();
    }

    protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      // ContextMenu.appendCopyPaste(menu);
      return menu;
    }

    protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
      ƒ.Debug.info(`ContextMenu: Item-id=${CONTEXTMENU[_item.id]}`);
    }
    //#endregion

    //#region Events
    protected hndDrop(_event: DragEvent, _source: View): void {
      // console.log(_source, _event);
    }

    protected hndDragOver(_event: DragEvent, _source: View): void {
      // _event.dataTransfer.dropEffect = "link";
    }

    private hndEventCommon = (_event: Event): void => {
      switch (_event.type) {
        case EVENT_EDITOR.SET_PROJECT:
          this.contextMenu = this.getContextMenu(this.contextMenuCallback.bind(this));
          break;
      }
    }
    //#endregion

  }
}