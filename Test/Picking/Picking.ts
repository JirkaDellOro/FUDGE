namespace Picking {
  import ƒ = FudgeCore;

  window.addEventListener("load", start);

  async function start(_event: Event): Promise<void> {
    ƒ.Debug.fudge("Start Picking");

    await FudgeCore.Project.loadResourcesFromHTML();
    // pick the graph to show
    let graph: ƒ.Graph = <ƒ.Graph>await ƒ.Project.getResource("Graph|2021-02-03T16:20:47.935Z|07303");
    // setup the viewport
    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.pivot.translateZ(3);
    cmpCamera.pivot.rotateY(180);
    let canvas: HTMLCanvasElement = document.querySelector("canvas");
    let viewport: ƒ.Viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", graph, cmpCamera, canvas);
    // FudgeAid.Viewport.expandCameraToInteractiveOrbit(viewport);
    
    viewport.draw();
  }
}