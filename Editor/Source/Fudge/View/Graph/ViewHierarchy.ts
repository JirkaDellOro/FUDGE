namespace Fudge {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  /**
   * View the hierarchy of a graph as tree-control
   * @author Jirka Dell'Oro-Friedl, HFU, 2020  
   */
  export class ViewHierarchy extends View {
    private graph: ƒ.Node;
    // private selectedNode: ƒ.Node;
    private tree: ƒUi.Tree<ƒ.Node>;

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
      
      this.tree = new ƒUi.Tree<ƒ.Node>(new ControllerTreeHierarchy(), this.graph);
      // this.listController.listRoot.addEventListener(ƒui.EVENT.SELECT, this.passEventToPanel);
      //TODO: examine if tree should fire common UI-EVENT for selection instead
      // this.tree.addEventListener(ƒui.EVENT.SELECT, this.passEventToPanel);
      this.tree.addEventListener(ƒUi.EVENT.DELETE, this.hndEvent);
      this.tree.addEventListener(ƒUi.EVENT.CONTEXTMENU, this.openContextMenu);
      this.dom.append(this.tree);
    }

    public getSelection(): ƒ.Node[] {
      return this.tree.controller.selection;
    }

    public getDragDropSources(): ƒ.Node[] {
      return this.tree.controller.dragDrop.sources;
    }

    protected hndDragOver(_event: DragEvent, _viewSource: View): void {
      if (_viewSource == this) {
        _event.stopPropagation();
        return; // continue with standard tree behaviour
      }

      _event.dataTransfer.dropEffect = "none";
      if (_event.target == this.dom)
        return;

      if (!(_viewSource instanceof ViewInternal))
        return;

      let source: Object = _viewSource.getDragDropSources()[0];
      if (!(source instanceof ƒ.Graph))
        return;

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

      this.dom.dispatchEvent(new Event(EVENT_EDITOR.UPDATE, { bubbles: true }));
    }

    //#region  ContextMenu
    protected getContextMenu(_callback: ContextMenuCallback): Electron.Menu {
      const menu: Electron.Menu = new remote.Menu();
      let item: Electron.MenuItem;

      item = new remote.MenuItem({ label: "Add Node", id: String(CONTEXTMENU.ADD_NODE), click: _callback, accelerator: process.platform == "darwin" ? "N" : "N" });
      menu.append(item);

      // item = new remote.MenuItem({
      //   label: "Add Component",
      //   submenu: ContextMenu.getSubclassMenu<typeof ƒ.Component>(CONTEXTMENU.ADD_COMPONENT, ƒ.Component.subclasses, _callback)
      // });
      // menu.append(item);

      // ContextMenu.appendCopyPaste(menu);

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
          this.tree.findVisible(focus).expand(true);
          this.tree.findVisible(child).focus();
          break;
        // case CONTEXTMENU.ADD_COMPONENT:
        //   let iSubclass: number = _item["iSubclass"];
        //   let component: typeof ƒ.Component = ƒ.Component.subclasses[iSubclass];
        //   //@ts-ignore
        //   let cmpNew: ƒ.Component = new component();
        //   ƒ.Debug.info(cmpNew.type, cmpNew);

        //   focus.addComponent(cmpNew);
        //   this.dom.dispatchEvent(new CustomEvent(ƒui.EVENT.SELECT, { bubbles: true, detail: { data: focus } }));
        //   break;
        case CONTEXTMENU.ADD_COMPONENT_SCRIPT:
          // let script: typeof ƒ.ComponentScript = <typeof ƒ.ComponentScript>_item["Script"];
          let cmpScript: ƒ.ComponentScript = <ƒ.ComponentScript>ƒ.Serializer.reconstruct(_item["Script"]);
          // let cmpScript: ƒ.ComponentScript = new script(); //Reflect.construct(script); //
          ƒ.Debug.info(cmpScript.type, cmpScript);

          focus.addComponent(cmpScript);
          this.dom.dispatchEvent(new CustomEvent(ƒUi.EVENT.SELECT, { bubbles: true, detail: { data: focus } }));
          break;
      }
    }
    //#endregion

    //#region EventHandlers
    private hndEvent = (_event: CustomEvent): void => {
      switch (_event.type) {
        case ƒUi.EVENT.DELETE:
          this.dom.dispatchEvent(new Event(EVENT_EDITOR.UPDATE, { bubbles: true }));
          break;
        default:
          this.setGraph(_event.detail);
      }
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
