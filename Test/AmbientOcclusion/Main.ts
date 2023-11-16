namespace AmbientOcclusionTest {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;
  import ƒAid = FudgeAid;

  window.addEventListener("load", init);
  export let viewport: ƒ.Viewport;
  export let loader: ƒ.GLTFLoader;
  export let loaded: ƒ.Node;
  export let cmpAnimator: ƒ.ComponentAnimator;

  async function init(): Promise<void> {
    let graphId: string = document.head.querySelector("meta[autoView]").getAttribute("autoView");
    // load resources referenced in the link-tag
    await ƒ.Project.loadResourcesFromHTML();
    ƒ.Debug.log("Project:", ƒ.Project.resources);
    // pick the graph to show
    let graph: ƒ.Graph = <ƒ.Graph>ƒ.Project.resources[graphId];
    ƒ.Debug.log("Graph:", graph);
    if (!graph) {
      alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
      return;
    }
    // setup the viewport
    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    
    // cmpCamera.clrBackground = ƒ.Color.CSS("SKYBLUE");
    let canvas: HTMLCanvasElement = document.querySelector("canvas");
    viewport = new ƒ.Viewport();
    viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
    ƒ.Debug.log("Viewport:", viewport);
    // hide the cursor when interacting, also suppressing right-click menu
    canvas.addEventListener("mousedown", canvas.requestPointerLock);
    canvas.addEventListener("mouseup", function () { document.exitPointerLock(); });
    // make the camera interactive (complex method in ƒAid)
    ƒAid.Viewport.expandCameraToInteractiveOrbit(viewport);

    let cmpAmbientOcclusion: ƒ.ComponentAmbientOcclusion = new ƒ.ComponentAmbientOcclusion();
    cmpCamera.node.addComponent(cmpAmbientOcclusion);

    let ui: HTMLDivElement = ƒui.Generator.createInterfaceFromMutable(cmpAmbientOcclusion);
    let controller: ƒui.Controller = new ƒui.Controller(cmpAmbientOcclusion, ui);
    document.body.appendChild(ui);

    let fpsSpan: HTMLSpanElement = document.getElementById("fps") as HTMLElement;

    let lastUpdateTime: number = 0;
    const updateInterval: number = 200;

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();

    function update(_event: Event): void {
      if (ƒ.Loop.timeFrameStartReal - lastUpdateTime > updateInterval) {
        fpsSpan.innerText = "FPS: " + ƒ.Loop.fpsRealAverage.toFixed(0);
        lastUpdateTime = ƒ.Loop.timeFrameStartReal;
      }

      viewport.draw();
    }
  }
}