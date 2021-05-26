//Reference Fudge, getting code completion ready and creating a shortcut f to write FudgeCode more comfortably

namespace Tutorials_FUDGEPhysics_Lesson1 {
  import f = FudgeCore;

  /*GOAL: Learning how to activate debugging of physics properties. Changing the mode of Debug. Reading the debugging values to improve physical behaviours.
          The knowledge can be used in any scene with physics. You only need the "hndKeydown" function in this example. The rest is explained in the other tutorials.
  */

  //Fudge Basic Variables
  window.addEventListener("load", init);
  const app: HTMLCanvasElement = document.querySelector("canvas"); // The html element where the scene is drawn to
  let viewPort: f.Viewport; // The scene visualization
  let hierarchy: f.Node; // You're object scene tree
  let cmpCamera: f.ComponentCamera; //The camera in the scene to shot the ray from


  //Physical Objects
  let bodies: f.Node[] = new Array(); // Array of all physical objects in the scene to have a quick reference
  let cylindricalJoint: f.ComponentJointCylindrical;

  //Setting Variables


  //Materials
  let fixedJointMaterial: f.Material = new f.Material("fixedJointMat", f.ShaderFlat, new f.CoatColored(new f.Color(0.8, 0.21, 0.02, 1)));
  let jointMaterial: f.Material = new f.Material("JointMat", f.ShaderFlat, new f.CoatColored(new f.Color(0.027, 0.8, 0.09, 1)));
  let defaultMaterial: f.Material = new f.Material("DeafultMat", f.ShaderFlat, new f.CoatColored(new f.Color(0.55, 0.55, 0.5, 1)));

  //Function to initialize the Fudge Scene with a camera, light, viewport and PHYSCIAL Objects
  function init(_event: Event): void {

    hierarchy = new f.Node("Scene"); //create the root Node where every object is parented to. Should never be changed

    //#region Physics
    //PHYSICS - Creating physical objects to debug
    bodies[0] = createCompleteNode("Ground", new f.Material("Ground", f.ShaderFlat, new f.CoatColored(new f.Color(0.2, 0.2, 0.2, 1))), new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC);
    bodies[0].mtxLocal.scale(new f.Vector3(14, 0.3, 14)); //Scale the body with it's standard ComponentTransform
    hierarchy.appendChild(bodies[0]); //Add the node to the scene by adding it to the scene-root

    bodies[1] = createCompleteNode("JointHolder_Cylindrical", fixedJointMaterial, new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC);
    bodies[1].mtxLocal.translate(new f.Vector3(2, 3.5, 0)); //This one we set a little higher since the connected body should dangle from it
    hierarchy.appendChild(bodies[1]);

    bodies[2] = createCompleteNode("Connected_Cylindrical", jointMaterial, new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC);
    bodies[2].mtxLocal.translate(new f.Vector3(2, 2, 0));
    bodies[2].mtxLocal.scale(new f.Vector3(0.3, 2, 0.3));
    hierarchy.appendChild(bodies[2]);

    bodies[3] = createCompleteNode("Pyramid", defaultMaterial, new f.MeshPyramid(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
    bodies[3].mtxLocal.translate(new f.Vector3(-2, 5, 0));
    bodies[3].mtxLocal.rotateX(105);
    bodies[3].mtxLocal.scale(new f.Vector3(1, 3, 2));
    bodies[3].getComponent(f.ComponentRigidbody).restitution = 0.6;
    hierarchy.appendChild(bodies[3]);

    cylindricalJoint = new f.ComponentJointCylindrical(bodies[1].getComponent(f.ComponentRigidbody), bodies[2].getComponent(f.ComponentRigidbody));
    cylindricalJoint.internalCollision = true;
    cylindricalJoint.translationMotorLimitUpper = 0.25;
    cylindricalJoint.translationMotorLimitLower = -0.25;
    cylindricalJoint.rotationalMotorSpeed = 5;
    cylindricalJoint.rotationalMotorTorque = 25;

    //Step 1 - Add Event to listen for keypress so we can switch physical debugging on/off and change the mode
    document.addEventListener("keydown", hndKeydown);

    //#endregion Physics

    //Standard Fudge Scene Initialization - Creating a directional light, a camera and initialize the viewport
    let cmpLight: f.ComponentLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE")));
    cmpLight.mtxPivot.lookAt(new f.Vector3(-0.5, -1, -0.8)); //Set light direction
    hierarchy.addComponent(cmpLight);

    cmpCamera = new f.ComponentCamera();
    cmpCamera.clrBackground = f.Color.CSS("GREY");
    cmpCamera.mtxPivot.translate(new f.Vector3(2, 5, 17)); //Move camera far back so the whole scene is visible
    cmpCamera.mtxPivot.lookAt(f.Vector3.ZERO()); //Set the camera matrix so that it looks at the center of the scene

    viewPort = new f.Viewport(); //Creating a viewport that is rendered onto the html canvas element
    viewPort.initialize("Viewport", hierarchy, cmpCamera, app); //initialize the viewport with the root node, camera and canvas

    //PHYSICS - Start using physics by telling the physics the scene root object. Physics will recalculate every transform and initialize
    f.Physics.adjustTransforms(hierarchy);

    //Important start the game loop after starting physics, so physics can use the current transform before it's first iteration
    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update); //Tell the game loop to call the update function on each frame
    f.Loop.start(); //Stard the game loop
  }

  //Function to animate/update the Fudge scene, commonly known as gameloop
  function update(): void {
    f.Physics.world.simulate(); //PHYSICS - Simulate physical changes each frame, parameter to set time between frames

    //Raycast from the pyramid to show a raycast debug
    raycastFromPyramid();

    viewPort.draw(); // Draw the current Fudge Scene to the canvas
  }

  // Function to quickly create a node with multiple needed FudgeComponents, including a physics component
  function createCompleteNode(_name: string, _material: f.Material, _mesh: f.Mesh, _mass: number, _physicsType: f.PHYSICS_TYPE, _group: f.PHYSICS_GROUP = f.PHYSICS_GROUP.DEFAULT, _colType: f.COLLIDER_TYPE = f.COLLIDER_TYPE.CUBE): f.Node {
    //Standard Fudge Node Creation
    let node: f.Node = new f.Node(_name); //Creating the node
    let cmpMesh: f.ComponentMesh = new f.ComponentMesh(_mesh); //Creating a mesh for the node
    let cmpMaterial: f.ComponentMaterial = new f.ComponentMaterial(_material); //Creating a material for the node
    let cmpTransform: f.ComponentTransform = new f.ComponentTransform();  //Transform holding position/rotation/scaling of the node
    let cmpRigidbody: f.ComponentRigidbody = new f.ComponentRigidbody(_mass, _physicsType, _colType, _group); //Adding a physical body component to use physics

    node.addComponent(cmpMesh);
    node.addComponent(cmpMaterial);
    node.addComponent(cmpTransform);
    node.addComponent(cmpRigidbody); // <-- best practice to add physics component last
    return node;
  }

  //Standard raycast as learned in Lesson 2 - but locally from the pyramid spire
  function raycastFromPyramid(): void {
    let origin: f.Vector3;
    let localUp: f.Vector3;
    origin = bodies[3].getComponent(f.ComponentRigidbody).getPosition();
    localUp = f.Vector3.Y();
    localUp.transform(bodies[3].mtxLocal, false);
    f.Physics.raycast(origin, localUp, 2);
  }

  function hndKeydown(_event: KeyboardEvent): void {

    /*Possible Modes
    COLLIDERS = You see the shape of the colliders that are used to define the shapes of an object in the physical space and also their origin/direction
    JOINTS_AND_COLLIDER = (DEFAULT) You see the colliders but also informations about joints their axis/constraints
    BOUNDING_BOXES = You see the simplified collision box of your objects aswell as the broadphase box (grey) which shows you if any objects can even be concidered by the physics engine
    CONTACTS = You see colliders and also the touching points on objects and their directions and with a yellow line connected you see the contact line between two shapes
    PHYSIC_OBJECTS_ONLY = Renders the all physics objects as wireframe to give a better view of them and makes joint information much more visible when it's normally hidden by the mesh
    */

    /*
    Colors of Colliders have meaning:
    White = static, unmoving
    DarkBlue = sleeping, dynamic
    Orange = kinematic
    Yellow = moving, awake
    Turquoise = constraint, joint, sleeping (in general) but awake in a constraint state
    And some more colors as combination of the above.
    */

    if (_event.code == f.KEYBOARD_CODE.T) { //Toggle between the physics debug view on/off
      //Accessing the settings of the physics simulation and changing the debugDraw to a inverse, to toggle between true/false
      f.Physics.settings.debugDraw = !f.Physics.settings.debugDraw;
    }
    if (_event.code == f.KEYBOARD_CODE.Y) { //Y == Z on german keyboards - Go through the different Physics Debug Modes
      let currentMode: number = f.Physics.settings.debugMode; //Get current mode
      currentMode = currentMode == 4 ? 0 : f.Physics.settings.debugMode += 1; //Go one mode further until the last mode is reached then reset
      f.Physics.settings.debugMode = currentMode; //Tell the physics settings to go to that mode
    }

    if (_event.code == f.KEYBOARD_CODE.P) { //Push around the pyramid a little to see the effects of debug modes
      bodies[3].getComponent(f.ComponentRigidbody).applyImpulseAtPoint(new f.Vector3(0, 5, 0));
    }


  }




}