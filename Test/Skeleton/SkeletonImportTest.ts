namespace SkeletonTest {
  import ƒ = FudgeCore;
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

    graph.addChild(new ƒ.Node("placeholder"));

    let timeSpan: HTMLSpanElement = document.getElementById("time") as HTMLElement;
    let fpsSpan: HTMLSpanElement = document.getElementById("fps") as HTMLElement;
    let gPressed: boolean = false;
    let iShader: number = 0;
    const shaders: typeof ƒ.Shader[] = [ƒ.ShaderFlatSkin, ƒ.ShaderGouraudSkin, ƒ.ShaderPhongSkin];

    let lastUpdateTime: number = 0;
    const updateInterval: number = 200;

    let cmpLightDirectional: ƒ.ComponentLight = graph.getChildrenByName("Light")[0]?.getComponents(ƒ.ComponentLight)?.find((_cmp: ƒ.ComponentLight) => _cmp.light instanceof ƒ.LightDirectional);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();

    function update(_event: Event): void {
      cmpLightDirectional.mtxPivot.rotation = new ƒ.Vector3(cmpCamera.mtxWorld.rotation.x, cmpCamera.mtxWorld.rotation.y, 0);

      const setShader: (_shader: typeof ƒ.Shader) => void = _shader => {
        for (const node of graph) {
          if (node.getComponent(ƒ.ComponentMaterial))
            node.getComponent(ƒ.ComponentMaterial).material.setShader(_shader);
        }
      };
      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.G])) {
        if (!gPressed) {
          gPressed = true;
          setShader(shaders[iShader = (iShader + 1) % shaders.length]);
        }
      } else
        gPressed = false;
      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.H])) setShader(ƒ.ShaderPhong);

      if (ƒ.Loop.timeFrameStartReal - lastUpdateTime > updateInterval) {
        fpsSpan.innerText = "FPS: " + ƒ.Loop.fpsRealAverage.toFixed(0);
        lastUpdateTime = ƒ.Loop.timeFrameStartReal;
      }

      if (loaded?.getComponent(ƒ.ComponentAnimator))
        timeSpan.innerText = "TIME: " + loaded?.getComponent(ƒ.ComponentAnimator).time.toFixed(0);

      viewport.draw();
    }

    document.addEventListener("keydown", hndKeydown);

    function hndKeydown(_event: KeyboardEvent): void {
      switch (_event.code) {
        case ƒ.KEYBOARD_CODE.SPACE:
          cmpAnimator?.jumpTo(0);
          break;
        case ƒ.KEYBOARD_CODE.P:
          ƒ.Time.game.setScale(ƒ.Time.game.getScale() == 0 ? 1 : 0);
          break;
        case ƒ.KEYBOARD_CODE.D:
          cmpAnimator?.jumpTo(cmpAnimator.time + 50);
          break;
        case ƒ.KEYBOARD_CODE.A:
          cmpAnimator?.jumpTo(cmpAnimator.time - 50);
          break;
        case ƒ.KEYBOARD_CODE.W:
          ƒ.Time.game.setScale(ƒ.Time.game.getScale() * 2);
          break;
        case ƒ.KEYBOARD_CODE.S:
          ƒ.Time.game.setScale(ƒ.Time.game.getScale() / 2);
          break;
        case ƒ.KEYBOARD_CODE.L:
          console.log(loaded.getChild(0)?.mtxWorld.toString());
          break;
      }
    }

    const selectedFile: number = parseInt(sessionStorage.getItem('selectedFile'));
    const selection: HTMLSelectElement = document.getElementById("file") as HTMLSelectElement;
    if (selectedFile != undefined) 
      selection.selectedIndex = selectedFile;
    load(selection);
  }
}


async function load(_selection: HTMLSelectElement): Promise<void> {
  // load scene
  SkeletonTest.loader = await ƒ.GLTFLoader.LOAD(_selection.value);
  SkeletonTest.loaded = await SkeletonTest.loader.getScene();

  SkeletonTest.cmpAnimator = SkeletonTest.loaded?.getComponent(ƒ.ComponentAnimator);
  SkeletonTest.loaded.name = "loaded";
  // loaded.getComponent(ƒ.ComponentAnimator)?.activate(false);
  let root: ƒ.Node = SkeletonTest.viewport.getBranch();
  let loaded: ƒ.Node = root.getChildrenByName("loaded")[0];
  if (loaded)
    root.replaceChild(loaded, SkeletonTest.loaded);
  else
    root.appendChild(SkeletonTest.loaded);

  ƒ.Debug.log("Loader:", SkeletonTest.loader);
  ƒ.Debug.log("Loaded:", SkeletonTest.loaded);

  // To store the selected option in sessionStorage
  sessionStorage.setItem('selectedFile', _selection.selectedIndex.toString());
}