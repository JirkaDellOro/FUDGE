namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  /**
   * View the hierarchy of a graph as tree-control
   * @author Jirka Dell'Oro-Friedl, HFU, 2020  
   */
  export class ViewHierarchy extends View {
    private graph: ƒ.Node;
    // private selectedNode: ƒ.Node;
    private tree: ƒui.Tree<ƒ.Node>;

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);
      // this.contextMenu = this.getContextMenu(this.contextMenuCallback);

      this.setGraph((<ƒ.General>_state).node);

      // this.parentPanel.addEventListener(ƒui.EVENT.SELECT, this.setSelectedNode);
      this.dom.addEventListener(EVENT_EDITOR.SET_GRAPH, this.hndEvent);
    }

    public setGraph(_graph: ƒ.Node): void {
      if (!_graph)
        return;
      if (this.tree)
        this.dom.removeChild(this.tree);

      this.graph = _graph;
      // this.selectedNode = null;

      this.tree = new ƒui.Tree<ƒ.Node>(new ControllerTreeNode(), this.graph);
      // this.listController.listRoot.addEventListener(ƒui.EVENT.SELECT, this.passEventToPanel);
      //TODO: examine if tree should fire common UI-EVENT for selection instead
      // this.tree.addEventListener(ƒui.EVENT.SELECT, this.passEventToPanel);
      this.tree.addEventListener(ƒui.EVENT.CONTEXTMENU, this.openContextMenu);
      this.dom.append(this.tree);
    }

    //#region  ContextMenu
    protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      let item: Electron.MenuItem;

      item = new remote.MenuItem({ label: "Add Node", id: String(CONTEXTMENU.ADD_NODE), click: _callback, accelerator: process.platform == "darwin" ? "N" : "N" });
      menu.append(item);

      item = new remote.MenuItem({ label: "Add Component", submenu: [] });
      for (let subItem of ContextMenu.getComponents(_callback))
        item.submenu.append(subItem);
      menu.append(item);

      ContextMenu.appendCopyPaste(menu);

      // menu.addListener("menu-will-close", (_event: Electron.Event) => { console.log(_event); });
      return menu;
    }

    protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
      ƒ.Debug.info(`MenuSelect: Item-id=${CONTEXTMENU[_item.id]}`);
      let focus: ƒ.Node = this.tree.getFocussed();

      switch (Number(_item.id)) {
        case CONTEXTMENU.ADD_NODE:
          let child: ƒ.Node = new ƒ.Node("New Node");
          focus.addChild(child);
          this.tree.findOpen(focus).open(true);
          this.tree.findOpen(child).focus();
          break;
        case CONTEXTMENU.ADD_COMPONENT:
          let iSubclass: number = _item["iSubclass"];
          let component: typeof ƒ.Component = ƒ.Component.subclasses[iSubclass];
          //@ts-ignore
          let cmpNew: ƒ.Component = new component();
          ƒ.Debug.info(cmpNew.type, cmpNew);

          focus.addComponent(cmpNew);
          this.dom.dispatchEvent(new CustomEvent(ƒui.EVENT.SELECT, { bubbles: true, detail: { data: focus } }));
          break;
      }
    }
    //#endregion

    //#region EventHandlers
    private hndEvent = (_event: CustomEvent): void => {
      this.setGraph(_event.detail);
    }

    // private setNode(_node: ƒ.Node): void {
    //   ƒ.Debug.info("Hierarchy", _node);
    //   // this.listController.setSelection(_event.detail);
    //   this.selectedNode = _node;
    // }

    // private passEventToPanel = (_event: CustomEvent): void => {
    //   let eventToPass: CustomEvent;
    //   eventToPass = new CustomEvent(_event.type, { bubbles: true, detail: _event.detail });
    // }
    //#endregion
  }
}
