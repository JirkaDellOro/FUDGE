namespace RaysSceneVR {
  import f = FudgeCore;
  f.Debug.info("Main Program Template running!");

  let xrViewport: f.XRViewport = new f.XRViewport();
  let graph: f.Graph = null;
  let cmpCamera: f.ComponentCamera = null;

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
    cmpCamera = graph.getChildrenByName("Camera")[0].getComponent(f.ComponentCamera);
    cmpCamera.clrBackground = f.Color.CSS("lightsteelblue", 0.25);

    xrViewport.initialize("Viewport", graph, cmpCamera, canvas);


    xrViewport.draw();
    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
    f.Loop.start(f.LOOP_MODE.FRAME_REQUEST);



    checkForVRSupport();
  }
  // check device/browser capabilities for XR Session 
  function checkForVRSupport(): void {
    navigator.xr.isSessionSupported("immersive-vr").then((supported: boolean) => {
      if (supported)
        initializeVR();
      else
        console.log("Session not supported");
    });
  }
  //main function to start XR Session
  function initializeVR(): void {
    //create XR Button -> Browser 
    let enterXRButton: HTMLButtonElement = document.createElement("button");
    enterXRButton.id = "xrButton";
    enterXRButton.innerHTML = "Enter VR";
    document.body.appendChild(enterXRButton);

    enterXRButton.addEventListener("click", async function () {
      //initalizes xr session 
      await xrViewport.initializeVR("immersive-vr", "local", true);
      xrViewport.vr.xrSession.addEventListener("end", onEndSession);

      initializeRays();
      //stop normal loop of winodws.animationFrame
      f.Loop.stop();
      //set xr transform to matrix from ComponentCamera -> xr transform = camera transform
      xrViewport.vr.setNewXRRigidtransform(f.Vector3.DIFFERENCE(f.Vector3.ZERO(), cmpCamera.mtxWorld.translation));
      //start xrSession.animationFrame instead of window.animationFrame, your xr-session is ready to go!
      f.Loop.start(f.LOOP_MODE.FRAME_REQUEST_XR);
    }
    );
  }

  function initializeRays(): void {
    let pickableObjects: f.Node[] = graph.getChildrenByName("CubeContainer")[0].getChildren();
    let rightRayNode = graph.getChildrenByName("raysContainer")[0].getChild(0);
    let leftRayNode = graph.getChildrenByName("raysContainer")[0].getChild(1);
    rightRayNode.addComponent(new RayHelper(xrViewport, xrViewport.vr.rightController, 50, pickableObjects));
    leftRayNode.addComponent(new RayHelper(xrViewport, xrViewport.vr.leftController, 50, pickableObjects));
  }

  function update(_event: Event): void {
    let pickableObjects: f.Node[] = graph.getChildrenByName("CubeContainer")[0].getChildren();

    let ray: f.Ray = new f.Ray(new f.Vector3(0, 0, -1), new f.Vector3(1, 0, 1), 0.1);

    let picker: f.Pick[] = f.Picker.pickRay(pickableObjects, ray, 0, 100000000000000000);
    // console.log(picker.length);
    xrViewport.draw();

  }
  function onEndSession(): void {
    f.Loop.stop();
    f.Loop.start(f.LOOP_MODE.FRAME_REQUEST);
  }
}