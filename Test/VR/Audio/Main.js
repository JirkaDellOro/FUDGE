var AudioSceneVR;
(function (AudioSceneVR) {
    var f = FudgeCore;
    f.Debug.info("Main Program Template running!");
    let xrViewport = new f.XRViewport();
    let graph = null;
    let cmpVRDevice = null;
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
        cmpVRDevice = graph.getChildrenByName("Camera")[0].getComponent(f.ComponentVRDevice);
        cmpVRDevice.clrBackground = f.Color.CSS("lightsteelblue", 0.25);
        xrViewport.initialize("Viewport", graph, cmpVRDevice, canvas);
        setupAudio();
        f.Loop.addEventListener("loopFrame" /* f.EVENT.LOOP_FRAME */, update);
        f.Loop.start(f.LOOP_MODE.FRAME_REQUEST);
        checkForVRSupport();
    }
    // check device/browser capabilities for XR Session 
    function checkForVRSupport() {
        navigator.xr.isSessionSupported(f.XR_SESSION_MODE.IMMERSIVE_VR).then((_supported) => {
            if (_supported)
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
        });
    }
    function setupAudio() {
        f.AudioManager.default.listenTo(graph);
        f.AudioManager.default.listenWith(cmpVRDevice.node.getComponent(f.ComponentAudioListener));
        audioLeft = graph.getChildrenByName("AudioL")[0].getComponent(f.ComponentAudio);
        audioRight = graph.getChildrenByName("AudioR")[0].getComponent(f.ComponentAudio);
    }
    function onSelect(_event) {
        let cmpAudio = _event.inputSource.handedness == "right" ? audioRight : _event.inputSource.handedness == "left" ? audioLeft : null;
        let color = _event.inputSource.handedness == "right" ? f.Color.CSS("lime") : _event.inputSource.handedness == "left" ? f.Color.CSS("red") : null;
        console.log(_event.inputSource.handedness + " " + !cmpAudio?.isPlaying);
        if (cmpAudio)
            cmpAudio.play(!cmpAudio.isPlaying);
        if (color)
            cmpAudio.node.getComponent(f.ComponentMaterial).clrPrimary = cmpAudio.isPlaying ? color : f.Color.CSS("white");
    }
    function onSqueeze(_event) {
        console.log(_event.inputSource.handedness);
        let translator = (_event.inputSource.handedness == "right" ? audioRight.node : _event.inputSource.handedness == "left" ? audioLeft.node : null)?.getComponent(AudioSceneVR.Translator);
        if (translator)
            translator.isTranslating = !translator.isTranslating;
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