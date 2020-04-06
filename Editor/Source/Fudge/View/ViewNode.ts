///<reference types="../../../Examples/Code/Scenes"/>
// /<reference path="../Menus.ts"/>

namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  enum Menu {
    NODE = "AddNode"
  }
  /**
   * View displaying a Node and the hierarchical relation to its parents and children.  
   * Consists of a viewport, a tree-control and . 
   */
  export class ViewNode extends View {
    branch: ƒ.Node;
    selectedNode: ƒ.Node;
    // listController: UINodeList;
    tree: ƒui.Tree<ƒ.Node>;
    contextMenu: Electron.Menu;

    constructor(_parent: PanelNode) {
      super(_parent);
      if (_parent instanceof PanelNode && (<PanelNode>_parent).getNode() != null)
        this.branch = (<PanelNode>_parent).getNode();
      else
        this.branch = new ƒ.Node("Node");

      this.selectedNode = null;
      this.parentPanel.addEventListener(ƒui.EVENT_USERINTERFACE.SELECT, this.setSelectedNode);
      // this.listController = new UINodeList(this.branch, this.content);
      this.tree = new ƒui.Tree<ƒ.Node>(new ControllerTreeNode(), this.branch);
      // this.listController.listRoot.addEventListener(ƒui.EVENT_USERINTERFACE.SELECT, this.passEventToPanel);
      //TODO: examine if tree should fire common UI-EVENT for selection instead
      this.tree.addEventListener(ƒui.EVENT_TREE.SELECT, this.passEventToPanel);
      this.tree.addEventListener(ƒui.EVENT_USERINTERFACE.CONTEXTMENU, this.openContextMenu);
      this.fillContent();

      this.contextMenu = ContextMenu.getMenu(ViewNode, this.contextMenuCallback);
    }
    deconstruct(): void {
      //TODO: desconstruct
    }

    fillContent(): void {
      let mutator: ƒ.Mutator = {};
      for (let member in NODEMENU) {
        ƒui.MultiLevelMenuManager.buildFromSignature(NODEMENU[member], mutator);
      }
      let menu: ƒui.DropMenu = new ƒui.DropMenu(Menu.NODE, mutator, { _text: "Add Node" });
      menu.addEventListener(ƒui.EVENT_USERINTERFACE.DROPMENUCLICK, this.createNode);
      // this.content.append(this.listController.listRoot);
      this.content.append(this.tree);
      // this.content.append(menu);
    }

    /**
     * Display structure of node
     * @param _node Node to be displayed
     */
    public setRoot(_node: ƒ.Node): void {
      if (!_node)
        return;
      this.branch = _node;
      // this.listController.listRoot.removeEventListener(ƒui.EVENT_USERINTERFACE.SELECT, this.passEventToPanel);
      // this.listController.setNodeRoot(_node);
      // this.content.replaceChild(this.listController.listRoot, this.content.firstChild);
      // this.listController.listRoot.addEventListener(ƒui.EVENT_USERINTERFACE.SELECT, this.passEventToPanel);
    }
    /**
     * Add new Node to Node Structure
     */
    private createNode = (_event: CustomEvent): void => {
      let node: ƒ.Node = new ƒ.Node("");
      let targetNode: ƒ.Node = this.selectedNode || this.branch;
      let clrRed: ƒ.Color = new ƒ.Color(1, 0, 0, 1);
      let coatRed: ƒ.CoatColored = new ƒ.CoatColored(clrRed);
      let mtrRed: ƒ.Material = new ƒ.Material("Red", ƒ.ShaderUniColor, coatRed);
      switch (_event.detail) {
        case Menu.NODE + "." + NODEMENU.BOX:
          let meshCube: ƒ.MeshCube = new ƒ.MeshCube();
          node = Scenes.createCompleteMeshNode("Box", mtrRed, meshCube);
          break;
        case Menu.NODE + "." + NODEMENU.EMPTY:
          node.name = "Empty Node";
          break;
        case Menu.NODE + "." + NODEMENU.PLANE:
          let meshPlane: ƒ.MeshQuad = new ƒ.MeshQuad();
          node = Scenes.createCompleteMeshNode("Plane", mtrRed, meshPlane);
          break;
        case Menu.NODE + "." + NODEMENU.PYRAMID:
          let meshPyramid: ƒ.MeshPyramid = new ƒ.MeshPyramid();
          node = Scenes.createCompleteMeshNode("Pyramid", mtrRed, meshPyramid);
          break;
      }
      targetNode.addChild(node);
      let event: Event = new Event(ƒ.EVENT.CHILD_APPEND);
      targetNode.dispatchEvent(event);
      this.setRoot(this.branch);
    }
    /**
     * Change the selected Node
     */
    private setSelectedNode = (_event: CustomEvent): void => {
      // this.listController.setSelection(_event.detail);
      this.selectedNode = _event.detail;
    }
    /**
     * Pass Event to Panel
     */
    private passEventToPanel = (_event: CustomEvent): void => {
      let eventToPass: CustomEvent;
      if (_event.type == ƒui.EVENT_TREE.SELECT)
        eventToPass = new CustomEvent(ƒui.EVENT_USERINTERFACE.SELECT, { bubbles: false, detail: _event.detail.data });
      else
        eventToPass = new CustomEvent(_event.type, { bubbles: false, detail: _event.detail });
      _event.cancelBubble = true;

      this.parentPanel.dispatchEvent(eventToPass);
      // this.dispatchEvent(eventToPass); <- if view was a subclass of HTMLElement or HTMLDivElement
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
          let s: typeof ƒ.Component = ƒ.Component.subclasses[iSubclass];
          //@ts-ignore
          let cmpNew: ƒ.Component = new s();
          console.log(cmpNew.type, cmpNew);

          focus.addComponent(cmpNew);
          break;
      }
    }
  }
}
