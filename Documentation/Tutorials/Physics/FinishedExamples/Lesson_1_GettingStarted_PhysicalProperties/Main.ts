namespace Tutorials_FUDGEPhysics_Lesson1 {
  import f = FudgeCore;

  //Fudge Basic Variables
  window.addEventListener("load", init);
  const app: HTMLCanvasElement = document.querySelector("canvas"); // The html element where the scene is drawn to
  let viewPort: f.Viewport; // The scene visualization
  let hierarchy: f.Node; // You're object scene tree


  //Physical Objects
  let bodies: f.Node[] = new Array(); // Array of all physical objects in the scene to have a quick reference
  let kinematicBody: f.Node; // Transform of a body that interacts with physics but can be moved by normal FudgeTransform


  //Setting Variables
  let stepWidth: number = 0.1; //The amount of movement with each keypress


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


    //Creating some dynamic bodies - Same as static only a different physics interaction type
    bodies[1] = createCompleteNode("Cube_1", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 0, 0, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_2);
    bodies[1].mtxLocal.translate(new f.Vector3(3, 2, 0));
    hierarchy.appendChild(bodies[1]);

    //Creating a different collider shape - just change the collider type to a predefined shape
    bodies[2] = createCompleteNode("Pyramid", new f.Material("Pyramid", f.ShaderFlat, new f.CoatColored(new f.Color(0.3, 0.5, 0.3, 1))), new f.MeshPyramid, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_1, f.COLLIDER_TYPE.PYRAMID);
    hierarchy.appendChild(bodies[2]);
    // -> best practice to think about placing objects in the world
    bodies[2].mtxLocal.translate(new f.Vector3(0, 2, 0)); //Translate first to the point you want it
    bodies[2].mtxLocal.scale(new f.Vector3(1.5, 1.5, 1.5)); //Then defined a size you want the object to have
    bodies[2].mtxLocal.rotateY(40, true); //Then rotate a object like you want it

    bodies[3] = createCompleteNode("Sphere", new f.Material("Sphere", f.ShaderFlat, new f.CoatColored(new f.Color(0.8, 0.3, 0.3, 1))), new f.MeshSphere, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_1, f.COLLIDER_TYPE.SPHERE);
    hierarchy.appendChild(bodies[3]);
    bodies[3].mtxLocal.translate(new f.Vector3(5, 2, 0)); //Translate first to the point you want it


    //Creating a kinematic body
    bodies[4] = createCompleteNode("KinematicPlayerCube", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0, 0, 1, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.KINEMATIC);
    kinematicBody = bodies[4]; //Reference this node specifically so we can access it for input more easily
    kinematicBody.mtxLocal.translate(new f.Vector3(-3, 2, 0));
    hierarchy.appendChild(bodies[4]);


    //Manipulate physical properties
    //Change how the surface material is reacting in form of friction (how easily it slides) and restution (how much it bounces)

    //e.g. Bouncy Sphere
    //Referencing the RB in a specific variable, don't do this unless you change things often.
    let sphereRigidbody: f.ComponentRigidbody = bodies[3].getComponent(f.ComponentRigidbody);
    sphereRigidbody.restitution = 4; //400% of the impulse that is received is kept from the sphere side, i'ts naturally weakened since the ground is absorbing some of the impulse
    /* Hint --> There are different types of calculation of restitution in the physical world, standard is restution of "Sphere" multiplied by restution of "Ground" same goes for friction.
       There are also the types of the greater value is kept or the smaller, other engines like Unity let you choose the type but not in Fudge so it's
       good to use higher values of restitution on bouncy objects since the ground is often having a low restitution. But this is a extreme example.
    */

    //e.g. Fast-Sliding Cube
    let cubeRigidbody: f.ComponentRigidbody = bodies[1].getComponent(f.ComponentRigidbody);
    cubeRigidbody.friction = 0.02;
    // Hint --> You will notice that the pyramid is not sliding since the friction is too high for such a small angle of the ground

    //Give physics objects some FORCE
    sphereRigidbody.applyForce(new f.Vector3(0, 500, 0)); //Add a upward force of 500 Newton to the body at the scene beginning
    /* Hint --> The sphere jumps up first because some for example "wind" hit it. You can either apply forces or impulses to bodies.
                A Force is a continous thing that is happening to the body pushing it, an impulse is instantanious like a collision.
                You can apply impulses, forces, torque and velocity to the center of a body or at a certain point. 
    */
    sphereRigidbody.applyTorque(new f.Vector3(-300, 0, 0)); //Spin the sphere by adding a torque, the difference to a force is that it's affecting the rotation internally

    //e.g. slower falling pyramid
    let pyramidRigidbody: f.ComponentRigidbody = bodies[2].getComponent(f.ComponentRigidbody);
    pyramidRigidbody.linearDamping = 3; //Changing the air resistance to keep if alot longer, all other bodies fall faster now
    /* Hint --> this will damp the effect of every physical interaction. To only achieve a featherfall effect for the body
    better change the effect of gravity. e.g. pyramidRigidbody.gravityScale = 0.3; 
    */

    // We handle more physical properties in the handling function of keypress (hndkey) for more interactivity. The above changes only affecting the starting properties.

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
    f.Loop.start(); //Start the game loop
  }

  //Function to animate/update the Fudge scene, commonly known as gameloop
  function update(): void {
    f.Physics.world.simulate(); //PHYSICS - Simulate physical changes each frame, parameter to set time between frames
    viewPort.draw(); // Draw the current Fudge Scene to the canvas
  }

  // Function to quickly create a node with multiple needed FudgeComponents, including a physics component
  function createCompleteNode(_name: string, _material: f.Material, _mesh: f.Mesh, _mass: number, _physicsType: f.PHYSICS_TYPE, _group: f.PHYSICS_GROUP = f.PHYSICS_GROUP.DEFAULT, _colType: f.COLLIDER_TYPE = f.COLLIDER_TYPE.CUBE): f.Node {
    //Standard Fudge Node Creation
    let node: f.Node = new f.Node(_name); //Creating the node
    let cmpMesh: f.ComponentMesh = new f.ComponentMesh(_mesh); //Creating a mesh for the node
    let cmpMaterial: f.ComponentMaterial = new f.ComponentMaterial(_material); //Creating a material for the node
    let cmpTransform: f.ComponentTransform = new f.ComponentTransform();  //Transform holding position/rotation/scaling of the node

    //PHYSICS - Step 1: Physics Component - A Rigidbody is describing a physical object that can not be deformed, opposite of softbodies. 
    /*A body is describing a physical object. Rigidbodies are the standard physical objects and the way to communicate physics in Fudge
      Rigidbodies are bascially defined by being a object with a mass and a shape of the object (also known as collider).
      Most of the times the shape and mass match the visual representation that is defined with cmpMesh and Transform.
      There are 3 Types of physical bodies:
        - Static:    Immovable, but interacting with other bodies, mostly used for things like obstacles, walls that are fixed
        - Dynamic:   Standard physical object, interacting with everything in a defined physical way,
                     Physical objects only listen to the physics engine, changing the transform will be overwritten by the physics integration.
        - Kinematic: Is able to interact with physical objects, but is controlled by transform/animation. Downside is it can not be moved by physics.
                     So colliding is only possible with dynamic objects it will move through static objects because kinematic objects try to push
                     everything but won't be pushed themselves, so if an object does not move away the kinematic will "glitch" through it. 
    */
    let cmpRigidbody: f.ComponentRigidbody = new f.ComponentRigidbody(_mass, _physicsType, _colType, _group);
    // Hint --> To convert a normal Fudge Node to a physics node just add a ComponentRigidbody defined by a mass, physics interaction type and collider type.
    // e.g. new ComponentRigidbody(1 "kg", Dynamic "Interaction Type", Cube "PhysicsType"); after this you can change a multitude of physical properties but this is enough to get started

    //Adding all components to the node
    node.addComponent(cmpMesh);
    node.addComponent(cmpMaterial);
    node.addComponent(cmpTransform);
    node.addComponent(cmpRigidbody); // <-- best practice to add physics component last
    return node; //return the full created node
  }

  // Event Function handling keyboard input
  function hndKey(_event: KeyboardEvent): void {

    //Move the kinematic body - "Pseudo player character"
    let horizontal: number = 0;  //left/right
    let vertical: number = 0; //front/back
    let height: number = 0; //upwards/downwards

    //Check keyboard input from Event
    if (_event.code == f.KEYBOARD_CODE.A) {
      horizontal -= 1 * stepWidth;
    }
    if (_event.code == f.KEYBOARD_CODE.D) {
      horizontal += 1 * stepWidth;
    }
    if (_event.code == f.KEYBOARD_CODE.W) {
      vertical -= 1 * stepWidth;
    }
    if (_event.code == f.KEYBOARD_CODE.S) {
      vertical += 1 * stepWidth;
    }
    if (_event.code == f.KEYBOARD_CODE.Q) {
      height += 1 * stepWidth;
    }
    if (_event.code == f.KEYBOARD_CODE.E) {
      height -= 1 * stepWidth;
    }
    //Get body position and add the new vector to it and give it back
    let pos: f.Vector3 = kinematicBody.mtxLocal.translation;
    pos.add(new f.Vector3(horizontal, height, vertical));
    kinematicBody.mtxLocal.translation = pos;
    /* Hint --> A kinematic body is controlled like a normal Fudge Node but reacts to physical objects, so no physical code here.
    You'll notice that kinematic bodies can slide into other objects and "break" physical interaction the behaviour is explained in the
    Node creation. And will be handled in a later tutorial. By having a smaller stepwidth you can decrease these problems. Best practice
    is to only use kinematic bodies when really needed. Player Characters should be dynamic bodies with special properties instead of kinematic bodies.
    */

    //PHYSICS - Step 3: Change properties interactivly
    //Interact with the pyramid - Difference between a impulse or force
    if (_event.code == f.KEYBOARD_CODE.F) { //Apply some jump force to our pyramid
      bodies[2].getComponent(f.ComponentRigidbody).applyForce(new f.Vector3(0, 750, 0)); // 500 Newton push
    }
    if (_event.code == f.KEYBOARD_CODE.G) { //Apply some jump impulse to our pyramid 
      bodies[2].getComponent(f.ComponentRigidbody).applyImpulseAtPoint(new f.Vector3(0, 15, 0)); //15 kg Impulse about the same effect
    }
    // Hint --> Impulses are much stronger because of their instantaneous nature they do not use force to slowly push something it's a direct hit, so keep that value low


    //You can influence the time in which the physics are calculated either in update when you change the default of 60 fps in f.Physics.world.simulate(timeDelta)
    //or by changing the whole timescale of your Fudge App.
    if (_event.code == f.KEYBOARD_CODE.I) {
      f.Time.game.setScale(2);
    }
    if (_event.code == f.KEYBOARD_CODE.K) {
      f.Time.game.setScale(1);
    }
    if (_event.code == f.KEYBOARD_CODE.M) {
      f.Time.game.setScale(0.5);
    }

  }

}