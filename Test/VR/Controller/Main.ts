namespace ControllerSceneVR {
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
    enterXRButton.style.position = "absolute";
    enterXRButton.style.zIndex = "1000";
    document.body.appendChild(enterXRButton);

    enterXRButton.addEventListener("click", async function () {
      //initalizes xr session 
      if (!xrViewport.session) {
        await xrViewport.initializeVR(f.XR_SESSION_MODE.IMMERSIVE_VR, f.XR_REFERENCE_SPACE.LOCAL, true);
        xrViewport.session.addEventListener("end", onEndSession);
      }
      initializeController();

      //stop normal loop of winodws.animationFrame
      f.Loop.stop();

      //starts xr-session.animationFrame instead of window.animationFrame, your xr-session is ready to go!
      f.Loop.start(f.LOOP_MODE.FRAME_REQUEST_XR);
    }
    );
  }

  function initializeController(): void {
    let rightCntrl = graph.getChildrenByName("ControllerRight")[0];
    let leftCntrl = graph.getChildrenByName("ControllerLeft")[0];
    rightCntrl.addComponent(new Controller(xrViewport, xrViewport.vrDevice.rightCntrl));
    leftCntrl.addComponent(new Controller(xrViewport, xrViewport.vrDevice.leftCntrl));
  }

  function update(_event: Event): void {
    xrViewport.draw();

  }
  function onEndSession(): void {
    f.Loop.stop();
    f.Loop.start(f.LOOP_MODE.FRAME_REQUEST);
  }
























  // function onSqueeze(_event: XRInputSourceEvent): void {
  //     if (actualTeleportationObj) {
  //         let newPos: f.Vector3 = f.Vector3.DIFFERENCE(cmpCamera.mtxWorld.translation, actualTeleportationObj.getComponent(f.ComponentTransform).mtxLocal.translation);
  //         newPos.y -= 0.5;
  //         xrViewport.vr.setNewXRRigidtransform(newPos);
  //         actualTeleportationObj.getComponent(f.ComponentMaterial).clrPrimary.a = 0.5;
  //         actualTeleportationObj = null;
  //     }
  // }

  // function onSelectStart(_event: XRInputSourceEvent): void {
  //     if (actualThrowObject) {
  //         if (_event.inputSource.handedness == "right") {
  //             selectPressedRight = true;
  //         }
  //         if (_event.inputSource.handedness == "left") {
  //             selectPressedLeft = true;
  //         }
  //     }
  // }

  // function onSelectEnd(_event: XRInputSourceEvent): void {
  //     if (actualThrowObject) {
  //         if (_event.inputSource.handedness == "right") {
  //             actualThrowObject.getComponent(f.ComponentRigidbody).setVelocity(f.Vector3.ZERO());
  //             let velocity: f.Vector3 = f.Vector3.DIFFERENCE(rightController.mtxLocal.translation, cmpCamera.mtxPivot.translation);
  //             velocity.scale(20);
  //             actualThrowObject.getComponent(f.ComponentRigidbody).addVelocity(velocity);
  //             actualThrowObject.getComponent(f.ComponentMaterial).clrPrimary.a = 0.5;
  //             actualThrowObject = null;
  //             selectPressedRight = false;
  //         } else {
  //             actualThrowObject.getComponent(f.ComponentRigidbody).setVelocity(f.Vector3.ZERO());
  //             let direction: f.Vector3 = f.Vector3.DIFFERENCE(leftController.mtxLocal.translation, cmpCamera.mtxPivot.translation);
  //             direction.scale(20);
  //             actualThrowObject.getComponent(f.ComponentRigidbody).addVelocity(direction);
  //             actualThrowObject.getComponent(f.ComponentMaterial).clrPrimary.a = 0.5;
  //             actualThrowObject = null;
  //             selectPressedLeft = false;
  //         }
  //     }

  // }
}