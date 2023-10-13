namespace ImportOBJ {
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
      // cmpLightDirectional.mtxPivot.rotation = new ƒ.Vector3(cmpCamera.mtxWorld.rotation.x, cmpCamera.mtxWorld.rotation.y, 0);

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
     
    }

    // const selectedFile: number = parseInt(sessionStorage.getItem('selectedFile'));
    // const selection: HTMLSelectElement = document.getElementById("file") as HTMLSelectElement;
    // if (selectedFile != undefined) 
    //   selection.selectedIndex = selectedFile;
    // load(selection);
  }
}


// async function load(_selection: HTMLSelectElement): Promise<void> {
//   // load scene
//   ImportOBJ.loader = await ƒ.GLTFLoader.LOAD(_selection.value);
//   ImportOBJ.loaded = await ImportOBJ.loader.getScene();

//   ImportOBJ.cmpAnimator = ImportOBJ.loaded?.getComponent(ƒ.ComponentAnimator);
//   ImportOBJ.loaded.name = "loaded";
//   // loaded.getComponent(ƒ.ComponentAnimator)?.activate(false);
//   let root: ƒ.Node = ImportOBJ.viewport.getBranch();
//   let loaded: ƒ.Node = root.getChildrenByName("loaded")[0];
//   if (loaded)
//     root.replaceChild(loaded, ImportOBJ.loaded);
//   else
//     root.appendChild(ImportOBJ.loaded);

//   ƒ.Debug.log("Loader:", ImportOBJ.loader);
//   ƒ.Debug.log("Loaded:", ImportOBJ.loaded);

//   // To store the selected option in sessionStorage
//   sessionStorage.setItem('selectedFile', _selection.selectedIndex.toString());
// }

// cube 1
// (-0.50000, 0.50000, 0.50000)
// (-0.50000, -0.50000, -0.50000)
// (-0.50000, -0.50000, 0.50000)
// (-0.50000, 0.50000, -0.50000)
// (0.50000, -0.50000, -0.50000)
// (0.50000, 0.50000, -0.50000)
// (0.50000, -0.50000, 0.50000)
// (0.50000, 0.50000, 0.50000)

// cube 2
// (-0.50000, 0.50000, 0.50000)
// (-0.50000, -0.50000, -0.50000)
// (-0.50000, -0.50000, 0.50000)
// (-0.50000, 0.50000, -0.50000)
// (0.50000, -0.50000, -0.50000)
// (0.50000, 0.50000, -0.50000)
// (0.50000, -0.50000, 0.50000)
// (0.50000, 0.50000, 0.50000)
// (-0.50000, -0.50000, 0.50000)
// (-0.50000, -0.50000, 0.50000)
// (-0.50000, -0.50000, -0.50000)
// (-0.50000, 0.50000, -0.50000)
// (-0.50000, 0.50000, 0.50000)
// (-0.50000, 0.50000, 0.50000)