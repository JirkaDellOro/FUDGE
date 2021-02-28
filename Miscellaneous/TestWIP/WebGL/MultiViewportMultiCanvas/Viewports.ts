namespace RenderRendering {
  import ƒ = FudgeCore;
  

  window.addEventListener("load", init);

  function init(): void {
    // create asset
    let graph: ƒ.Node = Scenes.createAxisCross();
    graph.addComponent(new ƒ.ComponentTransform());


    // initialize viewports
    let posCameras: ƒ.Vector3[] = [new ƒ.Vector3(0.1, 0, 5), new ƒ.Vector3(0.1, 5, 0), new ƒ.Vector3(5, 0.1, 0), new ƒ.Vector3(3, 3, 5)];
    let canvasList: HTMLCollectionOf<HTMLCanvasElement> = document.getElementsByTagName("canvas");
    let viewPorts: ƒ.Viewport[] = [];
    for (let i: number = 0; i < canvasList.length; i++) {
      let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(posCameras[i]);
      cmpCamera.projectCentral(1, 45);
      let viewPort: ƒ.Viewport = new ƒ.Viewport();
      viewPort.initialize(canvasList[i].id, graph, cmpCamera, canvasList[i]);
      viewPorts.push(viewPort);
    }

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, animate);
    ƒ.Loop.start();

    function animate(_event: Event): void {
      graph.mtxLocal.rotateY(1);
      // prepare and draw viewport
      for (let viewPort of viewPorts) {
        //viewPort.prepare();
        viewPort.draw();
      }
    }
  }
}