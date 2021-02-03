namespace Picking {
  import ƒ = FudgeCore;

  window.addEventListener("load", start);
  let cmpCamera: ƒ.ComponentCamera;
  let viewport: ƒ.Viewport;

  let mouse: ƒ.Vector2 = new ƒ.Vector2();

  async function start(_event: Event): Promise<void> {
    ƒ.Debug.fudge("Start Picking");

    await FudgeCore.Project.loadResourcesFromHTML();
    let canvas: HTMLCanvasElement = document.querySelector("canvas");
    canvas.addEventListener("mousemove", setCursorPosition);

    // pick the graph to show
    let graph: ƒ.Graph = <ƒ.Graph>await ƒ.Project.getResource("Graph|2021-02-03T16:20:47.935Z|07303");

    // setup the viewport
    cmpCamera = new ƒ.ComponentCamera();
    cmpCamera.pivot.translateZ(300);
    cmpCamera.pivot.rotateY(180);
    viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", graph, cmpCamera, canvas);
    // FudgeAid.Viewport.expandCameraToInteractiveOrbit(viewport);

    viewport.draw();

    viewport.createPickBuffers();
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, animate);
    ƒ.Loop.start();

    function animate(_event: Event): void {
      viewport.draw();
      adjustRayCamera();
      pickNodeAt(mouse);

      // let color: ƒ.Color = getPixelColor(mouse);           
    }
  }
  function pickNodeAt(_pos: ƒ.Vector2): void {
    let posRender: ƒ.Vector2 = viewport.pointClientToRender(
      new ƒ.Vector2(_pos.x, viewport.getClientRectangle().height - _pos.y)
    );
    let output: HTMLOutputElement = document.querySelector("output");

    console.group("Hit");
    let hits: ƒ.RayHit[] = viewport.pickNodeAt(posRender);
    for (let hit of hits)
      console.log(hit.node.name + ":" + hit.zBuffer);
    console.groupEnd();
  }

  function adjustRayCamera(): void {
    // ƒ.Debug.group("Ray");

    let ray: ƒ.Ray = computeRay();
    // ƒ.Debug.log(ray.direction.toString());

    ray.direction.transform(cmpCamera.pivot);
    // ƒ.Debug.log(ray.direction.toString());

    // ƒ.Debug.groupEnd();
  }

  function computeRay(): ƒ.Ray {
    // let posMouse: ƒ.Vector2 = ƒ.Vector2.DIFFERENCE(mouse, new ƒ.Vector2(rect.width / 2, rect.height / 2));
    // posMouse.y *= -1;
    let posMouse: ƒ.Vector2 = mouse.copy;
    // setUiPoint("Client", posMouse);

    let posRender: ƒ.Vector2 = viewport.pointClientToRender(posMouse);
    // setUiPoint("Render", posRender);

    let rect: ƒ.Rectangle = viewport.getClientRectangle();
    let result: ƒ.Vector2;
    result = viewport.frameClientToCanvas.getPoint(posMouse, rect);
    // setUiPoint("Canvas", result);
    rect = viewport.getCanvasRectangle();
    result = viewport.frameCanvasToDestination.getPoint(result, rect);
    // setUiPoint("Destination", result);
    result = viewport.frameDestinationToSource.getPoint(result, viewport.rectSource);
    // setUiPoint("Source", result);
    //TODO: when Source, Render and RenderViewport deviate, continue transformation 

    let posProjection: ƒ.Vector2 = viewport.pointClientToProjection(posMouse);
    // let rectProjection: ƒ.Rectangle = cmpCamera.getProjectionRectangle();
    // setUiPoint("Projection", posProjection);

    let ray: ƒ.Ray = new ƒ.Ray(new ƒ.Vector3(-posProjection.x, posProjection.y, 1));

    // ray = viewport.getRayFromScreenPoint(posMouse);
    return ray;
  }

  function setCursorPosition(_event: MouseEvent): void {
    mouse = new ƒ.Vector2(_event.clientX, _event.clientY);
  }

}