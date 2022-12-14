var RaySceneVR;
(function (RaySceneVR) {
    var f = FudgeCore;
    f.Debug.info("Main Program Template running!");
    let xrViewport = new f.XRViewport();
    let graph = null;
    let cmpCamera = null;
    window.addEventListener("load", init);
    async function init() {
        await FudgeCore.Project.loadResources("Internal.json");
        graph = f.Project.resources[document.head.querySelector("meta[autoView]").getAttribute("autoView")];
        FudgeCore.Debug.log("Graph:", graph);
        if (!graph) {
            alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
            return;
        }
        let canvas = document.querySelector("canvas");
        cmpCamera = graph.getChildrenByName("Camera")[0].getComponent(f.ComponentCamera);
        cmpCamera.clrBackground = f.Color.CSS("lightsteelblue", 0.25);
        xrViewport.initialize("Viewport", graph, cmpCamera, canvas);
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Loop.start(f.LOOP_MODE.FRAME_REQUEST);
        checkForVRSupport();
    }
    // check device/browser capabilities for XR Session 
    function checkForVRSupport() {
        navigator.xr.isSessionSupported(f.VRSessionMode.IMMERSIVEVR).then((supported) => {
            if (supported)
                setupVR();
            else
                console.log("Session not supported");
        });
    }
    //main function to start XR Session
    function setupVR() {
        //create XR Button -> Browser 
        let enterXRButton = document.createElement("button");
        enterXRButton.id = "xrButton";
        enterXRButton.innerHTML = "Enter VR";
        document.body.appendChild(enterXRButton);
        enterXRButton.addEventListener("click", async function () {
            //initalizes xr session 
            if (!xrViewport.vr.session) {
                await xrViewport.initializeVR(f.VRReferenceSpaceType.LOCAL, true);
                xrViewport.vr.session.addEventListener("end", onEndSession);
            }
            initializeController();
            //stop normal loop of winodws.animationFrame
            f.Loop.stop();
            //set xr transform to matrix from ComponentCamera -> xr transform = camera transform
            xrViewport.vr.setNewXRRigidtransform(f.Vector3.DIFFERENCE(f.Vector3.ZERO(), cmpCamera.mtxWorld.translation));
            //start xrSession.animationFrame instead of window.animationFrame, your xr-session is ready to go!
            f.Loop.start(f.LOOP_MODE.FRAME_REQUEST_XR);
        });
    }
    function initializeController() {
        let rightCntrl = graph.getChildrenByName("ControllerRight")[0];
        let leftCntrl = graph.getChildrenByName("ControllerLeft")[0];
        rightCntrl.addComponent(new RaySceneVR.Controller(xrViewport, xrViewport.vr.rController));
        leftCntrl.addComponent(new RaySceneVR.Controller(xrViewport, xrViewport.vr.lController));
    }
    function update(_event) {
        xrViewport.draw();
    }
    function onEndSession() {
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
})(RaySceneVR || (RaySceneVR = {}));
//# sourceMappingURL=Main.js.map