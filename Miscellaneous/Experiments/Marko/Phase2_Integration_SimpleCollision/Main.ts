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
  let origin: f.Vector3 = new f.Vector3(-5, 0.25, 0);
  let direction: f.Vector3 = new f.Vector3(1, 0, 0);
  let hitInfo: f.RayHitInfo = new f.RayHitInfo();
  let ground: f.Node;

  let stepWidth: number = 0.1;

  let moveableTransform: f.ComponentTransform;



  function init(_event: Event): void {
    f.Debug.log(app);
    //f.RenderManager.initialize();
    //f.Physics.initializePhysics();
    hierarchy = new f.Node("Scene");

    document.addEventListener("keypress", hndKey);

    ground = createCompleteMeshNode("Ground", new f.Material("Ground", f.ShaderFlat, new f.CoatColored(new f.Color(0.2, 0.2, 0.2, 1))), new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_1);
    let cmpGroundMesh: f.ComponentTransform = ground.getComponent(f.ComponentTransform);
    cmpGroundMesh.mtxLocal.scale(new f.Vector3(10, 0.3, 10));

    cmpGroundMesh.mtxLocal.translate(new f.Vector3(0, -1.5, 0));
    hierarchy.appendChild(ground);

    bodies[0] = createCompleteMeshNode("Cube_1", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 0, 0, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_2);
    let cmpCubeTransform: f.ComponentTransform = bodies[0].getComponent(f.ComponentTransform);
    hierarchy.appendChild(bodies[0]);
    cmpCubeTransform.mtxLocal.translate(new f.Vector3(0, 7, 0));

    bodies[1] = createCompleteMeshNode("Cube_2", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_1);
    let cmpCubeTransform2: f.ComponentTransform = bodies[1].getComponent(f.ComponentTransform);
    bodies[0].appendChild(bodies[1]);
    bodies[1].removeComponent(bodies[1].getComponent(f.ComponentRigidbody));
    cmpCubeTransform2.mtxLocal.translate(new f.Vector3(0, 1, 0));

    bodies[2] = createCompleteMeshNode("Cube_3", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 0, 0, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.DYNAMIC);
    let cmpCubeTransform3: f.ComponentTransform = bodies[2].getComponent(f.ComponentTransform);
    hierarchy.appendChild(bodies[2]);
    cmpCubeTransform3.mtxLocal.translate(new f.Vector3(0.5, 3, 0.5));

    bodies[3] = createCompleteMeshNode("Cube_3", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0, 0, 1, 1))), new f.MeshCube(), 1, f.PHYSICS_TYPE.KINEMATIC);
    moveableTransform = bodies[3].getComponent(f.ComponentTransform);
    hierarchy.appendChild(bodies[3]);
    moveableTransform.mtxLocal.translate(new f.Vector3(-4, 1, 0));

    bodies[4] = createCompleteMeshNode("Pyramid", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0, 0, 1, 1))), new f.MeshPyramid, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_1, f.COLLIDER_TYPE.PYRAMID);
    hierarchy.appendChild(bodies[4]);
    bodies[4].mtxLocal.translate(new f.Vector3(0, 4, 3));
    bodies[4].mtxLocal.scale(new f.Vector3(1.5, 1.5, 1.5));
    bodies[4].mtxLocal.rotateY(120, false);

    //#region  CompoundCollider Workaround
    //Compound Collider Workaround, through making ONE convex collider on a main object that has the shape of the result object instead of having multiple shapes on a rigidbody
    let colVertices: Float32Array = new Float32Array
      ([
        1, -1, 1,
        0, -2, 0,
        1, 1, 1,
        - 1, 1, 1,
        - 1, -1, 1,
        -2, 0, 0,
        1, 1, -1,
        - 1, 1, -1,
        - 1, -1, -1,
        0, 0, -2,
        1, -1, -1,
        2, 0, 0,
        0, 2, 0,
        0, 0, 2
      ]);

    //Main Shape
    bodies[5] = createCompleteMeshNode("Compound", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0, 0.3, 1, 1))), new f.MeshCube, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.CONVEX, colVertices);
    hierarchy.appendChild(bodies[5]);
    bodies[5].mtxLocal.translate(new f.Vector3(2.5, 4, 3.5));
    bodies[5].mtxLocal.rotateX(27);
    bodies[5].mtxLocal.rotateY(32);
    //Components
    bodies[6] = createCompleteMeshNode("CompoundUpper", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0, 0.3, 1, 1))), new f.MeshPyramid, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
    bodies[6].removeComponent(bodies[6].getComponent(f.ComponentRigidbody));
    bodies[6].mtxLocal.translateY(0.5);
    bodies[6].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
    bodies[5].appendChild(bodies[6]);
    bodies[7] = createCompleteMeshNode("CompoundLower", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0, 0.3, 1, 1))), new f.MeshPyramid, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
    bodies[7].removeComponent(bodies[7].getComponent(f.ComponentRigidbody));
    bodies[7].mtxLocal.rotateX(180);
    bodies[7].mtxLocal.translateY(0.5);
    bodies[7].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
    bodies[5].appendChild(bodies[7]);
    bodies[8] = createCompleteMeshNode("CompoundLeft", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0, 0.3, 1, 1))), new f.MeshPyramid, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
    bodies[8].removeComponent(bodies[8].getComponent(f.ComponentRigidbody));
    bodies[8].mtxLocal.rotateZ(90);
    bodies[8].mtxLocal.translateY(0.5);
    bodies[8].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
    bodies[5].appendChild(bodies[8]);
    bodies[9] = createCompleteMeshNode("CompoundRight", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0, 0.3, 1, 1))), new f.MeshPyramid, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
    bodies[9].removeComponent(bodies[9].getComponent(f.ComponentRigidbody));
    bodies[9].mtxLocal.rotateZ(-90);
    bodies[9].mtxLocal.translateY(0.5);
    bodies[9].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
    bodies[5].appendChild(bodies[9]);
    bodies[10] = createCompleteMeshNode("CompoundFront", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0, 0.3, 1, 1))), new f.MeshPyramid, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
    bodies[10].removeComponent(bodies[10].getComponent(f.ComponentRigidbody));
    bodies[10].mtxLocal.rotateX(90);
    bodies[10].mtxLocal.translateY(0.5);
    bodies[10].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
    bodies[5].appendChild(bodies[10]);
    bodies[11] = createCompleteMeshNode("CompoundBack", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0, 0.3, 1, 1))), new f.MeshPyramid, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
    bodies[11].removeComponent(bodies[11].getComponent(f.ComponentRigidbody));
    bodies[11].mtxLocal.rotateX(-90);
    bodies[11].mtxLocal.translateY(0.5);
    bodies[11].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
    bodies[5].appendChild(bodies[11]);
    bodies[5].getComponent(f.ComponentRigidbody).restitution = 2;
    //#endregion


    //Rest initialization
    let cmpLight: f.ComponentLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE")));
    cmpLight.mtxPivot.lookAt(new f.Vector3(0.5, -1, -0.8));
    hierarchy.addComponent(cmpLight);

    let cmpCamera: f.ComponentCamera = new f.ComponentCamera();
    cmpCamera.clrBackground = f.Color.CSS("GREY");
    cmpCamera.mtxPivot.translate(new f.Vector3(2, 2, 10));
    cmpCamera.mtxPivot.lookAt(f.Vector3.ZERO());


    viewPort = new f.Viewport();
    viewPort.initialize("Viewport", hierarchy, cmpCamera, app);

    viewPort.showSceneGraph();
    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
    f.Physics.start(hierarchy);
    f.Loop.start();
    f.Physics.settings.debugDraw = true;
  }

  function update(): void {
    f.Physics.world.simulate();
    hitInfo = f.Physics.raycast(origin, direction, 10);
    if (hitInfo.hit == true && hitInfo.rigidbodyComponent.getContainer().name == "Cube_1") {
      f.Debug.log(hitInfo);
    }

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

  function createCompleteMeshNode(_name: string, _material: f.Material, _mesh: f.Mesh, _mass: number, _physicsType: f.PHYSICS_TYPE, _group: f.PHYSICS_GROUP = f.PHYSICS_GROUP.DEFAULT, _colType: f.COLLIDER_TYPE = f.COLLIDER_TYPE.CUBE, _convexMesh: Float32Array = null): f.Node {
    let node: f.Node = new f.Node(_name);
    let cmpMesh: f.ComponentMesh = new f.ComponentMesh(_mesh);
    let cmpMaterial: f.ComponentMaterial = new f.ComponentMaterial(_material);

    let cmpTransform: f.ComponentTransform = new f.ComponentTransform();
    let cmpRigidbody: f.ComponentRigidbody = new f.ComponentRigidbody(_mass, _physicsType, _colType, _group, null, _convexMesh);
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

}