namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;
  import ƒaid = FudgeAid;

  /**
   * View displaying a Node and the hierarchical relation to its parents and children.  
   * Consists of a viewport and a tree-control. 
   */
  export class ViewRender extends View {
    viewport: ƒ.Viewport;
    canvas: HTMLCanvasElement;
    graph: ƒ.Node;

    constructor(_parent: PanelNode) {
      super(_parent);
      if (_parent instanceof PanelNode && _parent.getNode() != null)
        this.graph = _parent.getNode();
      else {
        this.graph = new ƒ.Node("Scene");
      }
      this.fillContent();
    }
    deconstruct(): void {
      ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.animate);
    }

    fillContent(): void {
      let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
      cmpCamera.pivot.translate(new ƒ.Vector3(3, 2, 1));
      cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
      cmpCamera.projectCentral(1, 45);
      this.canvas = ƒaid.Canvas.create(true, ƒaid.IMAGE_RENDERING.PIXELATED);
      let container: HTMLDivElement = document.createElement("div");
      container.style.borderWidth = "0px";
      document.body.appendChild(this.canvas);
      this.viewport = new ƒ.Viewport();
      this.viewport.initialize("ViewNode_Viewport", this.graph, cmpCamera, this.canvas);
      this.viewport.draw();

      this.content.append(this.canvas);
      ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL);
      ƒ.Physics.start(this.graph); //Starting for empty editor | recalculating physics depending on every transformation right before first draw @author Marko Fehrenbach | HFU 2020

      ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.animate);

      //Focus cameracontrols on new viewport
      let event: CustomEvent = new CustomEvent(EVENT_EDITOR.ACTIVEVIEWPORT, { detail: this.viewport.camera, bubbles: false });
      this.parentPanel.dispatchEvent(event);

      this.canvas.addEventListener("click", this.activeViewport);
    }

    /**
     * Set the root node for display in this view
     * @param _node 
     */
    public setRoot(_node: ƒ.Node): void {
      if (!_node)
        return;
      this.graph = _node;
      this.viewport.setGraph(this.graph);
      ƒ.Physics.start(this.graph); //Starting after new load | recalculating physics depending on every transformation right before first draw @author Marko Fehrenbach | HFU 2020
    }
    /** 
     * Update Viewport every frame
     */
    private animate = (_e: Event) => {
      this.viewport.setGraph(this.graph);
      if (this.canvas.clientHeight > 0 && this.canvas.clientWidth > 0) {
        this.viewport.draw();
        if (ƒ.Physics.world.getBodyList().length >= 1)
          ƒ.Physics.world.simulate(); //added for physics, but should only be called when there is at least 1 RB @author Marko Fehrenbach | HFU 2020
      }
    }

    private activeViewport = (_event: MouseEvent): void => {
      let event: CustomEvent = new CustomEvent(EVENT_EDITOR.ACTIVEVIEWPORT, { detail: this.viewport.camera, bubbles: false });
      this.parentPanel.dispatchEvent(event);

      _event.cancelBubble = true;
    }
  }
}
