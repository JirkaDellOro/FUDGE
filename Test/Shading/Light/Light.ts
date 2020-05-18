namespace TextureTest {
  import ƒ = FudgeCore;


  window.addEventListener("load", init);

  function init(_event: Event): void {
    let coatWhite: ƒ.CoatColored = new ƒ.CoatColored(ƒ.Color.CSS("WHITE"));
    let material: ƒ.Material = new ƒ.Material("White", ƒ.ShaderFlat, coatWhite);
    let graph: ƒ.Node = new ƒ.Node("Graph");

    let body: ƒ.Node = Scenes.createCompleteMeshNode("Body", material, new ƒ.MeshPyramid());
    body.mtxLocal.translate(ƒ.Vector3.ZERO());
    body.mtxLocal.scale(new ƒ.Vector3(0.8, 0.8, 0.8));

    // let cmpLightAmbient: ƒ.ComponentLight = new ƒ.ComponentLight(ƒ.LIGHT_TYPE.AMBIENT, new ƒ.Color(.5, .5, .5, 1));
    // graph.addComponent(cmpLightAmbient);

    let cmpLightDirectionalRed: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("RED")));
    // cmpLightDirectionalRed.pivot.rotateY(-90, true);
    // console.log(cmpLightDirectionalRed.pivot.toString());
    cmpLightDirectionalRed.pivot.translateX(1);
    console.log(cmpLightDirectionalRed.pivot.toString());
    cmpLightDirectionalRed.pivot.lookAt(ƒ.Vector3.ZERO());
    console.log(cmpLightDirectionalRed.pivot.toString());
    graph.addComponent(cmpLightDirectionalRed);

    let cmpLightDirectionalGreen: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("GREEN")));
    graph.addComponent(cmpLightDirectionalGreen);

    let cmpLightDirectionalBlue: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("BLUE")));
    cmpLightDirectionalBlue.pivot.rotateY(180);
    graph.addComponent(cmpLightDirectionalBlue);

    let cmpLightDirectionalWhite: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("WHITE")));
    cmpLightDirectionalWhite.pivot.rotateY(90);
    graph.addComponent(cmpLightDirectionalWhite);

    graph.addChild(body);
    let cosys: ƒ.Node = Scenes.createCoordinateSystem();
    graph.addChild(cosys);
    cosys.addComponent(new ƒ.ComponentTransform(cmpLightDirectionalRed.pivot));

    let viewport: ƒ.Viewport = new ƒ.Viewport();
    let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(new ƒ.Vector3(1.5, 1.5, 1.5), new ƒ.Vector3(0, 0, 0));
    viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));

    Scenes.dollyViewportCamera(viewport);
    viewport.setFocus(true);
    viewport.draw();

    //*/
    window.setInterval(function (): void {
      // body.cmpTransform.rotateY(-1.1);
      body.mtxLocal.rotateY(-1);
      // body.cmpTransform.rotateZ(-0.9);
      viewport.draw();
    },
      20);
    //*/
  }
}