var AudioSceneVR;
(function (AudioSceneVR) {
    var f = FudgeCore;
    f.Debug.info("Main Program Template running!");
    let xrViewport = new f.XRViewport();
    let graph = null;
    let cmpCamera = null;
    let audioLeft = null;
    let audioRight = null;
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
        setupAudio();
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Loop.start(f.LOOP_MODE.FRAME_REQUEST);
        checkForVRSupport();
    }
    // check device/browser capabilities for XR Session 
    function checkForVRSupport() {
        navigator.xr.isSessionSupported(f.VRSESSIONMODE.IMMERSIVEVR).then((supported) => {
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
            audioLeft.play(true);
            audioRight.play(true);
            //initalizes xr session 
            if (!xrViewport.vr.session) {
                await xrViewport.initializeVR(f.VRSESSIONMODE.IMMERSIVEVR, f.VRREFERENCESPACE.LOCAL, true);
                xrViewport.vr.session.addEventListener("select", onSelect);
                xrViewport.vr.session.addEventListener("squeeze", onSqueeze);
                xrViewport.vr.session.addEventListener("end", onEndSession);
            }
            //stop normal loop of winodws.animationFrame
            f.Loop.stop();
            //set xr transform to matrix from ComponentCamera -> xr transform = camera transform
            console.log(cmpCamera.mtxWorld.toString());
            //set xr rigid transform to rot&pos of ComponentCamera
            xrViewport.vr.addXRRigidPos(cmpCamera.mtxWorld.translation);
            xrViewport.vr.addXRRigidRot(f.Vector3.SCALE(cmpCamera.mtxPivot.rotation, Math.PI / 180));
            //start xrSession.animationFrame instead of window.animationFrame, your xr-session is ready to go!
            f.Loop.start(f.LOOP_MODE.FRAME_REQUEST_XR);
        });
    }
    function setupAudio() {
        f.AudioManager.default.listenTo(graph);
        f.AudioManager.default.listenWith(cmpCamera.node.getComponent(f.ComponentAudioListener));
        audioLeft = graph.getChildrenByName("AudioL")[0].getComponent(f.ComponentAudio);
        audioRight = graph.getChildrenByName("AudioR")[0].getComponent(f.ComponentAudio);
    }
    function onSelect(_event) {
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
    function onSqueeze(_event) {
        if (_event.inputSource.handedness == "right") {
            if (audioRight.node.getComponent(AudioSceneVR.Translator).isTranslating)
                audioRight.node.getComponent(AudioSceneVR.Translator).isTranslating = false;
            else
                audioRight.node.getComponent(AudioSceneVR.Translator).isTranslating = true;
        }
        if (_event.inputSource.handedness == "left") {
            if (audioLeft.node.getComponent(AudioSceneVR.Translator).isTranslating)
                audioLeft.node.getComponent(AudioSceneVR.Translator).isTranslating = false;
            else
                audioLeft.node.getComponent(AudioSceneVR.Translator).isTranslating = true;
        }
    }
    function update(_event) {
        xrViewport.draw();
        f.AudioManager.default.update();
    }
    function onEndSession() {
        f.Loop.stop();
        f.Loop.start(f.LOOP_MODE.FRAME_REQUEST);
    }
})(AudioSceneVR || (AudioSceneVR = {}));
//# sourceMappingURL=Main.js.map