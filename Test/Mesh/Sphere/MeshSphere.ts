namespace MeshTest {
  import ƒ = FudgeCore;
  ƒ.RenderManager.initialize();
  import ƒAid = FudgeAid;

  window.addEventListener("load", init);

  let branch: ƒ.Node = new ƒ.Node("Branch");
  let sphereTex: ƒ.Node = new ƒ.Node("sphereTex");
  let sphereFlat: ƒ.Node = new ƒ.Node("sphereFlat");


  function init(_event: Event): void {
    let img: HTMLImageElement = document.querySelector("img");
    let txtImage: ƒ.TextureImage = new ƒ.TextureImage();
    txtImage.image = img;
    let coatTextured: ƒ.CoatTextured = new ƒ.CoatTextured();
    coatTextured.texture = txtImage;

    let matTex: ƒ.Material = new ƒ.Material("Textured", ƒ.ShaderTexture, coatTextured);
    let matFlat: ƒ.Material = new ƒ.Material("White", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("WHITE")));

    let sphereMesh: ƒ.Mesh = new ƒ.MeshSphere(32, 24);
    sphereFlat = Scenes.createCompleteMeshNode("SphereFlat", matFlat, sphereMesh);
    sphereTex = Scenes.createCompleteMeshNode("SphereTexture", matTex, sphereMesh);

    sphereFlat.cmpTransform.local.translateX(0.6);
    sphereTex.cmpTransform.local.translateX(-0.6);

    branch.addChild(sphereFlat);
    branch.addChild(sphereTex);

    let body: ƒ.Node = new ƒ.Node("k");

    let lights: ƒ.Node = new ƒAid.NodeThreePointLights("lights", 0);
    branch.addChild(lights);

    branch.addChild(body);

    let viewport: ƒ.Viewport = new ƒ.Viewport();
    let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(new ƒ.Vector3(0, 0, 2.3), new ƒ.Vector3(0, 0, 0));
    viewport.initialize("Viewport", branch, cmpCamera, document.querySelector("canvas"));

    Scenes.dollyViewportCamera(viewport);
    viewport.setFocus(true);
    viewport.draw();


    window.setInterval(function (): void {
      sphereTex.cmpTransform.local.rotateY(0.5);
      viewport.draw();
    }, 
                       20);

  }
}