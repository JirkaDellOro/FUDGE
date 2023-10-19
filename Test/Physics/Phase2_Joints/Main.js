// /<reference types="../../../../Core/Build/FudgeCore.js"/>
var FudgePhysics_Communication;
// /<reference types="../../../../Core/Build/FudgeCore.js"/>
(function (FudgePhysics_Communication) {
    var f = FudgeCore;
    window.addEventListener("load", init);
    const app = document.querySelector("canvas");
    let viewPort;
    let hierarchy;
    let fps;
    const times = [];
    let fpsDisplay = document.querySelector("h2#FPS");
    let bodies = new Array();
    let ground;
    let cmpCamera;
    let stepWidth = 0.1;
    let moveableTransform;
    //Joints
    let prismaticJoint;
    let prismaticJointSlide;
    let revoluteJointSwingDoor;
    let cylindricalJoint;
    let sphericalJoint;
    let universalJoint;
    let secondUniversalJoint;
    //Ragdoll
    let head;
    let body1;
    let body2;
    let armL;
    let armR;
    let legL;
    let legR;
    let jointHeadBody;
    let jointUpperLowerBody;
    let jointBodyArmL;
    let jointBodyArmR;
    let jointBodyLegL;
    let jointBodyLegR;
    let holder;
    function init(_event) {
        f.Debug.log(app);
        hierarchy = new f.Node("Scene");
        document.addEventListener("keypress", hndKey);
        document.addEventListener("keydown", hndKeyDown);
        ground = createCompleteMeshNode("Ground", new f.Material("Ground", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.2, 0.2, 0.2, 1))), new f.MeshCube(), 0, f.BODY_TYPE.STATIC, f.COLLISION_GROUP.GROUP_1);
        let cmpGroundMesh = ground.getComponent(f.ComponentTransform);
        cmpGroundMesh.mtxLocal.scale(new f.Vector3(14, 0.3, 14));
        cmpGroundMesh.mtxLocal.translate(new f.Vector3(0, -1.5, 0));
        hierarchy.appendChild(ground);
        //Prismatic Joints
        bodies[0] = createCompleteMeshNode("Spring_Floor", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.4, 0.4, 0.4, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_2);
        let cmpCubeTransform = bodies[0].getComponent(f.ComponentTransform);
        hierarchy.appendChild(bodies[0]);
        cmpCubeTransform.mtxLocal.translate(new f.Vector3(0, 1, 0));
        cmpCubeTransform.mtxLocal.scaleY(0.2);
        prismaticJoint = new f.JointPrismatic(bodies[0].getComponent(f.ComponentRigidbody), ground.getComponent(f.ComponentRigidbody), new f.Vector3(0, 1, 0));
        bodies[0].addComponent(prismaticJoint);
        prismaticJoint.springDamping = 0;
        prismaticJoint.springFrequency = 1;
        prismaticJoint.maxMotor = 0;
        prismaticJoint.minMotor = 0;
        prismaticJoint.internalCollision = true;
        bodies[3] = createCompleteMeshNode("CubeJointBase", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.4, 0.4, 0.4, 1))), new f.MeshCube(), 1, f.BODY_TYPE.STATIC, f.COLLISION_GROUP.GROUP_1);
        hierarchy.appendChild(bodies[3]);
        bodies[3].mtxLocal.translate(new f.Vector3(-4, 2, -2));
        bodies[3].mtxLocal.scale(new f.Vector3(2, 0.5, 0.5));
        bodies[4] = createCompleteMeshNode("CubeJointSlide", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(1, 1, 0, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_1);
        hierarchy.appendChild(bodies[4]);
        bodies[4].mtxLocal.translate(new f.Vector3(-4, 2, -2));
        prismaticJointSlide = new f.JointPrismatic(bodies[3].getComponent(f.ComponentRigidbody), bodies[4].getComponent(f.ComponentRigidbody), new f.Vector3(1, 0, 0));
        bodies[3].addComponent(prismaticJointSlide);
        prismaticJointSlide.motorForce = 10; //so it does not slide too much on it's own.
        prismaticJointSlide.minMotor = -1;
        prismaticJointSlide.maxMotor = 1;
        //Revolute Joint
        bodies[5] = createCompleteMeshNode("Handle", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.4, 0.4, 0.4, 1))), new f.MeshCube(), 1, f.BODY_TYPE.STATIC, f.COLLISION_GROUP.GROUP_1);
        hierarchy.appendChild(bodies[5]);
        bodies[5].mtxLocal.translate(new f.Vector3(3.5, 2, -2));
        bodies[5].mtxLocal.scale(new f.Vector3(0.5, 2, 0.5));
        bodies[6] = createCompleteMeshNode("SwingDoor", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(1, 1, 0, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_1);
        hierarchy.appendChild(bodies[6]);
        bodies[6].mtxLocal.translate(new f.Vector3(4.25, 2, -2));
        bodies[6].mtxLocal.scale(new f.Vector3(1.5, 2, 0.2));
        revoluteJointSwingDoor = new f.JointRevolute(bodies[5].getComponent(f.ComponentRigidbody), bodies[6].getComponent(f.ComponentRigidbody), new f.Vector3(0, 1, 0));
        bodies[5].addComponent(revoluteJointSwingDoor);
        revoluteJointSwingDoor.minMotor = -60;
        revoluteJointSwingDoor.maxMotor = 60;
        //Cylindrical Joint
        bodies[7] = createCompleteMeshNode("Holder", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.4, 0.4, 0.4, 1))), new f.MeshCube(), 1, f.BODY_TYPE.STATIC, f.COLLISION_GROUP.GROUP_1);
        hierarchy.appendChild(bodies[7]);
        bodies[7].mtxLocal.translate(new f.Vector3(1.5, 3, -2));
        bodies[7].mtxLocal.scale(new f.Vector3(0.5, 1, 0.5));
        bodies[8] = createCompleteMeshNode("MovingDrill", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(1, 1, 0, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_1);
        hierarchy.appendChild(bodies[8]);
        bodies[8].mtxLocal.translate(new f.Vector3(1.5, 2.5, -2));
        bodies[8].mtxLocal.scale(new f.Vector3(0.3, 2, 0.3));
        cylindricalJoint = new f.JointCylindrical(bodies[7].getComponent(f.ComponentRigidbody), bodies[8].getComponent(f.ComponentRigidbody), new f.Vector3(0, 1, 0));
        bodies[7].addComponent(cylindricalJoint);
        cylindricalJoint.minMotor = -1.25;
        cylindricalJoint.rotorSpeed = 1;
        // cylindricalJoint.rotationalMotorTorque = 10;
        cylindricalJoint.rotorTorque = 10;
        //Spherical Joint
        bodies[9] = createCompleteMeshNode("Socket", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.4, 0.4, 0.4, 1))), new f.MeshCube(), 1, f.BODY_TYPE.STATIC, f.COLLISION_GROUP.GROUP_1);
        hierarchy.appendChild(bodies[9]);
        bodies[9].mtxLocal.translate(new f.Vector3(-1.5, 3, 2.5));
        bodies[9].mtxLocal.scale(new f.Vector3(0.5, 0.5, 0.5));
        bodies[10] = createCompleteMeshNode("BallJoint", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(1, 1, 0, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_1);
        hierarchy.appendChild(bodies[10]);
        bodies[10].mtxLocal.translate(new f.Vector3(-1.5, 2, 2.5));
        bodies[10].mtxLocal.scale(new f.Vector3(0.3, 2, 0.3));
        sphericalJoint = new f.JointSpherical(bodies[9].getComponent(f.ComponentRigidbody), bodies[10].getComponent(f.ComponentRigidbody));
        bodies[9].addComponent(sphericalJoint);
        //Universal Joint
        bodies[11] = createCompleteMeshNode("Holder", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.4, 0.4, 0.4, 1))), new f.MeshCube(), 1, f.BODY_TYPE.STATIC, f.COLLISION_GROUP.GROUP_1);
        hierarchy.appendChild(bodies[11]);
        bodies[11].mtxLocal.translate(new f.Vector3(-5.5, 5, 2.5));
        bodies[11].mtxLocal.scale(new f.Vector3(0.5, 0.5, 0.5));
        bodies[12] = createCompleteMeshNode("Universal1", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(1, 1, 0, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_1);
        hierarchy.appendChild(bodies[12]);
        bodies[12].mtxLocal.translate(new f.Vector3(-5.5, 3.75, 2.5));
        bodies[12].mtxLocal.scale(new f.Vector3(0.3, 2, 0.3));
        universalJoint = new f.JointUniversal(bodies[11].getComponent(f.ComponentRigidbody), bodies[12].getComponent(f.ComponentRigidbody), new f.Vector3(0, 1, 0), new f.Vector3(1, 0, 0));
        bodies[11].addComponent(universalJoint);
        bodies[13] = createCompleteMeshNode("Universal2", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(1, 1, 0, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_1);
        hierarchy.appendChild(bodies[13]);
        bodies[13].mtxLocal.translate(new f.Vector3(-5.5, 1.75, 2.5));
        bodies[13].mtxLocal.scale(new f.Vector3(0.3, 2, 0.3));
        secondUniversalJoint = new f.JointUniversal(bodies[12].getComponent(f.ComponentRigidbody), bodies[13].getComponent(f.ComponentRigidbody), new f.Vector3(0, 0, 1), new f.Vector3(1, 0, 0), new f.Vector3(0, -1, 0));
        bodies[12].addComponent(secondUniversalJoint);
        //Miscellaneous
        bodies[1] = createCompleteMeshNode("Cube_2", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(1, 1, 0, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_1);
        let cmpCubeTransform2 = bodies[1].getComponent(f.ComponentTransform);
        hierarchy.appendChild(bodies[1]);
        cmpCubeTransform2.mtxLocal.translate(new f.Vector3(0, 2, 0));
        bodies[2] = createCompleteMeshNode("Cube_3", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(1, 0, 0, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC);
        let cmpCubeTransform3 = bodies[2].getComponent(f.ComponentTransform);
        hierarchy.appendChild(bodies[2]);
        cmpCubeTransform3.mtxLocal.translate(new f.Vector3(0.5, 3, 0.5));
        bodies[40] = createCompleteMeshNode("Cube_NonePhysics", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0, 1, 1, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC);
        bodies[40].removeComponent(bodies[40].getComponent(f.ComponentRigidbody));
        hierarchy.appendChild(bodies[40]);
        bodies[40].mtxLocal.translate(new f.Vector3(-4.5, 3.5, 0.5));
        //Kinematic
        bodies[3] = createCompleteMeshNode("PlayerControlledCube", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0, 0, 1, 1))), new f.MeshCube(), 1, f.BODY_TYPE.KINEMATIC);
        moveableTransform = bodies[3].getComponent(f.ComponentTransform);
        hierarchy.appendChild(bodies[3]);
        moveableTransform.mtxLocal.translate(new f.Vector3(5, 6, 5));
        //Ragdoll
        createRagdoll();
        let cmpLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE")));
        cmpLight.mtxPivot.lookAt(new f.Vector3(0.5, -1, -0.8));
        hierarchy.addComponent(cmpLight);
        cmpCamera = new f.ComponentCamera();
        cmpCamera.clrBackground = f.Color.CSS("GREY");
        cmpCamera.mtxPivot.translate(new f.Vector3(0, 2, 17));
        cmpCamera.mtxPivot.lookAt(f.Vector3.ZERO());
        viewPort = new f.Viewport();
        viewPort.initialize("Viewport", hierarchy, cmpCamera, app);
        f.Debug.branch(viewPort.getBranch());
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        viewPort.canvas.addEventListener("pointerdown", hndPointerDown);
        viewPort.canvas.addEventListener("pointerup", hndPointerUp);
        f.Physics.adjustTransforms(hierarchy);
        f.Loop.start();
    }
    function update() {
        f.Physics.simulate();
        viewPort.draw();
        measureFPS();
    }
    function measureFPS() {
        window.requestAnimationFrame(() => {
            const now = performance.now();
            while (times.length > 0 && times[0] <= now - 1000) {
                times.shift();
            }
            times.push(now);
            fps = times.length;
            fpsDisplay.textContent = "FPS: " + fps.toString();
        });
    }
    function createCompleteMeshNode(_name, _material, _mesh, _mass, _physicsType, _group = f.COLLISION_GROUP.DEFAULT, _colType = f.COLLIDER_TYPE.CUBE) {
        let node = new f.Node(_name);
        let cmpMesh = new f.ComponentMesh(_mesh);
        let cmpMaterial = new f.ComponentMaterial(_material);
        let cmpTransform = new f.ComponentTransform();
        let cmpRigidbody = new f.ComponentRigidbody(_mass, _physicsType, _colType, _group);
        cmpRigidbody.restitution = 0.2;
        cmpRigidbody.friction = 0.8;
        node.addComponent(cmpMesh);
        node.addComponent(cmpMaterial);
        node.addComponent(cmpTransform);
        node.addComponent(cmpRigidbody);
        return node;
    }
    function hndKey(_event) {
        let horizontal = 0;
        let vertical = 0;
        let height = 0;
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
        let pos = moveableTransform.mtxLocal.translation;
        pos.add(new f.Vector3(horizontal, height, vertical));
        moveableTransform.mtxLocal.translation = pos;
    }
    function hndKeyDown(_event) {
        if (_event.code == f.KEYBOARD_CODE.Y) {
            prismaticJoint.bodyAnchor.applyForce(new f.Vector3(0, 1 * 1000, 0));
        }
        if (_event.code == f.KEYBOARD_CODE.U) {
            prismaticJointSlide.bodyTied.applyForce(new f.Vector3(1 * -100, 0, 0));
        }
        if (_event.code == f.KEYBOARD_CODE.I) {
            prismaticJointSlide.bodyTied.applyForce(new f.Vector3(1 * 100, 0, 0));
        }
        if (_event.code == f.KEYBOARD_CODE.O) {
            revoluteJointSwingDoor.bodyTied.applyForce(new f.Vector3(0, 0, 1 * 100));
        }
        if (_event.code == f.KEYBOARD_CODE.P) {
            revoluteJointSwingDoor.bodyTied.applyForce(new f.Vector3(0, 0, 1 * -100));
        }
        if (_event.code == f.KEYBOARD_CODE.F) {
            cylindricalJoint.bodyTied.applyForce(new f.Vector3(0, 1 * 300, 0));
        }
        if (_event.code == f.KEYBOARD_CODE.V) {
            cylindricalJoint.bodyTied.applyTorque(new f.Vector3(0, 1 * 100, 0));
        }
        if (_event.code == f.KEYBOARD_CODE.G) {
            sphericalJoint.bodyTied.applyTorque(new f.Vector3(0, 1 * 100, 0));
        }
        if (_event.code == f.KEYBOARD_CODE.H) {
            secondUniversalJoint.bodyTied.applyForce(new f.Vector3(0, 0, 1 * 100));
        }
        if (_event.code == f.KEYBOARD_CODE.J) {
            secondUniversalJoint.bodyTied.applyTorque(new f.Vector3(0, 1 * 100, 0));
        }
        //Physics Debugs
        if (_event.code == f.KEYBOARD_CODE.M) { //Go through the different modes
            let currentMode = viewPort.physicsDebugMode;
            currentMode = currentMode == 5 ? 0 : viewPort.physicsDebugMode += 1;
            viewPort.physicsDebugMode = currentMode;
        }
    }
    function hndPointerDown(_event) {
        let mouse = new f.Vector2(_event.offsetX, _event.offsetY);
        let posProjection = viewPort.pointClientToProjection(mouse);
        let ray = new f.Ray(new f.Vector3(-posProjection.x, posProjection.y, 1));
        ray.origin.transform(cmpCamera.mtxPivot);
        ray.direction.transform(cmpCamera.mtxPivot, false);
        //Ray
        let hitInfo = f.Physics.raycast(ray.origin, ray.direction, 20);
        if (hitInfo.hit)
            f.Debug.log(hitInfo.rigidbodyComponent.node.name);
        else
            f.Debug.log("miss");
        let pos = hitInfo.hitPoint;
        moveableTransform.mtxLocal.translation = pos;
    }
    function hndPointerUp(_event) {
        //
    }
    function createRagdoll() {
        let pos = new f.Vector3(5, 4, 5);
        let scale = new f.Vector3(0.4, 0.5, 0.4);
        head = createCompleteMeshNode("HeadRD", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.7, 1, 0.3, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_1, f.COLLIDER_TYPE.CUBE);
        hierarchy.appendChild(head);
        pos.add(new f.Vector3(0, 0.4, 0));
        head.mtxLocal.translate(pos);
        head.mtxLocal.scale(scale);
        body1 = createCompleteMeshNode("body1", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.7, 1, 0.3, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_1, f.COLLIDER_TYPE.CUBE);
        hierarchy.appendChild(body1);
        pos.add(new f.Vector3(0, -0.55, 0));
        scale = new f.Vector3(0.6, 0.6, 0.4);
        body1.mtxLocal.translate(pos);
        body1.mtxLocal.scale(scale);
        body2 = createCompleteMeshNode("body2", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.7, 1, 0.3, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_1, f.COLLIDER_TYPE.CUBE);
        hierarchy.appendChild(body2);
        pos.add(new f.Vector3(0, -0.35, 0));
        scale = new f.Vector3(0.4, 0.4, 0.35);
        body2.mtxLocal.translate(pos);
        body2.mtxLocal.scale(scale);
        legL = createCompleteMeshNode("legL", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.7, 1, 0.3, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_1, f.COLLIDER_TYPE.CUBE);
        hierarchy.appendChild(legL);
        pos.add(new f.Vector3(-0.25, -0.8, 0));
        scale = new f.Vector3(0.3, 1, 0.3);
        legL.mtxLocal.translate(pos);
        legL.mtxLocal.scale(scale);
        legR = createCompleteMeshNode("legR", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.7, 1, 0.3, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_1, f.COLLIDER_TYPE.CUBE);
        hierarchy.appendChild(legR);
        pos.add(new f.Vector3(0.5, 0, 0));
        scale = new f.Vector3(0.3, 1, 0.3);
        legR.mtxLocal.translate(pos);
        legR.mtxLocal.scale(scale);
        armR = createCompleteMeshNode("armR", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.7, 1, 0.3, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_1, f.COLLIDER_TYPE.CUBE);
        hierarchy.appendChild(armR);
        pos.add(new f.Vector3(0.45, 1.5, 0));
        scale = new f.Vector3(1, 0.2, 0.2);
        armR.mtxLocal.translate(pos);
        armR.mtxLocal.scale(scale);
        armL = createCompleteMeshNode("armL", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.7, 1, 0.3, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_1, f.COLLIDER_TYPE.CUBE);
        hierarchy.appendChild(armL);
        pos.add(new f.Vector3(-1.45, 0, 0));
        scale = new f.Vector3(1, 0.2, 0.2);
        armL.mtxLocal.translate(pos);
        armL.mtxLocal.scale(scale);
        let x = new f.Vector3(1, 0, 0);
        let y = new f.Vector3(0, 1, 0);
        let z = new f.Vector3(0, 0, 1);
        jointHeadBody = new f.JointRagdoll(head.getComponent(f.ComponentRigidbody), body1.getComponent(f.ComponentRigidbody), y, x, new f.Vector3(0, -0.2, 0));
        jointHeadBody.springFrequencySwing = 10;
        jointHeadBody.springDampingSwing = 1;
        jointHeadBody.maxAngleFirstAxis = 90;
        jointHeadBody.maxAngleSecondAxis = 70;
        jointHeadBody.minMotorTwist = -90;
        jointHeadBody.maxMotorTwist = 90;
        jointHeadBody.springFrequencyTwist = 10;
        jointHeadBody.springDampingTwist = 1;
        head.addComponent(jointHeadBody);
        jointUpperLowerBody = new f.JointRagdoll(body1.getComponent(f.ComponentRigidbody), body2.getComponent(f.ComponentRigidbody), y, x, new f.Vector3(0, -0.4, 0));
        jointUpperLowerBody.springFrequencySwing = 10;
        jointUpperLowerBody.springDampingSwing = 1;
        jointUpperLowerBody.maxAngleFirstAxis = 90;
        jointUpperLowerBody.maxAngleSecondAxis = 90;
        jointUpperLowerBody.minMotorTwist = -90;
        jointUpperLowerBody.maxMotorTwist = 90;
        jointUpperLowerBody.springFrequencyTwist = 10;
        jointUpperLowerBody.springDampingTwist = 1;
        body1.addComponent(jointUpperLowerBody);
        jointBodyArmL = new f.JointRagdoll(armL.getComponent(f.ComponentRigidbody), body1.getComponent(f.ComponentRigidbody), x, z, new f.Vector3(0.5, 0, 0));
        jointBodyArmL.springFrequencySwing = 10;
        jointBodyArmL.springDampingSwing = 1;
        jointBodyArmL.maxAngleFirstAxis = 90;
        jointBodyArmL.maxAngleSecondAxis = 90;
        jointBodyArmL.minMotorTwist = -90;
        jointBodyArmL.maxMotorTwist = 90;
        jointBodyArmL.springFrequencyTwist = 10;
        jointBodyArmL.springDampingTwist = 1;
        armL.addComponent(jointBodyArmL);
        x.x = -1;
        jointBodyArmR = new f.JointRagdoll(armR.getComponent(f.ComponentRigidbody), body1.getComponent(f.ComponentRigidbody), x, z, new f.Vector3(-0.5, 0, 0));
        jointBodyArmR.springFrequencySwing = 10;
        jointBodyArmR.springDampingSwing = 1;
        jointBodyArmR.maxAngleFirstAxis = 90;
        jointBodyArmR.maxAngleSecondAxis = 90;
        jointBodyArmR.minMotorTwist = -90;
        jointBodyArmR.maxMotorTwist = 90;
        jointBodyArmR.springFrequencyTwist = 10;
        jointBodyArmR.springDampingTwist = 1;
        armR.addComponent(jointBodyArmR);
        jointBodyLegL = new f.JointRagdoll(legL.getComponent(f.ComponentRigidbody), body1.getComponent(f.ComponentRigidbody), y, x, new f.Vector3(0, 0.5, 0));
        jointBodyLegL.springFrequencySwing = 10;
        jointBodyLegL.springDampingSwing = 1;
        jointBodyLegL.maxAngleFirstAxis = 90;
        jointBodyLegL.maxAngleSecondAxis = 90;
        jointBodyLegL.minMotorTwist = -90;
        jointBodyLegL.maxMotorTwist = 90;
        jointBodyLegL.springFrequencyTwist = 10;
        jointBodyLegL.springDampingTwist = 1;
        legL.addComponent(jointBodyLegL);
        jointBodyLegR = new f.JointRagdoll(legR.getComponent(f.ComponentRigidbody), body1.getComponent(f.ComponentRigidbody), y, x, new f.Vector3(0, 0.5, 0));
        jointBodyLegR.springFrequencySwing = 10;
        jointBodyLegR.springDampingSwing = 1;
        jointBodyLegR.maxAngleFirstAxis = 90;
        jointBodyLegR.maxAngleSecondAxis = 90;
        jointBodyLegR.minMotorTwist = -90;
        jointBodyLegR.maxMotorTwist = 90;
        jointBodyLegR.springFrequencyTwist = 10;
        jointBodyLegR.springDampingTwist = 1;
        legR.addComponent(jointBodyLegR);
        holder = new f.JointSpherical(moveableTransform.node.getComponent(f.ComponentRigidbody), head.getComponent(f.ComponentRigidbody), new f.Vector3(0, 0, 0));
        moveableTransform.node.addComponent(holder);
        holder.springDamping = 0.1;
        holder.springFrequency = 1;
    }
})(FudgePhysics_Communication || (FudgePhysics_Communication = {}));
//# sourceMappingURL=Main.js.map