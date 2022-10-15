// /<reference types="../../../../Core/Build/FudgeCore.js"/>
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
    let hitInfo: f.RayHitInfo = new f.RayHitInfo();
    let ground: f.Node;

    let stepWidth: number = 0.2;

    let moveableTransform: f.ComponentTransform;
    let speedCameraRotation: number = 0.5;



    function init(_event: Event): void {
        f.Debug.log(app);

        hierarchy = new f.Node("Scene");

        document.addEventListener("keypress", hndKey);

        ground = createCompleteMeshNode("Ground", new f.Material("Ground", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.2, 0.2, 0.2, 1))), new f.MeshCube(), 0, f.BODY_TYPE.STATIC, f.COLLISION_GROUP.GROUP_1);
        ground.mtxLocal.scale(new f.Vector3(20, 0.3, 20));
        ground.mtxLocal.translate(new f.Vector3(0, -1.5, 0));
        hierarchy.appendChild(ground);

        bodies[0] = createCompleteMeshNode("Target 1", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(1, 0, 0, 1))), new f.MeshCube(), 1, f.BODY_TYPE.STATIC, f.COLLISION_GROUP.GROUP_2);
        hierarchy.appendChild(bodies[0]);
        bodies[0].mtxLocal.translate(new f.Vector3(-10, 2, -10), true);
        bodies[0].mtxLocal.scale(new f.Vector3(3, 5, 3));
        bodies[0].mtxLocal.rotateY(45);

        bodies[1] = createCompleteMeshNode("Target 2", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(1, 0, 0, 1))), new f.MeshCube(), 1, f.BODY_TYPE.STATIC, f.COLLISION_GROUP.GROUP_2);
        hierarchy.appendChild(bodies[1]);
        bodies[1].mtxLocal.translate(new f.Vector3(10, 2, 10), true);
        bodies[1].mtxLocal.scale(new f.Vector3(3, 5, 3));
        bodies[1].mtxLocal.rotateY(-45);

        bodies[2] = createCompleteMeshNode("Target 3", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(1, 0, 0, 1))), new f.MeshCube(), 1, f.BODY_TYPE.STATIC, f.COLLISION_GROUP.GROUP_2);
        hierarchy.appendChild(bodies[2]);
        bodies[2].mtxLocal.translate(new f.Vector3(10, 2, 0), true);
        bodies[2].mtxLocal.scale(new f.Vector3(3, 5, 5));

        bodies[3] = createCompleteMeshNode("Player", new f.Material("Player", f.ShaderFlat, new f.CoatRemissive(new f.Color(0, 0, 1, 1))), new f.MeshCube(), 1, f.BODY_TYPE.KINEMATIC);
        moveableTransform = bodies[3].getComponent(f.ComponentTransform);
        hierarchy.appendChild(bodies[3]);
        moveableTransform.mtxLocal.scale(new f.Vector3(1, 2, 1));
        moveableTransform.mtxLocal.rotateY(180);
        moveableTransform.mtxLocal.translate(new f.Vector3(0, 0.5, 0));

        bodies[4] = createCompleteMeshNode("PlayerGun", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0, 0, 1, 1))), new f.MeshCube, 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_1);
        bodies[4].removeComponent(bodies[4].getComponent(f.ComponentRigidbody));
        bodies[4].mtxLocal.translate(new f.Vector3(-0.5, 0, 1), true);
        bodies[4].mtxLocal.scale(new f.Vector3(0.3, 0.3, 2));
        bodies[3].appendChild(bodies[4]);

        let cmpLight: f.ComponentLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE")));
        cmpLight.mtxPivot.lookAt(new f.Vector3(0.5, -1, -0.8));
        hierarchy.addComponent(cmpLight);

        let cmpCamera: f.ComponentCamera = new f.ComponentCamera();
        cmpCamera.clrBackground = f.Color.CSS("GREY");
        cmpCamera.mtxPivot.translate(new f.Vector3(-2, 1, -9.5));
        cmpCamera.mtxPivot.scale(new f.Vector3(1, 0.5, 1));
        bodies[3].addComponent(cmpCamera);


        viewPort = new f.Viewport();
        viewPort.initialize("Viewport", hierarchy, cmpCamera, app);
        viewPort.canvas.addEventListener("pointermove", hndPointerMove);
        viewPort.physicsDebugMode = f.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;

        f.Debug.branch(viewPort.getBranch());
        // f.Physics.settings.debugMode = f.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;

        f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
        // f.Physics.adjustTransforms(hierarchy);
        f.Loop.start();
    }

    function update(): void {
        continousRaycast();
        f.Physics.simulate();
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

    function createCompleteMeshNode(_name: string, _material: f.Material, _mesh: f.Mesh, _mass: number, _physicsType: f.BODY_TYPE, _group: f.COLLISION_GROUP = f.COLLISION_GROUP.DEFAULT, _colType: f.COLLIDER_TYPE = f.COLLIDER_TYPE.CUBE): f.Node {
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
        if (_event.code == f.KEYBOARD_CODE.A) {
            horizontal += 1 * stepWidth;
        }
        if (_event.code == f.KEYBOARD_CODE.D) {
            horizontal -= 1 * stepWidth;
        }
        if (_event.code == f.KEYBOARD_CODE.W) {
            vertical += 1 * stepWidth;
        }
        if (_event.code == f.KEYBOARD_CODE.S) {
            vertical -= 1 * stepWidth;
        }
        let pos: f.Vector3 = new f.Vector3(horizontal, 0, vertical);
        moveableTransform.mtxLocal.translate(pos, true);
    }

    function hndPointerMove(_event: PointerEvent): void {
        moveableTransform.mtxLocal.rotateY(_event.movementX * speedCameraRotation);
    }

    function continousRaycast(): void {//_event: f.EventPointer): void {
        origin = bodies[4].mtxWorld.translation;
        let forward: f.Vector3;
        forward = f.Vector3.Z();
        forward.transform(bodies[4].mtxWorld, false);

        hitInfo = f.Physics.raycast(origin, forward, 20, true);

        if (hitInfo.hit == true && hitInfo.rigidbodyComponent.node.name.includes("Target")) {
            f.Debug.log("hit", hitInfo.rigidbodyComponent.node.name);
        }
    }
}