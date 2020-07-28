namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  /**
   * View the hierarchy of a graph as tree-control
   * @author Jirka Dell'Oro-Friedl, HFU, 2020  
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

    private setNode(_node: ƒ.Node): void {
      ƒ.Debug.info("Hierarchy", _node);
      // this.listController.setSelection(_event.detail);
      this.selectedNode = _node;
    }
    
    private passEventToPanel = (_event: CustomEvent): void => {
      let eventToPass: CustomEvent;
      if (_event.type == ƒui.EVENT_TREE.SELECT)
        eventToPass = new CustomEvent(ƒui.EVENT_USERINTERFACE.SELECT, { bubbles: true, detail: _event.detail.data });
      else
        eventToPass = new CustomEvent(_event.type, { bubbles: false, detail: _event.detail });
      _event.cancelBubble = true;

      this.dom.dispatchEvent(eventToPass);
    }

    private openContextMenu = (_event: Event): void => {
      this.contextMenu.popup();
    }

    private contextMenuCallback = (_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void => {
      ƒ.Debug.info(`MenuSelect: Item-id=${MENU[_item.id]}`);
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
          ƒ.Debug.info(cmpNew.type, cmpNew);

          focus.addComponent(cmpNew);
          break;
      }
    }
  }
}
