namespace SuspensionTest {
  import f = FudgeCore;
  import fAid = FudgeAid;
  
  window.addEventListener("load", init);

  export let graph: f.Node = new f.Node("Graph");

  let gridMeshFlat: f.MeshTerrain;
  let gridFlat: f.Node;

  let img: f.TextureImage;

  export let viewport: f.Viewport;

  let controlled: Controlled;
  let chassis: f.Node;
  let tyreFL: f.Node;
  let tyreFR: f.Node;
  let tyreBL: f.Node;
  let tyreBR: f.Node;
  let frontAxis: f.Node;
  let rearAxis: f.Node;

  let FL: f.Node;
  let FR: f.Node;
  let BL: f.Node;
  let BR: f.Node;

  let cntKeyHorizontal: f.Control = new f.Control("Keyboard", 1, f.CONTROL_TYPE.PROPORTIONAL, true);
  let cntKeyVertical: f.Control = new f.Control("Keyboard", 4, f.CONTROL_TYPE.PROPORTIONAL, true);

  export let arrowRed: ƒ.Node;
  export let arrowRed2: f.Node;

  async function init(_event: Event): Promise<void> {

    await setupScene();
    setupControls();

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, hndLoop);
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 30);

    fAid.addStandardLightComponents(graph);
  }

  function hndLoop(_event: Event): void {
    hndKeyboardControls();

    let timeFrame: number = f.Loop.timeFrameGame / 1000;
    controlled.update(timeFrame);
    viewport.draw();
  }

  async function setupScene(): Promise<void> {

    let coatTextured: ƒ.CoatTextured = new ƒ.CoatTextured();
    let tex = new f.TextureImage();

    let matTex: ƒ.Material = new ƒ.Material("Textured", ƒ.ShaderTexture, coatTextured);
    let matFlat: f.Material = new f.Material("White", f.ShaderFlat, new f.CoatColored(f.Color.CSS("WHITE")));
    let matRed: f.Material = new f.Material("Red", f.ShaderFlat, new f.CoatColored(f.Color.CSS("RED")));
    let matGrey: f.Material = new f.Material("Red", f.ShaderFlat, new f.CoatColored(f.Color.CSS("GREY")));

    let meshCube = new f.MeshCube("CubeMesh");
    let meshSphere = new f.MeshSphere("Tyre", 10, 10);

    controlled = new Controlled("Cube", f.Matrix4x4.IDENTITY()/*, matRed, meshCube*/);
    controlled.mtxLocal.translation = new f.Vector3( 0.3, 0, 0.3 );
    controlled.mtxLocal.lookAt(f.Vector3.SUM(controlled.mtxLocal.translation, f.Vector3.Y(1)), f.Vector3.X(1));

    chassis = Scenes.createCompleteMeshNode("Chassis", matRed, meshCube);
    chassis.getComponent(f.ComponentMesh).mtxPivot.scale(new f.Vector3(1, 0.5, 0.3));
    chassis.getComponent(f.ComponentMesh).mtxPivot.translateX(0.5)
    chassis.mtxLocal.scale(f.Vector3.ONE(0.1));
    chassis.mtxLocal.translateZ(0.2)

    frontAxis = Scenes.createCompleteMeshNode("Front Axis", matRed, meshCube);
    frontAxis.getComponent(f.ComponentMesh).mtxPivot.scale(new f.Vector3(0.1, 0.8, 0.1));
    frontAxis.mtxLocal.translate(new f.Vector3(0.1, 0, 0));
    frontAxis.mtxLocal.scale(f.Vector3.ONE(0.1));

    rearAxis = Scenes.createCompleteMeshNode("Rear Axis", matGrey, meshCube);
    rearAxis.getComponent(f.ComponentMesh).mtxPivot.scale(new f.Vector3(0.1, 0.8, 0.1));
    rearAxis.mtxLocal.scale(f.Vector3.ONE(0.1));


    tyreFL = Scenes.createCompleteMeshNode("Tyre FL", matGrey, meshSphere);
    tyreFL.getComponent(f.ComponentMesh).mtxPivot.translateZ(0.5);
    tyreFL.getComponent(f.ComponentMesh).mtxPivot.rotateX(-90);
    tyreFL.getComponent(f.ComponentMesh).mtxPivot.scale(new f.Vector3(1, 1, 0.3));

    tyreFR = Scenes.createCompleteMeshNode("Tyre FR", matGrey, meshSphere);
    tyreFR.getComponent(f.ComponentMesh).mtxPivot.translateZ(0.5);
    tyreFR.getComponent(f.ComponentMesh).mtxPivot.rotateX(-90);
    tyreFR.getComponent(f.ComponentMesh).mtxPivot.scale(new f.Vector3(1, 1, 0.3));


    tyreBR = Scenes.createCompleteMeshNode("Tyre BR", matGrey, meshSphere);
    tyreBR.getComponent(f.ComponentMesh).mtxPivot.translateZ(0.5);
    tyreBR.getComponent(f.ComponentMesh).mtxPivot.rotateX(-90);
    tyreBR.getComponent(f.ComponentMesh).mtxPivot.scale(new f.Vector3(1, 1, 0.3));

    tyreBL = Scenes.createCompleteMeshNode("Tyre BL", matGrey, meshSphere);
    tyreBL.getComponent(f.ComponentMesh).mtxPivot.translateZ(0.5);
    tyreBL.getComponent(f.ComponentMesh).mtxPivot.rotateX(-90);
    tyreBL.getComponent(f.ComponentMesh).mtxPivot.scale(new f.Vector3(1, 1, 0.3));

    
    tyreFL.mtxLocal.scale(f.Vector3.ONE(0.5));
    tyreFL.mtxLocal.translate(new f.Vector3(0, 0.6, -0.5));

    tyreFR.mtxLocal.scale(f.Vector3.ONE(0.5));
    tyreFR.mtxLocal.translate(new f.Vector3(0, -0.6, -0.5));

    tyreBR.mtxLocal.scale(f.Vector3.ONE(0.5));
    tyreBR.mtxLocal.translate(new f.Vector3(0, -0.6, -0.5));

    tyreBL.mtxLocal.scale(f.Vector3.ONE(0.5));
    tyreBL.mtxLocal.translate(new f.Vector3(0, 0.6, -0.5));

    FL = new f.Node("FL");
    FL.addComponent(new f.ComponentTransform());
    FR = new f.Node("FR");
    FR.addComponent(new f.ComponentTransform());
    BR = new f.Node("BR");
    BR.addComponent(new f.ComponentTransform());
    BL = new f.Node("BL");
    BL.addComponent(new f.ComponentTransform());

    controlled.setUpAxis();

    const myHeightMapFunction: f.HeightMapFunction = function (x: number, y: number): number {
      return Math.sin(x * y * Math.PI * 2) * 0.2;
    };

    viewport = new f.Viewport();
    viewport.addEventListener(f.EVENT_KEYBOARD.DOWN, moreVertices);
    let cmpCamera: f.ComponentCamera = Scenes.createCamera(new f.Vector3(0, 2, 1), new f.Vector3(0, 0, 0));

    img = new ƒ.TextureImage();
    await img.load("../Textures/test2.png");

    gridMeshFlat = new f.MeshTerrain("HeightMap", img);
    gridFlat = Scenes.createCompleteMeshNode("Grid", matFlat, gridMeshFlat);
    gridMeshFlat.node = gridFlat;
    gridFlat.mtxLocal.scale(new f.Vector3(1,0.3,1))

    controlled.meshTerrain = gridMeshFlat;
    controlled.terrain = gridFlat;

    arrowRed = Scenes.createCompleteMeshNode("Arrow", matRed, meshCube);
    arrowRed.getComponent(f.ComponentMesh).mtxPivot.translateZ(0.5);
    arrowRed.mtxLocal.scale(new f.Vector3(0.01,0.01,0.2))

    arrowRed2 = Scenes.createCompleteMeshNode("Arrow", matRed, meshCube);
    arrowRed2.getComponent(f.ComponentMesh).mtxPivot.translateZ(0.5);
    arrowRed2.mtxLocal.scale(new f.Vector3(0.1,0.1,2))


    let test: f.Node = new fAid.NodeCoordinateSystem; 
    let test2: f.Node = new fAid.NodeCoordinateSystem("Test2", f.Matrix4x4.IDENTITY()); 
    test2.mtxLocal.scale(f.Vector3.ONE(2));
    let test3: f.Node = new fAid.NodeCoordinateSystem("Test2", f.Matrix4x4.IDENTITY()); 
    test3.mtxLocal.scale(f.Vector3.ONE(2));

    graph.addChild(gridFlat);
    graph.addChild(controlled);
    controlled.addChild(frontAxis);
    controlled.addChild(rearAxis);
    controlled.addChild(chassis);

    rearAxis.addChild(test3)
    frontAxis.addChild(test2)

    graph.addChild(test);

    frontAxis.addChild(tyreFL);
    frontAxis.addChild(tyreFR);
    rearAxis.addChild(tyreBR);
    rearAxis.addChild(tyreBL);

    controlled.addChild(FL);
    controlled.addChild(FR);
    controlled.addChild(BR);
    controlled.addChild(BL);

    viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));
    viewport.setFocus(true);
    Scenes.dollyViewportCamera(viewport);
    
    viewport.draw();

    FL.mtxLocal.translation = f.Vector3.TRANSFORMATION(tyreFL.mtxWorld.translation, controlled.mtxWorldInverse);
    FR.mtxLocal.translation = f.Vector3.TRANSFORMATION(tyreFR.mtxWorld.translation, controlled.mtxWorldInverse);
    BR.mtxLocal.translation = f.Vector3.TRANSFORMATION(tyreBR.mtxWorld.translation, controlled.mtxWorldInverse);
    BL.mtxLocal.translation = f.Vector3.TRANSFORMATION(tyreBL.mtxWorld.translation, controlled.mtxWorldInverse);

    viewport.draw();
  }
  
  function moreVertices(_event: KeyboardEvent): void{
    if(_event.code == f.KEYBOARD_CODE.M){
      
      gridMeshFlat.resolutionX = gridMeshFlat.resolutionX + 1;
      gridMeshFlat.resolutionZ = gridMeshFlat.resolutionZ + 1;
      
      gridMeshFlat.clear();
      gridMeshFlat.createRenderBuffers();

      console.log(gridMeshFlat.resolutionX);
    }

    if(_event.code == f.KEYBOARD_CODE.N){
      
      gridMeshFlat.resolutionX = gridMeshFlat.resolutionX - 1;
      gridMeshFlat.resolutionZ = gridMeshFlat.resolutionZ - 1;
      
      gridMeshFlat.clear();
      gridMeshFlat.createRenderBuffers();

      console.log(gridMeshFlat.resolutionX);
    }

  }


  function setupControls(): void {
    controlled.axisSpeed.addControl(cntKeyVertical);
    controlled.axisRotation.addControl(cntKeyHorizontal);
  }

  function hndKeyboardControls(): void {

    cntKeyVertical.setInput(
      f.Keyboard.mapToValue(1, 0, [f.KEYBOARD_CODE.W])
      + f.Keyboard.mapToValue(-1, 0, [f.KEYBOARD_CODE.S])
    );
    cntKeyHorizontal.setInput(
      f.Keyboard.mapToValue(1, 0, [f.KEYBOARD_CODE.A])
      + f.Keyboard.mapToValue(-1, 0, [f.KEYBOARD_CODE.D])
    );
  }
}
