// /<reference types="../../../../Core/Build/FudgeCore.js"/>
import f = FudgeCore;
//Reference Fudge, getting code completion ready and creating a shortcut f to write FudgeCode more comfortably

namespace Tutorials_FUDGEPhysics_Lesson1 {

  //GOAL: Learning to use the physical raycast to interact with objects. Different method than the standard Fudge Depth Texture Raycast

  //Fudge Basic Variables
  window.addEventListener("load", init);
  const app: HTMLCanvasElement = document.querySelector("canvas"); // The html element where the scene is drawn to
  let viewPort: f.Viewport; // The scene visualization
  let hierarchy: f.Node; // You're object scene tree
  let cmpCamera: f.ComponentCamera; //The camera in the scene to shot the ray from


  //Physical Objects
  let bodies: f.Node[] = new Array(); // Array of all physical objects in the scene to have a quick reference
  let pickedBody: f.ComponentRigidbody = null; //The physical component of the currently picked node


  //Setting Variables
  let rayLength: number = 40; //Length of the ray in Units (Meters)
  let pushStrength: number = 500; //Sterngth of the raycast push in Force (Newton)

  //Materials to switch between to indicate the picked object
  let standardMaterial: f.Material = new f.Material("StandardMaterial", f.ShaderFlat, new f.CoatColored(new f.Color(0.75, 0.8, 0.75, 1)));
  let focusMaterial: f.Material = new f.Material("FocusMaterial", f.ShaderFlat, new f.CoatColored(new f.Color(0.5, 0.8, 0.5, 1)));


  //Function to initialize the Fudge Scene with a camera, light, viewport and PHYSCIAL Objects
  function init(_event: Event): void {

    hierarchy = new f.Node("Scene"); //create the root Node where every object is parented to. Should never be changed

    //#region Physics
    //PHYSICS - Basic Plane and Cube
    //Creating a physically static ground plane for our physics playground. A simple scaled cube but with physics type set to static
    bodies[0] = createCompleteNode("Ground", new f.Material("Ground", f.ShaderFlat, new f.CoatColored(new f.Color(0.2, 0.2, 0.2, 1))), new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC);
    bodies[0].mtxLocal.scale(new f.Vector3(14, 0.3, 14)); //Scale the body with it's standard ComponentTransform
    bodies[0].mtxLocal.rotateX(3, true); //Give it a slight rotation so the physical objects are sliding, always from left when it's after a scaling
    hierarchy.appendChild(bodies[0]); //Add the node to the scene by adding it to the scene-root
    //Backwalls - So cubes are not pushed away easily
    bodies[1] = createCompleteNode("Ground", new f.Material("Ground", f.ShaderFlat, new f.CoatColored(new f.Color(0.2, 0.2, 0.2, 1))), new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC);
    bodies[1].mtxLocal.translate(new f.Vector3(0, -7, -3.5));
    bodies[1].mtxLocal.scale(new f.Vector3(14, 0.3, 7));
    bodies[1].mtxLocal.rotateX(90, true);
    hierarchy.appendChild(bodies[1]);
    bodies[2] = createCompleteNode("Ground", new f.Material("Ground", f.ShaderFlat, new f.CoatColored(new f.Color(0.2, 0.2, 0.2, 1))), new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC);
    bodies[2].mtxLocal.translate(new f.Vector3(3.5, 7, 0));
    bodies[2].mtxLocal.scale(new f.Vector3(7, 0.3, 14));
    bodies[2].mtxLocal.rotateZ(90, true);
    hierarchy.appendChild(bodies[2]);


    //Creating some dynamic bodies to play with
    bodies[3] = createCompleteNode("Cube_1", standardMaterial, new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_2);
    bodies[3].mtxLocal.translate(new f.Vector3(-1, 3.5, 0));
    hierarchy.appendChild(bodies[3]);

    bodies[4] = createCompleteNode("Cube_2", standardMaterial, new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_2);
    bodies[4].mtxLocal.translate(new f.Vector3(1, 3.5, 0));
    hierarchy.appendChild(bodies[4]);
    //#endregion

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

    //Activating input events - Important for this lesson
    viewPort.activatePointerEvent(f.EVENT_POINTER.DOWN, true); //Tell Fudge to use it's internal mouse event 
    viewPort.addEventListener(f.EVENT_POINTER.DOWN, hndMouseDown); //Set what function should receive the event
    viewPort.activatePointerEvent(f.EVENT_POINTER.UP, true);
    viewPort.addEventListener(f.EVENT_POINTER.UP, hndMouseUp);

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

  //What happens when the left mouse button is pressed
  function hndMouseDown(_event: f.EventPointer): void {

    let mouse: f.Vector2 = new f.Vector2(_event.pointerX, _event.pointerY); //Get the mouse position in the html window/client space
    let posProjection: f.Vector2 = viewPort.pointClientToProjection(mouse); //Convert the mouse position to the projection (ingame space)

    let ray: f.Ray = new f.Ray(new f.Vector3(-posProjection.x, posProjection.y, 1)); //Create a Fudge Mathematical ray. That starts a little in front of the camera
    ray.origin.transform(cmpCamera.mtxPivot); //Re-position the ray start to be at the camera position but offset by the mouse input
    ray.direction.transform(cmpCamera.mtxPivot, false); //Create the raycast direction by turning it the way the camera is facing

    //PHYSICS - Ray
    //Calculate a mathematical line from a point to a point in a direction of a length, and return the nearest physical object and infos about the ray.
    let hitInfo: f.RayHitInfo = f.Physics.raycast(ray.origin, ray.direction, rayLength);
    /* Hint: f.RayHitInfo is a specific Physics raycast result that is giving you a plethora of informations like has it hit something,
             what is it that was hit, the normal vector of the hit, the hit distance, start, end of the ray. But only physical objects can be hit.
             It's possible to only hit certain groups of objects but that will be shown in advanced physical concepts.
     */

    if (hitInfo.hit) { //The raycast hasHit variable is true, something was detected
      f.Debug.log(hitInfo.rigidbodyComponent.getContainer().name); //Log whats the name of the hit object

      if (hitInfo.rigidbodyComponent.getContainer().name != "Ground") { //Make sure it's not the ground, since we do not want to interact with the ground
        pickedBody = hitInfo.rigidbodyComponent; //Saving the picked body and change it's material to indicate it was picked
        pickedBody.getContainer().getComponent(f.ComponentMaterial).material = focusMaterial;

        //Push the body at the specific hit point 
        pickedBody.applyForceAtPoint(new f.Vector3(ray.direction.x * pushStrength, ray.direction.y * pushStrength, ray.direction.z * pushStrength), hitInfo.hitPoint);
      }
    }

    else
      f.Debug.log("Miss"); //Nothing was hit, so hitInfo.hit == false


    //Reset the cubes
    if (_event.button == 1) { //Mouse wheel is pressed //Mousebutton 0 == Left, 1 == Middle, 2 == Right
      bodies[3].getComponent(f.ComponentRigidbody).setPosition(new f.Vector3(-1, 5, 0)); //Set the position in physics, since transform has no say in this only physics
      bodies[4].getComponent(f.ComponentRigidbody).setPosition(new f.Vector3(1, 5, 0));
    }

    /*
      Hint: In the physics integration code is written in the standard Fudge way and the interaction involves components, but the interaction is alway between
      ComponentRigidbody components. To get the Node (whole object), just use getContainer() on the ComponentRigidbody and all other Components can easily be accessed. But return values of 
      physical features will always be ComponentRigidbody.
    */
  }

  //What happens when the left mouse button is released
  function hndMouseUp(_event: f.EventPointer): void {
    if (pickedBody != null) { //We unpick the body and therefore give it it's normal material back
      pickedBody.getContainer().getComponent(f.ComponentMaterial).material = standardMaterial;
      pickedBody = null;
    }
  }


}