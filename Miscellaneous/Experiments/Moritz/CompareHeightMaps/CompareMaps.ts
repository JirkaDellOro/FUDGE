namespace CompareHeightMaps {
  import f = FudgeCore;
  import ƒAid = FudgeAid;
  

  window.addEventListener("load", init);

  let graph: f.Node = new f.Node("Graph");

  let oldGridMeshFlat: f.MeshHeightMap;
  let gridMeshFlat: f.MeshTerrain;

  let oldGridFlat: f.Node = new f.Node("OldMap");
  let gridFlat: f.Node = new f.Node("Map");

  async function init(_event: Event): Promise<void> {

    let matFlat: f.Material = new f.Material("White", f.ShaderFlat, new f.CoatColored(f.Color.CSS("WHITE")));
    let matRed: f.Material = new f.Material("Red", f.ShaderFlat, new f.CoatColored(f.Color.CSS("RED")));
    
    let img: HTMLImageElement = document.querySelector("img");
    let txtImage: ƒ.TextureImage = new ƒ.TextureImage();
    txtImage.image = img;
    let coatTextured: ƒ.CoatTextured = new ƒ.CoatTextured();
    coatTextured.texture = txtImage;

    let matTex: ƒ.Material = new ƒ.Material("Textured", ƒ.ShaderTexture, coatTextured);

    let imgGrey = new ƒ.TextureImage();
    await imgGrey.load("test2.png");

    let greyMap = new f.MeshTerrain("HeightMap", imgGrey);
    greyMap.create();
    let GreyFlat = Scenes.createCompleteMeshNode("Grid", matFlat, gridMeshFlat);

    const myHeightMapFunction: f.HeightMapFunction = function (x: number, y: number): number {
      return Math.sin(x * y * Math.PI * 2) * 0.2;
    };
    

    gridMeshFlat = new f.MeshTerrain("HeightMap", myHeightMapFunction, 4, 4);
    oldGridMeshFlat = new f.MeshHeightMap("HeightMap", myHeightMapFunction, 4, 4);

    gridFlat = Scenes.createCompleteMeshNode("Grid", matTex, gridMeshFlat);
    oldGridFlat = Scenes.createCompleteMeshNode("oldGrid", matTex, oldGridMeshFlat);

    let SecondgridFlat = Scenes.createCompleteMeshNode("Grid", matFlat, gridMeshFlat);
    let SecondoldGridFlat = Scenes.createCompleteMeshNode("oldGrid", matFlat, oldGridMeshFlat);

    


    gridFlat.mtxLocal.translate(new f.Vector3(-0.75,0,-0.75))
    oldGridFlat.mtxLocal.translate(new f.Vector3(0.75,0,-0.75))

    SecondgridFlat.mtxLocal.translate(new f.Vector3(-0.75,0,0.75))
    SecondoldGridFlat.mtxLocal.translate(new f.Vector3(0.75,0,0.75))
    
    gridFlat.mtxLocal.rotateY(90);
    oldGridFlat.mtxLocal.rotateY(90);

    gridFlat.mtxLocal.rotateY(-90);
    oldGridFlat.mtxLocal.rotateY(-90);

    graph.addChild(gridFlat);
    graph.addChild(oldGridFlat);

    graph.addChild(SecondgridFlat);
    graph.addChild(SecondoldGridFlat);

    ƒAid.addStandardLightComponents(graph);

    // pivotMarker(graph);

    let viewport: f.Viewport = new f.Viewport();
    let cmpCamera: f.ComponentCamera = Scenes.createCamera(new f.Vector3(0, 5, 1), new f.Vector3(0, 0, 0));
    viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));

    viewport.addEventListener(f.EVENT_KEYBOARD.DOWN, moreVertices);

    Scenes.dollyViewportCamera(viewport);
    viewport.setFocus(true);
    viewport.draw();

    SecondoldGridFlat.getComponent(f.ComponentMesh).mesh.vertices = greyMap.vertices;

    SecondoldGridFlat.getComponent(f.ComponentMesh).mesh.create();
    SecondoldGridFlat.getComponent(f.ComponentMesh).mesh.createRenderBuffers();

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