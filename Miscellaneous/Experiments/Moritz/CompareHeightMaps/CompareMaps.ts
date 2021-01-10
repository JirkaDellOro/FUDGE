namespace CompareHeightMaps {
  import f = FudgeCore;
  import ƒAid = FudgeAid;
  

  window.addEventListener("load", init);

  let graph: f.Node = new f.Node("Graph");

  let oldGridMeshFlat: f.OldMeshHeightMap;
  let gridMeshFlat: f.MeshHeightMap;

  let oldGridFlat: f.Node = new f.Node("OldMap");
  let gridFlat: f.Node = new f.Node("Map");

  function init(_event: Event): void {

    let matFlat: f.Material = new f.Material("White", f.ShaderFlat, new f.CoatColored(f.Color.CSS("WHITE")));
    let matRed: f.Material = new f.Material("Red", f.ShaderFlat, new f.CoatColored(f.Color.CSS("RED")));    

    let txtImage: f.TextureImage = new f.TextureImage();
    let coatTextured: f.CoatTextured = new f.CoatTextured();
    coatTextured.texture = txtImage;

    let matTex: f.Material = new f.Material("Textured", f.ShaderTexture, coatTextured);

    const myHeightMapFunction: f.heightMapFunction = function (x: number, y: number): number {
      return Math.sin(x * y * Math.PI * 2) * 0.2;
    };

    gridMeshFlat = new f.MeshHeightMap("HeightMap", 4, 4, myHeightMapFunction);
    oldGridMeshFlat = new f.OldMeshHeightMap("HeightMap", 4, 4, myHeightMapFunction);

    gridFlat = Scenes.createCompleteMeshNode("Grid", matFlat, gridMeshFlat);
    oldGridFlat = Scenes.createCompleteMeshNode("oldGrid", matFlat, oldGridMeshFlat);

    gridFlat.mtxLocal.translate(new f.Vector3(-0.75,0,0))
    oldGridFlat.mtxLocal.translate(new f.Vector3(0.75,0,0))
    
    gridFlat.mtxLocal.rotateY(90);
    oldGridFlat.mtxLocal.rotateY(90);

    graph.addChild(gridFlat);
    graph.addChild(oldGridFlat);

    ƒAid.addStandardLightComponents(graph);

    // pivotMarker(graph);

    let viewport: f.Viewport = new f.Viewport();
    let cmpCamera: f.ComponentCamera = Scenes.createCamera(new f.Vector3(0, 6, 1), new f.Vector3(0, 0, 0));
    viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));

    viewport.addEventListener(f.EVENT_KEYBOARD.DOWN, moreVertices);

    Scenes.dollyViewportCamera(viewport);
    viewport.setFocus(true);
    viewport.draw();

    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 120);

    window.setInterval(function (): void {
      gridFlat.mtxLocal.rotateY(0);
      oldGridFlat.mtxLocal.rotateY(0);
      viewport.draw();
    },
    20);

  }
  
  function moreVertices(_event: KeyboardEvent): void{
    if(_event.code == f.KEYBOARD_CODE.M){
      
      gridMeshFlat.resolutionX = gridMeshFlat.resolutionX + 1;
      gridMeshFlat.resolutionZ = gridMeshFlat.resolutionZ + 1;

      oldGridMeshFlat.resolutionX = oldGridMeshFlat.resolutionX + 1;
      oldGridMeshFlat.resolutionZ = oldGridMeshFlat.resolutionZ + 1;
      
      gridMeshFlat.create();
      oldGridMeshFlat.create();

      gridMeshFlat.createRenderBuffers();
      oldGridMeshFlat.createRenderBuffers();

      console.log(oldGridMeshFlat.resolutionX);
    }

    if(_event.code == f.KEYBOARD_CODE.N){
      
      gridMeshFlat.resolutionX = gridMeshFlat.resolutionX - 1;
      gridMeshFlat.resolutionZ = gridMeshFlat.resolutionZ - 1;

      oldGridMeshFlat.resolutionX = oldGridMeshFlat.resolutionX - 1;
      oldGridMeshFlat.resolutionZ = oldGridMeshFlat.resolutionZ - 1;
      
      gridMeshFlat.create();
      oldGridMeshFlat.create();

      gridMeshFlat.createRenderBuffers();
      oldGridMeshFlat.createRenderBuffers();

      console.log(oldGridMeshFlat.resolutionX);
    }

  }

}