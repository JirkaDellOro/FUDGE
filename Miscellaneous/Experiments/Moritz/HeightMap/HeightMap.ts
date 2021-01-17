namespace HeightMap {
  import f = FudgeCore;
  import fAid = FudgeAid;
  

  window.addEventListener("load", init);

  let graph: f.Node = new f.Node("Graph");

  let m1: f.Node;
  let m2: f.Node;
  let m3: f.Node;

  let testCube: f.Node;

  let gridMeshFlat: f.MeshHeightMap;
  let gridFlat: f.Node;

  let viewport: f.Viewport;

  let controlled: Controlled;
  let parentControll: f.Node;
  let cntKeyHorizontal: f.Control = new f.Control("Keyboard", 1, f.CONTROL_TYPE.PROPORTIONAL, true);
  let cntKeyVertical: f.Control = new f.Control("Keyboard", 4, f.CONTROL_TYPE.PROPORTIONAL, true);
  cntKeyHorizontal.setDelay(500);
  cntKeyVertical.setDelay(500);


  function init(_event: Event): void {

    setupScene();
    setupControls();

    // controlled.height = getHeightOnTerrain(gridMeshFlat, controlled);

    console.log(gridMeshFlat.indices);
    console.log(gridMeshFlat.vertices);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, hndLoop);
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 120);

    console.log("mtxWorld controlled translation: " + controlled.mtxWorld.translation);
    console.log("mtxLocal controlled translation: " + controlled.mtxLocal.translation);
    console.log("mtxWorld controlled scaling: " + controlled.mtxWorld.scaling);

    // f.RenderManager.setupTransformAndLights(graph);

    fAid.addStandardLightComponents(graph);
  }

  function hndLoop(_event: Event): void {
    hndKeyboardControls();
    
    // controlled.mtxLocal.translation = new f.Vector3(controlled.mtxLocal.translation.x, height, controlled.mtxLocal.translation.z);
    let timeFrame: number = f.Loop.timeFrameGame / 1000;
    controlled.update(timeFrame);
    viewport.draw();
  }

  function setupScene(): void {
    let matFlat: f.Material = new f.Material("White", f.ShaderFlat, new f.CoatColored(f.Color.CSS("WHITE")));
    let matRed: f.Material = new f.Material("Red", f.ShaderFlat, new f.CoatColored(f.Color.CSS("RED")));

    let meshCube = new f.MeshCube("CubeMesh");

    let coord = new fAid.NodeCoordinateSystem("test");

    parentControll = new f.Node("ParentControlled");
    parentControll.addComponent(new ƒ.ComponentTransform());

    let test = new fAid.NodeCoordinateSystem("Cube", f.Matrix4x4.IDENTITY());
    graph.addChild(test);

    controlled = new Controlled("Cube", f.Matrix4x4.IDENTITY() /*, matRed, new f.MeshCube() */);
    controlled.mtxLocal.translation = new f.Vector3(0,0.1,0);
    controlled.mtxLocal.scale(new f.Vector3(0.2,0.2,0.2));
    // controlled.getComponent(f.ComponentMesh).pivot.scaleZ(2);

    m1 = Scenes.createCompleteMeshNode("M1", matRed, meshCube);
    m2 = Scenes.createCompleteMeshNode("M2", matRed, meshCube);
    m3 = Scenes.createCompleteMeshNode("M3", matRed, meshCube);

    const myHeightMapFunction: f.heightMapFunction = function (x: number, y: number): number {
      return Math.sin(x * y * Math.PI * 2) * 0.2;
    };

    viewport = new f.Viewport();
    viewport.addEventListener(f.EVENT_KEYBOARD.DOWN, moreVertices);
    let cmpCamera: f.ComponentCamera = Scenes.createCamera(new f.Vector3(0, 2, 1), new f.Vector3(0, 0, 0));

    gridMeshFlat = new f.MeshHeightMap("HeightMap", 4, 4, myHeightMapFunction);
    gridFlat = Scenes.createCompleteMeshNode("Grid", matFlat, gridMeshFlat);

    // testCube = Scenes.createCompleteMeshNode("Test", matRed, meshCube);
    // let testMat = new f.Matrix4x4;
    // testMat.translateY(0.5);
    // testMat.rotateX(45);
    // testMat.rotateZ(45);
    // testCube.mtxLocal.set(testMat);
    // testCube.mtxLocal.scale(new f.Vector3(0.1,0.1,0.1));

    let s = 0.01;

    m1.mtxLocal.scale(new f.Vector3(s,s,s));
    m2.mtxLocal.scale(new f.Vector3(s,s,s));
    m3.mtxLocal.scale(new f.Vector3(s,s,s));

    graph.addChild(gridFlat);
    graph.addChild(parentControll);
    parentControll.addChild(controlled);
    graph.addChild(m1);
    graph.addChild(m2);
    graph.addChild(m3);
    // graph.addChild(testCube);

    viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));
    viewport.setFocus(true);
    Scenes.dollyViewportCamera(viewport);
    
    viewport.draw();

    // console.log(controlled);
  }
  
  function moreVertices(_event: KeyboardEvent): void{
    if(_event.code == f.KEYBOARD_CODE.M){
      
      gridMeshFlat.resolutionX = gridMeshFlat.resolutionX + 1;
      gridMeshFlat.resolutionZ = gridMeshFlat.resolutionZ + 1;
      
      gridMeshFlat.create();
      gridMeshFlat.createRenderBuffers();

      console.log(gridMeshFlat.resolutionX);
    }

    if(_event.code == f.KEYBOARD_CODE.N){
      
      gridMeshFlat.resolutionX = gridMeshFlat.resolutionX - 1;
      gridMeshFlat.resolutionZ = gridMeshFlat.resolutionZ - 1;
      
      gridMeshFlat.create();
      gridMeshFlat.createRenderBuffers();

      console.log(gridMeshFlat.resolutionX);
    }

  }

  function getPositionOnTerrain(terrain: f.MeshHeightMap, object: f.Node, calculateRotation: boolean = false): f.Matrix4x4{
        
    let nearestFace: distanceToFaceVertices = findNearestFace(terrain, object);

    // let rotationMatrix = new f.Matrix4x4;
    // rotationMatrix.rotation = object.mtxWorld.rotation;

    // let directionX = f.Vector3.TRANSFORMATION(new f.Vector3(1,0,0), rotationMatrix);
    // let directionZ = f.Vector3.TRANSFORMATION(new f.Vector3(0,0,1), rotationMatrix);

    // let angleX = f.Vector3.DOT(directionX, nearestFace.faceNormal);
    // let angleZ = f.Vector3.DOT(directionZ, nearestFace.faceNormal);

    // angleX = angleX/(directionX.magnitude * nearestFace.faceNormal.magnitude);
    // angleZ = angleZ/(directionZ.magnitude * nearestFace.faceNormal.magnitude);

    // angleX = 90 - Math.acos(angleX) * 180 / Math.PI;
    // angleZ = 90 - Math.acos(angleZ) * 180 / Math.PI;

    // console.log("aX :" + angleX + " aZ :" + angleZ)

    let matrix = new f.Matrix4x4;
    matrix.translateY(calculateHeight(nearestFace, object));
    // console.log(nearestFace.faceNormal.toString())
    // matrix.rotation = f.Vector3.TRANSFORMATION(nearestFace.faceNormal, f.Matrix4x4.ROTATION_X(90));
    matrix.rotation = nearestFace.faceNormal;
    // matrix.rotateX(angleX);
    // matrix.rotateZ(angleZ);

    return matrix;
  }

  function calculateHeight (face: distanceToFaceVertices, object: f.Node): number{

    m1.mtxLocal.translation = face.vertexONE;
    m2.mtxLocal.translation = face.vertexTWO;
    m3.mtxLocal.translation = face.vertexTHREE;

    let ray = new f.Ray(new f.Vector3(0,1,0), object.mtxWorld.translation);
    
    let intersection = ray.intersectPlane(face.vertexONE, face.faceNormal);

    return intersection.y;
  }

  function findNearestFace(terrain: f.MeshHeightMap, object: f.Node): distanceToFaceVertices{
    let vertices = terrain.vertices;
    let indices = terrain.indices;

    let nearestFaces: Array<distanceToFaceVertices> = new Array;

    for(let i = 0; i < indices.length; i = i+3){
      let vertexONE = new f.Vector3(vertices[indices[i]*3], vertices[indices[i]*3+1],vertices[indices[i]*3+2]);
      let vertexTWO = new f.Vector3(vertices[indices[i+1]*3], vertices[indices[i+1]*3+1],vertices[indices[i+1]*3+2]);
      let vertexTHREE = new f.Vector3(vertices[indices[i+2]*3], vertices[indices[i+2]*3+1],vertices[indices[i+2]*3+2]);
      
      let face = new distanceToFaceVertices(vertexONE, vertexTWO, vertexTHREE, object);
      
      nearestFaces.push(face);
    }

    nearestFaces.sort((n1,n2) => {
      return n1.distance - n2.distance;
    });

    return nearestFaces[0];

  }

  function setupControls(): void {
    controlled.axisSpeed.addControl(cntKeyVertical);
    controlled.axisRotation.addControl(cntKeyHorizontal);
  }

  function hndKeyboardControls(): void {
    let matrix = getPositionOnTerrain(gridMeshFlat, controlled);
    controlled.height = matrix.translation.y;
    controlled.lookAt = matrix.rotation;

    cntKeyVertical.setInput(
      f.Keyboard.mapToValue(1, 0, [f.KEYBOARD_CODE.I])
      + f.Keyboard.mapToValue(-1, 0, [f.KEYBOARD_CODE.K])
    );
    cntKeyHorizontal.setInput(
      f.Keyboard.mapToValue(1, 0, [f.KEYBOARD_CODE.J])
      + f.Keyboard.mapToValue(-1, 0, [f.KEYBOARD_CODE.L])
    );
  }

  class distanceToFaceVertices {
    public vertexONE: f.Vector3;
    public vertexTWO: f.Vector3;
    public vertexTHREE: f.Vector3;

    public distanceONE: number;
    public distanceTWO: number;
    public distanceTHREE: number;

    public distance: number;

    public faceNormal: f.Vector3;

    public constructor(vertexONE: f.Vector3, vertexTWO: f.Vector3, vertexTHREE: f.Vector3, object: f.Node){
      this.vertexONE = vertexONE;
      this.vertexTWO = vertexTWO;
      this.vertexTHREE = vertexTHREE;
      
      this.distanceONE = new f.Vector2(vertexONE.x - object.mtxLocal.translation.x, vertexONE.z - object.mtxWorld.translation.z).magnitude;
      this.distanceTWO = new f.Vector2(vertexTWO.x - object.mtxLocal.translation.x, vertexTWO.z - object.mtxWorld.translation.z).magnitude;
      this.distanceTHREE = new f.Vector2(vertexTHREE.x - object.mtxLocal.translation.x, vertexTHREE.z - object.mtxWorld.translation.z).magnitude;

      this.distance = this.distanceONE + this.distanceTWO + this.distanceTHREE; 

      this.calculateFaceNormal();

    }

    public calculateFaceNormal(){
      let v1 = f.Vector3.DIFFERENCE(this.vertexTWO, this.vertexONE);
      let v2 = f.Vector3.DIFFERENCE(this.vertexTHREE, this.vertexONE);

      this.faceNormal = f.Vector3.CROSS(v1, v2);
    }
  }
}