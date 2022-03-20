var FudgeExperiments_Marko_ConvexColliderThroughWelding;
(function (FudgeExperiments_Marko_ConvexColliderThroughWelding) {
    var f = FudgeCore;
    // In a Test there could be about 100 Chairs and still maintain 15+ FPS, resulting in 600 RB's and 500 Joints calculated per Frame.
    //Fudge Basic Variables
    window.addEventListener("load", init);
    const app = document.querySelector("canvas"); // The html element where the scene is drawn to
    let viewPort; // The scene visualization
    let hierarchy; // You're object scene tree
    let fps;
    const times = [];
    let fpsDisplay = document.querySelector("h2#FPS");
    //Physical Objects
    let bodies = new Array(); // Array of all physical objects in the scene to have a quick reference
    let noChairs = 0;
    //Setting Variables
    //Function to initialize the Fudge Scene with a camera, light, viewport and PHYSCIAL Objects
    function init(_event) {
        hierarchy = new f.Node("Scene"); //create the root Node where every object is parented to. Should never be changed
        //PHYSICS - Basic Plane and Cube
        //Creating a physically static ground plane for our physics playground. A simple scaled cube but with physics type set to static
        bodies[0] = createCompleteNode("Ground", new f.Material("Ground", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.2, 0.2, 0.2, 1))), new f.MeshCube(), 0, f.BODY_TYPE.STATIC);
        bodies[0].mtxLocal.scale(new f.Vector3(14, 0.3, 14)); //Scale the body with it's standard ComponentTransform
        bodies[0].mtxLocal.rotateX(3, true); //Give it a slight rotation so the physical objects are sliding, always from left when it's after a scaling
        hierarchy.appendChild(bodies[0]); //Add the node to the scene by adding it to the scene-root
        spawnChair();
        //Standard Fudge Scene Initialization - Creating a directional light, a camera and initialize the viewport
        let cmpLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE")));
        cmpLight.mtxPivot.lookAt(new f.Vector3(0.5, -1, -0.8)); //Set light direction
        hierarchy.addComponent(cmpLight);
        let cmpCamera = new f.ComponentCamera();
        cmpCamera.clrBackground = f.Color.CSS("GREY");
        cmpCamera.mtxPivot.translate(new f.Vector3(2, 3.5, 17)); //Move camera far back so the whole scene is visible
        cmpCamera.mtxPivot.lookAt(f.Vector3.ZERO()); //Set the camera matrix so that it looks at the center of the scene
        viewPort = new f.Viewport(); //Creating a viewport that is rendered onto the html canvas element
        viewPort.initialize("Viewport", hierarchy, cmpCamera, app); //initialize the viewport with the root node, camera and canvas
        // viewPort.physicsDebugMode = f.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
        //PHYSICS - Start using physics by telling the physics the scene root object. Physics will recalculate every transform and initialize
        // f.Physics.adjustTransforms(hierarchy);
        app.addEventListener("mousedown", () => { spawnChair(); });
        //Important start the game loop after starting physics, so physics can use the current transform before it's first iteration
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update); //Tell the game loop to call the update function on each frame
        f.Loop.start(); //Stard the game loop
    }
    //Function to animate/update the Fudge scene, commonly known as gameloop
    function update() {
        f.Physics.simulate(); //PHYSICS - Simulate physical changes each frame, parameter to set time between frames
        measureFPS();
        viewPort.draw(); // Draw the current Fudge Scene to the canvas
    }
    // Function to quickly create a node with multiple needed FudgeComponents, including a physics component
    function createCompleteNode(_name, _material, _mesh, _mass, _physicsType, _group = f.COLLISION_GROUP.DEFAULT, _colType = f.COLLIDER_TYPE.CUBE) {
        //Standard Fudge Node Creation
        let node = new f.Node(_name); //Creating the node
        let cmpMesh = new f.ComponentMesh(_mesh); //Creating a mesh for the node
        let cmpMaterial = new f.ComponentMaterial(_material); //Creating a material for the node
        let cmpTransform = new f.ComponentTransform(); //Transform holding position/rotation/scaling of the node
        let cmpRigidbody = new f.ComponentRigidbody(_mass, _physicsType, _colType, _group); //Adding a physical body component to use physics
        node.addComponent(cmpMesh);
        node.addComponent(cmpMaterial);
        node.addComponent(cmpTransform);
        node.addComponent(cmpRigidbody); // <-- best practice to add physics component last
        return node;
    }
    function spawnChair() {
        let rngHeight = (min, max) => {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };
        let spawnHeight = rngHeight(8, 20);
        noChairs++;
        let chair = new f.Node("Chair");
        hierarchy.appendChild(chair);
        //Creating a chair, base + back + 4 legs
        let base = createCompleteNode("Base", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.75, 0.8, 0.75, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC);
        base.mtxLocal.translate(new f.Vector3(0, 3.5 + spawnHeight, 0));
        base.mtxLocal.scale(new f.Vector3(1, 0.2, 1));
        chair.appendChild(base);
        let back = createCompleteNode("Back", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.75, 0.8, 0.75, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC);
        back.mtxLocal.translate(new f.Vector3(0.4, 4 + spawnHeight, 0));
        back.mtxLocal.scale(new f.Vector3(0.2, 1, 1));
        chair.appendChild(back);
        let weldingJoint = new f.JointWelding(base.getComponent(f.ComponentRigidbody), back.getComponent(f.ComponentRigidbody));
        back.addComponent(weldingJoint);
        let leg = createCompleteNode("Leg_BL", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.75, 0.8, 0.75, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_2);
        leg.mtxLocal.translate(new f.Vector3(0.4, 3 + spawnHeight, 0.4));
        leg.mtxLocal.scale(new f.Vector3(0.2, 0.8, 0.2));
        chair.appendChild(leg);
        weldingJoint = new f.JointWelding(base.getComponent(f.ComponentRigidbody), leg.getComponent(f.ComponentRigidbody));
        back.addComponent(weldingJoint);
        leg = createCompleteNode("Leg_BR", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.75, 0.8, 0.75, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_2);
        leg.mtxLocal.translate(new f.Vector3(0.4, 3 + spawnHeight, -0.4));
        leg.mtxLocal.scale(new f.Vector3(0.2, 0.8, 0.2));
        chair.appendChild(leg);
        weldingJoint = new f.JointWelding(base.getComponent(f.ComponentRigidbody), leg.getComponent(f.ComponentRigidbody));
        back.addComponent(weldingJoint);
        leg = createCompleteNode("Leg_FR", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.75, 0.8, 0.75, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_2);
        leg.mtxLocal.translate(new f.Vector3(-0.4, 3 + spawnHeight, -0.4));
        leg.mtxLocal.scale(new f.Vector3(0.2, 0.8, 0.2));
        chair.appendChild(leg);
        weldingJoint = new f.JointWelding(base.getComponent(f.ComponentRigidbody), leg.getComponent(f.ComponentRigidbody));
        back.addComponent(weldingJoint);
        leg = createCompleteNode("Leg_FR", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.75, 0.8, 0.75, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_2);
        leg.mtxLocal.translate(new f.Vector3(-0.4, 3 + spawnHeight, 0.4));
        leg.mtxLocal.scale(new f.Vector3(0.2, 0.8, 0.2));
        chair.appendChild(leg);
        weldingJoint = new f.JointWelding(base.getComponent(f.ComponentRigidbody), leg.getComponent(f.ComponentRigidbody));
        back.addComponent(weldingJoint);
        f.Physics.adjustTransforms(chair); // Important! You need to at least adjust Transforms for the parts of the chair
    }
    function measureFPS() {
        window.requestAnimationFrame(() => {
            const now = performance.now();
            while (times.length > 0 && times[0] <= now - 1000) {
                times.shift();
            }
            times.push(now);
            fps = times.length;
            fpsDisplay.textContent = `FPS: ${fps.toString()} / Chairs: ${noChairs} / Bodies: ${f.Physics.getBodyList().length}`;
        });
    }
})(FudgeExperiments_Marko_ConvexColliderThroughWelding || (FudgeExperiments_Marko_ConvexColliderThroughWelding = {}));
//# sourceMappingURL=Main.js.map