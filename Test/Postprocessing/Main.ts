namespace PostprocessingTest {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;
  import ƒAid = FudgeAid;

  window.addEventListener("load", init);
  let viewport: ƒ.Viewport;

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
    cmpAmbientOcclusion.activate(false);
    cmpCamera.node.addComponent(cmpAmbientOcclusion);

    let cmpBloom: ƒ.ComponentBloom = new ƒ.ComponentBloom();
    cmpBloom.activate(false);
    cmpCamera.node.addComponent(cmpBloom);

    let cmpFog: ƒ.ComponentFog = new ƒ.ComponentFog();
    cmpFog.activate(false);
    cmpCamera.node.addComponent(cmpFog);

    let ui: HTMLElement = document.getElementById("ui");

    let uiAmbientOcclusion: HTMLElement = ƒui.Generator.createDetailsFromMutable(cmpAmbientOcclusion);
    new ƒui.Controller(cmpAmbientOcclusion, uiAmbientOcclusion);
    ui.appendChild(uiAmbientOcclusion);

    let uiBloom: HTMLElement = ƒui.Generator.createDetailsFromMutable(cmpBloom);
    new ƒui.Controller(cmpBloom, uiBloom);
    ui.appendChild(uiBloom);

    let uiFog: HTMLElement = ƒui.Generator.createDetailsFromMutable(cmpFog);
    new ƒui.Controller(cmpFog, uiFog);
    ui.appendChild(uiFog);
    
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();

    function update(_event: Event): void {
      viewport.draw();
    }
  }
}