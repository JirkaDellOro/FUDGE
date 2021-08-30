//Reference Fudge, getting code completion ready and creating a shortcut f to write FudgeCode more comfortably

namespace Tutorials_FUDGEPhysics_Lesson1 {
  import f = FudgeCore;

  //GOALS: Learning how to define shpes to create a not predefined collider shape.
  //Built a simple physical player like you would find in a adventure or 3d platformer.
  //Hint! -> These concepts are only a basic start, expand on it yourself to improve on results.

  //Fudge Basic Variables
  window.addEventListener("load", init);
  const app: HTMLCanvasElement = document.querySelector("canvas"); // The html element where the scene is drawn to
  let viewPort: f.Viewport; // The scene visualization
  let hierarchy: f.Node; // You're object scene tree


  //Physical Objects
  let bodies: f.Node[] = new Array(); // Array of all physical objects in the scene to have a quick reference
  let player: f.Node;
  let playerBody: f.ComponentRigidbody;

  //Setting Variables
  let materialConvexShape: f.Material = new f.Material("MorningStarThingy", f.ShaderFlat, new f.CoatColored(new f.Color(0.5, 0.4, 0.35, 1)));
  let materialPlayer: f.Material = new f.Material("Player", f.ShaderFlat, new f.CoatColored(new f.Color(0.7, 0.8, 0.6, 1)));
  let environmentMat: f.Material = new f.Material("Environment", f.ShaderFlat, new f.CoatColored(new f.Color(0.2, 0.2, 0.2, 1)));

  //Physical Player Variables
  let isGrounded: boolean;
  let movementspeed: number = 8;
  let turningspeed: number = 80;
  let playerWeight: number = 75;
  let playerJumpForce: number = 500;
  let cmpCamera: f.ComponentCamera; //We let the camera look at our player in update
  let yTurn: number = 0; //How high the turning input currently is
  let forwardMovement: number = 0; //How high the forward movement input currently is

  //Function to initialize the Fudge Scene with a camera, light, viewport and PHYSCIAL Objects
  function init(_event: Event): void {

    hierarchy = new f.Node("Scene"); //create the root Node where every object is parented to. Should never be changed

    //#region PHYSICS
    //OimoPhysics which is integrated in Fudge is using a correctionAlgorithm on solver iterations instead of fully recalculate physics too often, 
    //so you can crank the number of solver iterations higher than with most engines. But Oimo is in general less accurate.
    //This is not needed but we just do it to show it.
    f.Physics.world.setSolverIterations(1000);
    f.Physics.settings.defaultRestitution = 0.15;
    f.Physics.settings.defaultFriction = 0.8;


    //PHYSICS 
    //Creating a physically static ground plane for our physics playground. A simple scaled cube but with physics type set to static
    bodies[0] = createCompleteNode("Ground", environmentMat, new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_2);
    bodies[0].mtxLocal.scale(new f.Vector3(14, 0.3, 14)); //Scale the body with it's standard ComponentTransform
    //bodies[0].mtxLocal.rotateX(4, true); //Give it a slight rotation so the physical objects are sliding, always from left when it's after a scaling
    hierarchy.appendChild(bodies[0]); //Add the node to the scene by adding it to the scene-root


    //CONCEPT 1 - Convex Colliders / Compound Collider - A Collider Shape that is not predefined and has no holes in it
    //e.g. something like a morning star shape a cube with pyramides as spikes on the side
    createConvexCompountCollider();

    //CONCEPT 2 - Setting Up a physical player
    //A physical player is a standard physical object of the type dynamic, BUT, you only want to rotate on Y axis, and you want to setup things
    //like a grounded variable and other movement related stuff.
    settingUpAPlayer();

    //Setting up some environment objects for our player to jump on
    bodies[100] = createCompleteNode("Envinroment", environmentMat, new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_2);
    bodies[100].mtxLocal.translate(new f.Vector3(5, 1, 3));
    bodies[100].mtxLocal.scale(new f.Vector3(1, 1, 1));
    //bodies[100].mtxLocal.rotateX(4, true); 
    hierarchy.appendChild(bodies[100]); //Add the node to the scene by adding it to the scene-root

    bodies[101] = createCompleteNode("Envinroment", environmentMat, new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_2);
    bodies[101].mtxLocal.translate(new f.Vector3(-3, 3.5, 2));
    bodies[101].mtxLocal.scale(new f.Vector3(1, 1, 5));
    bodies[101].mtxLocal.rotateX(40, true);
    hierarchy.appendChild(bodies[101]);

    /*Stairs, keep in mind our player is only able to walk up stars because he is a capsule but it's not easy for him because we do not lift any feet,
    we are just pushing a capsule with force against a slope until it's pushed up, which we make easier by giving the player a low friction, the way
    we set the player up he can not slide on the ground but it helps to get him up the stairs.
    So you need to turn around a little while moving to climb these stairs
    advanced stairwalking is something you need to figure out yourself. Keyword raycast is a good start. 
    */
    let slopeHeight: number = 0.20;
    bodies[102] = createCompleteNode("Envinroment", environmentMat, new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_2);
    bodies[102].mtxLocal.translate(new f.Vector3(-3, slopeHeight, -2));
    bodies[102].mtxLocal.scale(new f.Vector3(2, slopeHeight * 2, 0.35));
    hierarchy.appendChild(bodies[102]);
    bodies[103] = createCompleteNode("Envinroment", environmentMat, new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_2);
    bodies[103].mtxLocal.translate(new f.Vector3(-3, slopeHeight * 2, -2 - 0.35));
    bodies[103].mtxLocal.scale(new f.Vector3(2, slopeHeight * 2, 0.35));
    hierarchy.appendChild(bodies[103]);
    bodies[104] = createCompleteNode("Envinroment", environmentMat, new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_2);
    bodies[104].mtxLocal.translate(new f.Vector3(-3, slopeHeight * 3, -2 - 0.35 * 2));
    bodies[104].mtxLocal.scale(new f.Vector3(2, slopeHeight * 2, 0.35));
    hierarchy.appendChild(bodies[104]);
    bodies[105] = createCompleteNode("Envinroment", environmentMat, new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_2);
    bodies[105].mtxLocal.translate(new f.Vector3(-3, slopeHeight * 4, -2 - 0.35 * 3));
    bodies[105].mtxLocal.scale(new f.Vector3(2, slopeHeight * 2, 0.35));
    hierarchy.appendChild(bodies[105]);
    bodies[106] = createCompleteNode("Envinroment", environmentMat, new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_2);
    bodies[106].mtxLocal.translate(new f.Vector3(-3, slopeHeight * 5, -2 - 0.35 * 4));
    bodies[106].mtxLocal.scale(new f.Vector3(2, slopeHeight * 2, 0.35));
    hierarchy.appendChild(bodies[106]);
    //#endregion PHYSICS


    //Standard Fudge Scene Initialization - Creating a directional light, a camera and initialize the viewport
    let cmpLight: f.ComponentLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE")));
    cmpLight.mtxPivot.lookAt(new f.Vector3(0.5, -1, -0.8)); //Set light direction
    hierarchy.addComponent(cmpLight);

    cmpCamera = new f.ComponentCamera();
    cmpCamera.clrBackground = f.Color.CSS("GREY");
    cmpCamera.mtxPivot.translate(new f.Vector3(17, 4, 17)); //Move camera far back so the whole scene is visible
    cmpCamera.mtxPivot.lookAt(f.Vector3.ZERO()); //Set the camera matrix so that it looks at the center of the scene

    viewPort = new f.Viewport(); //Creating a viewport that is rendered onto the html canvas element
    viewPort.initialize("Viewport", hierarchy, cmpCamera, app); //initialize the viewport with the root node, camera and canvas

    document.addEventListener("keypress", hndKey); //Adding a listener for keypress handling
    document.addEventListener("keyup", hndKeyUp); //Adding a listener for keyUp

    //PHYSICS - Start using physics by telling the physics the scene root object. Physics will recalculate every transform and initialize
    f.Physics.adjustTransforms(hierarchy);

    f.Physics.settings.debugDraw = true;

    //Important start the game loop after starting physics, so physics can use the current transform before it's first iteration
    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update); //Tell the game loop to call the update function on each frame
    f.Loop.start(); //Stard the game loop
  }

  //Function to animate/update the Fudge scene, commonly known as gameloop
  function update(): void {
    //PHYSICS - Simulate physical changes each frame, parameter to set time between frames
    f.Physics.world.simulate(f.Loop.timeFrameReal / 1000);

    //Player constant update functions do it after physics calculation is best practice
    cmpCamera.mtxPivot.lookAt(player.mtxWorld.translation);
    playerIsGroundedRaycast();
    playerMovement(f.Loop.timeFrameReal / 1000);

    viewPort.draw(); // Draw the current Fudge Scene to the canvas
  }

  // Function to quickly create a node with multiple needed FudgeComponents, including a physics component
  function createCompleteNode(_name: string, _material: f.Material, _mesh: f.Mesh, _mass: number, _physicsType: f.PHYSICS_TYPE, _group: f.PHYSICS_GROUP = f.PHYSICS_GROUP.DEFAULT, _colType: f.COLLIDER_TYPE = f.COLLIDER_TYPE.CUBE, _convexMesh: Float32Array = null): f.Node {
    let node: f.Node = new f.Node(_name);
    let cmpMesh: f.ComponentMesh = new f.ComponentMesh(_mesh);
    let cmpMaterial: f.ComponentMaterial = new f.ComponentMaterial(_material);

    let cmpTransform: f.ComponentTransform = new f.ComponentTransform();
    let cmpRigidbody: f.ComponentRigidbody = new f.ComponentRigidbody(_mass, _physicsType, _colType, _group, null, _convexMesh); //add a Float32 Array of points to the rb constructor to create a convex collider
    node.addComponent(cmpMesh);
    node.addComponent(cmpMaterial);
    node.addComponent(cmpTransform);
    node.addComponent(cmpRigidbody);
    return node;
  }

  function createConvexCompountCollider(): void {
    //Step 1 - define points that construct the shape you want for your collider - order is important so think about what point comes when in your shape
    let colliderVertices: Float32Array = new Float32Array
      ([
        1, -1, 1,     //Start of with a cube point
        0, -2, 0,     //go to a pyramid point
        1, 1, 1,      //back to the cube
        - 1, 1, 1,    //along the cube
        - 1, -1, 1,   //along the cube on a different side
        -2, 0, 0,     //go to another pyramid point
        1, 1, -1,     //back on the cube
        - 1, 1, -1,   //and so on.. it is not important that all points are in a correct order,
        - 1, -1, -1,  //but since the physics engine is trying to construct a shape out of your points that is closed of it should make some sense
        0, 0, -2,
        1, -1, -1,
        2, 0, 0,
        0, 2, 0,
        0, 0, 2
      ]);

    //Step 2 - define the visual nodes that are part of your whole shape, since we have a cube that is surounded by pyramids:
    //Main Shape
    bodies[5] = createCompleteNode("Compound", materialConvexShape, new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.CONVEX, colliderVertices);
    hierarchy.appendChild(bodies[5]);
    bodies[5].mtxLocal.translate(new f.Vector3(2.5, 4, 3.5));
    bodies[5].mtxLocal.rotateX(27);
    bodies[5].mtxLocal.rotateY(32);
    //Components - Removing the Physics component on each of them since they all build one shape on the main Node only the visual nodes need to be there
    bodies[6] = createCompleteNode("CompoundUpper", materialConvexShape, new f.MeshPyramid(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
    bodies[6].removeComponent(bodies[6].getComponent(f.ComponentRigidbody));
    bodies[6].mtxLocal.translateY(0.5);
    bodies[6].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
    bodies[5].appendChild(bodies[6]); //appending the Node not to the main hierarchy but the Node it is part of
    bodies[7] = createCompleteNode("CompoundLower", materialConvexShape, new f.MeshPyramid(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
    bodies[7].removeComponent(bodies[7].getComponent(f.ComponentRigidbody));
    bodies[7].mtxLocal.rotateX(180);
    bodies[7].mtxLocal.translateY(0.5);
    bodies[7].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
    bodies[5].appendChild(bodies[7]);
    bodies[8] = createCompleteNode("CompoundLeft", materialConvexShape, new f.MeshPyramid(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
    bodies[8].removeComponent(bodies[8].getComponent(f.ComponentRigidbody));
    bodies[8].mtxLocal.rotateZ(90);
    bodies[8].mtxLocal.translateY(0.5);
    bodies[8].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
    bodies[5].appendChild(bodies[8]);
    bodies[9] = createCompleteNode("CompoundRight", materialConvexShape, new f.MeshPyramid(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
    bodies[9].removeComponent(bodies[9].getComponent(f.ComponentRigidbody));
    bodies[9].mtxLocal.rotateZ(-90);
    bodies[9].mtxLocal.translateY(0.5);
    bodies[9].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
    bodies[5].appendChild(bodies[9]);
    bodies[10] = createCompleteNode("CompoundFront", materialConvexShape, new f.MeshPyramid(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
    bodies[10].removeComponent(bodies[10].getComponent(f.ComponentRigidbody));
    bodies[10].mtxLocal.rotateX(90);
    bodies[10].mtxLocal.translateY(0.5);
    bodies[10].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
    bodies[5].appendChild(bodies[10]);
    bodies[11] = createCompleteNode("CompoundBack", materialConvexShape, new f.MeshPyramid(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
    bodies[11].removeComponent(bodies[11].getComponent(f.ComponentRigidbody));
    bodies[11].mtxLocal.rotateX(-90);
    bodies[11].mtxLocal.translateY(0.5);
    bodies[11].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
    bodies[5].appendChild(bodies[11]);
    bodies[5].getComponent(f.ComponentRigidbody).restitution = 3;
  }

  //Setting up a physical player which is nothign but a cube but able to platform in our little world and reacting to stuff
  function settingUpAPlayer(): void {
    player = createCompleteNode("Player", materialPlayer, new f.MeshCube(), playerWeight, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.CAPSULE);
    hierarchy.appendChild(player);
    playerBody = player.getComponent(f.ComponentRigidbody);
    player.mtxLocal.scale(new f.Vector3(0.5, 1.8, 0.3));
    player.mtxLocal.translate(new f.Vector3(2.5, 4, 3.5));
    playerBody.rotationInfluenceFactor = new f.Vector3(0, 0, 0); //Physics not turn our player we do it ourselves
    //since our capsule collider is a box with half spheres on top and bottom it's a little higher than our box mesh, we need to scale the pivot on the rb itself
    playerBody.mtxPivot.scale(new f.Vector3(1, 0.85, 1));
    playerBody.friction = 0.01; //lower the friction to make it easier climbing stairs - this is only needed in this kind of player structure

    //addign a nose to our player so we know whats the forward direction - but it's not a physics object
    let playerNose: f.Node = createCompleteNode("PlayerNose", materialPlayer, new f.MeshCube(), playerWeight, f.PHYSICS_TYPE.DYNAMIC);
    playerNose.mtxLocal.translate(new f.Vector3(0, 0.2, 0.4));
    playerNose.mtxLocal.scale(new f.Vector3(0.1, 0.2, 1.5));
    playerNose.removeComponent(playerNose.getComponent(f.ComponentRigidbody));
    player.addChild(playerNose);
  }

  //Check if our physical player is hitting a surface with his feed, if yo let him be able to jump
  function playerIsGroundedRaycast(): void {
    let hitInfo: f.RayHitInfo;
    hitInfo = f.Physics.raycast(playerBody.getPosition(), new f.Vector3(0, -1, 0), 1.1);
    if (hitInfo.hit) {
      isGrounded = true;
    } else {
      isGrounded = false;
    }
  }


  // Event Function handling keyboard input
  function hndKey(_event: KeyboardEvent): void {

    if (_event.code == f.KEYBOARD_CODE.A) {
      yTurn = 1;
    }
    if (_event.code == f.KEYBOARD_CODE.W) {
      forwardMovement = 1;
    }
    if (_event.code == f.KEYBOARD_CODE.S) {
      forwardMovement = -1;
    }
    if (_event.code == f.KEYBOARD_CODE.D) {
      yTurn = -1;
    }
    if (_event.code == f.KEYBOARD_CODE.SPACE) {
      if (isGrounded) //Let the player only jumping when on the ground
        playerBody.applyLinearImpulse(new f.Vector3(0, playerJumpForce, 0));
    }

    if (_event.code == f.KEYBOARD_CODE.T) {
      f.Physics.settings.debugMode = f.Physics.settings.debugMode == f.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER ? f.PHYSICS_DEBUGMODE.PHYSIC_OBJECTS_ONLY : f.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
    }
  }

  //When the key is up we want to stop movement
  function hndKeyUp(_event: KeyboardEvent): void {
    if (_event.code == f.KEYBOARD_CODE.A) {
      yTurn = 0;
    }
    if (_event.code == f.KEYBOARD_CODE.W) {
      forwardMovement = 0;
    }
    if (_event.code == f.KEYBOARD_CODE.S) {
      forwardMovement = 0;
    }
    if (_event.code == f.KEYBOARD_CODE.D) {
      yTurn = 0;
    }
  }

  //Actually moving the player
  function playerMovement(_deltaTime: number) {
    let playerForward: f.Vector3;
    playerForward = f.Vector3.Z();
    playerForward.transform(player.mtxWorld, false);

    //You can rotate a body like you would rotate a transform, incremental but keep in mind, normally we use forces in physics,
    //this is just a feature to make it easier to create player characters
    playerBody.rotateBody(new f.Vector3(0, yTurn * turningspeed * _deltaTime, 0));

    let movementVelocity: f.Vector3 = new f.Vector3();
    movementVelocity.x = playerForward.x * forwardMovement * movementspeed;
    movementVelocity.y = playerBody.getVelocity().y;
    movementVelocity.z = playerForward.z * forwardMovement * movementspeed;
    playerBody.setVelocity(movementVelocity);
    //Since we are resetting the velocity when releasing the key to have a instant stop our player is not able to slide. We would have
    //the player fade out have sliding instead you need to configure that for your own game.
  }

}