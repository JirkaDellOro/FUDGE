namespace Fudge {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  /**
   * View the hierarchy of a graph as tree-control
   * @author Jirka Dell'Oro-Friedl, HFU, 2020  
   */
  export class ViewHierarchy extends View {
    #selectionPrevious: ƒ.Node[] = [];
    private graph: ƒ.Graph;
    private tree: ƒUi.Tree<ƒ.Node>;

    constructor(_container: ComponentContainer, _state: JsonValue | undefined) {
      super(_container, _state);
      // this.contextMenu = this.getContextMenu(this.contextMenuCallback);

      this.setGraph((<ƒ.General>_state).node);

      // this.parentPanel.addEventListener(ƒui.EVENT.SELECT, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.SELECT, this.hndEvent);
      // this.dom.addEventListener(EVENT_EDITOR.FOCUS, this.hndEvent);
    }

    public setGraph(_graph: ƒ.Graph): void {
      if (!_graph) {
        this.graph = undefined;
        this.dom.innerHTML = "";
        return;
      }

      if (this.graph && this.tree)
        this.dom.removeChild(this.tree);

      this.dom.innerHTML = "";
      this.graph = _graph;
      // this.selectedNode = null;

      this.tree = new ƒUi.Tree<ƒ.Node>(new ControllerTreeHierarchy(), this.graph);
      this.tree.addEventListener(ƒUi.EVENT.SELECT, this.hndEvent);
      this.tree.addEventListener(ƒUi.EVENT.DELETE, this.hndEvent);
      this.tree.addEventListener(ƒUi.EVENT.CONTEXTMENU, this.openContextMenu);
      this.dom.append(this.tree);
      this.dom.title = "● Right click on existing node to create child node.\n● Use Copy/Paste to duplicate nodes.";
      this.tree.title = "Select node to edit or duplicate.";
    }

    public getSelection(): ƒ.Node[] {
      return this.tree.controller.selection;
    }

    public getDragDropSources(): ƒ.Node[] {
      return this.tree.controller.dragDrop.sources;
    }

    public showNode(_node: ƒ.Node): void {
      let path: ƒ.Node[] = _node.getPath();
      path = path.splice(path.indexOf(this.graph));
      this.tree.show(path);
    }

    protected hndDragOver(_event: DragEvent, _viewSource: View): void {
      _event.dataTransfer.dropEffect = "none";
      let target: ƒ.Node = this.tree?.controller.dragDrop.target;

      if (_viewSource == this) {
        for (let source of _viewSource.getDragDropSources())
          if (!this.checkGraphDrop(<ƒ.Node>source, target))
            return;

        _event.dataTransfer.dropEffect = "copy";
        _event.stopPropagation();
        return; // continue with standard tree behaviour
      }

      if (_event.target == this.dom)
        return;

      if (!(_viewSource instanceof ViewInternal))
        return;

      let source: Object = _viewSource.getDragDropSources()[0];
      if (!(source instanceof ƒ.Graph) && !(source instanceof ƒ.GraphInstance))
        return;

      if (!this.checkGraphDrop(source, target))
        return;

      // gpt to this point -> allow drop
      _event.dataTransfer.dropEffect = "copy";
      _event.preventDefault();
      _event.stopPropagation();
    }

    protected async hndDrop(_event: DragEvent, _viewSource: View): Promise<void> {
      if (_viewSource == this)
        return; // continue with standard tree behaviour

      _event.stopPropagation(); // capture phase, don't pass further down
      let graph: ƒ.Graph = <ƒ.Graph>_viewSource.getDragDropSources()[0];
      let instance: ƒ.GraphInstance = await ƒ.Project.createGraphInstance(graph);
      let target: ƒ.Node = this.tree.controller.dragDrop.target;
      target.appendChild(instance);
      this.tree.findVisible(target).expand(true);

      this.dispatch(EVENT_EDITOR.MODIFY, { bubbles: true });
    }

    //#region  ContextMenu
    protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      let item: Electron.MenuItem;

      item = new remote.MenuItem({ label: "Add Node", id: String(CONTEXTMENU.ADD_NODE), click: _callback, accelerator: "N" });
      menu.append(item);
      item = new remote.MenuItem({ label: "De- / Acvtivate", id: String(CONTEXTMENU.ACTIVATE_NODE), click: _callback, accelerator: "A" });
      menu.append(item);
      item = new remote.MenuItem({ label: "Delete", id: String(CONTEXTMENU.DELETE_NODE), click: _callback, accelerator: "D" });
      menu.append(item);
      return menu;
    }

    protected contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void {
      ƒ.Debug.info(`MenuSelect: Item-id=${CONTEXTMENU[_item.id]}`);
      let focus: ƒ.Node = this.tree.getFocussed();

      switch (Number(_item.id)) {
        case CONTEXTMENU.ADD_NODE:
          let child: ƒ.Node = new ƒ.Node("New Node");
          focus.addChild(child);
          this.tree.findVisible(focus).expand(true);
          this.tree.findVisible(child).focus();
          break;
        case CONTEXTMENU.ACTIVATE_NODE:
          focus.activate(!focus.isActive);
          this.tree.findVisible(focus).refreshAttributes();
          this.dispatch(EVENT_EDITOR.MODIFY, { bubbles: true });
          break;
        case CONTEXTMENU.DELETE_NODE:
          // focus.addChild(child);
          if (!focus)
            return;
          this.tree.delete([focus]);
          focus.getParent().removeChild(focus);
          ƒ.Physics.activeInstance = Page.getPhysics(this.graph);
          ƒ.Physics.cleanup();
          this.dispatch(EVENT_EDITOR.MODIFY, { bubbles: true });
          break;
      }
    }
    //#endregion

    //#region EventHandlers
    private hndEvent = (_event: EditorEvent): void => {
      switch (_event.type) {
        case ƒUi.EVENT.DELETE:
          this.dispatch(EVENT_EDITOR.MODIFY, { bubbles: true });
          break;
        case ƒUi.EVENT.SELECT:
          //only dispatch the event to focus the node, if the node is in the current and the previous selection  
          let node: ƒ.Node = _event.detail["data"];
          if (this.#selectionPrevious.includes(node) && this.getSelection().includes(node))
            this.dispatch(EVENT_EDITOR.FOCUS, { bubbles: true, detail: { node: node, view: this } });
          this.#selectionPrevious = this.getSelection().slice(0);
          this.dispatch(EVENT_EDITOR.SELECT, { bubbles: true, detail: { node: node, view: this } });
          break;
        case EVENT_EDITOR.SELECT:
          if (_event.detail.node) {
            this.showNode(_event.detail.node);
            if (_event.detail.view != this) {
              this.tree.displaySelection([_event.detail.node]);
              this.#selectionPrevious = this.getSelection().slice(0);
            }
          }
          else {
            this.setGraph(_event.detail.graph);
            break;
          }
          break;
      }
    }
    //#endregion

    private checkGraphDrop(_source: ƒ.Node, _target: ƒ.Node): boolean {
      let idSources: string[] = [];
      for (let node of _source.getIterator())
        if (node instanceof ƒ.GraphInstance)
          idSources.push(node.idSource);
        else if (node instanceof ƒ.Graph)
          idSources.push(node.idResource);

      do {
        if (_target instanceof ƒ.Graph)
          if (idSources.indexOf(_target.idResource) > -1)
            return false;
        if (_target instanceof ƒ.GraphInstance)
          if (idSources.indexOf(_target.idSource) > -1)
            return false;

        _target = _target.getParent();
      } while (_target);

      return true;
    }
  }
}
