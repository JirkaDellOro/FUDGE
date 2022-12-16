var PhysicsVR;
(function (PhysicsVR) {
    var f = FudgeCore;
    let xrViewport = new f.XRViewport();
    let graph = null;
    let cmpCamera = null;
    let rightController = null;
    let leftController = null;
    PhysicsVR.cubeContainer = null;
    let cubeGraph = null;
    let spawnTime = 0;
    let spawnTrigger = 600;
    let cubeInstances = new Array();
    window.addEventListener("load", init);
    async function init() {
        await FudgeCore.Project.loadResources("Internal.json");
        graph = f.Project.resources[document.head.querySelector("meta[autoView]").getAttribute("autoView")];
        cubeGraph = f.Project.resources["Graph|2022-12-07T15:00:44.501Z|51271"];
        FudgeCore.Debug.log("Graph:", graph);
        if (!graph) {
            alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
            return;
        }
        let canvas = document.querySelector("canvas");
        cmpCamera = graph.getChildrenByName("Camera")[0].getComponent(f.ComponentCamera);
        xrViewport.physicsDebugMode = f.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
        xrViewport.initialize("Viewport", graph, cmpCamera, canvas);
        rightController = graph.getChildrenByName("rightController")[0];
        leftController = graph.getChildrenByName("leftController")[0];
        PhysicsVR.cubeContainer = graph.getChildrenByName("cubeContainer")[0];
        for (let i = 0; i <= 150; i++) {
            cubeInstances[i] = await f.Project.createGraphInstance(cubeGraph);
        }
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Loop.start(f.LOOP_MODE.FRAME_REQUEST, 60);
        checkForVRSupport();
    }
    // check device/browser capabilities for VR Session 
    function checkForVRSupport() {
        navigator.xr.isSessionSupported(f.VRSESSIONMODE.IMMERSIVEVR).then((supported) => {
            if (supported)
                setupVR();
            else
                console.log("Session not supported");
        });
    }
    //main function to start VR Session
    function setupVR() {
        //create XR Button -> Browser  //!important: look up the css file.
        let enterXRButton = document.createElement("button");
        enterXRButton.id = "xrButton";
        enterXRButton.innerHTML = "Enter VR";
        document.body.appendChild(enterXRButton);
        enterXRButton.addEventListener("click", async function () {
            //initalizes xr session 
            if (!xrViewport.vr.session) {
                await xrViewport.initializeVR(f.VRSESSIONMODE.IMMERSIVEVR, f.VRREFERENCESPACE.LOCAL, true);
                //triggers onEndSession function with user exits xr session
                xrViewport.vr.session.addEventListener("end", onEndSession);
            }
            //stop normal loop of winodws.animationFrame
            f.Loop.stop();
            //set controllers matrix information to component transform from node controller made in FUDGE Editor
            rightController.getComponent(f.ComponentTransform).mtxLocal = xrViewport.vr.rController.cntrlTransform.mtxLocal;
            leftController.getComponent(f.ComponentTransform).mtxLocal = xrViewport.vr.lController.cntrlTransform.mtxLocal;
            //set xr rigid transform to rot&pos of ComponentCamera
            xrViewport.vr.addXRRigidPos(cmpCamera.mtxWorld.translation);
            xrViewport.vr.addXRRigidRot(f.Vector3.SCALE(cmpCamera.mtxPivot.rotation, Math.PI / 180));
            //start xrSession.animationFrame instead of window.animationFrame, your xr-session is ready to go!
            f.Loop.start(f.LOOP_MODE.FRAME_REQUEST_XR, 60);
        });
    }
    let increment = 0;
    let spawnAmount = 0;
    function update(_event) {
        f.Physics.simulate();
        xrViewport.draw();
        if (xrViewport.vr.session && increment != cubeInstances.length) {
            spawnTime += 4;
            if (spawnTime == spawnTrigger) {
                spawnTime = 0;
                PhysicsVR.Translator.speed += 0.0002;
                spawnTrigger -= 4;
                for (let i = 0; i <= spawnAmount; i++) {
                    cubeInstances[increment].getComponent(f.ComponentMaterial).clrPrimary = new f.Color(f.Random.default.getRange(0, 1), f.Random.default.getRange(0, 1), f.Random.default.getRange(0, 1), 1);
                    cubeInstances[increment].mtxLocal.translation = new f.Vector3(f.Random.default.getRange(-2, 2), f.Random.default.getRange(-0.5, 0.5), f.Random.default.getRange(-2, 2));
                    PhysicsVR.cubeContainer.appendChild(cubeInstances[increment]);
                    increment++;
                }
                spawnAmount += 0.15;
            }
        }
    }
    function onEndSession() {
        f.Loop.stop();
        f.Loop.start(f.LOOP_MODE.FRAME_REQUEST);
    }
})(PhysicsVR || (PhysicsVR = {}));
//# sourceMappingURL=Main.js.map