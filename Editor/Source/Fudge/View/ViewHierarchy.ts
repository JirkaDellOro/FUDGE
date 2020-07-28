namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  /**
   * View displaying a Node and the hierarchical relation to its parents and children.  
   * Consists of a viewport, a tree-control and . 
   */
  export class ViewHierarchy extends View {
    graph: ƒ.Node;
    selectedNode: ƒ.Node;
    tree: ƒui.Tree<ƒ.Node>;
    contextMenu: Electron.Menu;

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);
      this.contextMenu = ContextMenu.getMenu(ViewHierarchy, this.contextMenuCallback);

      this.setRoot((<ƒ.General>_state).node);

      // this.parentPanel.addEventListener(ƒui.EVENT_USERINTERFACE.SELECT, this.setSelectedNode);
    }

    cleanup(): void {
      //TODO: desconstruct
    }

    /**
     * Display structure of node
     * @param _node Node to be displayed
     */
    public setRoot(_node: ƒ.Node): void {
      if (!_node)
        return;
      if (this.tree)
        this.dom.removeChild(this.tree);

      this.graph = _node;
      this.selectedNode = null;

      this.tree = new ƒui.Tree<ƒ.Node>(new ControllerTreeNode(), this.graph);
      // this.listController.listRoot.addEventListener(ƒui.EVENT_USERINTERFACE.SELECT, this.passEventToPanel);
      //TODO: examine if tree should fire common UI-EVENT for selection instead
      this.tree.addEventListener(ƒui.EVENT_TREE.SELECT, this.passEventToPanel);
      this.tree.addEventListener(ƒui.EVENT_USERINTERFACE.CONTEXTMENU, this.openContextMenu);
      this.dom.append(this.tree);
    }

    /**
     * Change the selected Node
     */
    private setNode(_node: ƒ.Node): void {
      console.log("Hierarchy", _node);
      // this.listController.setSelection(_event.detail);
      this.selectedNode = _node;
    }

    /**
     * Pass Event to Panel
     */
    private passEventToPanel = (_event: CustomEvent): void => {
      let eventToPass: CustomEvent;
      if (_event.type == ƒui.EVENT_TREE.SELECT)
        eventToPass = new CustomEvent(ƒui.EVENT_USERINTERFACE.SELECT, { bubbles: true, detail: _event.detail.data });
      else
        eventToPass = new CustomEvent(_event.type, { bubbles: false, detail: _event.detail });
      _event.cancelBubble = true;

      this.dom.dispatchEvent(eventToPass);

      // this.parentPanel.dispatchEvent(eventToPass);
      // this.dispatchEvent(eventToPass); <- if view was a subclass of HTMLElement or HTMLDivElement
      // this.goldenLayout.emit(ƒui.EVENT_USERINTERFACE.SELECT, _event.detail.data);
    }

    private openContextMenu = (_event: Event): void => {
      this.contextMenu.popup();
    }

    private contextMenuCallback = (_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void => {
      console.log(`MenuSelect: Item-id=${MENU[_item.id]}`);
      let focus: ƒ.Node = this.tree.getFocussed();

      switch (Number(_item.id)) {
        case MENU.ADD_NODE:
          let child: ƒ.Node = new ƒ.Node("New Node");
          focus.addChild(child);
          this.tree.findItem(focus).open(true);
          this.tree.findOpen(child).focus();
          break;
        case MENU.ADD_COMPONENT:
          let iSubclass: number = _item["iSubclass"];
          let component: typeof ƒ.Component = ƒ.Component.subclasses[iSubclass];
          //@ts-ignore
          let cmpNew: ƒ.Component = new component();
          console.log(cmpNew.type, cmpNew);

          focus.addComponent(cmpNew);
          break;
      }
    }
  }
}
