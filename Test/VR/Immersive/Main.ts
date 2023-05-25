namespace ImmersiveSceneVR {
  import f = FudgeCore;
  f.Debug.info("Main Program Template running!");

  let xrViewport: f.XRViewport = new f.XRViewport();
  let graph: f.Graph = null;
  let cmpVRDevice: f.ComponentVRDevice = null;
  window.addEventListener("load", init);

  async function init() {
    await FudgeCore.Project.loadResources("Internal.json");
    graph = <f.Graph>f.Project.resources[document.head.querySelector("meta[autoView]").getAttribute("autoView")];
    FudgeCore.Debug.log("Graph:", graph);
    if (!graph) {
      alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
      return;
    }
    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector("canvas");
    cmpVRDevice = graph.getChildrenByName("Camera")[0].getComponent(f.ComponentVRDevice);
    cmpVRDevice.clrBackground = f.Color.CSS("lightsteelblue", 0.25);

    xrViewport.initialize("Viewport", graph, cmpVRDevice, canvas);


    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
    f.Loop.start(f.LOOP_MODE.FRAME_REQUEST);

    checkForVRSupport();
  }
  // check device/browser capabilities for XR Session 
  function checkForVRSupport(): void {
    navigator.xr.isSessionSupported(f.XR_SESSION_MODE.IMMERSIVE_VR).then((supported: boolean) => {
      if (supported)
        setupVR();
      else
        console.log("Session not supported");
    });
  }
  //main function to start XR Session
  function setupVR(): void {
    //create XR Button -> Browser 
    let enterXRButton: HTMLButtonElement = document.createElement("button");
    enterXRButton.id = "xrButton";
    enterXRButton.innerHTML = "Enter VR";
    document.body.appendChild(enterXRButton);

    enterXRButton.addEventListener("click", async function () {
      //initalizes xr session 
      if (!xrViewport.session) {
        await xrViewport.initializeVR(f.XR_SESSION_MODE.IMMERSIVE_VR, f.XR_REFERENCE_SPACE.LOCAL, true);
        xrViewport.session.addEventListener("end", onEndSession);
      }

      //stop normal loop of winodws.animationFrame
      f.Loop.stop();
      //starts xr-session.animationFrame instead of window.animationFrame, your xr-session is ready to go!
      f.Loop.start(f.LOOP_MODE.FRAME_REQUEST_XR);
    }
    );
  }

  function update(_event: Event): void {
    // f.Physics.simulate();  // if physics is included and used
    xrViewport.draw();
  }
  function onEndSession(): void {
    f.Loop.stop();
    f.Loop.start(f.LOOP_MODE.FRAME_REQUEST);
  }
}