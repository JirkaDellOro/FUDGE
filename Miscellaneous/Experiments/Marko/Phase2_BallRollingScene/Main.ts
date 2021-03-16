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
  let ballRB: f.ComponentRigidbody;
  let speedForce: number = 10;

  let isForce: boolean = true;


  function init(_event: Event): void {
    f.Debug.log(app);
    hierarchy = new f.Node("Scene");

    document.addEventListener("keypress", hndKey);
    document.addEventListener("keydown", hndKeyDown);
    let ground: f.Node = createCompleteMeshNode("Ground", new f.Material("Ground", f.ShaderFlat, new f.CoatColored(new f.Color(0.2, 0.2, 0.2, 1))), "Cube", 0, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_1);
    let cmpGroundMesh: f.ComponentTransform = ground.getComponent(f.ComponentTransform);
    cmpGroundMesh.mtxLocal.scale(new f.Vector3(10, 0.3, 10));

    cmpGroundMesh.mtxLocal.translate(new f.Vector3(0, -1.5, 0));
    hierarchy.appendChild(ground);

    bodies[0] = createCompleteMeshNode("Ball", new f.Material("Ball", f.ShaderFlat, new f.CoatColored(new f.Color(0.5, 0.5, 0.5, 1))), "Sphere", 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_2);
    let cmpCubeTransform: f.ComponentTransform = bodies[0].getComponent(f.ComponentTransform);
    hierarchy.appendChild(bodies[0]);
    cmpCubeTransform.mtxLocal.translate(new f.Vector3(7, 4, 0));
    ballRB = bodies[0].getComponent(f.ComponentRigidbody);
    ballRB.linearDamping = 0.1;
    ballRB.angularDamping = 0.1;

    bodies[1] = createCompleteMeshNode("Cube_-10GradZ", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), "Cube", 1, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_1);
    hierarchy.appendChild(bodies[1]);
    bodies[1].mtxLocal.translate(new f.Vector3(-7, -1.5, 0));
    bodies[1].mtxLocal.scale(new f.Vector3(10, 0.3, 10));
    bodies[1].mtxLocal.rotateZ(-10, true);

    bodies[2] = createCompleteMeshNode("Cube_-20GradZ", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), "Cube", 1, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_1);
    hierarchy.appendChild(bodies[2]);
    bodies[2].mtxLocal.translate(new f.Vector3(8, -1, 0));
    bodies[2].mtxLocal.scale(new f.Vector3(10, 0.1, 10));
    bodies[2].mtxLocal.rotateZ(20, true);

    bodies[4] = createCompleteMeshNode("Cube_15,0,10Grad", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), "Cube", 1, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_1);
    bodies[4].mtxLocal.translate(new f.Vector3(0, -1.3, -9.5));
    bodies[4].mtxLocal.scale(new f.Vector3(10, 0.3, 10));
    bodies[4].mtxLocal.rotate(new f.Vector3(15, 0, 10), true);
    hierarchy.appendChild(bodies[4]);

    bodies[3] = createCompleteMeshNode("ResetTrigger", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), "Cube", 1, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.TRIGGER);
    bodies[3].removeComponent(bodies[3].getComponent(f.ComponentMesh));
    hierarchy.appendChild(bodies[3]);
    bodies[3].mtxLocal.translate(new f.Vector3(0, -3, 0));
    bodies[3].mtxLocal.scale(new f.Vector3(40, 0.3, 40));
    bodies[3].getComponent(f.ComponentRigidbody).addEventListener(f.EVENT_PHYSICS.TRIGGER_ENTER, resetBall);

    let cmpLight: f.ComponentLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE")));
    cmpLight.mtxPivot.lookAt(new f.Vector3(0.5, -1, -0.8));
    hierarchy.addComponent(cmpLight);

    let cmpCamera: f.ComponentCamera = new f.ComponentCamera();
    cmpCamera.clrBackground = f.Color.CSS("GREY");
    cmpCamera.mtxPivot.translate(new f.Vector3(2, 4, 25));
    cmpCamera.mtxPivot.lookAt(f.Vector3.ZERO());


    viewPort = new f.Viewport();
    viewPort.initialize("Viewport", hierarchy, cmpCamera, app);

    viewPort.showSceneGraph();
    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
    f.Physics.start(hierarchy);
    f.Loop.start();
  }

  function update(): void {
    f.Physics.world.simulate();
    viewPort.draw();
    measureFPS();
  }


  function resetBall(_event: f.EventPhysics): void {
    if (_event.cmpRigidbody.getContainer().name == "Ball") {
      ballRB.setPosition(new f.Vector3(0, 5, 0));
    }
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

  function createCompleteMeshNode(_name: string, _material: f.Material, _mesh: string, _mass: number, _physicsType: f.PHYSICS_TYPE, _group: f.PHYSICS_GROUP = f.PHYSICS_GROUP.DEFAULT): f.Node {
    let node: f.Node = new f.Node(_name);
    let mesh: f.Mesh;
    let meshType: f.COLLIDER_TYPE;
    if (_mesh == "Cube") {
      mesh = new f.MeshCube();
      meshType = f.COLLIDER_TYPE.CUBE;
    }
    if (_mesh == "Sphere") {
      mesh = new f.MeshSphere(undefined, 8, 8);
      meshType = f.COLLIDER_TYPE.SPHERE;
    }

    let cmpMesh: f.ComponentMesh = new f.ComponentMesh(mesh);
    let cmpMaterial: f.ComponentMaterial = new f.ComponentMaterial(_material);

    let cmpTransform: f.ComponentTransform = new f.ComponentTransform();


    let cmpRigidbody: f.ComponentRigidbody = new f.ComponentRigidbody(_mass, _physicsType, meshType, _group);
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

    if (_event.code == f.KEYBOARD_CODE.A) {
      //Steer Left
      horizontal -= 1;
    } else if (_event.code == f.KEYBOARD_CODE.D) {
      //Steer Right
      horizontal += 1;
    }
    if (_event.code == f.KEYBOARD_CODE.W) {
      //Forward
      vertical -= 1;
    } else if (_event.code == f.KEYBOARD_CODE.S) {
      //Backward
      vertical += 1;
    }
    if (isForce)
      ballRB.applyForce(new f.Vector3(horizontal * speedForce, 0, vertical * speedForce));
    else {
      ballRB.applyImpulseAtPoint(new f.Vector3(horizontal * speedForce, 0, vertical * speedForce));
    }
  }

  function hndKeyDown(_event: KeyboardEvent): void {
    //toggle between force applied and impulse applied
    if (_event.code == f.KEYBOARD_CODE.T) {
      isForce = !isForce;
    }
  }
}