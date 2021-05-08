//Reference Fudge, getting code completion ready and creating a shortcut f to write FudgeCode more comfortably

namespace Tutorials_FUDGEPhysics_Lesson1 {
  import f = FudgeCore;

  /*GOAL: Learning how to connect physical bodies with each other and what types of connections can be used to create different
          physical phenomena. And lastly how they can be influenced. In this tutorial not all joints are explained it's a means to get started,
          there are 6 types of joints in the Fudge Physics integration, once you understand prismatic/cylindrical joint the others are a combination
          of the learned techniques.
  */
  //-> We will create: A Spring like piston that is teaching the usage of a translationalMotor and spring properties 
  //-> We will create: A Drill like object that is teaching the usaeg of rotationalMotor - Axis/Anchor
  //All other joints use different amounts of these techniques translation/rotation Motor, Spring, Axis/Anchor

  //Fudge Basic Variables
  window.addEventListener("load", init);
  const app: HTMLCanvasElement = document.querySelector("canvas"); // The html element where the scene is drawn to
  let viewPort: f.Viewport; // The scene visualization
  let hierarchy: f.Node; // You're object scene tree
  let cmpCamera: f.ComponentCamera; //The camera in the scene to shot the ray from


  //Physical Objects
  let bodies: f.Node[] = new Array(); // Array of all physical objects in the scene to have a quick reference
  let prismaticJoint: f.ComponentJointPrismatic; //Quick reference of the joints we will create for later interaction
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
    //PHYSICS - Basic Plane and Cube
    //Creating a physically static ground plane for our physics playground. A simple scaled cube but with physics type set to static
    bodies[0] = createCompleteNode("Ground", new f.Material("Ground", f.ShaderFlat, new f.CoatColored(new f.Color(0.2, 0.2, 0.2, 1))), new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC);
    bodies[0].mtxLocal.scale(new f.Vector3(14, 0.3, 14)); //Scale the body with it's standard ComponentTransform
    hierarchy.appendChild(bodies[0]); //Add the node to the scene by adding it to the scene-root

    //Step 1 - Create bodies that we want to connect and to play with

    //First some static bodies that we want to connect objects to with joints
    bodies[1] = createCompleteNode("JointHolder_Prismatic", fixedJointMaterial, new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC);
    bodies[1].mtxLocal.translate(new f.Vector3(-2, 1, 0));
    hierarchy.appendChild(bodies[1]);

    bodies[2] = createCompleteNode("JointHolder_Cylindrical", fixedJointMaterial, new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC);
    bodies[2].mtxLocal.translate(new f.Vector3(2, 3.5, 0)); //This one we set a little higher since the connected body should dangle from it
    hierarchy.appendChild(bodies[2]);

    //And creating the bodies that we will connect
    bodies[3] = createCompleteNode("Connected_Prismatic", jointMaterial, new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC);
    bodies[3].mtxLocal.translate(new f.Vector3(-2, 3, 0));
    bodies[3].mtxLocal.scale(new f.Vector3(1.5, 0.2, 1.5));
    hierarchy.appendChild(bodies[3]);

    bodies[4] = createCompleteNode("Connected_Cylindrical", jointMaterial, new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC);
    bodies[4].mtxLocal.translate(new f.Vector3(2, 2, 0));
    bodies[4].mtxLocal.scale(new f.Vector3(0.3, 2, 0.3));
    hierarchy.appendChild(bodies[4]);

    //And we create a test cube that we use to interact with the joints
    bodies[5] = createCompleteNode("Tester", defaultMaterial, new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC);
    bodies[5].mtxLocal.translate(new f.Vector3(-2, 5, 0));
    hierarchy.appendChild(bodies[5]);

    /*Playing the scene now, without any joints you will notice physics will move objects accordingly, 
    everything dynamic will fall until it hits the ground and static objects stay in place. 
    Until now objects are unconnected and you can't connect them with hierarchy like you would with normal NODES since physics is overriding that.
    */

    //Step 2 - Creating a joint and connect bodies

    /*Adding a new component to a node of type ComponentJointJointName - e.g. Prismatic
    The component needs two bodies that should be connected, the first is the attachedRigidbody thats the body that this component will be added to
    the other is the connectedRigidbody that body that is holding onto the body. Positioning of the anchor where this body is connected happens locally
    to the attachedRigidbody. */
    prismaticJoint = new f.ComponentJointPrismatic(bodies[1].getComponent(f.ComponentRigidbody), bodies[3].getComponent(f.ComponentRigidbody), new f.Vector3(0, 1, 0), new f.Vector3(0, 0.5, 0));
    bodies[1].addComponent(prismaticJoint);
    //A joint is craeted by telling it which to bodies should connect, where they should connect, and in which axis (direction) the connection is not rigid.
    //e.g. we connect our holder_prismatic with the connected_prismatic half way up the holder and in the y axis to create a piston that can only move up/down.

    /*Hint: Testing at this point will show you something new. The green plate will fall through the orange holder. Thats because they are now connected.
      Connected bodies do by default not collide and since they constraints are not setup the piston plate is not hold aloft. We will change that in Step 3.
    */

    //Adding a cylindrical joint is the same procedure like adding any other joint there acn be a few differences in the constructors you should watch out for.
    cylindricalJoint = new f.ComponentJointCylindrical(bodies[2].getComponent(f.ComponentRigidbody), bodies[4].getComponent(f.ComponentRigidbody));
    bodies[2].addComponent(cylindricalJoint);
    //This time we will just connect the bodies since the default axis is up already and we want the anchor to be Vector(0,0,0) from the first body.


    //Step 3 - Setup constraints 
    //We want both joints to collide with themselves again - now they behave like before they where connected
    prismaticJoint.internalCollision = true;
    cylindricalJoint.internalCollision = true;

    //Setting up our spring piston
    /*Main problem why it's not held aloft because it has the freedom to move 10 meters away from it's partner
     by default before any constraints happen, like it is on a rope that is only tighten when it's too far away.
     Every joint has a thing called motor which defines things like limits and how they are reached.
    */
    prismaticJoint.motorLimitUpper = 0;
    prismaticJoint.motorLimitLower = 0;
    //So telling the motor that both limits are 0 the body is fixed to one another no movement whatsoever.
    //Now we want it to move up/down by the power of a spring - a setting that most joints have is to try to reset the position by having a spring
    prismaticJoint.springDamping = 0.2; //We define how much the spring slows down the incomming force
    //The strength of the spring in form of Hertz, the higher the hertz the more power the spring has, 
    //so the less the connected body can move away from the start. A spring of 0 Hertz is rigid thats the default so no spring.
    prismaticJoint.springFrequency = 0.7;
    //Testing now, we see what we expect a spring system similar to a scale or in a car that is dampening an incoming impulse.

    //Setting up our drill
    //For this we have the same translationalMotor, so a motor that defines movement. Since the defaults allow movement it is not held aloft
    cylindricalJoint.translationMotorLimitUpper = 0.25;
    cylindricalJoint.translationMotorLimitLower = -0.25;
    /*Since this joint allows not only movement but also rotation we have two distinct motors a translationMotor and a rotation.
    When using joints look out for these types of motors some joints can even have 1 of those for each axis. Since a joint can sometimes also 
    have the possibilty to move in more directions.
    */
    //We are not change the rotationalMotor since it's default value is 0-360 degree so it's fully rotational and thats what we want in this case.
    //But keep in mind rotations needs to be set in degree and translation in meters.

    //But we will introduce another functionality of a motor now force/speed
    //Setting up speed - A movement/rotation along the defined axis of our joint that is tried to be reached in m/s
    cylindricalJoint.rotationalMotorSpeed = 5; //We want our drill to drill with 5m/s
    //What we will notice is nothing. Because the speed is what we want to reach. But how can it move without a force to reach it
    cylindricalJoint.rotationalMotorTorque = 25; //So we have to setup a power that is trying to reach the speed.
    //Hint: The power is also the thing that keeps the object from being pushed if speed is 0; So even a unmoving motor should have a Torque/Force

    //Step 4 - At this point you learned the most important things about joints, we will handle some more changes in update with keypresses.
    document.addEventListener("keydown", hndKeydown);

    //#endregion Physics

    //Standard Fudge Scene Initialization - Creating a directional light, a camera and initialize the viewport
    let cmpLight: f.ComponentLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE")));
    cmpLight.mtxPivot.lookAt(new f.Vector3(-0.5, -1, -0.8)); //Set light direction
    hierarchy.addComponent(cmpLight);

    cmpCamera = new f.ComponentCamera();
    cmpCamera.clrBackground = f.Color.CSS("GREY");
    cmpCamera.mtxPivot.translate(new f.Vector3(2, 3.5, 17)); //Move camera far back so the whole scene is visible
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

  function hndKeydown(_event: KeyboardEvent): void {
    if (_event.code == f.KEYBOARD_CODE.V) {
      //We can add a force to our piston plane to push the object back up again
      prismaticJoint.connectedRigidbody.applyForce(new f.Vector3(0, 500, 0));
    }
    if (_event.code == f.KEYBOARD_CODE.B) {
      //Joints can also be broken in a realistic way if overused, to break them if a certain force is pushing/rotating them use breakForce/Torque
      prismaticJoint.breakForce = 20;
      //We reset the test cube to fall from a higher distance and see what happens
      bodies[5].getComponent(f.ComponentRigidbody).setPosition(new f.Vector3(-2, 10, 0));
    }
    if (_event.code == f.KEYBOARD_CODE.N) { //Same for rotation breakTorque
      cylindricalJoint.breakTorque = 20;
      cylindricalJoint.rotationalMotorSpeed = 10;
    }
    if (_event.code == f.KEYBOARD_CODE.M) { //Now add some force sideways on the body to break the torque axis
      //You can easily access both participants in the joint connection with .attachedRigidbody / .connectedRigidbody
      cylindricalJoint.connectedRigidbody.applyImpulseAtPoint(new f.Vector3(-300, 0, 0));
    }

    if (_event.code == f.KEYBOARD_CODE.J) { //Now add some force from below to show the translationalMotor in effect, the drill is slightly able to be pressed in
      cylindricalJoint.connectedRigidbody.applyForce(new f.Vector3(0, 300, 0));
    }
  }


}