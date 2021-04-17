"use strict";
var PhysikTest;
(function (PhysikTest) {
    var f = FudgeCore;
    var fAid = FudgeAid;
    window.addEventListener("load", init);
    let graph = new f.Node("Graph");
    // let m1: f.Node;
    // let m2: f.Node;
    // let m3: f.Node;
    let meshTerrain;
    let gridFlat;
    let img;
    let bodies = new Array(); // Array of all physical objects in the scene to have a quick reference
    let controlled;
    let tyreFL;
    let tyreFR;
    let tyreBL;
    let tyreBR;
    let frontSuspensionRight;
    let frontSuspensionLeft;
    let backSuspensionRight;
    let backSuspensionLeft;
    let cntKeyHorizontal = new f.Control("Keyboard", 1, 0 /* PROPORTIONAL */, true);
    let cntKeyVertical = new f.Control("Keyboard", 4, 0 /* PROPORTIONAL */, true);
    function init(_event) {
        setupScene();
        setupControls();
        // controlled.height = getHeightOnTerrain(gridMeshFlat, controlled);
        // console.log(gridMeshFlat.indices);
        // console.log(gridMeshFlat.vertices);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, hndLoop);
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 120);
        // f.RenderManager.setupTransformAndLights(graph);
        fAid.addStandardLightComponents(graph);
    }
    function hndLoop(_event) {
        hndKeyboardControls();
        // controlled.mtxLocal.translation = new f.Vector3(controlled.mtxLocal.translation.x, height, controlled.mtxLocal.translation.z);
        let timeFrame = f.Loop.timeFrameGame / 1000;
        controlled.update(timeFrame);
        PhysikTest.viewport.draw();
    }
    async function setupScene() {
        // f.Physics.world.setSolverIterations(1000);
        // f.Physics.settings.defaultRestitution = 0.15;
        // f.Physics.settings.defaultFriction = 0.95;
        let coatTextured = new ƒ.CoatTextured();
        let tex = new f.TextureImage();
        tex.load("../Textures/grass.jpg");
        coatTextured.texture = tex;
        let matTex = new ƒ.Material("Textured", ƒ.ShaderTexture, coatTextured);
        let matFlat = new f.Material("White", f.ShaderFlat, new f.CoatColored(f.Color.CSS("WHITE")));
        let matRed = new f.Material("Red", f.ShaderFlat, new f.CoatColored(f.Color.CSS("RED")));
        let matGrey = new f.Material("Red", f.ShaderFlat, new f.CoatColored(f.Color.CSS("GREY")));
        let meshCube = new f.MeshCube("CubeMesh");
        let meshSphere = new f.MeshSphere("Tyre", 10, 10);
        controlled = new PhysikTest.Controlled("Cube", f.Matrix4x4.IDENTITY(), matRed, new f.MeshCube());
        let cmpRigidbody = new f.ComponentRigidbody(500, f.PHYSICS_TYPE.DYNAMIC, f.COLLIDER_TYPE.CUBE, f.PHYSICS_GROUP.DEFAULT, null, null);
        controlled.addComponent(cmpRigidbody);
        controlled.mtxLocal.translation = new f.Vector3(0.3, 0, 0.3);
        controlled.getComponent(f.ComponentMesh).mtxPivot.scale(new f.Vector3(0.1, 0.05, 0.025));
        controlled.getComponent(f.ComponentMesh).mtxPivot.translate(new f.Vector3(0.5, 0, 0.5));
        tyreFL = createCompleteNode("Tyre FL", matGrey, meshSphere, 20, f.PHYSICS_TYPE.DYNAMIC);
        tyreFL.getComponent(f.ComponentMesh).mtxPivot.scale(new f.Vector3(0.5, 0.5, 0.15));
        bodies.push(tyreFL);
        tyreFR = createCompleteNode("Tyre FR", matGrey, meshSphere, 20, f.PHYSICS_TYPE.DYNAMIC);
        tyreFR.getComponent(f.ComponentMesh).mtxPivot.scale(new f.Vector3(0.5, 0.5, 0.15));
        bodies.push(tyreFR);
        tyreBR = createCompleteNode("Tyre BR", matGrey, meshSphere, 20, f.PHYSICS_TYPE.DYNAMIC);
        tyreBR.getComponent(f.ComponentMesh).mtxPivot.scale(new f.Vector3(0.5, 0.5, 0.15));
        bodies.push(tyreBR);
        tyreBL = createCompleteNode("Tyre FL", matGrey, meshSphere, 20, f.PHYSICS_TYPE.DYNAMIC);
        tyreBL.getComponent(f.ComponentMesh).mtxPivot.scale(new f.Vector3(0.5, 0.5, 0.15));
        bodies.push(tyreBL);
        tyreFL.mtxLocal.rotateX(90);
        tyreFL.mtxLocal.scale(f.Vector3.ONE(0.1));
        tyreFL.mtxLocal.translate(new f.Vector3(0.9, 0, -0.3));
        tyreFR.mtxLocal.rotateX(90);
        tyreFR.mtxLocal.scale(f.Vector3.ONE(0.1));
        tyreFR.mtxLocal.translate(new f.Vector3(0.9, 0, 0.3));
        tyreBR.mtxLocal.rotateX(90);
        tyreBR.mtxLocal.scale(f.Vector3.ONE(0.1));
        tyreBR.mtxLocal.translate(new f.Vector3(0.1, 0, 0.3));
        tyreBL.mtxLocal.rotateX(90);
        tyreBL.mtxLocal.scale(f.Vector3.ONE(0.1));
        tyreBL.mtxLocal.translate(new f.Vector3(0.1, 0, -0.3));
        controlled.setUpAxis();
        //controlled.getComponent(f.ComponentMesh).mtxPivot.scaleZ(2);
        // m1 = Scenes.createCompleteMeshNode("M1", matRed, meshCube);
        // m2 = Scenes.createCompleteMeshNode("M2", matRed, meshCube);
        // m3 = Scenes.createCompleteMeshNode("M3", matRed, meshCube);
        const myHeightMapFunction = function (x, y) {
            return Math.sin(x * y * Math.PI * 2) * 0.2;
        };
        PhysikTest.viewport = new f.Viewport();
        PhysikTest.viewport.addEventListener("\u0192keydown" /* DOWN */, moreVertices);
        let cmpCamera = Scenes.createCamera(new f.Vector3(0, 2, 1), new f.Vector3(0, 0, 0));
        img = new ƒ.TextureImage();
        await img.load("test2.png");
        meshTerrain = new f.MeshTerrain("HeightMap", img);
        gridFlat = Scenes.createCompleteMeshNode("Grid", matFlat, meshTerrain);
        meshTerrain.node = gridFlat;
        // gridFlat.mtxLocal.translateX(0.5);
        // gridFlat.mtxLocal.scale(f.Vector3.ONE(1.5));
        // gridFlat.mtxLocal.rotateY(45);
        controlled.meshTerrain = meshTerrain;
        // let s = 0.01;
        // m1.mtxLocal.scale(new f.Vector3(s,s,s));
        // m2.mtxLocal.scale(new f.Vector3(s,s,s));
        // m3.mtxLocal.scale(new f.Vector3(s,s,s));
        PhysikTest.arrowRed = Scenes.createCompleteMeshNode("Arrow", matRed, meshCube);
        PhysikTest.arrowRed.getComponent(f.ComponentMesh).mtxPivot.translateZ(0.5);
        PhysikTest.arrowRed.mtxLocal.scale(new f.Vector3(0.01, 0.01, 0.2));
        // let test: f.Node = new fAid.NodeCoordinateSystem; 
        graph.addChild(gridFlat);
        graph.addChild(controlled);
        // graph.addChild(m1);
        // graph.addChild(m2);
        // graph.addChild(m3);
        // graph.addChild(test);
        gridFlat.addChild(PhysikTest.arrowRed);
        controlled.addChild(tyreFL);
        controlled.addChild(tyreFR);
        controlled.addChild(tyreBR);
        controlled.addChild(tyreBL);
        frontSuspensionRight = new f.ComponentJointCylindrical(controlled.getComponent(f.ComponentRigidbody), tyreFR.getComponent(f.ComponentRigidbody), new f.Vector3(0, -1, 0), new f.Vector3(0.50, -1, -0.75));
        controlled.addComponent(frontSuspensionRight);
        frontSuspensionRight.springDamping = 100;
        frontSuspensionRight.springFrequency = 2;
        frontSuspensionRight.translationMotorLimitUpper = 0;
        frontSuspensionRight.translationMotorLimitLower = 0;
        frontSuspensionRight.rotationalMotorLimitUpper = 0;
        frontSuspensionRight.rotationalMotorLimitLower = 0;
        frontSuspensionRight.internalCollision = true;
        frontSuspensionLeft = new f.ComponentJointCylindrical(controlled.getComponent(f.ComponentRigidbody), tyreFL.getComponent(f.ComponentRigidbody), new f.Vector3(0, -1, 0), new f.Vector3(-0.50, -1, -0.75));
        controlled.addComponent(frontSuspensionLeft);
        frontSuspensionLeft.springDamping = 100;
        frontSuspensionLeft.springFrequency = 2;
        frontSuspensionLeft.translationMotorLimitUpper = 0;
        frontSuspensionLeft.translationMotorLimitLower = 0;
        frontSuspensionLeft.rotationalMotorLimitUpper = 0;
        frontSuspensionLeft.rotationalMotorLimitLower = 0;
        frontSuspensionLeft.internalCollision = true;
        backSuspensionLeft = new f.ComponentJointCylindrical(controlled.getComponent(f.ComponentRigidbody), tyreBL.getComponent(f.ComponentRigidbody), new f.Vector3(0, -1, 0), new f.Vector3(-0.50, -1, 0.75));
        controlled.addComponent(backSuspensionLeft);
        backSuspensionLeft.springDamping = 100;
        backSuspensionLeft.springFrequency = 2;
        backSuspensionLeft.translationMotorLimitUpper = 0;
        backSuspensionLeft.translationMotorLimitLower = 0;
        backSuspensionLeft.rotationalMotorLimitUpper = 0;
        backSuspensionLeft.rotationalMotorLimitLower = 0;
        backSuspensionLeft.internalCollision = true;
        backSuspensionRight = new f.ComponentJointCylindrical(controlled.getComponent(f.ComponentRigidbody), tyreBR.getComponent(f.ComponentRigidbody), new f.Vector3(0, -1, 0), new f.Vector3(0.50, -1, 0.75));
        controlled.addComponent(backSuspensionRight);
        backSuspensionRight.springDamping = 100;
        backSuspensionRight.springFrequency = 2;
        backSuspensionRight.translationMotorLimitUpper = 0;
        backSuspensionRight.translationMotorLimitLower = 0;
        backSuspensionRight.rotationalMotorLimitUpper = 0;
        backSuspensionRight.rotationalMotorLimitLower = 0;
        backSuspensionRight.internalCollision = true;
        f.Physics.start(graph);
        f.Physics.settings.debugDraw = true;
        PhysikTest.viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));
        PhysikTest.viewport.setFocus(true);
        Scenes.dollyViewportCamera(PhysikTest.viewport);
        PhysikTest.viewport.draw();
    }
    function moreVertices(_event) {
        if (_event.code == f.KEYBOARD_CODE.M) {
            meshTerrain.resolutionX = meshTerrain.resolutionX + 1;
            meshTerrain.resolutionZ = meshTerrain.resolutionZ + 1;
            meshTerrain.clear();
            meshTerrain.createRenderBuffers();
            console.log(meshTerrain.resolutionX);
        }
        if (_event.code == f.KEYBOARD_CODE.N) {
            meshTerrain.resolutionX = meshTerrain.resolutionX - 1;
            meshTerrain.resolutionZ = meshTerrain.resolutionZ - 1;
            meshTerrain.clear();
            meshTerrain.createRenderBuffers();
            console.log(meshTerrain.resolutionX);
        }
    }
    // export function getPositionOnTerrain(terrain: f.MeshHeightMap, object: f.Node, calculateRotation: boolean = false): f.Ray{
    //   let nearestFace: distanceToFaceVertices = findNearestFace(terrain, object);
    //   let ray = new f.Ray;
    //   ray.origin = new f.Vector3(0, calculateHeight(nearestFace, object), 0);
    //   ray.direction = nearestFace.faceNormal;
    //   return ray;
    // }
    // function calculateHeight (face: distanceToFaceVertices, object: f.Node): number{
    //   m1.mtxLocal.translation = face.vertexONE;
    //   m2.mtxLocal.translation = face.vertexTWO;
    //   m3.mtxLocal.translation = face.vertexTHREE;
    //   let ray = new f.Ray(new f.Vector3(0,1,0), object.mtxWorld.translation);
    //   let intersection = ray.intersectPlane(face.vertexONE, face.faceNormal);
    //   return intersection.y;
    // }
    // function findNearestFace(terrain: f.MeshHeightMap, object: f.Node): distanceToFaceVertices{
    //   let vertices = terrain.vertices;
    //   let indices = terrain.indices;
    //   let nearestFaces: Array<distanceToFaceVertices> = new Array;
    //   for(let i = 0; i < indices.length; i = i+3){
    //     let vertexONE = new f.Vector3(vertices[indices[i]*3], vertices[indices[i]*3+1],vertices[indices[i]*3+2]);
    //     let vertexTWO = new f.Vector3(vertices[indices[i+1]*3], vertices[indices[i+1]*3+1],vertices[indices[i+1]*3+2]);
    //     let vertexTHREE = new f.Vector3(vertices[indices[i+2]*3], vertices[indices[i+2]*3+1],vertices[indices[i+2]*3+2]);
    //     let face = new distanceToFaceVertices(vertexONE, vertexTWO, vertexTHREE, object);
    //     nearestFaces.push(face);
    //   }
    //   nearestFaces.sort((n1,n2) => {
    //     return n1.distance - n2.distance;
    //   });
    //   return nearestFaces[0];
    // }
    function setupControls() {
        controlled.axisSpeed.addControl(cntKeyVertical);
        controlled.axisRotation.addControl(cntKeyHorizontal);
    }
    function hndKeyboardControls() {
        cntKeyVertical.setInput(f.Keyboard.mapToValue(1, 0, [f.KEYBOARD_CODE.I])
            + f.Keyboard.mapToValue(-1, 0, [f.KEYBOARD_CODE.K]));
        cntKeyHorizontal.setInput(f.Keyboard.mapToValue(1, 0, [f.KEYBOARD_CODE.J])
            + f.Keyboard.mapToValue(-1, 0, [f.KEYBOARD_CODE.L]));
    }
    // class distanceToFaceVertices {
    //   public vertexONE: f.Vector3;
    //   public vertexTWO: f.Vector3;
    //   public vertexTHREE: f.Vector3;
    //   public distanceONE: number;
    //   public distanceTWO: number;
    //   public distanceTHREE: number;
    //   public distance: number;
    //   public faceNormal: f.Vector3;
    //   public constructor(vertexONE: f.Vector3, vertexTWO: f.Vector3, vertexTHREE: f.Vector3, object: f.Node){
    //     this.vertexONE = vertexONE;
    //     this.vertexTWO = vertexTWO;
    //     this.vertexTHREE = vertexTHREE;
    //     this.distanceONE = new f.Vector2(vertexONE.x - object.mtxLocal.translation.x, vertexONE.z - object.mtxWorld.translation.z).magnitude;
    //     this.distanceTWO = new f.Vector2(vertexTWO.x - object.mtxLocal.translation.x, vertexTWO.z - object.mtxWorld.translation.z).magnitude;
    //     this.distanceTHREE = new f.Vector2(vertexTHREE.x - object.mtxLocal.translation.x, vertexTHREE.z - object.mtxWorld.translation.z).magnitude;
    //     this.distance = this.distanceONE + this.distanceTWO + this.distanceTHREE; 
    //     this.calculateFaceNormal();
    //   }
    //   public calculateFaceNormal(){
    //     let v1 = f.Vector3.DIFFERENCE(this.vertexTWO, this.vertexONE);
    //     let v2 = f.Vector3.DIFFERENCE(this.vertexTHREE, this.vertexONE);
    //     this.faceNormal = f.Vector3.CROSS(v1, v2);
    //   }
    // }
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
})(PhysikTest || (PhysikTest = {}));
