namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;
  import ƒaid = FudgeAid;

  export class ViewModellerScene extends View {
    viewport: ƒ.Viewport;
    canvas: HTMLCanvasElement;
    graph: ƒ.Node;

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);
      this.graph = <ƒ.Node><unknown>_state["node"];
      this.createUserInterface();
      new ControllerModeller(this.viewport);
      // this.dom.addEventListener(ƒui.EVENT_USERINTERFACE.SELECT, this.hndEvent);
      // this.dom.addEventListener(EVENT_EDITOR.SET_GRAPH, this.hndEvent);
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

      // ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL);
      // ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.animate);
    } 

    private animate = (_e: Event) => {
      this.viewport.setGraph(this.graph);
      if (this.canvas.clientHeight > 0 && this.canvas.clientWidth > 0)
        this.viewport.draw();
    }

    protected cleanup(): void {
      ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.animate);
    }
  }
}