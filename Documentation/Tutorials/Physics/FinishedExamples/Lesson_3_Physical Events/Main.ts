//Reference Fudge, getting code completion ready and creating a shortcut f to write FudgeCode more comfortably

namespace Tutorials_FUDGEPhysics_Lesson1 {
  import f = FudgeCore;

  //Goal: Learn how to create and use physics based events (Collision/Trigger) to control nodes in the app.

  //Fudge Basic Variables
  window.addEventListener("load", init);
  const app: HTMLCanvasElement = document.querySelector("canvas"); // The html element where the scene is drawn to
  let viewPort: f.Viewport; // The scene visualization
  let hierarchy: f.Node; // You're object scene tree


  //Physical Objects
  let bodies: f.Node[] = new Array(); // Array of all physical objects in the scene to have a quick reference
  let playerBody: f.Node; // Transform of a body that interacts with physics but can be moved by normal FudgeTransform


  //Setting Variables
  let force: number = 0.5; //The amount of movement with each keypress
  let playerDefaultMat: f.Material = new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0, 0, 1, 1)));
  let playerTriggeredMat: f.Material = new f.Material("CubeTriggered", f.ShaderFlat, new f.CoatColored(new f.Color(0.9, 0.1, 0.1, 1)));

  //Function to initialize the Fudge Scene with a camera, light, viewport and PHYSCIAL Objects
  function init(_event: Event): void {

    hierarchy = new f.Node("Scene"); //create the root Node where every object is parented to. Should never be changed

    //#region PHYSICS

    //PHYSICS - Step 2: Create some physical Nodes to play with 
    //Creating a physically static ground plane for our physics playground. A simple scaled cube but with physics type set to static
    bodies[0] = createCompleteNode("Ground", new f.Material("Ground", f.ShaderFlat, new f.CoatColored(new f.Color(0.2, 0.2, 0.2, 1))), new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC);
    bodies[0].mtxLocal.scale(new f.Vector3(14, 0.3, 14)); //Scale the body with it's standard ComponentTransform
    bodies[0].mtxLocal.rotateX(4, true); //Give it a slight rotation so the physical objects are sliding, always from left when it's after a scaling
    hierarchy.appendChild(bodies[0]); //Add the node to the scene by adding it to the scene-root

    //Step 1 - Creating a the player cube - to interact to trigger, COLLIDERS and TRIGGERS 
    bodies[1] = createCompleteNode("Player", playerDefaultMat, new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC);
    playerBody = bodies[1]; //Reference this node specifically so we can access it for input more easily
    playerBody.mtxLocal.translate(new f.Vector3(0, 1, 0));
    hierarchy.appendChild(bodies[1]);
    playerBody.getComponent(f.ComponentRigidbody).rotationInfluenceFactor = new f.Vector3(0, 0, 0); //make rotation fixed the player does not rotate
    playerBody.getComponent(f.ComponentRigidbody).friction = 1;

    //Step 2 - Create bodies - one used as a button when it collides it will an action will happen - one as a trigger, when it's overlapping it will trigger an action
    //The Collision Event is happening on a collision so a normal body can receive it
    //A use case for a collision event is for example when the player is hitting the ground to play a sound
    bodies[2] = createCompleteNode("Collider_Button", new f.Material("Collider_Button", f.ShaderFlat, new f.CoatColored(new f.Color(0.3, 0.3, 0.4, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.STATIC);
    bodies[2].mtxLocal.translate(new f.Vector3(-3, 1, 0));
    hierarchy.appendChild(bodies[2]);

    //The Trigger Event is happening when bodies overlap, so we need a special body that does not collide but overlap
    //So it must be in the PHYSICS_GROUP.TRIGGER, and normally it's invisble, so it has no mesh component or is fully transparent
    //A use case is something like spawning enemies when a player enters a room.
    bodies[3] = createCompleteNode("Trigger_Button", new f.Material("Trigger_Button", f.ShaderFlat, new f.CoatColored(new f.Color(0.5, 0.3, 0.2, 0.3))), new f.MeshCube(), 1, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.TRIGGER);
    bodies[3].mtxLocal.translate(new f.Vector3(3, 1, 0));
    hierarchy.appendChild(bodies[3]);

    //Trigger when player is falling of the plane
    bodies[4] = createCompleteNode("Trigger_Reset", new f.Material("Trigger_Reset", f.ShaderFlat, new f.CoatColored(new f.Color(0.5, 0.3, 0.2, 0.3))), new f.MeshCube(), 1, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.TRIGGER);
    bodies[4].removeComponent(bodies[4].getComponent(f.ComponentMesh)); //removing the mesh to have invisible trigger - standard practice
    bodies[4].mtxLocal.translate(new f.Vector3(0, -4, 0));
    bodies[4].mtxLocal.scale(new f.Vector3(30, 1, 30)); //Make it big enough so the player should hit it
    hierarchy.appendChild(bodies[4]);

    //Step 3 - After creating our Physic Event Bodies, we tell them to listen to the specific event happening
    //These events are happening on the physic component not on the node. So be sure to add them to the component not to the node
    //A body can receive a enter/exit event, and it's only happening once. If a body is staying on a collision or in a trigger it needs to be handled manually
    bodies[2].getComponent(f.ComponentRigidbody).addEventListener(f.EVENT_PHYSICS.COLLISION_ENTER, hndCollisionEventEnter);
    bodies[2].getComponent(f.ComponentRigidbody).addEventListener(f.EVENT_PHYSICS.COLLISION_EXIT, hndCollisionEventExit);
    /*Hint: The Collision Event is only happening if the object is hitting it physically, 
      So KINEMATIC vs. STATIC does not receive a collision Event. Only DYNAMIC vs. DYNAMIC/STATIC/KINEMATIC, neither do two Kinematic hit each other nor do Kinematic/Static.
      If you really need a kinematic hitting a static object and still have a action, use trigger, or make the object not static but dynamic but unmoving by having a ridiculously high weight.
      Thats why we use a dynamic player cube instead of a kinematic like we did in Lesson 1.
    */

    //Same as for collision a trigger is also listening on a event type in form of f.EVENT_PHYSICS and a function that will be called
    bodies[3].getComponent(f.ComponentRigidbody).addEventListener(f.EVENT_PHYSICS.TRIGGER_ENTER, hndTriggerEventEnter);
    bodies[3].getComponent(f.ComponentRigidbody).addEventListener(f.EVENT_PHYSICS.TRIGGER_EXIT, hndTriggerEventExit);

    //Setting up our reset
    bodies[4].getComponent(f.ComponentRigidbody).addEventListener(f.EVENT_PHYSICS.TRIGGER_ENTER, hndResetTrigger);
    //#endregion PHYSICS


    //Standard Fudge Scene Initialization - Creating a directional light, a camera and initialize the viewport
    let cmpLight: f.ComponentLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE")));
    cmpLight.mtxPivot.lookAt(new f.Vector3(0.5, -1, -0.8)); //Set light direction
    hierarchy.addComponent(cmpLight);

    let cmpCamera: f.ComponentCamera = new f.ComponentCamera();
    cmpCamera.clrBackground = f.Color.CSS("GREY");
    cmpCamera.mtxPivot.translate(new f.Vector3(2, 3.5, 17)); //Move camera far back so the whole scene is visible
    cmpCamera.mtxPivot.lookAt(f.Vector3.ZERO()); //Set the camera matrix so that it looks at the center of the scene

    viewPort = new f.Viewport(); //Creating a viewport that is rendered onto the html canvas element
    viewPort.initialize("Viewport", hierarchy, cmpCamera, app); //initialize the viewport with the root node, camera and canvas

    document.addEventListener("keypress", hndKey); //Adding a listener for keypress handling

    //PHYSICS - Start using physics by telling the physics the scene root object. Physics will recalculate every transform and initialize
    f.Physics.adjustTransforms(hierarchy);

    //Important start the game loop after starting physics, so physics can use the current transform before it's first iteration
    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update); //Tell the game loop to call the update function on each frame
    f.Loop.start(); //Stard the game loop
  }

  //Function to animate/update the Fudge scene, commonly known as gameloop
  function update(): void {
    f.Physics.world.simulate(); //PHYSICS - Simulate physical changes each frame, parameter to set time between frames
    viewPort.draw(); // Draw the current Fudge Scene to the canvas
  }

  // Function to quickly create a node with multiple needed FudgeComponents, including a physics component
  function createCompleteNode(_name: string, _material: f.Material, _mesh: f.Mesh, _mass: number, _physicsType: f.PHYSICS_TYPE, _group: f.PHYSICS_GROUP = f.PHYSICS_GROUP.DEFAULT, _colType: f.COLLIDER_TYPE = f.COLLIDER_TYPE.CUBE): f.Node {
    let node: f.Node = new f.Node(_name); //Creating the node
    let cmpMesh: f.ComponentMesh = new f.ComponentMesh(_mesh); //Creating a mesh for the node
    let cmpMaterial: f.ComponentMaterial = new f.ComponentMaterial(_material); //Creating a material for the node
    let cmpTransform: f.ComponentTransform = new f.ComponentTransform();  //Transform holding position/rotation/scaling of the node

    let cmpRigidbody: f.ComponentRigidbody = new f.ComponentRigidbody(_mass, _physicsType, _colType, _group); //<-- adding the group when using triggers, since a trigger should not collide with anything else

    node.addComponent(cmpMesh);
    node.addComponent(cmpMaterial);
    node.addComponent(cmpTransform);
    node.addComponent(cmpRigidbody); // <-- best practice to add physics component last
    return node; //return the full created node
  }

  // Event Function handling keyboard input - similar to Lesson 1 but a little different, since it's pushing the player by force
  function hndKey(_event: KeyboardEvent): void {
    let horizontal: number = 0;  //left/right
    let vertical: number = 0; //front/back
    let height: number = 0; //upwards/downwards

    //Check keyboard input from Event
    if (_event.code == f.KEYBOARD_CODE.A) {
      horizontal -= force;
    }
    if (_event.code == f.KEYBOARD_CODE.D) {
      horizontal += force;
    }
    if (_event.code == f.KEYBOARD_CODE.W) {
      vertical -= force;
    }
    if (_event.code == f.KEYBOARD_CODE.S) {
      vertical += force;
    }
    if (_event.code == f.KEYBOARD_CODE.SPACE) { //Jump
      height += force * 10;
    }
    playerBody.getComponent(f.ComponentRigidbody).applyLinearImpulse(new f.Vector3(horizontal, height, vertical));
  }


  //Step 4 - Receiving and handling the events
  //Event function handling collision - A EVENT_PHYSICS is receiving a f.EventPhysics with infos about the event
  function hndCollisionEventEnter(_event: f.EventPhysics): void {
    //_event. keeps a plethora of informations about the event the most interesting are things like 
    /* 
      _event.cmpRigidbody -> to identify the body involved in the event, with getContainer().name you get the actual name of the node involved 
      _event.normalImpulse -> intensity of the collision good to play a sound that is only as heavy as the collision
      _event.collisionPoint -> the point in the world where the collision is happening to maybe spawn things like particles
      _event.collisionNormal -> the direction the collision is happening often used to correctly rotate spawned things on the colliding surface
    */
    if (_event.cmpRigidbody.getContainer().name == "Player") { //Our Event is happening with the body NODE called "Player"
      f.Debug.log("Player hit me - Collider");
      //We let this collider act like a bumper through this event. We take the event normal and shoot the player away from the bumper on the contact point.
      playerBody.getComponent(f.ComponentRigidbody).applyForceAtPoint(new f.Vector3(_event.collisionNormal.x * 500, _event.collisionNormal.y * 500, _event.collisionNormal.z * 500), _event.collisionPoint);
    }
  }

  function hndCollisionEventExit(_event: f.EventPhysics): void {
    if (_event.cmpRigidbody.getContainer().name == "Player") {
      f.Debug.log("Player left me - Collider");
    }
  }

  //Event function handling triggering
  function hndTriggerEventEnter(_event: f.EventPhysics): void {
    if (_event.cmpRigidbody.getContainer().name == "Player") {
      f.Debug.log("Player entered me - Trigger");
      playerBody.getComponent(f.ComponentMaterial).material = playerTriggeredMat;
    }
  }

  function hndTriggerEventExit(_event: f.EventPhysics): void {
    if (_event.cmpRigidbody.getContainer().name == "Player") {
      f.Debug.log("Player left me - Trigger");
      playerBody.getComponent(f.ComponentMaterial).material = playerDefaultMat;
    }
  }

  //Since the player could fall of we will reset him back with a trigger when he falls down from the plane
  function hndResetTrigger(_event: f.EventPhysics): void {
    if (_event.cmpRigidbody.getContainer().name == "Player") {
      playerBody.getComponent(f.ComponentRigidbody).setPosition(new f.Vector3(0, 3, 0)); //Since it's a physics body we have to set position through physics not transform
    }
  }

}