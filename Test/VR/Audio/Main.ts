namespace AudioSceneVR {
  import f = FudgeCore;
  f.Debug.info("Main Program Template running!");

  let xrViewport: f.XRViewport = new f.XRViewport();
  let graph: f.Graph = null;
  let cmpVRDevice: f.ComponentVRDevice = null;
  let audioLeft: f.ComponentAudio = null;
  let audioRight: f.ComponentAudio = null;

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
    setupAudio();


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
      audioLeft.play(true);
      audioRight.play(true);

      //initalizes xr session 
      if (!xrViewport.session) {
        await xrViewport.initializeVR(f.XR_SESSION_MODE.IMMERSIVE_VR, f.XR_REFERENCE_SPACE.LOCAL, true);

        xrViewport.session.addEventListener("select", onSelect);
        xrViewport.session.addEventListener("squeeze", onSqueeze);

        xrViewport.session.addEventListener("end", onEndSession);
      }
      //stop normal loop of winodws.animationFrame
      f.Loop.stop();



      //starts xr-session.animationFrame instead of window.animationFrame, your xr-session is ready to go!
      f.Loop.start(f.LOOP_MODE.FRAME_REQUEST_XR);
    }
    );
  }
  function setupAudio(): void {
    f.AudioManager.default.listenTo(graph);
    f.AudioManager.default.listenWith(cmpVRDevice.node.getComponent(f.ComponentAudioListener));
    audioLeft = graph.getChildrenByName("AudioL")[0].getComponent(f.ComponentAudio);
    audioRight = graph.getChildrenByName("AudioR")[0].getComponent(f.ComponentAudio);
  }
  function onSelect(_event: XRInputSourceEvent): void {
    console.log(_event.inputSource.handedness);
    if (_event.inputSource.handedness == "right") {
      if (audioRight.isPlaying)
        audioRight.play(false);
      else
        audioRight.play(true);
    }
    if (_event.inputSource.handedness == "left") {
      if (audioLeft.isPlaying)
        audioLeft.play(false);
      else
        audioLeft.play(true);

    }
  }
  function onSqueeze(_event: XRInputSourceEvent): void {
    if (_event.inputSource.handedness == "right") {
      if (audioRight.node.getComponent(Translator).isTranslating)
        audioRight.node.getComponent(Translator).isTranslating = false;
      else
        audioRight.node.getComponent(Translator).isTranslating = true;
    }
    if (_event.inputSource.handedness == "left") {
      if (audioLeft.node.getComponent(Translator).isTranslating)
        audioLeft.node.getComponent(Translator).isTranslating = false;
      else
        audioLeft.node.getComponent(Translator).isTranslating = true;
    }
  }
  function update(_event: Event): void {
    xrViewport.draw();
    f.AudioManager.default.update();
  }
  function onEndSession(): void {
    f.Loop.stop();
    f.Loop.start(f.LOOP_MODE.FRAME_REQUEST);
  }
}