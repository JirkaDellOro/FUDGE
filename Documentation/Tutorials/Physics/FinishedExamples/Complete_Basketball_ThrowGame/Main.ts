//Reference Fudge, getting code completion ready and creating a shortcut f to write FudgeCode more comfortably

namespace Tutorials_FUDGEPhysics_Lesson1 {
  import f = FudgeCore;

  //GOAL: Learning to use the physical raycast to interact with objects. Different method than the standard Fudge Depth Texture Raycast

  //Fudge Basic Variables
  window.addEventListener("load", init);
  const app: HTMLCanvasElement = document.querySelector("canvas"); // The html element where the scene is drawn to
  let goalCounter: HTMLElement = document.getElementById("pointsCounter");
  let viewPort: f.Viewport; // The scene visualization
  let hierarchy: f.Node; // You're object scene tree
  let cmpCamera: f.ComponentCamera; //The camera in the scene to shot the ray from


  //Physical Objects
  let bodies: f.Node[] = new Array(); // Array of all physical objects in the scene to have a quick reference
  let ball: f.ComponentRigidbody = null; //The Ball we are playing with


  //Setting Variables


  //Miscellaneous Variables
  let ballStart: f.Vector3 = new f.Vector3(0, 1.5, 3);
  let startPosition: f.Vector2;
  let endPosition: f.Vector2;
  let playerForce: number = 5000;
  let points: number = 0;
  let lastSpeed: number = 0;

  //Materials
  let boardDefault: f.Material = new f.Material("Board", f.ShaderFlat, new f.CoatColored(new f.Color(0.85, 0.95, 0.85, 1)));
  let boardGoal: f.Material = new f.Material("BoardGoal", f.ShaderFlat, new f.CoatColored(new f.Color(0.2, 0.95, 0.2, 1)));
  let groundMaterial: f.Material = new f.Material("Ground", f.ShaderFlat, new f.CoatColored(new f.Color(0.2, 0.2, 0.2, 1)));

  //Function to initialize the Fudge Scene with a camera, light, viewport and PHYSCIAL Objects
  function init(_event: Event): void {

    hierarchy = new f.Node("Scene"); //create the root Node where every object is parented to. Should never be changed

    //#region Physics
    //PHYSICS - Basic Plane and Cube
    //Creating a physically static ground plane for our physics playground. A simple scaled cube but with physics type set to static
    bodies[0] = createCompleteNode("Ground", groundMaterial, new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC);
    bodies[0].mtxLocal.scale(new f.Vector3(14, 0.3, 14)); //Scale the body with it's standard ComponentTransform
    bodies[0].getComponent(f.ComponentRigidbody).restitution = 0.5;
    hierarchy.appendChild(bodies[0]); //Add the node to the scene by adding it to the scene-root

    //Backwalls - So cubes are not pushed away easily
    bodies[1] = createCompleteNode("WallBack", groundMaterial, new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC);
    bodies[1].mtxLocal.translate(new f.Vector3(0, -7, -7.5));
    bodies[1].mtxLocal.scale(new f.Vector3(14, 0.3, 15));
    bodies[1].mtxLocal.rotateX(90, true);
    hierarchy.appendChild(bodies[1]);

    bodies[2] = createCompleteNode("WallLeft", groundMaterial, new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC);
    bodies[2].mtxLocal.translate(new f.Vector3(7.5, 7, 0));
    bodies[2].mtxLocal.scale(new f.Vector3(15, 0.3, 14));
    bodies[2].mtxLocal.rotateZ(90, true);
    hierarchy.appendChild(bodies[2]);

    bodies[3] = createCompleteNode("WallRight", groundMaterial, new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC);
    bodies[3].mtxLocal.translate(new f.Vector3(-7.5, 7, 0));
    bodies[3].mtxLocal.scale(new f.Vector3(15, 0.3, 14));
    bodies[3].mtxLocal.rotateZ(-90, true);
    hierarchy.appendChild(bodies[3]);

    //Ball
    bodies[4] = createCompleteNode("Basketball", new f.Material("Basketball", f.ShaderFlat, new f.CoatColored(new f.Color(181 / 255, 66 / 255, 19 / 255))), new f.MeshSphere(), 0.65, f.PHYSICS_TYPE.KINEMATIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.SPHERE);
    bodies[4].mtxLocal.translate(ballStart);
    bodies[4].mtxLocal.scale(new f.Vector3(0.26, 0.26, 0.26)); //26cm diameter basketball
    hierarchy.appendChild(bodies[4]);
    ball = bodies[4].getComponent(f.ComponentRigidbody);
    ball.restitution = 0.95;

    createCourt(5, new f.Vector3(0, 3.05, -6));

    createShootableDecoration(12, new f.Vector3(3, 0.5, -3));
    createShootableDecoration(14, new f.Vector3(-3, 0.5, -2));
    createShootableDecoration(16, new f.Vector3(-2, 4, -4), -1);

    //Add Events to our trigger and colliders
    bodies[11].getComponent(f.ComponentRigidbody).addEventListener(f.EVENT_PHYSICS.TRIGGER_ENTER, goalCheckEnter);
    bodies[11].getComponent(f.ComponentRigidbody).addEventListener(f.EVENT_PHYSICS.TRIGGER_EXIT, goalCheckExit);

    bodies[0].getComponent(f.ComponentRigidbody).addEventListener(f.EVENT_PHYSICS.COLLISION_ENTER, groundColEnter);
    bodies[13].getComponent(f.ComponentRigidbody).addEventListener(f.EVENT_PHYSICS.COLLISION_ENTER, targetColEnter);
    bodies[15].getComponent(f.ComponentRigidbody).addEventListener(f.EVENT_PHYSICS.COLLISION_ENTER, targetColEnter);
    bodies[17].getComponent(f.ComponentRigidbody).addEventListener(f.EVENT_PHYSICS.COLLISION_ENTER, targetColEnter);
    //#endregion

    f.Physics.world.setSolverIterations(15);

    //Standard Fudge Scene Initialization - Creating a directional light, a camera and initialize the viewport
    let cmpLight: f.ComponentLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE")));
    cmpLight.mtxPivot.lookAt(new f.Vector3(-0.5, -1, -0.8)); //Set light direction
    hierarchy.addComponent(cmpLight);

    cmpCamera = new f.ComponentCamera();
    cmpCamera.clrBackground = f.Color.CSS("GREY");
    cmpCamera.mtxPivot.translate(new f.Vector3(0, 1.5, 6)); //Centered Camera a little bit backwards
    cmpCamera.mtxPivot.lookAt(new f.Vector3(0, 2, 0)); //Set the camera matrix so that it looks at the basket

    viewPort = new f.Viewport(); //Creating a viewport that is rendered onto the html canvas element
    viewPort.initialize("Viewport", hierarchy, cmpCamera, app); //initialize the viewport with the root node, camera and canvas

    //Activating input events - Important for this lesson
    viewPort.activatePointerEvent(f.EVENT_POINTER.DOWN, true); //Tell Fudge to use it's internal mouse event 
    viewPort.addEventListener(f.EVENT_POINTER.DOWN, hndMouseDown); //Set what function should receive the event
    viewPort.activatePointerEvent(f.EVENT_POINTER.UP, true);
    viewPort.addEventListener(f.EVENT_POINTER.UP, hndMouseUp);

    //Physics Events

    //PHYSICS - Start using physics by telling the physics the scene root object. Physics will recalculate every transform and initialize
    f.Physics.adjustTransforms(hierarchy);

    //f.Physics.settings.debugDraw = true; //Seeing the physical scene in debug mode - Lesson Debugging

    //Important start the game loop after starting physics, so physics can use the current transform before it's first iteration
    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update); //Tell the game loop to call the update function on each frame
    f.Loop.start(); //Stard the game loop
  }

  //Function to animate/update the Fudge scene, commonly known as gameloop
  function update(): void {
    f.Physics.world.simulate(); //PHYSICS - Simulate physical changes each frame, parameter to set time between frames
    raycastSpeedTest();
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

  //Creating a node without any physics
  function createStandardFudgeNode(_name: string, _material: f.Material, _mesh: f.Mesh): f.Node {
    let node: f.Node = new f.Node(_name); //Creating the node
    let cmpMesh: f.ComponentMesh = new f.ComponentMesh(_mesh); //Creating a mesh for the node
    let cmpMaterial: f.ComponentMaterial = new f.ComponentMaterial(_material); //Creating a material for the node
    let cmpTransform: f.ComponentTransform = new f.ComponentTransform();  //Transform holding position/rotation/scaling of the node
    node.addComponent(cmpMesh);
    node.addComponent(cmpMaterial);
    node.addComponent(cmpTransform);
    return node;
  }

  //What happens when the left mouse button is pressed
  function hndMouseDown(_event: f.EventPointer) {
    resetBall();
    startPosition = viewPort.pointClientToProjection(new f.Vector2(_event.pointerX, _event.pointerY));
  }

  //What happens when the left mouse button is released
  function hndMouseUp(_event: f.EventPointer) {
    endPosition = viewPort.pointClientToProjection(new f.Vector2(_event.pointerX, _event.pointerY));
    let xDirection: number = startPosition.x - endPosition.x;
    let forwardUpStrength: number = startPosition.y - endPosition.y;
    let differenceVector: f.Vector2 = f.Vector2.DIFFERENCE(startPosition, endPosition);
    let power: number = differenceVector.magnitude * playerForce;
    throwBall(xDirection, forwardUpStrength, power);
  }

  function throwBall(_xDirection: number, _forwardUpStrength: number, _power: number) {
    ball.physicsType = f.PHYSICS_TYPE.DYNAMIC; //make ball listening to physics again
    ball.applyForce(new f.Vector3(-_xDirection * _power * 0.8, _power * -_forwardUpStrength * 0.8, _forwardUpStrength * _power)); //throw the ball with forces
    ball.applyTorque(new f.Vector3(-0.0005 * _power, 0, 0)); //Just add a tad bit of rotational force to make it visually more realistic
  }

  function resetBall() {
    //ball.setPosition(ballStart); <-- Position can't be set by physics since you make the ball kinematic in the same frame
    ball.getContainer().mtxLocal.translation = ballStart; // Kinematic objects need to be set through normal transform
    ball.getContainer().mtxLocal.rotation = f.Vector3.ZERO();
    ball.setVelocity(new f.Vector3(0, 0, 0));
    ball.setAngularVelocity(new f.Vector3(0, 0, 0));
    ball.physicsType = f.PHYSICS_TYPE.KINEMATIC;
  }

  //Creating a basket and a board with some decoration - 7 new bodies
  function createCourt(_bodyStartNo: number, _position: f.Vector3) {
    let materialBasket: f.Material = new f.Material("Basket", f.ShaderFlat, new f.CoatColored(new f.Color(0.9, 0.2, 0.2, 1)));
    let basketPosition: f.Vector3 = _position;
    //Basket - Square - Not completly real values of course since it's no circle
    bodies[_bodyStartNo] = createCompleteNode("BasketBack", materialBasket, new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC);
    bodies[_bodyStartNo].mtxLocal.translate(new f.Vector3(basketPosition.x, basketPosition.y, basketPosition.z));
    bodies[_bodyStartNo].mtxLocal.scale(new f.Vector3(0.6, 0.05, 0.15));
    hierarchy.appendChild(bodies[_bodyStartNo]);
    bodies[_bodyStartNo + 1] = createCompleteNode("BasketSide", materialBasket, new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC);
    bodies[_bodyStartNo + 1].mtxLocal.translate(new f.Vector3(basketPosition.x + 0.3, basketPosition.y, basketPosition.z - 0.3));
    bodies[_bodyStartNo + 1].mtxLocal.scale(new f.Vector3(0.15, 0.05, 0.6));
    hierarchy.appendChild(bodies[_bodyStartNo + 1]);
    bodies[_bodyStartNo + 2] = createCompleteNode("BasketSide", materialBasket, new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC);
    bodies[_bodyStartNo + 2].mtxLocal.translate(new f.Vector3(basketPosition.x - 0.3, basketPosition.y, basketPosition.z - 0.3));
    bodies[_bodyStartNo + 2].mtxLocal.scale(new f.Vector3(0.15, 0.05, 0.6));
    hierarchy.appendChild(bodies[_bodyStartNo + 2]);
    bodies[_bodyStartNo + 3] = createCompleteNode("BasketFront", materialBasket, new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC);
    bodies[_bodyStartNo + 3].mtxLocal.translate(new f.Vector3(basketPosition.x, basketPosition.y, basketPosition.z - 0.6));
    bodies[_bodyStartNo + 3].mtxLocal.scale(new f.Vector3(0.6, 0.05, 0.15));
    hierarchy.appendChild(bodies[_bodyStartNo + 3]);
    bodies[_bodyStartNo + 4] = createCompleteNode("BasketHolder", materialBasket, new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC);
    bodies[_bodyStartNo + 4].mtxLocal.translate(new f.Vector3(basketPosition.x, basketPosition.y - 0.01, basketPosition.z - 0.775));
    bodies[_bodyStartNo + 4].mtxLocal.scale(new f.Vector3(0.15, 0.05, 0.6));
    hierarchy.appendChild(bodies[_bodyStartNo + 4]);
    bodies[_bodyStartNo + 5] = createCompleteNode("WhiteBoard", boardDefault, new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC);
    bodies[_bodyStartNo + 5].mtxLocal.translate(new f.Vector3(basketPosition.x, basketPosition.y + 0.45, basketPosition.z - 0.775)); //Board 17.5 cm from basket
    bodies[_bodyStartNo + 5].mtxLocal.scale(new f.Vector3(1.80, 1.05, 0.15));
    hierarchy.appendChild(bodies[_bodyStartNo + 5]);

    //Board black decoration
    let node: f.Node; //we do not add them to bodies they will only be decorative and therefore normal Fudge nodes
    let decorationMaterial: f.Material = new f.Material("BoardDeco", f.ShaderFlat, new f.CoatColored(new f.Color(0.1, 0.1, 0.1, 1)));
    node = createStandardFudgeNode("BlackUpperStripe", decorationMaterial, new f.MeshCube());
    node.mtxLocal.translate(new f.Vector3(basketPosition.x, basketPosition.y + 0.5, basketPosition.z - 0.7235)); //Board 17.5 cm from basket
    node.mtxLocal.scale(new f.Vector3(0.59, 0.05, 0.05));
    hierarchy.appendChild(node);
    node = createStandardFudgeNode("BlackLowerStripe", decorationMaterial, new f.MeshCube());
    node.mtxLocal.translate(new f.Vector3(basketPosition.x, basketPosition.y + 0.05, basketPosition.z - 0.7235)); //Board 17.5 cm from basket
    node.mtxLocal.scale(new f.Vector3(0.59, 0.05, 0.05));
    hierarchy.appendChild(node);
    node = createStandardFudgeNode("BlackLeftStripe", decorationMaterial, new f.MeshCube());
    node.mtxLocal.translate(new f.Vector3(basketPosition.x - 0.27, basketPosition.y + 0.25, basketPosition.z - 0.7235)); //Board 17.5 cm from basket
    node.mtxLocal.scale(new f.Vector3(0.05, 0.45, 0.05));
    hierarchy.appendChild(node);
    node = createStandardFudgeNode("BlackRightStripe", decorationMaterial, new f.MeshCube());
    node.mtxLocal.translate(new f.Vector3(basketPosition.x + 0.27, basketPosition.y + 0.25, basketPosition.z - 0.7235)); //Board 17.5 cm from basket
    node.mtxLocal.scale(new f.Vector3(0.05, 0.45, 0.05));
    hierarchy.appendChild(node);

    //GoalTrigger - Slightly positioned under the basket entry so it only counts when it goes through and very small
    bodies[_bodyStartNo + 6] = createCompleteNode("GoalTrigger", materialBasket, new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.TRIGGER);
    bodies[_bodyStartNo + 6].removeComponent(bodies[_bodyStartNo + 6].getComponent(f.ComponentMesh)); //Trigger does not need to be visible so remove the mesh component
    bodies[_bodyStartNo + 6].mtxLocal.translate(new f.Vector3(basketPosition.x, basketPosition.y - 0.05, basketPosition.z - 0.3));
    bodies[_bodyStartNo + 6].mtxLocal.scale(new f.Vector3(0.1, 0.05, 0.1));
    hierarchy.appendChild(bodies[_bodyStartNo + 6]);
  }

  //Some Bodies on Joints that move when hit by the ball, just for visuals and fun - Lesson Joints
  function createShootableDecoration(_bodyStartNo: number, _position: f.Vector3, _height: number = 1) {
    let stickMaterial: f.Material = new f.Material("JointStick", f.ShaderFlat, new f.CoatColored(new f.Color(0, 0.15, 1, 0.7)))
    //Spherical Joint
    bodies[_bodyStartNo] = createCompleteNode("Socket", groundMaterial, new f.MeshCube(), 1, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_1);
    hierarchy.appendChild(bodies[_bodyStartNo]);
    bodies[_bodyStartNo].mtxLocal.translate(new f.Vector3(_position.x, _position.y, _position.z));
    bodies[_bodyStartNo].mtxLocal.scale(new f.Vector3(0.5, 0.5, 0.5));

    bodies[_bodyStartNo + 1] = createCompleteNode("BallJoint", stickMaterial, new f.MeshCube(), 0.5, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_1);
    hierarchy.appendChild(bodies[_bodyStartNo + 1]);
    bodies[_bodyStartNo + 1].mtxLocal.translate(new f.Vector3(_position.x, _position.y + _height, _position.z));
    bodies[_bodyStartNo + 1].mtxLocal.scale(new f.Vector3(0.3, 1.5, 0.3));
    let hingeJoint = new f.ComponentJointRevolute(bodies[_bodyStartNo].getComponent(f.ComponentRigidbody), bodies[_bodyStartNo + 1].getComponent(f.ComponentRigidbody), new f.Vector3(1, 0, 0));
    bodies[_bodyStartNo].addComponent(hingeJoint);
    hingeJoint.springDamping = 0.9;
  }


  //Spawn a object that is signaling a fresh bounce on the ground - Lesson Collision Events - Impulses
  function spawnDecoObjectOnSpot(_position: f.Vector3, _impulseStrength: number = 0) {
    let _node = createStandardFudgeNode("Deko", boardDefault, new f.MeshCube());
    _node.mtxLocal.translate(_position);
    _node.mtxLocal.scale(new f.Vector3(0.1, _impulseStrength / 10, 0.1));
    hierarchy.addChild(_node);
    window.setTimeout(despawnDecoObject, 1000, _node);
  }

  //Remove the child against after a while (not performant, should use object pooling but that is not part of the lesson)
  function despawnDecoObject(_node: f.Node) {
    hierarchy.removeChild(_node);
  }

  //Simple Raycast that is checking the speed of the passing ball on the basketring - Lesson Raycast
  function raycastSpeedTest() {
    let origin = new f.Vector3(0, 3.15, -6.775);
    let rayHit: f.RayHitInfo = f.Physics.raycast(origin, new f.Vector3(0, 0, 1), 1.5);
    if (rayHit.hit && rayHit.rigidbodyComponent.getContainer().name == "Basketball") {
      lastSpeed = ball.getVelocity().magnitude;
      goalCounter.textContent = "Points: " + points.toString() + " / Speed: " + lastSpeed.toFixed(2);
    }
  }

  //#region Event Handling
  //Register a triggering event - Lesson Trigger Events
  function goalCheckEnter(_event: f.EventPhysics) {
    if (_event.cmpRigidbody.getContainer().name == "Basketball") {
      bodies[10].getComponent(f.ComponentMaterial).material = boardGoal;
      points += 100;
      goalCounter.textContent = "Points: " + points.toString() + " / Speed: " + lastSpeed.toFixed(2);
    }
  }

  function goalCheckExit(_event: f.EventPhysics) {
    if (_event.cmpRigidbody.getContainer().name == "Basketball") {
      bodies[10].getComponent(f.ComponentMaterial).material = boardDefault;
    }
  }

  //Register a collision of a body with the ground - Lesson Collision Events
  function groundColEnter(_event: f.EventPhysics) {
    if (_event.cmpRigidbody.getContainer().name == "Basketball") {
      spawnDecoObjectOnSpot(_event.collisionPoint, _event.normalImpulse);
    }
  }

  function targetColEnter(_event: f.EventPhysics) {
    if (_event.cmpRigidbody.getContainer().name == "Basketball") {
      points += 50;
      goalCounter.textContent = "Points: " + points.toString() + " / Speed: " + lastSpeed.toFixed(2);
    }
  }
  //#endregion

}