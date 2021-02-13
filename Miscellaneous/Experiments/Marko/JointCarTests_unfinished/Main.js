"use strict";
///<reference types="../../../../Core/Build/FudgeCore.js"/>
var f = FudgeCore;
//Reference Fudge, getting code completion ready and creating a shortcut f to write FudgeCode more comfortably
var Turorials_FUDGEPhysics_Lesson1;
//Reference Fudge, getting code completion ready and creating a shortcut f to write FudgeCode more comfortably
(function (Turorials_FUDGEPhysics_Lesson1) {
    //GOALS: Learning how to define shpes to create a not predefined collider shape.
    //Built a simple physics car with wheel colliders (different approach than a raycast car (default))
    //Fudge Basic Variables
    window.addEventListener("load", init);
    const app = document.querySelector("canvas"); // The html element where the scene is drawn to
    let viewPort; // The scene visualization
    let hierarchy; // You're object scene tree
    //Physical Objects
    let bodies = new Array(); // Array of all physical objects in the scene to have a quick reference
    let carBody;
    //Setting Variables
    let materialPlayer = new f.Material("Player", f.ShaderFlat, new f.CoatColored(new f.Color(0.7, 0.5, 0.35, 1)));
    //Car Settings / Joints
    let frontSuspensionRight;
    let frontSuspensionLeft;
    let backSuspensionRight;
    let backSuspensionLeft;
    let wheelJoint_frontR;
    let wheelJoint_frontL;
    let wheelJoint_backR;
    let wheelJoint_backL;
    let maxAngle = 30;
    let currentAngle = 0;
    //Function to initialize the Fudge Scene with a camera, light, viewport and PHYSCIAL Objects
    function init(_event) {
        hierarchy = new f.Node("Scene"); //create the root Node where every object is parented to. Should never be changed
        //#region PHYSICS
        //For this demo we want a higher accuracy since semi-real car physics are very delicate to calculate (thats why normally a raycast car is used for approximation)
        //OimoPhysics which is integrated in Fudge is using a correctionAlgorithm on solver iterations instead of fully recalculate physics too often, 
        //so you can crank the number of solver iterations higher than with most engines. But Oimo is in general less accurate.
        f.Physics.world.setSolverIterations(1000);
        f.Physics.settings.defaultRestitution = 0.15;
        f.Physics.settings.defaultFriction = 0.95;
        //f.Physics.settings.defaultConstraintSolverType = 1; //Use most accurate joint solving, slower but needed for complex things like cars
        //Experiment with defaultConstraintSolverType and defaultCorrectionAlgorithm
        //PHYSICS 
        //Creating a physically static ground plane for our physics playground. A simple scaled cube but with physics type set to static
        bodies[0] = createCompleteNode("Ground", new f.Material("Ground", f.ShaderFlat, new f.CoatColored(new f.Color(0.2, 0.2, 0.2, 1))), new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_2);
        bodies[0].mtxLocal.scale(new f.Vector3(14, 0.3, 14)); //Scale the body with it's standard ComponentTransform
        //bodies[0].mtxLocal.rotateX(4, true); //Give it a slight rotation so the physical objects are sliding, always from left when it's after a scaling
        hierarchy.appendChild(bodies[0]); //Add the node to the scene by adding it to the scene-root
        //A car is basically wheels on a suspension. A suspension is a prismatic spring and a wheel is on a revolute joint.
        //But the joints, wheels need to be very well placed, could not get it done even in unity with this setup. 
        //(Unity has wheelcolliders and things to make it easier), so different setup would be done there
        settingUpCar();
        //#endregion PHYSICS
        //Standard Fudge Scene Initialization - Creating a directional light, a camera and initialize the viewport
        let cmpLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE")));
        cmpLight.pivot.lookAt(new f.Vector3(0.5, -1, -0.8)); //Set light direction
        hierarchy.addComponent(cmpLight);
        let cmpCamera = new f.ComponentCamera();
        cmpCamera.backgroundColor = f.Color.CSS("GREY");
        cmpCamera.pivot.translate(new f.Vector3(17, 4, 17)); //Move camera far back so the whole scene is visible
        cmpCamera.pivot.lookAt(f.Vector3.ZERO()); //Set the camera matrix so that it looks at the center of the scene
        viewPort = new f.Viewport(); //Creating a viewport that is rendered onto the html canvas element
        viewPort.initialize("Viewport", hierarchy, cmpCamera, app); //initialize the viewport with the root node, camera and canvas
        document.addEventListener("keypress", hndKey); //Adding a listener for keypress handling
        //PHYSICS - Start using physics by telling the physics the scene root object. Physics will recalculate every transform and initialize
        f.Physics.start(hierarchy);
        f.Physics.settings.debugDraw = true;
        //Important start the game loop after starting physics, so physics can use the current transform before it's first iteration
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update); //Tell the game loop to call the update function on each frame
        f.Loop.start(); //Stard the game loop
    }
    //Function to animate/update the Fudge scene, commonly known as gameloop
    function update() {
        //PHYSICS - Simulate physical changes each frame, parameter to set time between frames
        f.Physics.world.simulate(f.Loop.timeFrameReal / 1000);
        viewPort.draw(); // Draw the current Fudge Scene to the canvas
    }
    // Function to quickly create a node with multiple needed FudgeComponents, including a physics component
    function createCompleteNode(_name, _material, _mesh, _mass, _physicsType, _group = f.PHYSICS_GROUP.DEFAULT, _colType = f.COLLIDER_TYPE.CUBE, _convexMesh = null) {
        let node = new f.Node(_name);
        let cmpMesh = new f.ComponentMesh(_mesh);
        let cmpMaterial = new f.ComponentMaterial(_material);
        let cmpTransform = new f.ComponentTransform();
        let cmpRigidbody = new f.ComponentRigidbody(_mass, _physicsType, _colType, _group, null, _convexMesh); //add a Float32 Array of points to the rb constructor to create a convex collider
        node.addComponent(cmpMesh);
        node.addComponent(cmpMaterial);
        node.addComponent(cmpTransform);
        node.addComponent(cmpRigidbody);
        return node;
    }
    function settingUpCar() {
        //Setting up visuals
        //Best practice to place the main body and place every suspension and wheel locally to the body. Not in this tutorial to make it more clear
        //CarBody
        bodies[12] = createCompleteNode("Car_Base", materialPlayer, new f.MeshCube(), 500, f.PHYSICS_TYPE.DYNAMIC);
        carBody = bodies[12].getComponent(f.ComponentRigidbody);
        bodies[12].mtxLocal.translate(new f.Vector3(0, 2.5, 0));
        bodies[12].mtxLocal.scale(new f.Vector3(1, 0.5, 2));
        hierarchy.appendChild(bodies[12]);
        //CarWheels - Important to balance the car out correctly
        bodies[13] = createCompleteNode("Car_WheelRight_Front", materialPlayer, new f.MeshCube(), 5, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.CYLINDER);
        bodies[13].mtxLocal.translate(new f.Vector3(1, 1.50, -0.75));
        bodies[13].mtxLocal.scale(new f.Vector3(0.5, 0.85, 0.85)); //Wheels the as a cylinder use the x, for the height of the cylinder, y for the diameter and z is just for the f.MeshCube to scale.
        bodies[13].mtxLocal.rotateZ(90, false);
        hierarchy.appendChild(bodies[13]);
        bodies[14] = createCompleteNode("Car_WheelRight_Back", materialPlayer, new f.MeshCube(), 5, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.CYLINDER);
        bodies[14].mtxLocal.translate(new f.Vector3(1, 1.50, 0.75));
        bodies[14].mtxLocal.scale(new f.Vector3(0.5, 0.85, 0.85));
        bodies[14].mtxLocal.rotateZ(90, false);
        hierarchy.appendChild(bodies[14]);
        bodies[15] = createCompleteNode("Car_WheelLeft_Front", materialPlayer, new f.MeshCube(), 5, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.CYLINDER);
        bodies[15].mtxLocal.translate(new f.Vector3(-1, 1.50, -0.75));
        bodies[15].mtxLocal.scale(new f.Vector3(0.5, 0.85, 0.85));
        bodies[15].mtxLocal.rotateZ(90, false);
        hierarchy.appendChild(bodies[15]);
        bodies[16] = createCompleteNode("Car_WheelLeft_Back", materialPlayer, new f.MeshCube(), 5, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.CYLINDER);
        bodies[16].mtxLocal.translate(new f.Vector3(-1, 1.50, 0.75));
        bodies[16].mtxLocal.scale(new f.Vector3(0.5, 0.85, 0.85));
        bodies[16].mtxLocal.rotateZ(90, false);
        hierarchy.appendChild(bodies[16]);
        //SuspensionHolders
        bodies[17] = createCompleteNode("Car_HolderRight_Front", materialPlayer, new f.MeshCube(), 20, f.PHYSICS_TYPE.DYNAMIC);
        bodies[17].mtxLocal.translate(new f.Vector3(0.4, 1.5, -0.75));
        bodies[17].mtxLocal.scale(new f.Vector3(0.5, 0.5, 0.5));
        hierarchy.appendChild(bodies[17]);
        bodies[18] = createCompleteNode("Car_HolderRight_Back", materialPlayer, new f.MeshCube(), 20, f.PHYSICS_TYPE.DYNAMIC);
        bodies[18].mtxLocal.translate(new f.Vector3(0.4, 1.5, 0.75));
        bodies[18].mtxLocal.scale(new f.Vector3(0.5, 0.5, 0.5));
        hierarchy.appendChild(bodies[18]);
        bodies[19] = createCompleteNode("Car_HolderLeft_Front", materialPlayer, new f.MeshCube(), 20, f.PHYSICS_TYPE.DYNAMIC);
        bodies[19].mtxLocal.translate(new f.Vector3(-0.4, 1.5, -0.75));
        bodies[19].mtxLocal.scale(new f.Vector3(0.5, 0.5, 0.5));
        hierarchy.appendChild(bodies[19]);
        bodies[20] = createCompleteNode("Car_HolderLeft_Back", materialPlayer, new f.MeshCube(), 20, f.PHYSICS_TYPE.DYNAMIC);
        bodies[20].mtxLocal.translate(new f.Vector3(-0.4, 1.5, 0.75));
        bodies[20].mtxLocal.scale(new f.Vector3(0.5, 0.5, 0.5));
        hierarchy.appendChild(bodies[20]);
        //Connecting them with joints
        //Sliding, Prismatic, Spring Joint between the body and the suspension
        //In -Y-Axis positioned where the holder is located locally to the car_base
        frontSuspensionRight = new f.ComponentJointCylindrical(carBody, bodies[17].getComponent(f.ComponentRigidbody), new f.Vector3(0, -1, 0), new f.Vector3(0.50, -1, -0.75));
        carBody.getContainer().addComponent(frontSuspensionRight);
        frontSuspensionRight.springDamping = 100;
        frontSuspensionRight.springFrequency = 2;
        frontSuspensionRight.translationMotorLimitUpper = 0;
        frontSuspensionRight.translationMotorLimitLower = 0;
        frontSuspensionRight.rotationalMotorLimitUpper = 0;
        frontSuspensionRight.rotationalMotorLimitLower = 0;
        frontSuspensionRight.internalCollision = true;
        frontSuspensionLeft = new f.ComponentJointCylindrical(carBody, bodies[19].getComponent(f.ComponentRigidbody), new f.Vector3(0, -1, 0), new f.Vector3(-0.50, -1, -0.75));
        carBody.getContainer().addComponent(frontSuspensionLeft);
        frontSuspensionLeft.springDamping = 100;
        frontSuspensionLeft.springFrequency = 2;
        frontSuspensionLeft.translationMotorLimitUpper = 0;
        frontSuspensionLeft.translationMotorLimitLower = 0;
        frontSuspensionLeft.rotationalMotorLimitUpper = 0;
        frontSuspensionLeft.rotationalMotorLimitLower = 0;
        frontSuspensionLeft.internalCollision = true;
        backSuspensionLeft = new f.ComponentJointCylindrical(carBody, bodies[20].getComponent(f.ComponentRigidbody), new f.Vector3(0, -1, 0), new f.Vector3(-0.50, -1, 0.75));
        carBody.getContainer().addComponent(backSuspensionLeft);
        backSuspensionLeft.springDamping = 100;
        backSuspensionLeft.springFrequency = 2;
        backSuspensionLeft.translationMotorLimitUpper = 0;
        backSuspensionLeft.translationMotorLimitLower = 0;
        backSuspensionLeft.rotationalMotorLimitUpper = 0;
        backSuspensionLeft.rotationalMotorLimitLower = 0;
        backSuspensionLeft.internalCollision = true;
        backSuspensionRight = new f.ComponentJointCylindrical(carBody, bodies[18].getComponent(f.ComponentRigidbody), new f.Vector3(0, -1, 0), new f.Vector3(0.50, -1, 0.75));
        carBody.getContainer().addComponent(backSuspensionRight);
        backSuspensionRight.springDamping = 100;
        backSuspensionRight.springFrequency = 2;
        backSuspensionRight.translationMotorLimitUpper = 0;
        backSuspensionRight.translationMotorLimitLower = 0;
        backSuspensionRight.rotationalMotorLimitUpper = 0;
        backSuspensionRight.rotationalMotorLimitLower = 0;
        backSuspensionRight.internalCollision = true;
        //Connect Wheels to suspension - Hinge (revolute) joints that can rotate 360° in X-Axis but not move
        wheelJoint_frontR = new f.ComponentJointRevolute(bodies[17].getComponent(f.ComponentRigidbody), bodies[13].getComponent(f.ComponentRigidbody), new f.Vector3(-1, 0, 0));
        bodies[17].addComponent(wheelJoint_frontR);
        wheelJoint_frontL = new f.ComponentJointRevolute(bodies[19].getComponent(f.ComponentRigidbody), bodies[15].getComponent(f.ComponentRigidbody), new f.Vector3(-1, 0, 0));
        bodies[19].addComponent(wheelJoint_frontL);
        wheelJoint_backR = new f.ComponentJointRevolute(bodies[18].getComponent(f.ComponentRigidbody), bodies[14].getComponent(f.ComponentRigidbody), new f.Vector3(-1, 0, 0));
        bodies[18].addComponent(wheelJoint_backR);
        wheelJoint_backL = new f.ComponentJointRevolute(bodies[20].getComponent(f.ComponentRigidbody), bodies[16].getComponent(f.ComponentRigidbody), new f.Vector3(-1, 0, 0));
        bodies[20].addComponent(wheelJoint_backL);
        wheelJoint_frontR.motorSpeed = -5;
        wheelJoint_frontR.motorTorque = 50;
        wheelJoint_frontL.motorSpeed = -5;
        wheelJoint_frontL.motorTorque = 50;
        // wheelJoint_backR.motorSpeed = -5;
        // wheelJoint_backR.motorTorque = 50;
        // wheelJoint_backL.motorSpeed = -5;
        // wheelJoint_backL.motorTorque = 50;
    }
    // Event Function handling keyboard input
    function hndKey(_event) {
        if (_event.code == f.KEYBOARD_CODE.A) { //Steering the wheels by giving them a new angle limit so they are fixed on this angle
            frontSuspensionLeft.rotationalMotorLimitUpper = currentAngle < maxAngle ? currentAngle++ : currentAngle;
            frontSuspensionLeft.rotationalMotorLimitLower = currentAngle < maxAngle ? currentAngle++ : currentAngle;
            frontSuspensionRight.rotationalMotorLimitUpper = currentAngle < maxAngle ? currentAngle++ : currentAngle;
            frontSuspensionRight.rotationalMotorLimitLower = currentAngle < maxAngle ? currentAngle++ : currentAngle;
        }
        if (_event.code == f.KEYBOARD_CODE.W) {
            bodies[12].getComponent(f.ComponentRigidbody).applyForce(new f.Vector3(0, 10, 0));
            wheelJoint_frontR.motorSpeed++;
            wheelJoint_frontL.motorSpeed++;
        }
        if (_event.code == f.KEYBOARD_CODE.S) {
        }
        if (_event.code == f.KEYBOARD_CODE.D) {
            frontSuspensionLeft.rotationalMotorLimitUpper = currentAngle > -maxAngle ? currentAngle-- : currentAngle;
            frontSuspensionLeft.rotationalMotorLimitLower = currentAngle > -maxAngle ? currentAngle-- : currentAngle;
            frontSuspensionRight.rotationalMotorLimitUpper = currentAngle < maxAngle ? currentAngle-- : currentAngle;
            frontSuspensionRight.rotationalMotorLimitLower = currentAngle < maxAngle ? currentAngle-- : currentAngle;
        }
        if (_event.code == f.KEYBOARD_CODE.T) {
            f.Physics.settings.debugMode = f.Physics.settings.debugMode == f.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER ? f.PHYSICS_DEBUGMODE.PHYSIC_OBJECTS_ONLY : f.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
        }
    }
})(Turorials_FUDGEPhysics_Lesson1 || (Turorials_FUDGEPhysics_Lesson1 = {}));
