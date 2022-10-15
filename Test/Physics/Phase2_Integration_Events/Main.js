// /<reference types="../../../../Core/Build/FudgeCore.js"/>
var FudgePhysics_Communication;
// /<reference types="../../../../Core/Build/FudgeCore.js"/>
(function (FudgePhysics_Communication) {
    var f = FudgeCore;
    window.addEventListener("load", init);
    document.addEventListener("keydown", hndKeyDown);
    const app = document.querySelector("canvas");
    let viewPort;
    let hierarchy;
    let fps;
    const times = [];
    let fpsDisplay = document.querySelector("h2#FPS");
    let cubes = new Array();
    let hitMaterial = new f.Material("hitMat", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.3, 0, 0, 1)));
    let triggeredMaterial = new f.Material("triggerMat", f.ShaderFlat, new f.CoatRemissive(new f.Color(0, 0.3, 0, 1)));
    let normalMaterial = new f.Material("NormalMat", f.ShaderFlat, new f.CoatRemissive(new f.Color(1, 0, 0, 1)));
    function init(_event) {
        f.Debug.log(app);
        hierarchy = new f.Node("Scene");
        let ground = createCompleteMeshNode("GroundCollider", new f.Material("Ground", f.ShaderFlat, new f.CoatRemissive(new f.Color(0.2, 0.2, 0.2, 1))), new f.MeshCube(), 0, f.BODY_TYPE.STATIC, f.COLLISION_GROUP.GROUP_1);
        let cmpGroundMesh = ground.getComponent(f.ComponentTransform);
        cmpGroundMesh.mtxLocal.scale(new f.Vector3(10, 0.3, 10));
        cmpGroundMesh.mtxLocal.translate(new f.Vector3(0, -1.5, 0));
        hierarchy.appendChild(ground);
        cubes[0] = createCompleteMeshNode("Cube", normalMaterial, new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_2);
        let cmpCubeTransform = cubes[0].getComponent(f.ComponentTransform);
        hierarchy.appendChild(cubes[0]);
        cmpCubeTransform.mtxLocal.translate(new f.Vector3(0, 7, 0));
        cubes[1] = createCompleteMeshNode("Cube", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(1, 0, 0, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_1);
        let cmpCubeTransform2 = cubes[1].getComponent(f.ComponentTransform);
        hierarchy.appendChild(cubes[1]);
        cmpCubeTransform2.mtxLocal.translate(new f.Vector3(0, 3.5, 0.48));
        cubes[2] = createCompleteMeshNode("Cube", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(1, 0, 0, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC);
        let cmpCubeTransform3 = cubes[2].getComponent(f.ComponentTransform);
        hierarchy.appendChild(cubes[2]);
        cmpCubeTransform3.mtxLocal.translate(new f.Vector3(0.6, 7, 0.5));
        cubes[3] = createCompleteMeshNode("Trigger", new f.Material("Cube", f.ShaderFlat, new f.CoatRemissive(new f.Color(0, 1, 0, 1))), new f.MeshSphere(), 1, f.BODY_TYPE.STATIC, f.COLLISION_GROUP.DEFAULT, f.COLLIDER_TYPE.SPHERE);
        cubes[3].getComponent(f.ComponentRigidbody).isTrigger = true;
        let cmpCubeTransform4 = cubes[3].getComponent(f.ComponentTransform);
        hierarchy.appendChild(cubes[3]);
        cmpCubeTransform4.mtxLocal.translate(new f.Vector3(0, 2.1, 0));
        let cmpLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE")));
        cmpLight.mtxPivot.lookAt(new f.Vector3(0.5, -1, -0.8));
        hierarchy.addComponent(cmpLight);
        let cmpCamera = new f.ComponentCamera();
        cmpCamera.clrBackground = f.Color.CSS("GREY");
        cmpCamera.mtxPivot.translate(new f.Vector3(2, 2, 10));
        cmpCamera.mtxPivot.lookAt(f.Vector3.ZERO());
        ground.getComponent(f.ComponentRigidbody).addEventListener("ColliderEnteredCollision" /* COLLISION_ENTER */, onCollisionEnter);
        cubes[3].getComponent(f.ComponentRigidbody).addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, onTriggerEnter);
        ground.getComponent(f.ComponentRigidbody).addEventListener("ColliderLeftCollision" /* COLLISION_EXIT */, onCollisionExit);
        cubes[3].getComponent(f.ComponentRigidbody).addEventListener("TriggerLeftCollision" /* TRIGGER_EXIT */, onTriggerExit);
        viewPort = new f.Viewport();
        viewPort.initialize("Viewport", hierarchy, cmpCamera, app);
        f.Debug.branch(viewPort.getBranch());
        viewPort.physicsDebugMode = f.PHYSICS_DEBUGMODE.CONTACTS;
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        cubes[0].getComponent(f.ComponentRigidbody).restitution = 1.3;
        f.Time.game.setScale(0);
        f.Physics.adjustTransforms(hierarchy);
        f.Loop.start();
    }
    function onCollisionEnter(_event) {
        f.Debug.log("ColEnter: " + _event.cmpRigidbody.node.name);
        f.Debug.log("ColEnterIMPULSE: " + _event.normalImpulse);
        f.Debug.log("ColEnterPoint: " + _event.collisionPoint);
        if (_event.cmpRigidbody.node.name == "Cube") {
            let cmpMaterial = _event.cmpRigidbody.node.getComponent(f.ComponentMaterial);
            cmpMaterial.material = hitMaterial;
        }
    }
    function onCollisionExit(_event) {
        f.Debug.log("ColExit: " + _event.cmpRigidbody.node.name);
        if (_event.cmpRigidbody.node.name == "Cube") {
            let cmpMaterial = _event.cmpRigidbody.node.getComponent(f.ComponentMaterial);
            cmpMaterial.material = normalMaterial;
        }
    }
    function onTriggerEnter(_event) {
        f.Debug.log("TriggerEnter: " + _event.cmpRigidbody.node.name);
        f.Debug.log("TriggerEnterPoint: " + _event.collisionPoint);
        if (_event.cmpRigidbody.node.name == "Cube") {
            let cmpMaterial = _event.cmpRigidbody.node.getComponent(f.ComponentMaterial);
            cmpMaterial.material = triggeredMaterial;
        }
    }
    function onTriggerExit(_event) {
        f.Debug.log("TriggerExit: " + _event.cmpRigidbody.node.name);
        if (_event.cmpRigidbody.node.name == "Cube") {
            let cmpMaterial = _event.cmpRigidbody.node.getComponent(f.ComponentMaterial);
            cmpMaterial.material = normalMaterial;
        }
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
    function createCompleteMeshNode(_name, _material, _mesh, _mass, _physicsType, _group = f.COLLISION_GROUP.DEFAULT, _collider = f.COLLIDER_TYPE.CUBE) {
        let node = new f.Node(_name);
        let cmpMesh = new f.ComponentMesh(_mesh);
        let cmpMaterial = new f.ComponentMaterial(_material);
        let cmpTransform = new f.ComponentTransform();
        let cmpRigidbody = new f.ComponentRigidbody(_mass, _physicsType, _collider, _group);
        node.addComponent(cmpMesh);
        node.addComponent(cmpMaterial);
        node.addComponent(cmpTransform);
        node.addComponent(cmpRigidbody);
        return node;
    }
    function hndKeyDown(_event) {
        if (_event.code == f.KEYBOARD_CODE.W) {
            if (f.Time.game.getScale() < 1)
                f.Time.game.setScale(f.Time.game.getScale() + 0.1);
        }
        if (_event.code == f.KEYBOARD_CODE.S) {
            if (f.Time.game.getScale() > 0)
                f.Time.game.setScale(f.Time.game.getScale() - 0.1);
        }
    }
})(FudgePhysics_Communication || (FudgePhysics_Communication = {}));
//# sourceMappingURL=Main.js.map