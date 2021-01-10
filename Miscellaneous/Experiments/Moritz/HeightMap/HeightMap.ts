namespace HeightMap {
  import f = FudgeCore;
  import ƒAid = FudgeAid;
  

  window.addEventListener("load", init);

  let graph: f.Node = new f.Node("Graph");

  let m1: f.Node = new f.Node("M1");
  let m2: f.Node = new f.Node("M1");
  let m3: f.Node = new f.Node("M1");

  let gridMeshFlat: f.MeshHeightMap;
  let gridFlat: f.Node = new f.Node("Map");

  let viewport: f.Viewport;

  let controlled: Controlled;
  let cntKeyHorizontal: f.Control = new f.Control("Keyboard", 1, f.CONTROL_TYPE.PROPORTIONAL, true);
  let cntKeyVertical: f.Control = new f.Control("Keyboard", 4, f.CONTROL_TYPE.PROPORTIONAL, true);
  cntKeyHorizontal.setDelay(500);
  cntKeyVertical.setDelay(500);


  function init(_event: Event): void {

    setupScene();
    setupControls();

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, hndLoop);
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 120);

    console.log("mtxWorld controlled translation: " + controlled.mtxWorld.translation);
    console.log("mtxLocal controlled translation: " + controlled.mtxLocal.translation);
    console.log("mtxWorld controlled scaling: " + controlled.mtxWorld.scaling);

    // f.RenderManager.setupTransformAndLights(graph);

    ƒAid.addStandardLightComponents(graph);  

    // console.log(heightMarker.mtxLocal.translation.x);
    // console.log(heightMarker.mtxLocal.translation.z);

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

    controlled = new Controlled("Cube", f.Matrix4x4.IDENTITY(), matRed, new f.MeshCube());
    controlled.mtxLocal.translation = new f.Vector3(0.5,0.1,0);
    controlled.mtxLocal.scale(new f.Vector3(0.05,0.05,0.05));

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

    let s = 0.01;

    m1.mtxLocal.scale(new f.Vector3(s,s,s));
    m2.mtxLocal.scale(new f.Vector3(s,s,s));
    m3.mtxLocal.scale(new f.Vector3(s,s,s));

    graph.addChild(gridFlat);
    graph.addChild(controlled);
    graph.addChild(m1);
    graph.addChild(m2);
    graph.addChild(m3);

    viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));
    viewport.setFocus(true);
    Scenes.dollyViewportCamera(viewport);
    
    viewport.draw();
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

  function getHeightOnTerrain(terrain: f.MeshHeightMap, object: f.Node): number{
    var splitVertices = terrain.vertices;
    let nearestVerices: Array<distanceToVertice> = new Array;

    for(let i = 0; i < splitVertices.length; i = i+3){
      let vertex: f.Vector3 = new f.Vector3(splitVertices[i], splitVertices[i+1], splitVertices[i+2]);
      let distance = new f.Vector2(vertex.x, vertex.z);

      distance.subtract(new f.Vector2(object.mtxWorld.translation.x, object.mtxWorld.translation.z));
      
      nearestVerices.push({ vertex: vertex, distance: distance.magnitude });
    }

    nearestVerices.sort((n1,n2) => {
      return n1.distance - n2.distance;
    });

    return calculateHeight(nearestVerices[0], nearestVerices[1], nearestVerices[2]);
  }

  function calculateHeight (vertEXONE: distanceToVertice, vertexTWO: distanceToVertice, vertexTHREE: distanceToVertice): number{

    m1.mtxLocal.translation = vertEXONE.vertex;
    m2.mtxLocal.translation = vertexTWO.vertex;
    m3.mtxLocal.translation = vertexTHREE.vertex;
    
    if ( vertEXONE.distance == 0 )
      return vertEXONE.vertex.y;

    return ( (1/vertEXONE.distance) * vertEXONE.vertex.y + (1/vertexTWO.distance) * vertexTWO.vertex.y + (1/vertexTHREE.distance) * vertexTHREE.vertex.y ) /
        (1/vertEXONE.distance + 1/vertexTWO.distance + 1/vertexTHREE.distance);
  }

  function setupControls(): void {
    controlled.axisSpeed.addControl(cntKeyVertical);
    controlled.axisRotation.addControl(cntKeyHorizontal);
  }

  function hndKeyboardControls(): void {
    controlled.height = getHeightOnTerrain(gridMeshFlat, controlled);
    cntKeyVertical.setInput(
      f.Keyboard.mapToValue(1, 0, [f.KEYBOARD_CODE.I])
      + f.Keyboard.mapToValue(-1, 0, [f.KEYBOARD_CODE.K])
    );
    cntKeyHorizontal.setInput(
      f.Keyboard.mapToValue(1, 0, [f.KEYBOARD_CODE.J])
      + f.Keyboard.mapToValue(-1, 0, [f.KEYBOARD_CODE.L])
    );
  }

  class distanceToVertice {
    public vertex: f.Vector3;
    public distance: number;
 }
}