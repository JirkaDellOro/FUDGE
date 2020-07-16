///<reference types="../../../../Core/Build/FudgeCore.js"/>
import f = FudgeCore;
//Reference Fudge, getting code completion ready and creating a shortcut f to write FudgeCode more comfortably

namespace Turorials_FUDGEPhysics_Lesson1 {

  //Fudge Basic Variables
  window.addEventListener("load", init);
  const app: HTMLCanvasElement = document.querySelector("canvas"); // The html element where the scene is drawn to
  let viewPort: f.Viewport; // The scene visualization
  let hierarchy: f.Node; // You're object scene tree


  //Physical Objects
  let bodies: f.Node[] = new Array(); // Array of all physical objects in the scene to have a quick reference

  //Setting Variables
  let materialConvexShape: f.Material = new f.Material("MorningStar", f.ShaderFlat, new f.CoatColored(new f.Color(0.5, 0.4, 0.35, 1)));

  //Function to initialize the Fudge Scene with a camera, light, viewport and PHYSCIAL Objects
  function init(_event: Event): void {

    hierarchy = new f.Node("Scene"); //create the root Node where every object is parented to. Should never be changed

    //#region PHYSICS
    f.Physics.settings.defaultRestitution = 0.7;
    f.Physics.settings.defaultFriction = 1;

    //PHYSICS 
    //Creating a physically static ground plane for our physics playground. A simple scaled cube but with physics type set to static
    bodies[0] = createCompleteNode("Ground", new f.Material("Ground", f.ShaderFlat, new f.CoatColored(new f.Color(0.2, 0.2, 0.2, 1))), new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC);
    bodies[0].mtxLocal.scale(new f.Vector3(14, 0.3, 14)); //Scale the body with it's standard ComponentTransform
    bodies[0].mtxLocal.rotateX(4, true); //Give it a slight rotation so the physical objects are sliding, always from left when it's after a scaling
    hierarchy.appendChild(bodies[0]); //Add the node to the scene by adding it to the scene-root


    //CONCEPT 1 - Convex Colliders / Compound Collider - A Collider Shape that is not predefined and has no holes in it
    //e.g. something like a morning star shape a cube with pyramides as spikes on the side
    createConvexCompountCollider();

    //CONCEPT 2 - Setting Up a physical player
    //A physical player is a standard physical object of the type dynamic, BUT, you only want to rotate on Y axis, and you want to setup things
    //like a grounded variable and other movement related stuff.
    settingUpPhysicalPlayer();

    //#endregion PHYSICS


    //Standard Fudge Scene Initialization - Creating a directional light, a camera and initialize the viewport
    let cmpLight: f.ComponentLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE")));
    cmpLight.pivot.lookAt(new f.Vector3(0.5, -1, -0.8)); //Set light direction
    hierarchy.addComponent(cmpLight);

    let cmpCamera: f.ComponentCamera = new f.ComponentCamera();
    cmpCamera.backgroundColor = f.Color.CSS("GREY");
    cmpCamera.pivot.translate(new f.Vector3(2, 3.5, 17)); //Move camera far back so the whole scene is visible
    cmpCamera.pivot.lookAt(f.Vector3.ZERO()); //Set the camera matrix so that it looks at the center of the scene

    viewPort = new f.Viewport(); //Creating a viewport that is rendered onto the html canvas element
    viewPort.initialize("Viewport", hierarchy, cmpCamera, app); //initialize the viewport with the root node, camera and canvas

    document.addEventListener("keypress", hndKey); //Adding a listener for keypress handling

    //PHYSICS - Start using physics by telling the physics the scene root object. Physics will recalculate every transform and initialize
    f.Physics.start(hierarchy);

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
    bodies[5] = createCompleteNode("Compound", materialConvexShape, new f.MeshCube, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.CONVEX, colliderVertices);
    hierarchy.appendChild(bodies[5]);
    bodies[5].mtxLocal.translate(new f.Vector3(2.5, 4, 3.5));
    bodies[5].mtxLocal.rotateX(27);
    bodies[5].mtxLocal.rotateY(32);
    //Components - Removing the Physics component on each of them since they all build one shape on the main Node only the visual nodes need to be there
    bodies[6] = createCompleteNode("CompoundUpper", materialConvexShape, new f.MeshPyramid, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
    bodies[6].removeComponent(bodies[6].getComponent(f.ComponentRigidbody));
    bodies[6].mtxLocal.translateY(0.5);
    bodies[6].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
    bodies[5].appendChild(bodies[6]); //appending the Node not to the main hierarchy but the Node it is part of
    bodies[7] = createCompleteNode("CompoundLower", materialConvexShape, new f.MeshPyramid, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
    bodies[7].removeComponent(bodies[7].getComponent(f.ComponentRigidbody));
    bodies[7].mtxLocal.rotateX(180);
    bodies[7].mtxLocal.translateY(0.5);
    bodies[7].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
    bodies[5].appendChild(bodies[7]);
    bodies[8] = createCompleteNode("CompoundLeft", materialConvexShape, new f.MeshPyramid, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
    bodies[8].removeComponent(bodies[8].getComponent(f.ComponentRigidbody));
    bodies[8].mtxLocal.rotateZ(90);
    bodies[8].mtxLocal.translateY(0.5);
    bodies[8].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
    bodies[5].appendChild(bodies[8]);
    bodies[9] = createCompleteNode("CompoundRight", materialConvexShape, new f.MeshPyramid, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
    bodies[9].removeComponent(bodies[9].getComponent(f.ComponentRigidbody));
    bodies[9].mtxLocal.rotateZ(-90);
    bodies[9].mtxLocal.translateY(0.5);
    bodies[9].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
    bodies[5].appendChild(bodies[9]);
    bodies[10] = createCompleteNode("CompoundFront", materialConvexShape, new f.MeshPyramid, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
    bodies[10].removeComponent(bodies[10].getComponent(f.ComponentRigidbody));
    bodies[10].mtxLocal.rotateX(90);
    bodies[10].mtxLocal.translateY(0.5);
    bodies[10].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
    bodies[5].appendChild(bodies[10]);
    bodies[11] = createCompleteNode("CompoundBack", materialConvexShape, new f.MeshPyramid, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
    bodies[11].removeComponent(bodies[11].getComponent(f.ComponentRigidbody));
    bodies[11].mtxLocal.rotateX(-90);
    bodies[11].mtxLocal.translateY(0.5);
    bodies[11].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
    bodies[5].appendChild(bodies[11]);
    bodies[5].getComponent(f.ComponentRigidbody).restitution = 0.8;
  }

  function settingUpPhysicalPlayer(): void {

  }

  // Event Function handling keyboard input
  function hndKey(_event: KeyboardEvent): void {


  }

}