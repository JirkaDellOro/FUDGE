"use strict";
///<reference types="../../../../Core/Build/FudgeCore.js"/>
var f = FudgeCore;
//Reference Fudge, getting code completion ready and creating a shortcut f to write FudgeCode more comfortably
var Turorials_FUDGEPhysics_Lesson1;
//Reference Fudge, getting code completion ready and creating a shortcut f to write FudgeCode more comfortably
(function (Turorials_FUDGEPhysics_Lesson1) {
    //GOAL: Learning to use the physical raycast to interact with objects. Different method than the standard Fudge Depth Texture Raycast
    //Fudge Basic Variables
    window.addEventListener("load", init);
    const app = document.querySelector("canvas"); // The html element where the scene is drawn to
    let viewPort; // The scene visualization
    let hierarchy; // You're object scene tree
    let cmpCamera; //The camera in the scene to shot the ray from
    //Physical Objects
    let bodies = new Array(); // Array of all physical objects in the scene to have a quick reference
    let pickedBody = null; //The physical component of the currently picked node
    //Setting Variables
    let rayLength = 40; //Length of the ray in Units (Meters)
    let pushStrength = 500; //Sterngth of the raycast push in Force (Newton)
    //Materials to switch between to indicate the picked object
    let standardMaterial = new f.Material("StandardMaterial", f.ShaderFlat, new f.CoatColored(new f.Color(0.75, 0.8, 0.75, 1)));
    let focusMaterial = new f.Material("FocusMaterial", f.ShaderFlat, new f.CoatColored(new f.Color(0.5, 0.8, 0.5, 1)));
    //Function to initialize the Fudge Scene with a camera, light, viewport and PHYSCIAL Objects
    function init(_event) {
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
        let cmpLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE")));
        cmpLight.mtxPivot.lookAt(new f.Vector3(-0.5, -1, -0.8)); //Set light direction
        hierarchy.addComponent(cmpLight);
        cmpCamera = new f.ComponentCamera();
        cmpCamera.clrBackground = f.Color.CSS("GREY");
        cmpCamera.mtxPivot.translate(new f.Vector3(2, 3.5, 17)); //Move camera far back so the whole scene is visible
        cmpCamera.mtxPivot.lookAt(f.Vector3.ZERO()); //Set the camera matrix so that it looks at the center of the scene
        viewPort = new f.Viewport(); //Creating a viewport that is rendered onto the html canvas element
        viewPort.initialize("Viewport", hierarchy, cmpCamera, app); //initialize the viewport with the root node, camera and canvas
        //Activating input events - Important for this lesson
        viewPort.activatePointerEvent("\u0192pointerdown" /* DOWN */, true); //Tell Fudge to use it's internal mouse event 
        viewPort.addEventListener("\u0192pointerdown" /* DOWN */, hndMouseDown); //Set what function should receive the event
        viewPort.activatePointerEvent("\u0192pointerup" /* UP */, true);
        viewPort.addEventListener("\u0192pointerup" /* UP */, hndMouseUp);
        //PHYSICS - Start using physics by telling the physics the scene root object. Physics will recalculate every transform and initialize
        f.Physics.start(hierarchy);
        //Important start the game loop after starting physics, so physics can use the current transform before it's first iteration
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update); //Tell the game loop to call the update function on each frame
        f.Loop.start(); //Stard the game loop
    }
    //Function to animate/update the Fudge scene, commonly known as gameloop
    function update() {
        f.Physics.world.simulate(); //PHYSICS - Simulate physical changes each frame, parameter to set time between frames
        viewPort.draw(); // Draw the current Fudge Scene to the canvas
    }
    // Function to quickly create a node with multiple needed FudgeComponents, including a physics component
    function createCompleteNode(_name, _material, _mesh, _mass, _physicsType, _group = f.PHYSICS_GROUP.DEFAULT, _colType = f.COLLIDER_TYPE.CUBE) {
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
    //What happens when the left mouse button is pressed
    function hndMouseDown(_event) {
        let mouse = new f.Vector2(_event.pointerX, _event.pointerY); //Get the mouse position in the html window/client space
        let posProjection = viewPort.pointClientToProjection(mouse); //Convert the mouse position to the projection (ingame space)
        let ray = new f.Ray(new f.Vector3(-posProjection.x, posProjection.y, 1)); //Create a Fudge Mathematical ray. That starts a little in front of the camera
        ray.origin.transform(cmpCamera.mtxPivot); //Re-position the ray start to be at the camera position but offset by the mouse input
        ray.direction.transform(cmpCamera.mtxPivot, false); //Create the raycast direction by turning it the way the camera is facing
        //PHYSICS - Ray
        //Calculate a mathematical line from a point to a point in a direction of a length, and return the nearest physical object and infos about the ray.
        let hitInfo = f.Physics.raycast(ray.origin, ray.direction, rayLength);
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
    function hndMouseUp(_event) {
        if (pickedBody != null) { //We unpick the body and therefore give it it's normal material back
            pickedBody.getContainer().getComponent(f.ComponentMaterial).material = standardMaterial;
            pickedBody = null;
        }
    }
})(Turorials_FUDGEPhysics_Lesson1 || (Turorials_FUDGEPhysics_Lesson1 = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDJEQUEyRDtBQUMzRCxJQUFPLENBQUMsR0FBRyxTQUFTLENBQUM7QUFDckIsOEdBQThHO0FBRTlHLElBQVUsOEJBQThCLENBc0t2QztBQXhLRCw4R0FBOEc7QUFFOUcsV0FBVSw4QkFBOEI7SUFFdEMscUlBQXFJO0lBRXJJLHVCQUF1QjtJQUN2QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RDLE1BQU0sR0FBRyxHQUFzQixRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsK0NBQStDO0lBQ2hILElBQUksUUFBb0IsQ0FBQyxDQUFDLDBCQUEwQjtJQUNwRCxJQUFJLFNBQWlCLENBQUMsQ0FBQywyQkFBMkI7SUFDbEQsSUFBSSxTQUE0QixDQUFDLENBQUMsOENBQThDO0lBR2hGLGtCQUFrQjtJQUNsQixJQUFJLE1BQU0sR0FBYSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUMsdUVBQXVFO0lBQzNHLElBQUksVUFBVSxHQUF5QixJQUFJLENBQUMsQ0FBQyxxREFBcUQ7SUFHbEcsbUJBQW1CO0lBQ25CLElBQUksU0FBUyxHQUFXLEVBQUUsQ0FBQyxDQUFDLHFDQUFxQztJQUNqRSxJQUFJLFlBQVksR0FBVyxHQUFHLENBQUMsQ0FBQyxnREFBZ0Q7SUFFaEYsMkRBQTJEO0lBQzNELElBQUksZ0JBQWdCLEdBQWUsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEksSUFBSSxhQUFhLEdBQWUsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBR2hJLDRGQUE0RjtJQUM1RixTQUFTLElBQUksQ0FBQyxNQUFhO1FBRXpCLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxpRkFBaUY7UUFFbEgsaUJBQWlCO1FBQ2pCLGdDQUFnQztRQUNoQyxnSUFBZ0k7UUFDaEksTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0ssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLHNEQUFzRDtRQUM1RyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQywyR0FBMkc7UUFDaEosU0FBUyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLDBEQUEwRDtRQUM1RixpREFBaUQ7UUFDakQsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0ssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDekQsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwRCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDckMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsa0JBQWtCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFlB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QUMsQ0FBQyxDQUFDLDBDQUEwQztRQUdqRSxpQkFBaUI7UUFDakIsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxFQUFFLHlFQUF5RTtZQUNqRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyw4RUFBOEU7WUFDakssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsRjtRQUVEOzs7O1VBSUU7SUFDSixDQUFDO0lBRUQscURBQXFEO0lBQ3JELFNBQVMsVUFBVSxDQUFDLE1BQXNCO1FBQ3hDLElBQUksVUFBVSxJQUFJLElBQUksRUFBRSxFQUFFLG9FQUFvRTtZQUM1RixVQUFVLENBQUMsWUFBWSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQztZQUN4RixVQUFVLEdBQUcsSUFBSSxDQUFDO1NBQ25CO0lBQ0gsQ0FBQztBQUdILENBQUMsRUF0S1MsOEJBQThCLEtBQTlCLDhCQUE4QixRQXNLdkMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy88cmVmZXJlbmNlIHR5cGVzPVwiLi4vLi4vLi4vLi4vQ29yZS9CdWlsZC9GdWRnZUNvcmUuanNcIi8+XHJcbmltcG9ydCBmID0gRnVkZ2VDb3JlO1xyXG4vL1JlZmVyZW5jZSBGdWRnZSwgZ2V0dGluZyBjb2RlIGNvbXBsZXRpb24gcmVhZHkgYW5kIGNyZWF0aW5nIGEgc2hvcnRjdXQgZiB0byB3cml0ZSBGdWRnZUNvZGUgbW9yZSBjb21mb3J0YWJseVxyXG5cclxubmFtZXNwYWNlIFR1cm9yaWFsc19GVURHRVBoeXNpY3NfTGVzc29uMSB7XHJcblxyXG4gIC8vR09BTDogTGVhcm5pbmcgdG8gdXNlIHRoZSBwaHlzaWNhbCByYXljYXN0IHRvIGludGVyYWN0IHdpdGggb2JqZWN0cy4gRGlmZmVyZW50IG1ldGhvZCB0aGFuIHRoZSBzdGFuZGFyZCBGdWRnZSBEZXB0aCBUZXh0dXJlIFJheWNhc3RcclxuXHJcbiAgLy9GdWRnZSBCYXNpYyBWYXJpYWJsZXNcclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgaW5pdCk7XHJcbiAgY29uc3QgYXBwOiBIVE1MQ2FudmFzRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJjYW52YXNcIik7IC8vIFRoZSBodG1sIGVsZW1lbnQgd2hlcmUgdGhlIHNjZW5lIGlzIGRyYXduIHRvXHJcbiAgbGV0IHZpZXdQb3J0OiBmLlZpZXdwb3J0OyAvLyBUaGUgc2NlbmUgdmlzdWFsaXphdGlvblxyXG4gIGxldCBoaWVyYXJjaHk6IGYuTm9kZTsgLy8gWW91J3JlIG9iamVjdCBzY2VuZSB0cmVlXHJcbiAgbGV0IGNtcENhbWVyYTogZi5Db21wb25lbnRDYW1lcmE7IC8vVGhlIGNhbWVyYSBpbiB0aGUgc2NlbmUgdG8gc2hvdCB0aGUgcmF5IGZyb21cclxuXHJcblxyXG4gIC8vUGh5c2ljYWwgT2JqZWN0c1xyXG4gIGxldCBib2RpZXM6IGYuTm9kZVtdID0gbmV3IEFycmF5KCk7IC8vIEFycmF5IG9mIGFsbCBwaHlzaWNhbCBvYmplY3RzIGluIHRoZSBzY2VuZSB0byBoYXZlIGEgcXVpY2sgcmVmZXJlbmNlXHJcbiAgbGV0IHBpY2tlZEJvZHk6IGYuQ29tcG9uZW50UmlnaWRib2R5ID0gbnVsbDsgLy9UaGUgcGh5c2ljYWwgY29tcG9uZW50IG9mIHRoZSBjdXJyZW50bHkgcGlja2VkIG5vZGVcclxuXHJcblxyXG4gIC8vU2V0dGluZyBWYXJpYWJsZXNcclxuICBsZXQgcmF5TGVuZ3RoOiBudW1iZXIgPSA0MDsgLy9MZW5ndGggb2YgdGhlIHJheSBpbiBVbml0cyAoTWV0ZXJzKVxyXG4gIGxldCBwdXNoU3RyZW5ndGg6IG51bWJlciA9IDUwMDsgLy9TdGVybmd0aCBvZiB0aGUgcmF5Y2FzdCBwdXNoIGluIEZvcmNlIChOZXd0b24pXHJcblxyXG4gIC8vTWF0ZXJpYWxzIHRvIHN3aXRjaCBiZXR3ZWVuIHRvIGluZGljYXRlIHRoZSBwaWNrZWQgb2JqZWN0XHJcbiAgbGV0IHN0YW5kYXJkTWF0ZXJpYWw6IGYuTWF0ZXJpYWwgPSBuZXcgZi5NYXRlcmlhbChcIlN0YW5kYXJkTWF0ZXJpYWxcIiwgZi5TaGFkZXJGbGF0LCBuZXcgZi5Db2F0Q29sb3JlZChuZXcgZi5Db2xvcigwLjc1LCAwLjgsIDAuNzUsIDEpKSk7XHJcbiAgbGV0IGZvY3VzTWF0ZXJpYWw6IGYuTWF0ZXJpYWwgPSBuZXcgZi5NYXRlcmlhbChcIkZvY3VzTWF0ZXJpYWxcIiwgZi5TaGFkZXJGbGF0LCBuZXcgZi5Db2F0Q29sb3JlZChuZXcgZi5Db2xvcigwLjUsIDAuOCwgMC41LCAxKSkpO1xyXG5cclxuXHJcbiAgLy9GdW5jdGlvbiB0byBpbml0aWFsaXplIHRoZSBGdWRnZSBTY2VuZSB3aXRoIGEgY2FtZXJhLCBsaWdodCwgdmlld3BvcnQgYW5kIFBIWVNDSUFMIE9iamVjdHNcclxuICBmdW5jdGlvbiBpbml0KF9ldmVudDogRXZlbnQpOiB2b2lkIHtcclxuXHJcbiAgICBoaWVyYXJjaHkgPSBuZXcgZi5Ob2RlKFwiU2NlbmVcIik7IC8vY3JlYXRlIHRoZSByb290IE5vZGUgd2hlcmUgZXZlcnkgb2JqZWN0IGlzIHBhcmVudGVkIHRvLiBTaG91bGQgbmV2ZXIgYmUgY2hhbmdlZFxyXG5cclxuICAgIC8vI3JlZ2lvbiBQaHlzaWNzXHJcbiAgICAvL1BIWVNJQ1MgLSBCYXNpYyBQbGFuZSBhbmQgQ3ViZVxyXG4gICAgLy9DcmVhdGluZyBhIHBoeXNpY2FsbHkgc3RhdGljIGdyb3VuZCBwbGFuZSBmb3Igb3VyIHBoeXNpY3MgcGxheWdyb3VuZC4gQSBzaW1wbGUgc2NhbGVkIGN1YmUgYnV0IHdpdGggcGh5c2ljcyB0eXBlIHNldCB0byBzdGF0aWNcclxuICAgIGJvZGllc1swXSA9IGNyZWF0ZUNvbXBsZXRlTm9kZShcIkdyb3VuZFwiLCBuZXcgZi5NYXRlcmlhbChcIkdyb3VuZFwiLCBmLlNoYWRlckZsYXQsIG5ldyBmLkNvYXRDb2xvcmVkKG5ldyBmLkNvbG9yKDAuMiwgMC4yLCAwLjIsIDEpKSksIG5ldyBmLk1lc2hDdWJlKCksIDAsIGYuUEhZU0lDU19UWVBFLlNUQVRJQyk7XHJcbiAgICBib2RpZXNbMF0ubXR4TG9jYWwuc2NhbGUobmV3IGYuVmVjdG9yMygxNCwgMC4zLCAxNCkpOyAvL1NjYWxlIHRoZSBib2R5IHdpdGggaXQncyBzdGFuZGFyZCBDb21wb25lbnRUcmFuc2Zvcm1cclxuICAgIGJvZGllc1swXS5tdHhMb2NhbC5yb3RhdGVYKDMsIHRydWUpOyAvL0dpdmUgaXQgYSBzbGlnaHQgcm90YXRpb24gc28gdGhlIHBoeXNpY2FsIG9iamVjdHMgYXJlIHNsaWRpbmcsIGFsd2F5cyBmcm9tIGxlZnQgd2hlbiBpdCdzIGFmdGVyIGEgc2NhbGluZ1xyXG4gICAgaGllcmFyY2h5LmFwcGVuZENoaWxkKGJvZGllc1swXSk7IC8vQWRkIHRoZSBub2RlIHRvIHRoZSBzY2VuZSBieSBhZGRpbmcgaXQgdG8gdGhlIHNjZW5lLXJvb3RcclxuICAgIC8vQmFja3dhbGxzIC0gU28gY3ViZXMgYXJlIG5vdCBwdXNoZWQgYXdheSBlYXNpbHlcclxuICAgIGJvZGllc1sxXSA9IGNyZWF0ZUNvbXBsZXRlTm9kZShcIkdyb3VuZFwiLCBuZXcgZi5NYXRlcmlhbChcIkdyb3VuZFwiLCBmLlNoYWRlckZsYXQsIG5ldyBmLkNvYXRDb2xvcmVkKG5ldyBmLkNvbG9yKDAuMiwgMC4yLCAwLjIsIDEpKSksIG5ldyBmLk1lc2hDdWJlKCksIDAsIGYuUEhZU0lDU19UWVBFLlNUQVRJQyk7XHJcbiAgICBib2RpZXNbMV0ubXR4TG9jYWwudHJhbnNsYXRlKG5ldyBmLlZlY3RvcjMoMCwgLTcsIC0zLjUpKTtcclxuICAgIGJvZGllc1sxXS5tdHhMb2NhbC5zY2FsZShuZXcgZi5WZWN0b3IzKDE0LCAwLjMsIDcpKTtcclxuICAgIGJvZGllc1sxXS5tdHhMb2NhbC5yb3RhdGVYKDkwLCB0cnVlKTtcclxuICAgIGhpZXJhcmNoeS5hcHBlbmRDaGlsZChib2RpZXNbMV0pO1xyXG4gICAgYm9kaWVzWzJdID0gY3JlYXRlQ29tcGxldGVOb2RlKFwiR3JvdW5kXCIsIG5ldyBmLk1hdGVyaWFsKFwiR3JvdW5kXCIsIGYuU2hhZGVyRmxhdCwgbmV3IGYuQ29hdENvbG9yZWQobmV3IGYuQ29sb3IoMC4yLCAwLjIsIDAuMiwgMSkpKSwgbmV3IGYuTWVzaEN1YmUoKSwgMCwgZi5QSFlTSUNTX1RZUEUuU1RBVElDKTtcclxuICAgIGJvZGllc1syXS5tdHhMb2NhbC50cmFuc2xhdGUobmV3IGYuVmVjdG9yMygzLjUsIDcsIDApKTtcclxuICAgIGJvZGllc1syXS5tdHhMb2NhbC5zY2FsZShuZXcgZi5WZWN0b3IzKDcsIDAuMywgMTQpKTtcclxuICAgIGJvZGllc1syXS5tdHhMb2NhbC5yb3RhdGVaKDkwLCB0cnVlKTtcclxuICAgIGhpZXJhcmNoeS5hcHBlbmRDaGlsZChib2RpZXNbMl0pO1xyXG5cclxuXHJcbiAgICAvL0NyZWF0aW5nIHNvbWUgZHluYW1pYyBib2RpZXMgdG8gcGxheSB3aXRoXHJcbiAgICBib2RpZXNbM10gPSBjcmVhdGVDb21wbGV0ZU5vZGUoXCJDdWJlXzFcIiwgc3RhbmRhcmRNYXRlcmlhbCwgbmV3IGYuTWVzaEN1YmUoKSwgMSwgZi5QSFlTSUNTX1RZUEUuRFlOQU1JQywgZi5QSFlTSUNTX0dST1VQLkdST1VQXzIpO1xyXG4gICAgYm9kaWVzWzNdLm10eExvY2FsLnRyYW5zbGF0ZShuZXcgZi5WZWN0b3IzKC0xLCAzLjUsIDApKTtcclxuICAgIGhpZXJhcmNoeS5hcHBlbmRDaGlsZChib2RpZXNbM10pO1xyXG5cclxuICAgIGJvZGllc1s0XSA9IGNyZWF0ZUNvbXBsZXRlTm9kZShcIkN1YmVfMlwiLCBzdGFuZGFyZE1hdGVyaWFsLCBuZXcgZi5NZXNoQ3ViZSgpLCAxLCBmLlBIWVNJQ1NfVFlQRS5EWU5BTUlDLCBmLlBIWVNJQ1NfR1JPVVAuR1JPVVBfMik7XHJcbiAgICBib2RpZXNbNF0ubXR4TG9jYWwudHJhbnNsYXRlKG5ldyBmLlZlY3RvcjMoMSwgMy41LCAwKSk7XHJcbiAgICBoaWVyYXJjaHkuYXBwZW5kQ2hpbGQoYm9kaWVzWzRdKTtcclxuICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICAgIC8vU3RhbmRhcmQgRnVkZ2UgU2NlbmUgSW5pdGlhbGl6YXRpb24gLSBDcmVhdGluZyBhIGRpcmVjdGlvbmFsIGxpZ2h0LCBhIGNhbWVyYSBhbmQgaW5pdGlhbGl6ZSB0aGUgdmlld3BvcnRcclxuICAgIGxldCBjbXBMaWdodDogZi5Db21wb25lbnRMaWdodCA9IG5ldyBmLkNvbXBvbmVudExpZ2h0KG5ldyBmLkxpZ2h0RGlyZWN0aW9uYWwoZi5Db2xvci5DU1MoXCJXSElURVwiKSkpO1xyXG4gICAgY21wTGlnaHQubXR4UGl2b3QubG9va0F0KG5ldyBmLlZlY3RvcjMoLTAuNSwgLTEsIC0wLjgpKTsgLy9TZXQgbGlnaHQgZGlyZWN0aW9uXHJcbiAgICBoaWVyYXJjaHkuYWRkQ29tcG9uZW50KGNtcExpZ2h0KTtcclxuXHJcbiAgICBjbXBDYW1lcmEgPSBuZXcgZi5Db21wb25lbnRDYW1lcmEoKTtcclxuICAgIGNtcENhbWVyYS5jbHJCYWNrZ3JvdW5kID0gZi5Db2xvci5DU1MoXCJHUkVZXCIpO1xyXG4gICAgY21wQ2FtZXJhLm10eFBpdm90LnRyYW5zbGF0ZShuZXcgZi5WZWN0b3IzKDIsIDMuNSwgMTcpKTsgLy9Nb3ZlIGNhbWVyYSBmYXIgYmFjayBzbyB0aGUgd2hvbGUgc2NlbmUgaXMgdmlzaWJsZVxyXG4gICAgY21wQ2FtZXJhLm10eFBpdm90Lmxvb2tBdChmLlZlY3RvcjMuWkVSTygpKTsgLy9TZXQgdGhlIGNhbWVyYSBtYXRyaXggc28gdGhhdCBpdCBsb29rcyBhdCB0aGUgY2VudGVyIG9mIHRoZSBzY2VuZVxyXG5cclxuICAgIHZpZXdQb3J0ID0gbmV3IGYuVmlld3BvcnQoKTsgLy9DcmVhdGluZyBhIHZpZXdwb3J0IHRoYXQgaXMgcmVuZGVyZWQgb250byB0aGUgaHRtbCBjYW52YXMgZWxlbWVudFxyXG4gICAgdmlld1BvcnQuaW5pdGlhbGl6ZShcIlZpZXdwb3J0XCIsIGhpZXJhcmNoeSwgY21wQ2FtZXJhLCBhcHApOyAvL2luaXRpYWxpemUgdGhlIHZpZXdwb3J0IHdpdGggdGhlIHJvb3Qgbm9kZSwgY2FtZXJhIGFuZCBjYW52YXNcclxuXHJcbiAgICAvL0FjdGl2YXRpbmcgaW5wdXQgZXZlbnRzIC0gSW1wb3J0YW50IGZvciB0aGlzIGxlc3NvblxyXG4gICAgdmlld1BvcnQuYWN0aXZhdGVQb2ludGVyRXZlbnQoZi5FVkVOVF9QT0lOVEVSLkRPV04sIHRydWUpOyAvL1RlbGwgRnVkZ2UgdG8gdXNlIGl0J3MgaW50ZXJuYWwgbW91c2UgZXZlbnQgXHJcbiAgICB2aWV3UG9ydC5hZGRFdmVudExpc3RlbmVyKGYuRVZFTlRfUE9JTlRFUi5ET1dOLCBobmRNb3VzZURvd24pOyAvL1NldCB3aGF0IGZ1bmN0aW9uIHNob3VsZCByZWNlaXZlIHRoZSBldmVudFxyXG4gICAgdmlld1BvcnQuYWN0aXZhdGVQb2ludGVyRXZlbnQoZi5FVkVOVF9QT0lOVEVSLlVQLCB0cnVlKTtcclxuICAgIHZpZXdQb3J0LmFkZEV2ZW50TGlzdGVuZXIoZi5FVkVOVF9QT0lOVEVSLlVQLCBobmRNb3VzZVVwKTtcclxuXHJcbiAgICAvL1BIWVNJQ1MgLSBTdGFydCB1c2luZyBwaHlzaWNzIGJ5IHRlbGxpbmcgdGhlIHBoeXNpY3MgdGhlIHNjZW5lIHJvb3Qgb2JqZWN0LiBQaHlzaWNzIHdpbGwgcmVjYWxjdWxhdGUgZXZlcnkgdHJhbnNmb3JtIGFuZCBpbml0aWFsaXplXHJcbiAgICBmLlBoeXNpY3Muc3RhcnQoaGllcmFyY2h5KTtcclxuXHJcbiAgICAvL0ltcG9ydGFudCBzdGFydCB0aGUgZ2FtZSBsb29wIGFmdGVyIHN0YXJ0aW5nIHBoeXNpY3MsIHNvIHBoeXNpY3MgY2FuIHVzZSB0aGUgY3VycmVudCB0cmFuc2Zvcm0gYmVmb3JlIGl0J3MgZmlyc3QgaXRlcmF0aW9uXHJcbiAgICBmLkxvb3AuYWRkRXZlbnRMaXN0ZW5lcihmLkVWRU5ULkxPT1BfRlJBTUUsIHVwZGF0ZSk7IC8vVGVsbCB0aGUgZ2FtZSBsb29wIHRvIGNhbGwgdGhlIHVwZGF0ZSBmdW5jdGlvbiBvbiBlYWNoIGZyYW1lXHJcbiAgICBmLkxvb3Auc3RhcnQoKTsgLy9TdGFyZCB0aGUgZ2FtZSBsb29wXHJcbiAgfVxyXG5cclxuICAvL0Z1bmN0aW9uIHRvIGFuaW1hdGUvdXBkYXRlIHRoZSBGdWRnZSBzY2VuZSwgY29tbW9ubHkga25vd24gYXMgZ2FtZWxvb3BcclxuICBmdW5jdGlvbiB1cGRhdGUoKTogdm9pZCB7XHJcbiAgICBmLlBoeXNpY3Mud29ybGQuc2ltdWxhdGUoKTsgLy9QSFlTSUNTIC0gU2ltdWxhdGUgcGh5c2ljYWwgY2hhbmdlcyBlYWNoIGZyYW1lLCBwYXJhbWV0ZXIgdG8gc2V0IHRpbWUgYmV0d2VlbiBmcmFtZXNcclxuICAgIHZpZXdQb3J0LmRyYXcoKTsgLy8gRHJhdyB0aGUgY3VycmVudCBGdWRnZSBTY2VuZSB0byB0aGUgY2FudmFzXHJcbiAgfVxyXG5cclxuICAvLyBGdW5jdGlvbiB0byBxdWlja2x5IGNyZWF0ZSBhIG5vZGUgd2l0aCBtdWx0aXBsZSBuZWVkZWQgRnVkZ2VDb21wb25lbnRzLCBpbmNsdWRpbmcgYSBwaHlzaWNzIGNvbXBvbmVudFxyXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbXBsZXRlTm9kZShfbmFtZTogc3RyaW5nLCBfbWF0ZXJpYWw6IGYuTWF0ZXJpYWwsIF9tZXNoOiBmLk1lc2gsIF9tYXNzOiBudW1iZXIsIF9waHlzaWNzVHlwZTogZi5QSFlTSUNTX1RZUEUsIF9ncm91cDogZi5QSFlTSUNTX0dST1VQID0gZi5QSFlTSUNTX0dST1VQLkRFRkFVTFQsIF9jb2xUeXBlOiBmLkNPTExJREVSX1RZUEUgPSBmLkNPTExJREVSX1RZUEUuQ1VCRSk6IGYuTm9kZSB7XHJcbiAgICAvL1N0YW5kYXJkIEZ1ZGdlIE5vZGUgQ3JlYXRpb25cclxuICAgIGxldCBub2RlOiBmLk5vZGUgPSBuZXcgZi5Ob2RlKF9uYW1lKTsgLy9DcmVhdGluZyB0aGUgbm9kZVxyXG4gICAgbGV0IGNtcE1lc2g6IGYuQ29tcG9uZW50TWVzaCA9IG5ldyBmLkNvbXBvbmVudE1lc2goX21lc2gpOyAvL0NyZWF0aW5nIGEgbWVzaCBmb3IgdGhlIG5vZGVcclxuICAgIGxldCBjbXBNYXRlcmlhbDogZi5Db21wb25lbnRNYXRlcmlhbCA9IG5ldyBmLkNvbXBvbmVudE1hdGVyaWFsKF9tYXRlcmlhbCk7IC8vQ3JlYXRpbmcgYSBtYXRlcmlhbCBmb3IgdGhlIG5vZGVcclxuICAgIGxldCBjbXBUcmFuc2Zvcm06IGYuQ29tcG9uZW50VHJhbnNmb3JtID0gbmV3IGYuQ29tcG9uZW50VHJhbnNmb3JtKCk7ICAvL1RyYW5zZm9ybSBob2xkaW5nIHBvc2l0aW9uL3JvdGF0aW9uL3NjYWxpbmcgb2YgdGhlIG5vZGVcclxuICAgIGxldCBjbXBSaWdpZGJvZHk6IGYuQ29tcG9uZW50UmlnaWRib2R5ID0gbmV3IGYuQ29tcG9uZW50UmlnaWRib2R5KF9tYXNzLCBfcGh5c2ljc1R5cGUsIF9jb2xUeXBlLCBfZ3JvdXApOyAvL0FkZGluZyBhIHBoeXNpY2FsIGJvZHkgY29tcG9uZW50IHRvIHVzZSBwaHlzaWNzXHJcblxyXG4gICAgbm9kZS5hZGRDb21wb25lbnQoY21wTWVzaCk7XHJcbiAgICBub2RlLmFkZENvbXBvbmVudChjbXBNYXRlcmlhbCk7XHJcbiAgICBub2RlLmFkZENvbXBvbmVudChjbXBUcmFuc2Zvcm0pO1xyXG4gICAgbm9kZS5hZGRDb21wb25lbnQoY21wUmlnaWRib2R5KTsgLy8gPC0tIGJlc3QgcHJhY3RpY2UgdG8gYWRkIHBoeXNpY3MgY29tcG9uZW50IGxhc3RcclxuICAgIHJldHVybiBub2RlO1xyXG4gIH1cclxuXHJcbiAgLy9XaGF0IGhhcHBlbnMgd2hlbiB0aGUgbGVmdCBtb3VzZSBidXR0b24gaXMgcHJlc3NlZFxyXG4gIGZ1bmN0aW9uIGhuZE1vdXNlRG93bihfZXZlbnQ6IGYuRXZlbnRQb2ludGVyKTogdm9pZCB7XHJcblxyXG4gICAgbGV0IG1vdXNlOiBmLlZlY3RvcjIgPSBuZXcgZi5WZWN0b3IyKF9ldmVudC5wb2ludGVyWCwgX2V2ZW50LnBvaW50ZXJZKTsgLy9HZXQgdGhlIG1vdXNlIHBvc2l0aW9uIGluIHRoZSBodG1sIHdpbmRvdy9jbGllbnQgc3BhY2VcclxuICAgIGxldCBwb3NQcm9qZWN0aW9uOiBmLlZlY3RvcjIgPSB2aWV3UG9ydC5wb2ludENsaWVudFRvUHJvamVjdGlvbihtb3VzZSk7IC8vQ29udmVydCB0aGUgbW91c2UgcG9zaXRpb24gdG8gdGhlIHByb2plY3Rpb24gKGluZ2FtZSBzcGFjZSlcclxuXHJcbiAgICBsZXQgcmF5OiBmLlJheSA9IG5ldyBmLlJheShuZXcgZi5WZWN0b3IzKC1wb3NQcm9qZWN0aW9uLngsIHBvc1Byb2plY3Rpb24ueSwgMSkpOyAvL0NyZWF0ZSBhIEZ1ZGdlIE1hdGhlbWF0aWNhbCByYXkuIFRoYXQgc3RhcnRzIGEgbGl0dGxlIGluIGZyb250IG9mIHRoZSBjYW1lcmFcclxuICAgIHJheS5vcmlnaW4udHJhbnNmb3JtKGNtcENhbWVyYS5tdHhQaXZvdCk7IC8vUmUtcG9zaXRpb24gdGhlIHJheSBzdGFydCB0byBiZSBhdCB0aGUgY2FtZXJhIHBvc2l0aW9uIGJ1dCBvZmZzZXQgYnkgdGhlIG1vdXNlIGlucHV0XHJcbiAgICByYXkuZGlyZWN0aW9uLnRyYW5zZm9ybShjbXBDYW1lcmEubXR4UGl2b3QsIGZhbHNlKTsgLy9DcmVhdGUgdGhlIHJheWNhc3QgZGlyZWN0aW9uIGJ5IHR1cm5pbmcgaXQgdGhlIHdheSB0aGUgY2FtZXJhIGlzIGZhY2luZ1xyXG5cclxuICAgIC8vUEhZU0lDUyAtIFJheVxyXG4gICAgLy9DYWxjdWxhdGUgYSBtYXRoZW1hdGljYWwgbGluZSBmcm9tIGEgcG9pbnQgdG8gYSBwb2ludCBpbiBhIGRpcmVjdGlvbiBvZiBhIGxlbmd0aCwgYW5kIHJldHVybiB0aGUgbmVhcmVzdCBwaHlzaWNhbCBvYmplY3QgYW5kIGluZm9zIGFib3V0IHRoZSByYXkuXHJcbiAgICBsZXQgaGl0SW5mbzogZi5SYXlIaXRJbmZvID0gZi5QaHlzaWNzLnJheWNhc3QocmF5Lm9yaWdpbiwgcmF5LmRpcmVjdGlvbiwgcmF5TGVuZ3RoKTtcclxuICAgIC8qIEhpbnQ6IGYuUmF5SGl0SW5mbyBpcyBhIHNwZWNpZmljIFBoeXNpY3MgcmF5Y2FzdCByZXN1bHQgdGhhdCBpcyBnaXZpbmcgeW91IGEgcGxldGhvcmEgb2YgaW5mb3JtYXRpb25zIGxpa2UgaGFzIGl0IGhpdCBzb21ldGhpbmcsXHJcbiAgICAgICAgICAgICB3aGF0IGlzIGl0IHRoYXQgd2FzIGhpdCwgdGhlIG5vcm1hbCB2ZWN0b3Igb2YgdGhlIGhpdCwgdGhlIGhpdCBkaXN0YW5jZSwgc3RhcnQsIGVuZCBvZiB0aGUgcmF5LiBCdXQgb25seSBwaHlzaWNhbCBvYmplY3RzIGNhbiBiZSBoaXQuXHJcbiAgICAgICAgICAgICBJdCdzIHBvc3NpYmxlIHRvIG9ubHkgaGl0IGNlcnRhaW4gZ3JvdXBzIG9mIG9iamVjdHMgYnV0IHRoYXQgd2lsbCBiZSBzaG93biBpbiBhZHZhbmNlZCBwaHlzaWNhbCBjb25jZXB0cy5cclxuICAgICAqL1xyXG5cclxuICAgIGlmIChoaXRJbmZvLmhpdCkgeyAvL1RoZSByYXljYXN0IGhhc0hpdCB2YXJpYWJsZSBpcyB0cnVlLCBzb21ldGhpbmcgd2FzIGRldGVjdGVkXHJcbiAgICAgIGYuRGVidWcubG9nKGhpdEluZm8ucmlnaWRib2R5Q29tcG9uZW50LmdldENvbnRhaW5lcigpLm5hbWUpOyAvL0xvZyB3aGF0cyB0aGUgbmFtZSBvZiB0aGUgaGl0IG9iamVjdFxyXG5cclxuICAgICAgaWYgKGhpdEluZm8ucmlnaWRib2R5Q29tcG9uZW50LmdldENvbnRhaW5lcigpLm5hbWUgIT0gXCJHcm91bmRcIikgeyAvL01ha2Ugc3VyZSBpdCdzIG5vdCB0aGUgZ3JvdW5kLCBzaW5jZSB3ZSBkbyBub3Qgd2FudCB0byBpbnRlcmFjdCB3aXRoIHRoZSBncm91bmRcclxuICAgICAgICBwaWNrZWRCb2R5ID0gaGl0SW5mby5yaWdpZGJvZHlDb21wb25lbnQ7IC8vU2F2aW5nIHRoZSBwaWNrZWQgYm9keSBhbmQgY2hhbmdlIGl0J3MgbWF0ZXJpYWwgdG8gaW5kaWNhdGUgaXQgd2FzIHBpY2tlZFxyXG4gICAgICAgIHBpY2tlZEJvZHkuZ2V0Q29udGFpbmVyKCkuZ2V0Q29tcG9uZW50KGYuQ29tcG9uZW50TWF0ZXJpYWwpLm1hdGVyaWFsID0gZm9jdXNNYXRlcmlhbDtcclxuXHJcbiAgICAgICAgLy9QdXNoIHRoZSBib2R5IGF0IHRoZSBzcGVjaWZpYyBoaXQgcG9pbnQgXHJcbiAgICAgICAgcGlja2VkQm9keS5hcHBseUZvcmNlQXRQb2ludChuZXcgZi5WZWN0b3IzKHJheS5kaXJlY3Rpb24ueCAqIHB1c2hTdHJlbmd0aCwgcmF5LmRpcmVjdGlvbi55ICogcHVzaFN0cmVuZ3RoLCByYXkuZGlyZWN0aW9uLnogKiBwdXNoU3RyZW5ndGgpLCBoaXRJbmZvLmhpdFBvaW50KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGVsc2VcclxuICAgICAgZi5EZWJ1Zy5sb2coXCJNaXNzXCIpOyAvL05vdGhpbmcgd2FzIGhpdCwgc28gaGl0SW5mby5oaXQgPT0gZmFsc2VcclxuXHJcblxyXG4gICAgLy9SZXNldCB0aGUgY3ViZXNcclxuICAgIGlmIChfZXZlbnQuYnV0dG9uID09IDEpIHsgLy9Nb3VzZSB3aGVlbCBpcyBwcmVzc2VkIC8vTW91c2VidXR0b24gMCA9PSBMZWZ0LCAxID09IE1pZGRsZSwgMiA9PSBSaWdodFxyXG4gICAgICBib2RpZXNbM10uZ2V0Q29tcG9uZW50KGYuQ29tcG9uZW50UmlnaWRib2R5KS5zZXRQb3NpdGlvbihuZXcgZi5WZWN0b3IzKC0xLCA1LCAwKSk7IC8vU2V0IHRoZSBwb3NpdGlvbiBpbiBwaHlzaWNzLCBzaW5jZSB0cmFuc2Zvcm0gaGFzIG5vIHNheSBpbiB0aGlzIG9ubHkgcGh5c2ljc1xyXG4gICAgICBib2RpZXNbNF0uZ2V0Q29tcG9uZW50KGYuQ29tcG9uZW50UmlnaWRib2R5KS5zZXRQb3NpdGlvbihuZXcgZi5WZWN0b3IzKDEsIDUsIDApKTtcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICBIaW50OiBJbiB0aGUgcGh5c2ljcyBpbnRlZ3JhdGlvbiBjb2RlIGlzIHdyaXR0ZW4gaW4gdGhlIHN0YW5kYXJkIEZ1ZGdlIHdheSBhbmQgdGhlIGludGVyYWN0aW9uIGludm9sdmVzIGNvbXBvbmVudHMsIGJ1dCB0aGUgaW50ZXJhY3Rpb24gaXMgYWx3YXkgYmV0d2VlblxyXG4gICAgICBDb21wb25lbnRSaWdpZGJvZHkgY29tcG9uZW50cy4gVG8gZ2V0IHRoZSBOb2RlICh3aG9sZSBvYmplY3QpLCBqdXN0IHVzZSBnZXRDb250YWluZXIoKSBvbiB0aGUgQ29tcG9uZW50UmlnaWRib2R5IGFuZCBhbGwgb3RoZXIgQ29tcG9uZW50cyBjYW4gZWFzaWx5IGJlIGFjY2Vzc2VkLiBCdXQgcmV0dXJuIHZhbHVlcyBvZiBcclxuICAgICAgcGh5c2ljYWwgZmVhdHVyZXMgd2lsbCBhbHdheXMgYmUgQ29tcG9uZW50UmlnaWRib2R5LlxyXG4gICAgKi9cclxuICB9XHJcblxyXG4gIC8vV2hhdCBoYXBwZW5zIHdoZW4gdGhlIGxlZnQgbW91c2UgYnV0dG9uIGlzIHJlbGVhc2VkXHJcbiAgZnVuY3Rpb24gaG5kTW91c2VVcChfZXZlbnQ6IGYuRXZlbnRQb2ludGVyKTogdm9pZCB7XHJcbiAgICBpZiAocGlja2VkQm9keSAhPSBudWxsKSB7IC8vV2UgdW5waWNrIHRoZSBib2R5IGFuZCB0aGVyZWZvcmUgZ2l2ZSBpdCBpdCdzIG5vcm1hbCBtYXRlcmlhbCBiYWNrXHJcbiAgICAgIHBpY2tlZEJvZHkuZ2V0Q29udGFpbmVyKCkuZ2V0Q29tcG9uZW50KGYuQ29tcG9uZW50TWF0ZXJpYWwpLm1hdGVyaWFsID0gc3RhbmRhcmRNYXRlcmlhbDtcclxuICAgICAgcGlja2VkQm9keSA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbn0iXX0=