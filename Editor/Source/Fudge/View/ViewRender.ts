namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;
  import ƒaid = FudgeAid;

  /**
   * View the rendering of a graph in a viewport with an independent camera
   * @author Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class ViewRender extends View {
    viewport: ƒ.Viewport;
    canvas: HTMLCanvasElement;
    graph: ƒ.Node;

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);
      this.graph = <ƒ.Node><unknown>_state["node"];
      this.createUserInterface();
    }

    cleanup(): void {
      ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.animate);
    }

    createUserInterface(): void {
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

      this.dom.append(this.canvas);

      ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL);
      ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.animate);

      //Focus cameracontrols on new viewport
      let event: CustomEvent = new CustomEvent(EVENT_EDITOR.ACTIVEVIEWPORT, { detail: this.viewport.camera, bubbles: false });

      this.canvas.addEventListener("click", this.activeViewport);
    }

    public setRoot(_node: ƒ.Node): void {
      if (!_node)
        return;
      this.graph = _node;
      this.viewport.setGraph(this.graph);

    }
    
    private animate = (_e: Event) => {
      this.viewport.setGraph(this.graph);
      if (this.canvas.clientHeight > 0 && this.canvas.clientWidth > 0)
        this.viewport.draw();
    }
    
    private activeViewport = (_event: MouseEvent): void => {
      let event: CustomEvent = new CustomEvent(EVENT_EDITOR.ACTIVEVIEWPORT, { detail: this.viewport.camera, bubbles: false });
      _event.cancelBubble = true;
    }
  }
}
