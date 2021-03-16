///<reference types="../../../../Core/Build/FudgeCore.js"/>
import f = FudgeCore;



namespace FudgePhysics_Communication {

  window.addEventListener("load", init);
  const app: HTMLCanvasElement = document.querySelector("canvas");
  let viewPort: f.Viewport;
  let hierarchy: f.Node;
  let fps: number;
  const times: number[] = [];
  let fpsDisplay: HTMLElement = document.querySelector("h2#FPS");

  let bodies: f.Node[] = new Array();
  let ground: f.Node;
  let cmpCamera: f.ComponentCamera;

  let stepWidth: number = 0.1;
  let moveableTransform: f.ComponentTransform;

  //Joints
  let prismaticJoint: f.ComponentJointPrismatic;
  let prismaticJointSlide: f.ComponentJointPrismatic;
  let revoluteJointSwingDoor: f.ComponentJointRevolute;
  let cylindricalJoint: f.ComponentJointCylindrical;
  let sphericalJoint: f.ComponentJointSpherical;
  let universalJoint: f.ComponentJointUniversal;
  let secondUniversalJoint: f.ComponentJointUniversal;

  //Ragdoll
  let head: f.Node;
  let body1: f.Node;
  let body2: f.Node;
  let armL: f.Node;
  let armR: f.Node;
  let legL: f.Node;
  let legR: f.Node;
  let jointHeadBody: f.ComponentJointRagdoll;
  let jointUpperLowerBody: f.ComponentJointRagdoll;
  let jointBodyArmL: f.ComponentJointRagdoll;
  let jointBodyArmR: f.ComponentJointRagdoll;
  let jointBodyLegL: f.ComponentJointRagdoll;
  let jointBodyLegR: f.ComponentJointRagdoll;
  let holder: f.ComponentJointSpherical;


  function init(_event: Event): void {
    f.Debug.log(app);
    hierarchy = new f.Node("Scene");

    document.addEventListener("keypress", hndKey);
    document.addEventListener("keydown", hndKeyDown);

    ground = createCompleteMeshNode("Ground", new f.Material("Ground", f.ShaderFlat, new f.CoatColored(new f.Color(0.2, 0.2, 0.2, 1))), new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_1);
    let cmpGroundMesh: f.ComponentTransform = ground.getComponent(f.ComponentTransform);
    cmpGroundMesh.mtxLocal.scale(new f.Vector3(14, 0.3, 14));

    cmpGroundMesh.mtxLocal.translate(new f.Vector3(0, -1.5, 0));
    hierarchy.appendChild(ground);

    //Prismatic Joints
    bodies[0] = createCompleteMeshNode("Spring_Floor", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0.4, 0.4, 0.4, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_2);
    let cmpCubeTransform: f.ComponentTransform = bodies[0].getComponent(f.ComponentTransform);
    hierarchy.appendChild(bodies[0]);
    cmpCubeTransform.mtxLocal.translate(new f.Vector3(0, 1, 0));
    cmpCubeTransform.mtxLocal.scaleY(0.2);
    prismaticJoint = new f.ComponentJointPrismatic(bodies[0].getComponent(f.ComponentRigidbody), ground.getComponent(f.ComponentRigidbody), new f.Vector3(0, 1, 0));
    bodies[0].addComponent(prismaticJoint);
    prismaticJoint.springDamping = 0;
    prismaticJoint.springFrequency = 1;
    prismaticJoint.motorLimitUpper = 0;
    prismaticJoint.motorLimitLower = 0;
    prismaticJoint.internalCollision = true;

    bodies[3] = createCompleteMeshNode("CubeJointBase", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0.4, 0.4, 0.4, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_1);
    hierarchy.appendChild(bodies[3]);
    bodies[3].mtxLocal.translate(new f.Vector3(-4, 2, -2));
    bodies[3].mtxLocal.scale(new f.Vector3(2, 0.5, 0.5));

    bodies[4] = createCompleteMeshNode("CubeJointSlide", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_1);
    hierarchy.appendChild(bodies[4]);
    bodies[4].mtxLocal.translate(new f.Vector3(-4, 2, -2));
    prismaticJointSlide = new f.ComponentJointPrismatic(bodies[3].getComponent(f.ComponentRigidbody), bodies[4].getComponent(f.ComponentRigidbody), new f.Vector3(1, 0, 0));
    bodies[3].addComponent(prismaticJointSlide);
    prismaticJointSlide.motorForce = 10; //so it does not slide too much on it's own.
    prismaticJointSlide.motorLimitLower = -1;
    prismaticJointSlide.motorLimitUpper = 1;

    //Revolute Joint
    bodies[5] = createCompleteMeshNode("Handle", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0.4, 0.4, 0.4, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_1);
    hierarchy.appendChild(bodies[5]);
    bodies[5].mtxLocal.translate(new f.Vector3(3.5, 2, -2));
    bodies[5].mtxLocal.scale(new f.Vector3(0.5, 2, 0.5));

    bodies[6] = createCompleteMeshNode("SwingDoor", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_1);
    hierarchy.appendChild(bodies[6]);
    bodies[6].mtxLocal.translate(new f.Vector3(4.25, 2, -2));
    bodies[6].mtxLocal.scale(new f.Vector3(1.5, 2, 0.2));

    revoluteJointSwingDoor = new f.ComponentJointRevolute(bodies[5].getComponent(f.ComponentRigidbody), bodies[6].getComponent(f.ComponentRigidbody), new f.Vector3(0, 1, 0));
    bodies[5].addComponent(revoluteJointSwingDoor);
    revoluteJointSwingDoor.motorLimitLower = -60;
    revoluteJointSwingDoor.motorLimitUpper = 60;

    //Cylindrical Joint
    bodies[7] = createCompleteMeshNode("Holder", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0.4, 0.4, 0.4, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_1);
    hierarchy.appendChild(bodies[7]);
    bodies[7].mtxLocal.translate(new f.Vector3(1.5, 3, -2));
    bodies[7].mtxLocal.scale(new f.Vector3(0.5, 1, 0.5));

    bodies[8] = createCompleteMeshNode("MovingDrill", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_1);
    hierarchy.appendChild(bodies[8]);
    bodies[8].mtxLocal.translate(new f.Vector3(1.5, 2.5, -2));
    bodies[8].mtxLocal.scale(new f.Vector3(0.3, 2, 0.3));
    cylindricalJoint = new f.ComponentJointCylindrical(bodies[7].getComponent(f.ComponentRigidbody), bodies[8].getComponent(f.ComponentRigidbody), new f.Vector3(0, 1, 0));
    bodies[7].addComponent(cylindricalJoint);
    cylindricalJoint.translationMotorLimitLower = -1.25;
    cylindricalJoint.translationMotorLimitUpper = 0;
    cylindricalJoint.rotationalMotorSpeed = 1;
    cylindricalJoint.rotationalMotorTorque = 10;

    //Spherical Joint
    bodies[9] = createCompleteMeshNode("Socket", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0.4, 0.4, 0.4, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_1);
    hierarchy.appendChild(bodies[9]);
    bodies[9].mtxLocal.translate(new f.Vector3(-1.5, 3, 2.5));
    bodies[9].mtxLocal.scale(new f.Vector3(0.5, 0.5, 0.5));

    bodies[10] = createCompleteMeshNode("BallJoint", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_1);
    hierarchy.appendChild(bodies[10]);
    bodies[10].mtxLocal.translate(new f.Vector3(-1.5, 2, 2.5));
    bodies[10].mtxLocal.scale(new f.Vector3(0.3, 2, 0.3));
    sphericalJoint = new f.ComponentJointSpherical(bodies[9].getComponent(f.ComponentRigidbody), bodies[10].getComponent(f.ComponentRigidbody));
    bodies[9].addComponent(sphericalJoint);

    //Universal Joint
    bodies[11] = createCompleteMeshNode("Holder", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0.4, 0.4, 0.4, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_1);
    hierarchy.appendChild(bodies[11]);
    bodies[11].mtxLocal.translate(new f.Vector3(-5.5, 5, 2.5));
    bodies[11].mtxLocal.scale(new f.Vector3(0.5, 0.5, 0.5));

    bodies[12] = createCompleteMeshNode("Universal1", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_1);
    hierarchy.appendChild(bodies[12]);
    bodies[12].mtxLocal.translate(new f.Vector3(-5.5, 3.75, 2.5));
    bodies[12].mtxLocal.scale(new f.Vector3(0.3, 2, 0.3));
    universalJoint = new f.ComponentJointUniversal(bodies[11].getComponent(f.ComponentRigidbody), bodies[12].getComponent(f.ComponentRigidbody), new f.Vector3(0, 1, 0), new f.Vector3(1, 0, 0));
    bodies[11].addComponent(universalJoint);


    bodies[13] = createCompleteMeshNode("Universal2", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_1);
    hierarchy.appendChild(bodies[13]);
    bodies[13].mtxLocal.translate(new f.Vector3(-5.5, 1.75, 2.5));
    bodies[13].mtxLocal.scale(new f.Vector3(0.3, 2, 0.3));
    secondUniversalJoint = new f.ComponentJointUniversal(bodies[12].getComponent(f.ComponentRigidbody), bodies[13].getComponent(f.ComponentRigidbody), new f.Vector3(0, 0, 1), new f.Vector3(1, 0, 0), new f.Vector3(0, -1, 0));
    bodies[12].addComponent(secondUniversalJoint);


    //Miscellaneous
    bodies[1] = createCompleteMeshNode("Cube_2", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_1);
    let cmpCubeTransform2: f.ComponentTransform = bodies[1].getComponent(f.ComponentTransform);
    hierarchy.appendChild(bodies[1]);
    cmpCubeTransform2.mtxLocal.translate(new f.Vector3(0, 2, 0));

    bodies[2] = createCompleteMeshNode("Cube_3", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 0, 0, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC);
    let cmpCubeTransform3: f.ComponentTransform = bodies[2].getComponent(f.ComponentTransform);
    hierarchy.appendChild(bodies[2]);
    cmpCubeTransform3.mtxLocal.translate(new f.Vector3(0.5, 3, 0.5));

    bodies[40] = createCompleteMeshNode("Cube_NonePhysics", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0, 1, 1, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC);
    bodies[40].removeComponent(bodies[40].getComponent(f.ComponentRigidbody));
    hierarchy.appendChild(bodies[40]);
    bodies[40].mtxLocal.translate(new f.Vector3(-4.5, 3.5, 0.5));

    //Kinematic
    bodies[3] = createCompleteMeshNode("PlayerControlledCube", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0, 0, 1, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.KINEMATIC);
    moveableTransform = bodies[3].getComponent(f.ComponentTransform);
    hierarchy.appendChild(bodies[3]);
    moveableTransform.mtxLocal.translate(new f.Vector3(5, 6, 5));

    //Ragdoll
    createRagdoll();

    let cmpLight: f.ComponentLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE")));
    cmpLight.mtxPivot.lookAt(new f.Vector3(0.5, -1, -0.8));
    hierarchy.addComponent(cmpLight);

    cmpCamera = new f.ComponentCamera();
    cmpCamera.clrBackground = f.Color.CSS("GREY");
    cmpCamera.mtxPivot.translate(new f.Vector3(0, 2, 17));
    cmpCamera.mtxPivot.lookAt(f.Vector3.ZERO());


    viewPort = new f.Viewport();
    viewPort.initialize("Viewport", hierarchy, cmpCamera, app);

    viewPort.showSceneGraph();
    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);

    viewPort.activatePointerEvent(f.EVENT_POINTER.DOWN, true);
    viewPort.addEventListener(f.EVENT_POINTER.DOWN, hndPointerDown);
    viewPort.activatePointerEvent(f.EVENT_POINTER.UP, true);
    viewPort.addEventListener(f.EVENT_POINTER.UP, hndPointerUp);

    f.Physics.start(hierarchy);
    f.Loop.start();
  }

  function update(): void {
    f.Physics.world.simulate();
    viewPort.draw();
    measureFPS();
  }

  function measureFPS(): void {
    window.requestAnimationFrame(() => {
      const now: number = performance.now();
      while (times.length > 0 && times[0] <= now - 1000) {
        times.shift();
      }
      times.push(now);
      fps = times.length;
      fpsDisplay.textContent = "FPS: " + fps.toString();
    });
  }

  function createCompleteMeshNode(_name: string, _material: f.Material, _mesh: f.Mesh, _mass: number, _physicsType: f.PHYSICS_TYPE, _group: f.PHYSICS_GROUP = f.PHYSICS_GROUP.DEFAULT, _colType: f.COLLIDER_TYPE = f.COLLIDER_TYPE.CUBE): f.Node {
    let node: f.Node = new f.Node(_name);
    let cmpMesh: f.ComponentMesh = new f.ComponentMesh(_mesh);
    let cmpMaterial: f.ComponentMaterial = new f.ComponentMaterial(_material);

    let cmpTransform: f.ComponentTransform = new f.ComponentTransform();

    let cmpRigidbody: f.ComponentRigidbody = new f.ComponentRigidbody(_mass, _physicsType, _colType, _group);
    cmpRigidbody.restitution = 0.2;
    cmpRigidbody.friction = 0.8;
    node.addComponent(cmpMesh);
    node.addComponent(cmpMaterial);
    node.addComponent(cmpTransform);
    node.addComponent(cmpRigidbody);
    return node;
  }

  function hndKey(_event: KeyboardEvent): void {
    let horizontal: number = 0;
    let vertical: number = 0;
    let height: number = 0;

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
    let pos: f.Vector3 = moveableTransform.mtxLocal.translation;
    pos.add(new f.Vector3(horizontal, height, vertical));
    moveableTransform.mtxLocal.translation = pos;
  }

  function hndKeyDown(_event: KeyboardEvent): void { //Test for joint changes
    if (_event.code == f.KEYBOARD_CODE.Y) {
      prismaticJoint.attachedRigidbody.applyForce(new f.Vector3(0, 1 * 1000, 0));
    }
    if (_event.code == f.KEYBOARD_CODE.U) {
      prismaticJointSlide.connectedRigidbody.applyForce(new f.Vector3(1 * -100, 0, 0));
    }
    if (_event.code == f.KEYBOARD_CODE.I) {
      prismaticJointSlide.connectedRigidbody.applyForce(new f.Vector3(1 * 100, 0, 0));
    }
    if (_event.code == f.KEYBOARD_CODE.O) {
      revoluteJointSwingDoor.connectedRigidbody.applyForce(new f.Vector3(0, 0, 1 * 100));
    }
    if (_event.code == f.KEYBOARD_CODE.P) {
      revoluteJointSwingDoor.connectedRigidbody.applyForce(new f.Vector3(0, 0, 1 * -100));
    }
    if (_event.code == f.KEYBOARD_CODE.F) {
      cylindricalJoint.connectedRigidbody.applyForce(new f.Vector3(0, 1 * 300, 0));
    }
    if (_event.code == f.KEYBOARD_CODE.G) {
      sphericalJoint.connectedRigidbody.applyTorque(new f.Vector3(0, 1 * 100, 0));
    }
    if (_event.code == f.KEYBOARD_CODE.H) {
      secondUniversalJoint.connectedRigidbody.applyForce(new f.Vector3(0, 0, 1 * 100));
    }
    if (_event.code == f.KEYBOARD_CODE.J) {
      secondUniversalJoint.connectedRigidbody.applyTorque(new f.Vector3(0, 1 * 100, 0));
    }

    //Physics Debugs
    if (_event.code == f.KEYBOARD_CODE.N) { //Toggle Debug Draw
      f.Physics.settings.debugDraw = !f.Physics.settings.debugDraw;
    }
    if (_event.code == f.KEYBOARD_CODE.M) { //Go through the different modes
      let currentMode: number = f.Physics.settings.debugMode;
      currentMode = currentMode == 4 ? 0 : f.Physics.settings.debugMode += 1;
      f.Physics.settings.debugMode = currentMode;
    }

  }

  function hndPointerDown(_event: f.EventPointer): void {
    let mouse: f.Vector2 = new f.Vector2(_event.pointerX, _event.pointerY);
    let posProjection: f.Vector2 = viewPort.pointClientToProjection(mouse);

    let ray: f.Ray = new f.Ray(new f.Vector3(-posProjection.x, posProjection.y, 1));


    ray.origin.transform(cmpCamera.mtxPivot);
    ray.direction.transform(cmpCamera.mtxPivot, false);

    //Ray
    let hitInfo: f.RayHitInfo = f.Physics.raycast(ray.origin, ray.direction, 20);
    if (hitInfo.hit)
      f.Debug.log(hitInfo.rigidbodyComponent.getContainer().name);
    else
      f.Debug.log("miss");
    let pos: f.Vector3 = hitInfo.hitPoint;
    moveableTransform.mtxLocal.translation = pos;
  }

  function hndPointerUp(_event: f.EventPointer) {
  }

  function createRagdoll(): void {
    let pos: f.Vector3 = new f.Vector3(5, 4, 5);
    let scale: f.Vector3 = new f.Vector3(0.4, 0.5, 0.4);
    head = createCompleteMeshNode("HeadRD", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0.7, 1, 0.3, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_1, f.COLLIDER_TYPE.CUBE);
    hierarchy.appendChild(head);
    pos.add(new f.Vector3(0, 0.4, 0));
    head.mtxLocal.translate(pos);
    head.mtxLocal.scale(scale);

    body1 = createCompleteMeshNode("body1", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0.7, 1, 0.3, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_1, f.COLLIDER_TYPE.CUBE);
    hierarchy.appendChild(body1);
    pos.add(new f.Vector3(0, -0.55, 0));
    scale = new f.Vector3(0.6, 0.6, 0.4);
    body1.mtxLocal.translate(pos);
    body1.mtxLocal.scale(scale);

    body2 = createCompleteMeshNode("body2", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0.7, 1, 0.3, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_1, f.COLLIDER_TYPE.CUBE);
    hierarchy.appendChild(body2);
    pos.add(new f.Vector3(0, -0.35, 0));
    scale = new f.Vector3(0.4, 0.4, 0.35);
    body2.mtxLocal.translate(pos);
    body2.mtxLocal.scale(scale);

    legL = createCompleteMeshNode("legL", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0.7, 1, 0.3, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_1, f.COLLIDER_TYPE.CUBE);
    hierarchy.appendChild(legL);
    pos.add(new f.Vector3(-0.25, -0.8, 0));
    scale = new f.Vector3(0.3, 1, 0.3);
    legL.mtxLocal.translate(pos);
    legL.mtxLocal.scale(scale);

    legR = createCompleteMeshNode("legR", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0.7, 1, 0.3, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_1, f.COLLIDER_TYPE.CUBE);
    hierarchy.appendChild(legR);
    pos.add(new f.Vector3(0.5, 0, 0));
    scale = new f.Vector3(0.3, 1, 0.3);
    legR.mtxLocal.translate(pos);
    legR.mtxLocal.scale(scale);

    armR = createCompleteMeshNode("armR", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0.7, 1, 0.3, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_1, f.COLLIDER_TYPE.CUBE);
    hierarchy.appendChild(armR);
    pos.add(new f.Vector3(0.45, 1.5, 0));
    scale = new f.Vector3(1, 0.2, 0.2);
    armR.mtxLocal.translate(pos);
    armR.mtxLocal.scale(scale);

    armL = createCompleteMeshNode("armL", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0.7, 1, 0.3, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_1, f.COLLIDER_TYPE.CUBE);
    hierarchy.appendChild(armL);
    pos.add(new f.Vector3(-1.45, 0, 0));
    scale = new f.Vector3(1, 0.2, 0.2);
    armL.mtxLocal.translate(pos);
    armL.mtxLocal.scale(scale);

    let x: f.Vector3 = new f.Vector3(1, 0, 0);
    let y: f.Vector3 = new f.Vector3(0, 1, 0);
    let z: f.Vector3 = new f.Vector3(0, 0, 1);

    jointHeadBody = new f.ComponentJointRagdoll(head.getComponent(f.ComponentRigidbody), body1.getComponent(f.ComponentRigidbody), y, x, new f.Vector3(0, -0.2, 0));
    jointHeadBody.springFrequencySwing = 10;
    jointHeadBody.springDampingSwing = 1;
    jointHeadBody.maxAngleFirstAxis = 90;
    jointHeadBody.maxAngleSecondAxis = 70;
    jointHeadBody.twistMotorLimitLower = -90;
    jointHeadBody.twistMotorLimitUpper = 90;
    jointHeadBody.springFrequencyTwist = 10;
    jointHeadBody.springDampingTwist = 1;
    head.addComponent(jointHeadBody);

    jointUpperLowerBody = new f.ComponentJointRagdoll(body1.getComponent(f.ComponentRigidbody), body2.getComponent(f.ComponentRigidbody), y, x, new f.Vector3(0, -0.4, 0));
    jointUpperLowerBody.springFrequencySwing = 10;
    jointUpperLowerBody.springDampingSwing = 1;
    jointUpperLowerBody.maxAngleFirstAxis = 90;
    jointUpperLowerBody.maxAngleSecondAxis = 90;
    jointUpperLowerBody.twistMotorLimitLower = -90;
    jointUpperLowerBody.twistMotorLimitUpper = 90;
    jointUpperLowerBody.springFrequencyTwist = 10;
    jointUpperLowerBody.springDampingTwist = 1;
    body1.addComponent(jointUpperLowerBody);

    jointBodyArmL = new f.ComponentJointRagdoll(armL.getComponent(f.ComponentRigidbody), body1.getComponent(f.ComponentRigidbody), x, z, new f.Vector3(0.5, 0, 0));
    jointBodyArmL.springFrequencySwing = 10;
    jointBodyArmL.springDampingSwing = 1;
    jointBodyArmL.maxAngleFirstAxis = 90;
    jointBodyArmL.maxAngleSecondAxis = 90;
    jointBodyArmL.twistMotorLimitLower = -90;
    jointBodyArmL.twistMotorLimitUpper = 90;
    jointBodyArmL.springFrequencyTwist = 10;
    jointBodyArmL.springDampingTwist = 1;
    armL.addComponent(jointBodyArmL);

    x.x = -1;
    jointBodyArmR = new f.ComponentJointRagdoll(armR.getComponent(f.ComponentRigidbody), body1.getComponent(f.ComponentRigidbody), x, z, new f.Vector3(-0.5, 0, 0));
    jointBodyArmR.springFrequencySwing = 10;
    jointBodyArmR.springDampingSwing = 1;
    jointBodyArmR.maxAngleFirstAxis = 90;
    jointBodyArmR.maxAngleSecondAxis = 90;
    jointBodyArmR.twistMotorLimitLower = -90;
    jointBodyArmR.twistMotorLimitUpper = 90;
    jointBodyArmR.springFrequencyTwist = 10;
    jointBodyArmR.springDampingTwist = 1;
    armR.addComponent(jointBodyArmR);

    jointBodyLegL = new f.ComponentJointRagdoll(legL.getComponent(f.ComponentRigidbody), body1.getComponent(f.ComponentRigidbody), y, x, new f.Vector3(0, 0.5, 0));
    jointBodyLegL.springFrequencySwing = 10;
    jointBodyLegL.springDampingSwing = 1;
    jointBodyLegL.maxAngleFirstAxis = 90;
    jointBodyLegL.maxAngleSecondAxis = 90;
    jointBodyLegL.twistMotorLimitLower = -90;
    jointBodyLegL.twistMotorLimitUpper = 90;
    jointBodyLegL.springFrequencyTwist = 10;
    jointBodyLegL.springDampingTwist = 1;
    legL.addComponent(jointBodyLegL);

    jointBodyLegR = new f.ComponentJointRagdoll(legR.getComponent(f.ComponentRigidbody), body1.getComponent(f.ComponentRigidbody), y, x, new f.Vector3(0, 0.5, 0));
    jointBodyLegR.springFrequencySwing = 10;
    jointBodyLegR.springDampingSwing = 1;
    jointBodyLegR.maxAngleFirstAxis = 90;
    jointBodyLegR.maxAngleSecondAxis = 90;
    jointBodyLegR.twistMotorLimitLower = -90;
    jointBodyLegR.twistMotorLimitUpper = 90;
    jointBodyLegR.springFrequencyTwist = 10;
    jointBodyLegR.springDampingTwist = 1;
    legR.addComponent(jointBodyLegR);

    holder = new f.ComponentJointSpherical(moveableTransform.getContainer().getComponent(f.ComponentRigidbody), head.getComponent(f.ComponentRigidbody), new f.Vector3(0, 0, 0));
    moveableTransform.getContainer().addComponent(holder);
    holder.springDamping = 0.1;
    holder.springFrequency = 1;

  }

}